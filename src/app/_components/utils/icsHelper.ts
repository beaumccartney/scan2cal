import type { EventInput } from "@fullcalendar/core/index.js";
import ICAL from "ical.js";

const formatICSDate = (date: Date, allDay: boolean) => {
  if (allDay) {
    return date.toISOString().slice(0, 10).replace(/-/g, "");
  }
  return date.toISOString().replace(/[-:]/g, "").replace(".000Z", "Z");
};

const escapeICS = (text: string) =>
  text.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,");

export const eventsToICS = (events: EventInput[], calendarName: string) => {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Scan2cal//EN",
  ];

  events.forEach((event, idx) => {
    const start = event.start
      ? new Date(event.start as string | number)
      : null;
    const end = event.end ? new Date(event.end as string | number) : null;
    const allDay = !!event.allDay;
    lines.push("BEGIN:VEVENT");
    lines.push(
      `UID:${event.id ?? `scan2cal-${idx}-${Date.now()}`}@scan2cal.local`,
    );
    if (start) {
      lines.push(
        `${allDay ? "DTSTART;VALUE=DATE" : "DTSTART"}:${formatICSDate(
          start,
          allDay,
        )}`,
      );
    }
    if (end) {
      lines.push(
        `${allDay ? "DTEND;VALUE=DATE" : "DTEND"}:${formatICSDate(
          end,
          allDay,
        )}`,
      );
    }
    lines.push(`SUMMARY:${escapeICS(event.title || "Untitled event")}`);
    if (event.extendedProps?.location) {
      lines.push(
        `LOCATION:${escapeICS(event.extendedProps.location as string)}`,
      );
    }
    if (event.extendedProps?.raw_line) {
      lines.push(
        `DESCRIPTION:${escapeICS(event.extendedProps.raw_line as string)}`,
      );
    }
    lines.push("END:VEVENT");
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
};

export const parseICS = (text: string) => {
  const jcal = ICAL.parse(text);
  const comp = new ICAL.Component(jcal);
  const vevents = comp.getAllSubcomponents("vevent");
  return vevents.map((vevent) => {
    const icalEvent = new ICAL.Event(vevent);
    const startDate = icalEvent.startDate?.toJSDate();
    const endDate = icalEvent.endDate?.toJSDate();
    const allDay = !!icalEvent.startDate?.isDate;
    return {
      title: icalEvent.summary || "Untitled event",
      start: startDate ? startDate.toISOString() : undefined,
      end: endDate ? endDate.toISOString() : undefined,
      allDay,
      extendedProps: {
        location: icalEvent.location || null,
        raw_line: icalEvent.description || null,
        course: null,
      },
    } as EventInput;
  });
};

