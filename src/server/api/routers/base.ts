import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { createTable } from "./table";

export const baseRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const base = await ctx.db.base.create({
        data: {
          name: input.name,
          User: { connect: { id: ctx.session.user.id } },
        },
      });
      await createTable(ctx.db, base.id, "Table 1");
      return base;
    }),

  get: protectedProcedure
    .input(
      z.object({
        baseId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const base = await ctx.db.base.findFirst({
        where: {
          User: { id: ctx.session.user.id },
          id: input.baseId,
        },
        include: {
          Table: {
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              name: true,
              View: {
                orderBy: { modifiedAt: "desc" },
                take: 1,
                select: {
                  id: true,
                },
              },
            },
          },
        },
      });
      return base;
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    const bases = await ctx.db.base.findMany({
      orderBy: { modifiedAt: "desc" },
      where: { User: { id: ctx.session.user.id } },
    });
    return bases ?? [];
  }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.base.delete({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });
    }),

  rename: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.base.update({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        data: {
          name: input.name,
          modifiedAt: new Date(),
        },
      });
    }),

  // return the latest opened table + view for a base
  getLatestTableView: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // get last used table
      const lastUsedTable = await ctx.db.table.findFirst({
        where: { baseId: input.id },
        orderBy: { modifiedAt: "desc" },
      });

      // get last used view
      let lastUsedView = null;
      if (lastUsedTable) {
        lastUsedView = await ctx.db.view.findFirst({
          where: { tableId: lastUsedTable.id },
          orderBy: { modifiedAt: "desc" },
        });
      }

      return {
        lastUsedTable,
        lastUsedView,
      };
    }),

  // opens a base, updating the base/table/view modifiedat and returning the objects
  open: protectedProcedure
    .input(
      z.object({
        baseId: z.string().uuid(),
        tableId: z.string().uuid(),
        viewId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const base = await ctx.db.base.update({
        where: {
          id: input.baseId,
          userId: ctx.session.user.id,
        },
        data: { modifiedAt: new Date() },
      });
      if (!base) throw new Error("Something went wrong (base)");

      const table = await ctx.db.table.update({
        where: { id: input.tableId },
        data: { modifiedAt: new Date() },
      });
      if (!table) throw new Error("Something went wrong (table)");

      const view = await ctx.db.view.update({
        where: { id: input.viewId },
        data: { modifiedAt: new Date() },
      });

      if (!view) throw new Error("Something went wrong (view)");

      return { base, table, view };
    }),
});
