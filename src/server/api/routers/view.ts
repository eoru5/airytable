import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const viewRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
        name: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.view.create({
        data: {
          tableId: input.tableId,
          name: input.name,
          criteria: {},
        },
      });
    }),

  deleteView: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // check user owns view
      // could prob do this better tbh
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
});
