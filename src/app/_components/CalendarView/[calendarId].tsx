"use client";

import React, { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import daygrid from "@fullcalendar/daygrid";
import timegrid from "@fullcalendar/timegrid";
import interaction from "@fullcalendar/interaction";
import icalendar from "@fullcalendar/icalendar";
import { useParams } from "next/navigation";
import type {
  CalendarApi,
  DateSelectArg,
  EventAddArg,
  EventChangeArg,
  EventRemoveArg,
  EventApi,
  EventInput,
} from "@fullcalendar/core/index.js";
import { api } from "~/trpc/react";

export default function CalendarViewById() {
  const cal_ref = useRef<FullCalendar | null>(null);
  const { calendarId } = useParams<{ calendarId?: string }>();
  const calendarIdNumber = Number(calendarId);

  const [tempEvents, setTempEvents] = useState<Record<string, unknown>[]>([]);
  const [localEvents, setLocalEvents] = useState<EventInput[]>([]);
  const saveEvents = api.calendar.saveLocalDb.useMutation();
  const { data, isLoading } = api.calendar.getCalendarById.useQuery(
    { calendarId: calendarIdNumber },
    { enabled: !Number.isNaN(calendarIdNumber) },
  );

  useEffect(() => {
    if (Array.isArray(data?.events)) {
      setLocalEvents(data.events as EventInput[]);
      setTempEvents(data.events as EventInput[]);
    }
  }, [data?.events]);

  const refreshEventsFromCalendar = () => {
    const apiInstance = cal_ref.current?.getApi();
    if (!apiInstance) return;
    const updated = apiInstance
      .getEvents()
      .map((event) => event.toPlainObject());
    setTempEvents(updated);
    setLocalEvents(updated as EventInput[]);
  };

  const handleEventChange = (_changeInfo: EventChangeArg) => {
    refreshEventsFromCalendar();
  };

  const handleEventAdd = (_addInfo: EventAddArg) => {
    refreshEventsFromCalendar();
  };

  const handleEventRemove = (_removeInfo: EventRemoveArg) => {
    refreshEventsFromCalendar();
  };

  const handleSelect = (selectionInfo: DateSelectArg) => {
    const calendarApi = selectionInfo.view.calendar;
    calendarApi.unselect();
    const title = window.prompt("Event title?");
    if (!title) return;
    const newEvent: EventInput = {
      title,
      start: selectionInfo.startStr,
      end: selectionInfo.endStr,
      allDay: selectionInfo.allDay,
    };
    setLocalEvents((prev) => [...prev, newEvent]);
    setTempEvents((prev) => [...prev, newEvent]);
  };

  async function handleSave() {
    const namePrompt = window.prompt(
      "Name this calendar",
      data?.name ?? "Untitled calendar",
    );
    const finalName =
      namePrompt?.trim() || data?.name || "Untitled calendar";
    const calID = calendarIdNumber;
    await saveEvents.mutateAsync({
      name: finalName,
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

  return (
    <div className="flex w-full flex-col gap-4">
      <h1 className="text-xl font-semibold">{data.name}</h1>
      <FullCalendar
        ref={cal_ref}
        timeZone="MTC"
        plugins={[daygrid, timegrid, interaction, icalendar]}
        editable={true}
        selectable={true}
        selectMirror={true}
        eventStartEditable={true}
        eventDurationEditable={true}
        events={localEvents}
        initialView="timeGridWeek"
        eventChange={handleEventChange}
        eventAdd={handleEventAdd}
        eventRemove={handleEventRemove}
        select={handleSelect}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
      />
      <button
        type="button"
        onClick={handleSave}
        disabled={saveEvents.isPending}
        className="self-start rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:from-amber-500 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {saveEvents.isPending ? "Saving..." : "Save calendar"}
      </button>
    </div>
  );
}
