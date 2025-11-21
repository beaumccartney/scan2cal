import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { calendar } from "~/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { readTextFromS3 } from "~/server/lib/s3/readTextFromS3";
/* ---------- Zod Schemas ---------- */
const CalendarIdInput = z.object({
  calendarId: z.number(),
});
const SaveEventsInput = z.object({
  name: z.string().min(1),
  events: z.array(z.unknown()),
  calendarId: z.number(),
});

const CreateCalendarInput = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

const deleteCalendarInput = z.object({
  calendarId: z.number(),
})
const PreviewFromS3Input = z.object({
  cleanKey: z.string(),      
  calendarId: z.number(),    
});

// lLM prompt , this is from gpt.
function buildSchedulePrompt(fullText: string) {
  const lines = fullText
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const limited = lines.slice(0, 200).join("\n");

  return `
You are a precise assistant generating calendar events from academic documents. 

Use the syllabus text to extract every distinct event such as lectures, labs, tutorials, assessments, exams, and assignment deadlines.

Return a JSON array of objects with EXACTLY this structure:
[
  {
    "title": string,
    "start": string,             // ISO 8601, include timezone if present in text. Example: "2025-09-03T14:00:00"
    "end": string | null,        // ISO 8601 end time if available. If only a start time is given, assume a 1 hour duration.
    "allDay": boolean,
    "extendedProps": {
      "course": string | null,   // course code or name if stated
      "location": string | null, // classroom/venue if stated
      "raw_line": string         // the exact sentence/phrase where the event came from
    }
  }
]

Rules:
- Interpret months/day names/dates relative to the academic year mentioned.
- If only a date is given, set allDay = true and leave end = null.
- If a weekday and time are given (e.g. "Wednesdays 3:30-5:00pm"), create a representative event per the first occurrence with both start and end times. Set allDay = false.
- Normalize times to 24-hour format (e.g. 3:30pm -> 15:30). Always include seconds (:00).
- Do not invent events. If a line is ambiguous, include it with the best interpretation and record the original text in raw_line.
- Output ONLY the JSON array, no comments or explanations.

Syllabus text:
${limited}
`.trim();
}

// The Router part
export const calendarRouter = createTRPCRouter({
  listCalendars: protectedProcedure.query(({ ctx }) => {
    // get current user id
    const accountId = ctx.userSession?.user.accountId;
    console.log("Account ID:", accountId);

    if (!accountId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
// select current user's calendar
    return ctx.db
      .select()
      .from(calendar)
      .where(eq(calendar.account_id, accountId));
  }),
// get current calendar id
  getCalendarById: protectedProcedure
    .input(CalendarIdInput)
    .query(({ ctx, input }) => {
      const accountId = ctx.userSession?.user?.accountId;
      if (!accountId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
// find the calendar from the calendar database
      return ctx.db.query.calendar.findFirst({
        where: (cal) =>
          and(
            eq(cal.calendar_id, input.calendarId),
            eq(cal.account_id, accountId),
          ),
      });
    }),
// create the calendar
  createCalendar: protectedProcedure
    .input(CreateCalendarInput)
    .mutation(async ({ ctx, input }) => {
      const accountId = ctx.userSession?.user?.accountId;
      if (!accountId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
// insert a table in calendar table
      const [inserted] = await ctx.db
        .insert(calendar)
        .values({
          name: input.name,
          description: input.description,
          account_id: accountId,
          events: [],
        })
        .returning({ calendarId: calendar.calendar_id });

      if (!inserted) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable to create calendar",
        });
      }

      return inserted;
    }),
  
  // delete calendar
  deleteCalendar: protectedProcedure
    .input(deleteCalendarInput)
    .mutation(async ({ ctx, input }) => {
      const accountId = ctx.userSession?.user?.accountId;
      if (!accountId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      //delete calendar from calendar table
      const deleted = await ctx.db
        .delete(calendar)
        .where(
          and(
            eq(calendar.calendar_id, input.calendarId),
            eq(calendar.account_id, accountId),
          ),
        )
        .returning({
          calendarId: calendar.calendar_id,
          name: calendar.name,
        });

      const row = deleted[0];

      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Calendar not found or not owned by user",
        });
      }

      return row;
    }),
// save the all events in calendar table
  saveLocalDb: protectedProcedure
    .input(SaveEventsInput)
    .mutation(({ ctx, input }) => {
      const accountId = ctx.userSession?.user?.accountId;
      if (!accountId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      console.log(
        ` Saving calendar ${input.calendarId} (${input.name}) with ${input.events.length} events`,
      );
      console.log(JSON.stringify(input.events, null, 2));
// insert the event in calendar table
      return ctx.db
        .insert(calendar)
        .values({
          calendar_id: input.calendarId,
          name: input.name,
          account_id: accountId,
          events: input.events,
        }) 
        // if the calendar exist, just update the table
        .onConflictDoUpdate({
          target: calendar.calendar_id,
          set: {
            name: input.name,
            events: input.events,
          },
        });
    }),
    // Read cleaned TXT from S3 → Parse into events using LLM → Return to preview
  previewLlmEventsFromS3: protectedProcedure
  .input(PreviewFromS3Input)
  .mutation(async ({ ctx, input }) => {
    const accountId = ctx.userSession?.user?.accountId;
    if (!accountId) throw new TRPCError({ code: "UNAUTHORIZED" });

 // find user owned calendar first
    const cal = await ctx.db.query.calendar.findFirst({
      where: (cal) =>
        and(
          eq(cal.calendar_id, input.calendarId),
          eq(cal.account_id, accountId),
        ),
    });
// if calendar doesnt exist, throw error
    if (!cal)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Calendar not found or not owned by user",
      });
// get the text from S3
    const text = await readTextFromS3(input.cleanKey);
    if (!text || text.length < 20)
      return { events: [] };

    const apiKey = process.env.GEMINI_API_KEY!;
    const prompt = buildSchedulePrompt(text);
// Create the LLM pinpline
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0,
      },
    });

    const res = await model.generateContent(prompt);
    // save the reslut to json
    const jsonText = res.response.text();

    let parsedEvents: unknown = [];
    try {
      parsedEvents = JSON.parse(jsonText);
    } catch (error) {
      console.error("LLM JSON parse error", error);
      console.error(jsonText);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "LLM returned invalid JSON",
      });
    }

    const eventsArray = Array.isArray(parsedEvents) ? parsedEvents : [];

    return { events: eventsArray };
  }),
});
