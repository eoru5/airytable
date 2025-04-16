import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const fieldRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
        name: z.string().min(1),
        type: z.enum(["Text", "Number"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const table = await ctx.db.table.findUnique({
        where: { id: input.tableId, Base: { userId: ctx.session.user.id } },
      });
      if (!table) throw new Error("Table not found or user doesn't have perms");
      await ctx.db.field.create({
        data: { tableId: input.tableId, name: input.name, Type: input.type },
      });
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.field.delete({
        where: {
          id: input.id,
          Table: {
            Base: {
              userId: ctx.session.user.id,
            },
          },
        },
      });
    }),

  rename: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.field.update({
        where: {
          id: input.id,
          Table: {
            Base: {
              userId: ctx.session.user.id,
            },
          },
        },
        data: {
          name: input.name,
        },
      });
    }),
});
