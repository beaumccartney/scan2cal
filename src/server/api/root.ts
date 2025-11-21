import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { calendarRouter } from "./routers/calendarRouter";
import { s3Router } from "./routers/s3Router";
// import { awsRouter } from "./routers/awsRouter";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  calendar: calendarRouter,
  s3: s3Router,
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
