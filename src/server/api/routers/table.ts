import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

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
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.table.create({
        data: {
          baseId: input.baseId,
          name: input.name,
          View: {
            create: {
              name: "Grid View",
              criteria: {},
            },
          },
        },
      });
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
});
