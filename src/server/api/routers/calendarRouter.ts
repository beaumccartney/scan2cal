import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { calendar } from "~/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { db } from "~/server/db";
import {readTextFromS3} from "~/server/lib/s3/readTextFromS3"
const CalendarIdInput = z.object({
  calendarId: z.number(),
});
const SaveEventsInput = z.object({
  name: z.string().min(1),
  events: z.array(z.unknown()),
  calendarId: z.number(),
});

const LlmPreviewInput = z.object({
  calendarId: z.number(),
  cleanKey: z. string(),
});


const PreviewFromS3Input = z.object({
  cleanKey: z.string(),      // S3 上 clean/...txt 的 key
  calendarId: z.number(),    // 要存到哪个 calendar
});

// lLM prompt
function buildSchedulePrompt(fullText: string) {
  // 简单做个行数/长度截断，防止 prompt 太长
  const lines = fullText
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const limited = lines.slice(0, 200).join("\n"); // 例如只拿前 200 行

  return `
You are an assistant that extracts course schedule events for a university student.

From the syllabus text below, extract all relevant calendar events: lectures, labs, tutorials, exams, assignment deadlines, quizzes, etc.

Return a JSON array of objects with this exact shape:

[
  {
    "title": string,
    "start": string,
    "end": string | null,
    "allDay": boolean,
    "extendedProps": {
      "course": string | null,
      "location": string | null,
      "raw_line": string | null
    }
  }
]

Rules:
- Use ISO 8601 date/time (e.g. "2025-09-03T14:00:00" or "2025-09-03").
- If there is only a date with no time, set allDay = true.
- If there is a time range, fill both start and end.
- Do not create events that are not clearly supported by the text.
- If there is no time/date-related content, return an empty JSON array [].
- Output ONLY the JSON array, no extra text.

Syllabus text:
${limited}
`.trim();
}


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
      console.log("📥 Saving calendar:", input.name, input.events.length);
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
  previewLlmEventsFromS3: protectedProcedure
  .input(PreviewFromS3Input)
  .mutation(async ({ ctx, input }) => {
    const accountId = ctx.userSession?.user?.id;
    if (!accountId) throw new TRPCError({ code: "UNAUTHORIZED" });


    const cal = await ctx.db.query.calendar.findFirst({
      where: (cal) =>
        and(
          eq(cal.calendar_id, input.calendarId),
          eq(cal.account_id, accountId),
        ),
    });

    if (!cal)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Calendar not found or not owned by user",
      });

    const text = await readTextFromS3(input.cleanKey);
    if (!text || text.length < 20)
      return { events: [] };

    const apiKey = process.env.GEMINI_API_KEY!;
    const prompt = buildSchedulePrompt(text);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0,
      },
    });

    const res = await model.generateContent(prompt);
    const jsonText = res.response.text();

    let events;
    try {
      events = JSON.parse(jsonText);
    } catch (e) {
      console.error(jsonText);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "LLM returned invalid JSON",
      });
    }

    if (!Array.isArray(events)) events = [];

    return { events };
  }),
});
