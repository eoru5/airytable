import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const baseRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // create base with a default view/table
      return ctx.db.base.create({
        data: {
          name: input.name,
          User: { connect: { id: ctx.session.user.id } },
          Table: {
            create: {
              name: "Table 1",
              View: {
                create: {
                  name: "Grid View",
                  criteria: {},
                },
              },
            },
          },
        },
      });
    }),

  // get base data + associated tables + latest used view for each table
  // getting the view lets us route directly to base/table/view instead of relying on the base/table redirect
  // which means we only need to rerender (i think) the table section of the page
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

  // idk if prisma has triggers or sth that be better for this
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // get all the tables and flatten
      const tables = await ctx.db.table.findMany({
        where: {
          baseId: input.id,
          Base: { userId: ctx.session.user.id },
        },
        select: { id: true },
      });
      const tableIds = tables.map((t) => t.id);

      // delete everything associated with base tables (cells, fields, records, views)
      await ctx.db.cellNumber.deleteMany({
        where: { Record: { tableId: { in: tableIds } } },
      });

      await ctx.db.cellText.deleteMany({
        where: { Record: { tableId: { in: tableIds } } },
      });

      await ctx.db.field.deleteMany({
        where: { tableId: { in: tableIds } },
      });

      await ctx.db.record.deleteMany({
        where: { tableId: { in: tableIds } },
      });

      await ctx.db.view.deleteMany({
        where: { tableId: { in: tableIds } },
      });

      // delete tables
      await ctx.db.table.deleteMany({
        where: { id: { in: tableIds } },
      });

      // finally delete the base
      const deleted = await ctx.db.base.deleteMany({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (deleted.count === 0) {
        throw new Error("Error occurred, no base deleted");
      }
      return { success: true };
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

  // opens a view, updating the base/table/view modifiedat and returning the objects
  open: protectedProcedure
    .input(
      z.object({
        baseId: z.string(),
        tableId: z.string(),
        viewId: z.string(),
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
