import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { calendar } from "~/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";

import { z } from "zod";
import { db } from "~/server/db";
const CalendarIdInput = z.object({
  calendarId: z.number(),
});
const SaveEventsInput = z.object({
  name: z.string().min(1),
  events: z.array(z.unknown()),
  calendarId: z.number(),
});

export const calendarRouter = createTRPCRouter({
  listCalendars: protectedProcedure.query(({ ctx }) => {
    const accountId = ctx.userSession?.user.id;
    console.log("Account ID:", accountId);
    if (!accountId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return ctx.db
      .select()
      .from(calendar)
      .where(eq(calendar.account_id, accountId));
  }),

  getCalendarById: protectedProcedure
    .input(CalendarIdInput)
    .query(({ ctx, input }) => {
      const accountId = ctx.userSession?.user?.id;
      if (!accountId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      return ctx.db.query.calendar.findFirst({
        where: (cal) =>
          and(
            eq(cal.calendar_id, input.calendarId),
            eq(cal.account_id, accountId),
          ),
      });
    }),

  saveLocalDb: protectedProcedure
    .input(SaveEventsInput)
    .mutation(({ ctx, input }) => {
      const accountId = ctx.userSession?.user?.id;
      if (!accountId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      return ctx.db
        .insert(calendar)
        .values({
          calendar_id: input.calendarId,
          name: input.name,
          account_id: accountId,
          events: input.events,
        })
        .onConflictDoUpdate({
          target: calendar.calendar_id,
          set: {
            name: input.name,
            events: input.events,
          },
        });
    }),
});
