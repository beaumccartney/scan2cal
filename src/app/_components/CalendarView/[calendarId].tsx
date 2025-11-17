"use client";

// import calendarExample from "../../../../public/random-events.ics";
import React, { useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import daygrid from "@fullcalendar/daygrid";
import interaction from "@fullcalendar/interaction";
// import { CalendarApi } from "@fullcalendar/core/";
import icalendar from "@fullcalendar/icalendar";
// import { getEvents } from "./events";

import { useParams } from "next/navigation";
import type { EventApi, EventInput } from "@fullcalendar/core/index.js";
import { api } from "~/trpc/react";

export default function CalendarViewById() {
  const cal_ref = useRef<FullCalendar | null>(null);
  const { calendarId } = useParams<{ calendarId?: string }>();
  const calendarIdNumber = Number(calendarId);

  const [tempEvents, setTempEvents] = useState<Record<string, unknown>[]>([]);
  const saveEvents = api.calendar.saveLocalDb.useMutation();
  const { data, isLoading } = api.calendar.getCalendarById.useQuery(
    { calendarId: calendarIdNumber },
    { enabled: !Number.isNaN(calendarIdNumber) },
  );

  const handleEventsSet = (calendarEvents: EventApi[]) => {
    setTempEvents(calendarEvents.map((event) => event.toPlainObject()));
  };

  async function handleSave() {
    if (!tempEvents.length) return;
    const name = window.prompt("Name this calendar");
    const calID = calendarIdNumber;
    if (!name) return;
    await saveEvents.mutateAsync({
      name,
      events: tempEvents,
      calendarId: calID,
    });
  }

  if (Number.isNaN(calendarIdNumber)) {
    return <div>Invalid calendar selected.</div>;
  }

  if (isLoading) {
    return <div>Loading calendar...</div>;
  }

  if (!data) {
    return <div>Calendar not found.</div>;
  }

  const events: EventInput[] = Array.isArray(data.events)
    ? (data.events as EventInput[])
    : [];

  return (
    <div className="flex w-full flex-col gap-4">
      <h1 className="text-xl font-semibold">{data.name}</h1>
      <FullCalendar
        ref={cal_ref}
        timeZone="MTC"
        plugins={[daygrid, interaction, icalendar]}
        editable={true}
        events={events}
        initialView="dayGridWeek"
        eventsSet={handleEventsSet}
        eventMouseEnter={() => {
          console.log("Entered");
          return (
            <div className="z-20 hidden h-[20px] w-[20px] bg-red-400">
              HELLO THERE
            </div>
          );
        }}
        headerToolbar={{
          left: "prev,next",
          center: "title",
          right: "dayGridWeek,dayGridDay",
        }}
      />
      <div className="h-20 w-20 bg-amber-300" onClick={handleSave}>
        Save
      </div>
    </div>
  );
}
