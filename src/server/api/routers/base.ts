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
        name: z.string().min(1)
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.base.create({
        data: {
          name: input.name,
          User: { connect: { id: ctx.session.user.id } },
        },
      });
    }),

  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const bases = await ctx.db.base.findMany({
        orderBy: { modifiedAt: "desc" },
        where: { User: { id: ctx.session.user.id } },
      });
      return bases ?? [];
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const deleted = await ctx.db.base.deleteMany({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (deleted.count === 0) {
        throw new Error("Error occured, no base deleted");
      }
      return { success: true };
    }),

  rename: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1)
      })
    )
    .mutation(async ({ ctx, input }) => {
      const base = await ctx.db.base.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!base) {
        throw new Error("Base not found");
      }

      return ctx.db.base.update({
        where: { id: input.id },
        data: { name: input.name },
      });
    }),

  open: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const base = await ctx.db.base.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!base) {
        throw new Error("Base not found");
      }

      const updatedBase = await ctx.db.base.update({
        where: { id: input.id },
        data: {
          modifiedAt: new Date(),
        },
      });

      return updatedBase;
    }),
});
