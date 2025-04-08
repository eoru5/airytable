import { record, z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

const updateCell = async <T>(
  ctx: any,
  fieldId: number,
  recordId: number,
  value: T | null,
  cellTable: string,
) => {
  const v = await ctx.db.field.findFirst({
    where: {
      id: fieldId,
      Table: { Base: { userId: ctx.session.user.id } },
    },
  });
  const r = await ctx.db.record.findFirst({
    where: {
      id: recordId,
      Table: { Base: { userId: ctx.session.user.id } },
    },
  });
  if (!v || !r)
    throw new Error("View or record not found or user doesn't own it");

  const cell = await ctx.db[cellTable].findFirst({
    where: {
      fieldId,
      recordId,
    },
  });

  if (cell && (value === null || value === "")) {
    // cell exists and empty input => delete cell
    await ctx.db[cellTable].delete({
      where: {
        id: cell.id,
      },
    });
    return null;
  } else if (cell) {
    // cell exists and nonempty input => update cell
    return await ctx.db[cellTable].update({
      where: { id: cell.id },
      data: { value },
    });
  } else if (!cell && !(value === null || value === "")) {
    // cell doesnt exist and nonempty input => create cell
    return await ctx.db[cellTable].create({
      data: {
        fieldId,
        recordId,
        value,
      },
    });
  }
};

export const cellRouter = createTRPCRouter({
  updateNumber: protectedProcedure
    .input(
      z.object({
        fieldId: z.number(),
        recordId: z.number(),
        value: z.number().nullable(),
      }),
    )
    .mutation(
      async ({ ctx, input }) =>
        await updateCell(ctx, input.fieldId, input.recordId, input.value, "cellNumber"),
    ),

  updateText: protectedProcedure
    .input(
      z.object({
        fieldId: z.number(),
        recordId: z.number(),
        value: z.string().nullable(),
      }),
    )
    .mutation(
      async ({ ctx, input }) =>
        await updateCell(ctx, input.fieldId, input.recordId, input.value, "cellText"),
    ),
});
