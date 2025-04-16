import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { baseRouter } from "./routers/base";
import { tableRouter } from "./routers/table";
import { viewRouter } from "./routers/view";
import { cellRouter } from "./routers/cell";
import { fieldRouter } from "./routers/field";
import { recordRouter } from "./routers/record";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  base: baseRouter,
  table: tableRouter,
  view: viewRouter,
  cell: cellRouter,
  field: fieldRouter,
  record: recordRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
