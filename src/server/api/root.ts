import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { s3Router } from "./router/s3";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
// create the s3 router.
export const appRouter = createTRPCRouter({
    s3:s3Router
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
