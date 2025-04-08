import { record, z } from "zod";
import { faker } from "@faker-js/faker";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import type { PrismaClient } from "@prisma/client";
import { createView } from "./view";
import { db } from "~/server/db";
import { createRecords } from "./record";

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
  generateData: boolean = true,
  numRecords: number = 3,
) => {
  const table = await db.table.create({
    data: {
      baseId: baseId,
      name: name,
    },
  });
  await createView(db, { name: "Grid View", tableId: table.id });

  // field = col, record = row
  const fields = await db.field.createManyAndReturn({
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
          Name: faker.person.fullName,
          Color: faker.color.human,
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
        offset: z.number().min(0).default(0),
        size: z.number().min(1).default(100),
      }),
    )
    .query(async ({ ctx, input }) => {
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
        orderBy: { id: "asc" },
        include: {
          CellNumber: true,
          CellText: true,
        },
      });

      // format the output
      const formattedRecords = records.map((record) => {
        const recordData: Record<string, any> = {};
        record.CellText.forEach(
          (cell) => (recordData[cell.fieldId] = cell),
        );
        record.CellNumber.forEach(
          (cell) => (recordData[cell.fieldId] = cell),
        );
        recordData.recordId = record.id;
        return recordData;
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
