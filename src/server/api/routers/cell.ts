import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

// cant figure out the types..
// const updateCell = async <T>(
//   ctx: inferProcedureBuilderResolverOptions<typeof protectedProcedure>["ctx"],
//   fieldId: number,
//   recordId: number,
//   value: T | null,
//   cellTable: "cellNumber" | "cellText",
// ) => {
//   const v = await ctx.db.field.findFirst({
//     where: {
//       id: fieldId,
//       Table: { Base: { userId: ctx.session.user.id } },
//     },
//   });
//   const r = await ctx.db.record.findFirst({
//     where: {
//       id: recordId,
//       Table: { Base: { userId: ctx.session.user.id } },
//     },
//   });
//   if (!v || !r)
//     throw new Error("View or record not found or user doesn't own it");

//   const cell = await ctx.db[cellTable].findFirst({
//     where: {
//       fieldId,
//       recordId,
//     },
//   });

//   if (cell && (value === null || value === "")) {
//     // cell exists and empty input => delete cell
//     await ctx.db[cellTable].delete({
//       where: {
//         id: cell.id,
//       },
//     });
//     return null;
//   } else if (cell) {
//     // cell exists and nonempty input => update cell
//     return await ctx.db[cellTable].update({
//       where: { id: cell.id },
//       data: { value },
//     });
//   } else if (!cell && !(value === null || value === "")) {
//     // cell doesnt exist and nonempty input => create cell
//     return await ctx.db[cellTable].create({
//       data: {
//         fieldId,
//         recordId,
//         value,
//       },
//     });
//   }
// };

export const cellRouter = createTRPCRouter({
  updateNumber: protectedProcedure
    .input(
      z.object({
        fieldId: z.number(),
        recordId: z.number(),
        value: z.number().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const v = await ctx.db.field.findFirst({
        where: {
          id: input.fieldId,
          Table: { Base: { userId: ctx.session.user.id } },
        },
      });
      const r = await ctx.db.record.findFirst({
        where: {
          id: input.recordId,
          Table: { Base: { userId: ctx.session.user.id } },
        },
      });
      if (!v || !r)
        throw new Error("View or record not found or user doesn't own it");

      const cell = await ctx.db.cellNumber.findFirst({
        where: {
          fieldId: input.fieldId,
          recordId: input.recordId,
        },
      });

      if (cell && (input.value === null)) {
        // cell exists and empty input => delete cell
        await ctx.db.cellNumber.delete({
          where: {
            id: cell.id,
          },
        });
        return null;
      } else if (cell) {
        // cell exists and nonempty input => update cell
        return await ctx.db.cellNumber.update({
          where: { id: cell.id },
          data: { value: input.value },
        });
      } else if (!cell && !(input.value === null)) {
        // cell doesnt exist and nonempty input => create cell
        return await ctx.db.cellNumber.create({
          data: {
            fieldId: input.fieldId,
            recordId: input.recordId,
            value: input.value,
          },
        });
      }
    }),

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
       {
        const v = await ctx.db.field.findFirst({
          where: {
            id: input.fieldId,
            Table: { Base: { userId: ctx.session.user.id } },
          },
        });
        const r = await ctx.db.record.findFirst({
          where: {
            id: input.recordId,
            Table: { Base: { userId: ctx.session.user.id } },
          },
        });
        if (!v || !r)
          throw new Error("View or record not found or user doesn't own it");
      
        const cell = await ctx.db.cellText.findFirst({
          where: {
            fieldId: input.fieldId,
            recordId: input.recordId,
          },
        });
      
        if (cell && (input.value === null || input.value === "")) {
          // cell exists and empty input => delete cell
          await ctx.db.cellText.delete({
            where: {
              id: cell.id,
            },
          });
          return null;
        } else if (cell) {
          // cell exists and nonempty input => update cell
          return await ctx.db.cellText.update({
            where: { id: cell.id },
            data: { value: input.value },
          });
        } else if (!cell && !(input.value === null || input.value === "")) {
          // cell doesnt exist and nonempty input => create cell
          return await ctx.db.cellText.create({
            data: {
              fieldId: input.fieldId,
              recordId: input.recordId,
              value: input.value,
            },
          });
        }
       }
    ),
});
