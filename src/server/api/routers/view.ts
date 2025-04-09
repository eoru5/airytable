import type { PrismaClient } from "@prisma/client";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const createView = async (
  db: PrismaClient,
  input: {
    name: string;
    tableId: string;
  },
) => {
  return db.view.create({
    data: {
      tableId: input.tableId,
      name: input.name,
      criteria: {},
    },
  });
};

export const viewRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
        name: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return createView(ctx.db, input);
    }),

  deleteView: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // check user owns view
      const view = await ctx.db.view.findFirst({
        where: {
          id: input.id,
          Table: {
            Base: {
              userId: ctx.session.user.id,
            },
          },
        },
      });

      if (!view) throw new Error("Error occurred");

      await ctx.db.view.delete({
        where: { id: view.id },
      });

      return { success: true };
    }),

  updateSort: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        sort: z.array(
          z.object({
            id: z.string(),
            desc: z.boolean(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const view = await ctx.db.view.findFirst({
        where: {
          id: input.id,
          Table: {
            Base: {
              userId: ctx.session.user.id,
            },
          },
        },
      });

      if (!view) throw new Error("Error occurred");

      await ctx.db.view.update({
        where: { id: view.id },
        data: {
          criteria: {
            sort: input.sort,
          },
        },
      });

      return { success: true };
    }),
});
