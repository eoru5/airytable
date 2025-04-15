import { z } from "zod";
import { faker } from "@faker-js/faker";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { type PrismaClient } from "@prisma/client";
import { createView } from "./view";
import { db } from "~/server/db";
import { createRecords } from "./record";
import { type ColumnFiltersState } from "~/app/_components/base/table";

export enum NumberFilters {
  LessThan = "<",
  GreaterThan = ">",
}
export enum TextFilters {
  Is = "is",
  Contains = "contains",
  DoesNotContain = "does not contain",
  IsEmpty = "is empty",
  IsNotEmpty = "is not empty",
}
export type FilterType = NumberFilters | TextFilters;

// currently just order by id
export const getFields = async (tableId: string) => {
  return db.field.findMany({
    orderBy: { id: "asc" },
    where: { tableId },
  });
};

export const createTable = async (
  db: PrismaClient,
  baseId: string,
  name: string,
  generateData = true,
  numRecords = 3,
) => {
  const table = await db.table.create({
    data: {
      baseId: baseId,
      name: name,
    },
  });
  await createView(db, { name: "Grid View", tableId: table.id });

  // field = col, record = row
  await db.field.createManyAndReturn({
    data: [
      { tableId: table.id, name: "Name", Type: "Text" },
      { tableId: table.id, name: "Color", Type: "Text" },
      { tableId: table.id, name: "Number", Type: "Number" },
    ],
  });

  // create with default fields. should be abstracted into params but fine for now
  await createRecords(
    db,
    table.id,
    numRecords,
    generateData,
    generateData
      ? {
          Name: () => faker.person.fullName(),
          Color: () => faker.color.human(),
          // just use the default thing for the num
        }
      : {},
  );
  return table;
};

