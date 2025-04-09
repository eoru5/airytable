import { z } from "zod";
import { faker } from "@faker-js/faker";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import type { PrismaClient } from "@prisma/client";
import { getFields } from "./table";

export const createRecords = async (
  db: PrismaClient,
  tableId: string,
  amount: number,
  generateData = false,
  generators: Record<string, () => string | number> = {},
) => {
  // make some records
  const createRecords = Array(amount).fill({ tableId });
  const records = await db.record.createManyAndReturn({ data: createRecords });

  // find the fields in the table so we can generate cells for them
  const fields = await getFields(tableId);

  if (!generateData) return;

  // generate cells
  const numberCells = [];
  const textCells = [];

  for (const record of records) {
    for (const field of fields) {
      if (field.Type === "Number") {
        const value =
          (generators[field.name]?.() as number) ??
          faker.number.int({ min: 0, max: 1000 });
        const cell = {
          recordId: record.id,
          fieldId: field.id,
          value,
        };
        numberCells.push(cell);
      } else {
        const value =
          (generators[field.name]?.() as string) ??
          faker.word.noun({ length: { min: 1, max: 5 } });
        const cell = {
          recordId: record.id,
          fieldId: field.id,
          value,
        };
        textCells.push(cell);
      }
    }
  }
  await db.cellText.createMany({ data: textCells });
  await db.cellNumber.createMany({ data: numberCells });
};

export const recordRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
        numRows: z.number().min(1),
        randomData: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const table = await ctx.db.table.findUnique({
        where: { id: input.tableId, Base: { userId: ctx.session.user.id } },
      });
      if (!table) throw new Error("Table not found or user doesn't have perms");

      await createRecords(
        ctx.db,
        input.tableId,
        input.numRows,
        input.randomData,
      );
    }),
});
