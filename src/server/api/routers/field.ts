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
});