export const tableRouter = createTRPCRouter({
  getAllViews: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const views = await ctx.db.view.findMany({
        orderBy: { createdAt: "asc" },
        where: { tableId: input.tableId },
      });
      return views ?? [];
    }),

  getLatestView: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // get last used view
      const lastUsedView = await ctx.db.view.findFirst({
        where: { tableId: input.id },
        orderBy: { modifiedAt: "desc" },
      });

      return {
        lastUsedView,
      };
    }),

  create: protectedProcedure
    .input(
      z.object({
        baseId: z.string(),
        name: z.string().min(1),
        generateData: z.boolean().default(true),
        numRecords: z.number().default(3),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return createTable(
        ctx.db,
        input.baseId,
        input.name,
        input.generateData,
        input.numRecords,
      );
    }),

  rename: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.table.update({
        where: {
          id: input.id,
          Base: {
            userId: ctx.session.user.id,
          },
        },
        data: {
          name: input.name,
          modifiedAt: new Date(),
        },
      });
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.table.delete({
        where: {
          id: input.id,
          Base: {
            userId: ctx.session.user.id,
          },
        },
      });
    }),

  getRecords: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
        viewId: z.string(),
        limit: z.number().min(1).nullish(),
        cursor: z.number().nullish(), // tried to integrate prisma cursors but couldnt figure out how, so just using it as an offset
      }),
    )
    .query(async ({ ctx, input }) => {
      const view = await ctx.db.view.findUnique({
        where: { id: input.viewId },
      });

      if (!view) throw new Error("View not found");

      let sort = (view.sort as { id: string; desc: boolean }[]) ?? [];
      let filters = (view.filters as ColumnFiltersState) ?? [];
      const hiddenFields = view.hiddenFields;

      if (hiddenFields.length > 0) {
        sort = sort.filter((s) => !hiddenFields.includes(Number(s.id)));
        filters = filters.filter((f) => !hiddenFields.includes(Number(f.id)));
      }

      const filterConditions = filters
        .filter((f) => f.value !== undefined)
        .map((f) => {
          if (Object.values(NumberFilters).includes(f.type as NumberFilters)) {
            switch (f.type as NumberFilters) {
              case NumberFilters.GreaterThan:
                return `f${f.id}.value > ${f.value}`;
              case NumberFilters.LessThan:
                return `f${f.id}.value < ${f.value}`;
            }
          } else if (
            Object.values(TextFilters).includes(f.type as TextFilters)
          ) {
            switch (f.type as TextFilters) {
              case TextFilters.Contains:
                return `f${f.id}.value ilike '%${f.value}%'`;
              case TextFilters.DoesNotContain:
                return `f${f.id}.value not ilike '%${f.value}%'`;
              case TextFilters.Is:
                return `f${f.id}.value = '${f.value}'`;
              case TextFilters.IsEmpty:
                return `f${f.id}.value is null or f${f.id}.value = ''`;
              case TextFilters.IsNotEmpty:
                return `f${f.id}.value is not null and f${f.id}.value != ''`;
            }
          }
        });

      const fields = await ctx.db.field.findMany({
        where: {
          tableId: input.tableId,
          id: {
            notIn: hiddenFields.length > 0 ? hiddenFields : undefined,
          },
        },
        select: { id: true, Type: true },
      });

      const limit = input.limit ?? 50;

      const qry = `
        select
          r.id${fields.length > 0 ? "," : ""}
          ${fields.map((f) => `f${f.id}.value as f${f.id}`).join(",\n")}
        from "Record" r

        ${fields
          .map(
            (f) =>
              `
              left join (
                select "recordId", value
                from "${f.Type === "Text" ? "CellText" : "CellNumber"}"
                where "fieldId" = ${f.id}
              ) as f${f.id} on f${f.id}."recordId" = r.id
            `,
          )
          .join("\n")}

        where r."tableId" = '${input.tableId}'
        ${filterConditions.length > 0 ? "\nand " + filterConditions.join("and\n") : ""}

        order by
        ${sort
          .map((s) => `f${s.id}.value ${s.desc ? "desc" : "asc"}`)
          .join(",\n")}
          ${sort.length > 0 ? "," : ""}r.id
          
        limit ${limit + 1}
        offset ${input.cursor ?? 0}
        ;
      `;

      const records =
        await ctx.db.$queryRawUnsafe<Record<string, string | number>[]>(qry);

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (!input.cursor) {
        nextCursor = limit + 1;
      } else if (records.length > limit && input.cursor) {
        nextCursor = input.cursor + limit + 1;
      }

      return {
        records,
        nextCursor,
      };
    }),

  getFields: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.field.findMany({
        where: {
          tableId: input.tableId,
          Table: {
            Base: {
              userId: ctx.session.user.id,
            },
          },
        },
        orderBy: { id: "asc" },
      });
    }),

  search: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
        viewId: z.string(),
        search: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      // prob a better way, but just reuse getrecords code to keep result order and table cell order consistent
      const view = await ctx.db.view.findUnique({
        where: { id: input.viewId },
      });

      if (!view) throw new Error("View not found");

      let sort = (view.sort as { id: string; desc: boolean }[]) ?? [];
      let filters = (view.filters as ColumnFiltersState) ?? [];
      const hiddenFields = view.hiddenFields;

      if (hiddenFields.length > 0) {
        sort = sort.filter((s) => !hiddenFields.includes(Number(s.id)));
        filters = filters.filter((f) => !hiddenFields.includes(Number(f.id)));
      }

      const filterConditions = filters
        .filter((f) => f.value !== undefined)
        .map((f) => {
          if (Object.values(NumberFilters).includes(f.type as NumberFilters)) {
            switch (f.type as NumberFilters) {
              case NumberFilters.GreaterThan:
                return `f${f.id}.value > ${f.value}`;
              case NumberFilters.LessThan:
                return `f${f.id}.value < ${f.value}`;
            }
          } else if (
            Object.values(TextFilters).includes(f.type as TextFilters)
          ) {
            switch (f.type as TextFilters) {
              case TextFilters.Contains:
                return `f${f.id}.value ilike '%${f.value}%'`;
              case TextFilters.DoesNotContain:
                return `f${f.id}.value not ilike '%${f.value}%'`;
              case TextFilters.Is:
                return `f${f.id}.value = '${f.value}'`;
              case TextFilters.IsEmpty:
                return `f${f.id}.value is null or f${f.id}.value = ''`;
              case TextFilters.IsNotEmpty:
                return `f${f.id}.value is not null and f${f.id}.value != ''`;
            }
          }
        });

      const fields = await ctx.db.field.findMany({
        where: {
          tableId: input.tableId,
          id: {
            notIn: hiddenFields.length > 0 ? hiddenFields : undefined,
          },
        },
        select: { id: true, Type: true },
      });

      const qry = `
        select
          r.id${fields.length > 0 ? "," : ""}
          ${fields.map((f) => `f${f.id}.value as f${f.id}`).join(",\n")}
        from "Record" r

        ${fields
          .map(
            (f) =>
              `
              left join (
                select "recordId", value
                from "${f.Type === "Text" ? "CellText" : "CellNumber"}"
                where "fieldId" = ${f.id}
                and "value"::text like '%${input.search}%'
              ) as f${f.id} on f${f.id}."recordId" = r.id
            `,
          )
          .join("\n")}

        where r."tableId" = '${input.tableId}'
        ${filterConditions.length > 0 ? "\nand " + filterConditions.join("and\n") : ""}

        order by
        ${sort
          .map((s) => `f${s.id}.value ${s.desc ? "desc" : "asc"}`)
          .join(",\n")}
          ${sort.length > 0 ? "," : ""}r.id
        ;
      `;

      const records =
        await ctx.db.$queryRawUnsafe<Record<string, string | number>[]>(qry);
        
      const results: {rIdx: number, rId: number, fId: number}[] = [];
      for (const [idx, r] of records.entries()) {
        for (const f of fields) {
          if (r[`f${f.id}`]) {
            results.push({rIdx: idx, rId: r.id !== undefined ? Number(r.id) : -1, fId: f.id})
          }
        }
      }
      
      return {
        results,
        search: input.search,
      };
    }),
});
