import type { PrismaClient } from "@prisma/client";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

// importing them doesnt work for some reason
export enum NumberFilters {
  LessThan = "<",
  GreaterThan = ">",
}
enum TextFilters {
  Is = "is",
  Contains = "contains",
  DoesNotContain = "does not contain",
  IsEmpty = "is empty",
  IsNotEmpty = "is not empty",
}

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
      sort: [],
      filters: [],
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
          sort: input.sort,
        },
      });

      return { success: true };
    }),

  updateFilter: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        filters: z.array(
          z.object({
            id: z.string(),
            type: z.union([
              z.nativeEnum(NumberFilters),
              z.nativeEnum(TextFilters),
            ]),
            value: z.string().optional(),
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
          filters: input.filters,
        },
      });

      return { success: true };
    }),

  updateHiddenFields: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        hiddenFields: z.array(z.number()),
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
          hiddenFields: input.hiddenFields
        },
      });

      return { success: true };
    }),
});
