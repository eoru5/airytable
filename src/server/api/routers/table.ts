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

  deleteTable: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // check user owns the table
      const table = await ctx.db.table.findFirst({
        where: {
          id: input.id,
          Base: {
            userId: ctx.session.user.id,
          },
        },
        select: { id: true },
      });

      if (!table) throw new Error("Error occurred");

      // delete everything associated with the table (cells, fields, records, views)
      await ctx.db.cellNumber.deleteMany({
        where: { Record: { tableId: table.id } },
      });

      await ctx.db.cellText.deleteMany({
        where: { Record: { tableId: table.id } },
      });

      await ctx.db.field.deleteMany({
        where: { tableId: table.id },
      });

      await ctx.db.record.deleteMany({
        where: { tableId: table.id },
      });

      await ctx.db.view.deleteMany({
        where: { tableId: table.id },
      });

      // finally delete the table
      await ctx.db.table.delete({
        where: { id: table.id },
      });

      return { success: true };
    }),

  getRecords: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
        viewId: z.string(),
        offset: z.number().min(0).default(0),
        size: z.number().min(1).default(100),
      }),
    )
    .query(async ({ ctx, input }) => {
      const view = await ctx.db.view.findUnique({
        where: { id: input.viewId },
      });

      if (!view) throw new Error("View not found");

      const records = await ctx.db.record.findMany({
        where: {
          tableId: input.tableId,
          Table: {
            Base: {
              userId: ctx.session.user.id,
            },
          },
        },
        skip: input.offset,
        take: input.size,
        include: {
          CellNumber: true,
          CellText: true,
        },
      });

      const recordsById = new Map(records.map((r) => [r.id, r]));

      const sort = (view.sort as { id: string; desc: boolean }[]) ?? [];
      const filters = (view.filters as ColumnFiltersState) ?? [];

      const fields = await ctx.db.field.findMany({
        where: { tableId: input.tableId },
        select: { id: true, Type: true },
      });

      const filterConditions = filters
        .filter((f) => f.value !== undefined)
        .map((f) => {
          if (f.type in NumberFilters) {
            switch (f.type as NumberFilters) {
              case NumberFilters.GreaterThan:
                return `f${f.id}.value > ${f.value}`;
              case NumberFilters.LessThan:
                return `f${f.id}.value < ${f.value}`;
            }
          }

          if (f.type in TextFilters) {
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

      console.log(filterConditions);

      // better to just get the vals from this one qry
      // r.id${fields.length > 0 ? "," : ""}
      // ${fields.map((f) => `f${f.id}.value`).join(",\n")}
      const qry = `
        select
          r.id  
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
          ;
      `;

      const orderedRecords = await ctx.db.$queryRawUnsafe<
        {
          id: number;
          // [key: string]: string | number | null;
        }[]
      >(qry);

      // format the output
      const formattedRecords = orderedRecords.map(({ id }) => {
        const result: Record<string, unknown> = {};
        const record = recordsById.get(id)!;
        record.CellText.forEach((cell) => (result[cell.fieldId] = cell));
        record.CellNumber.forEach((cell) => (result[cell.fieldId] = cell));
        result.recordId = record.id;
        return result;
      });

      return formattedRecords;
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
});
