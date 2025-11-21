"use client";

import FullCalendar from "@fullcalendar/react";
import daygrid from "@fullcalendar/daygrid";
import timegrid from "@fullcalendar/timegrid";
import interaction from "@fullcalendar/interaction";
import icalendar from "@fullcalendar/icalendar";
import type {
  CalendarApi,
  DateSelectArg,
  EventAddArg,
  EventChangeArg,
  EventRemoveArg,
  EventInput,
  EventClickArg,
} from "@fullcalendar/core/index.js";
import React from "react";

interface CalendarGridProps {
  calendarRef: React.MutableRefObject<FullCalendar | null>;
  events: EventInput[];
  onEventClick: (info: EventClickArg) => void;
  onSelect: (info: DateSelectArg) => void;
  onEventChange: (info: EventChangeArg) => void;
  onEventAdd: (info: EventAddArg) => void;
  onEventRemove: (info: EventRemoveArg) => void;
}

export default function CalendarGrid({
  calendarRef,
  events,
  onEventClick,
  onSelect,
  onEventChange,
  onEventAdd,
  onEventRemove,
}: CalendarGridProps) {
  return (
    <FullCalendar
      ref={calendarRef}
      timeZone="MTC"
      plugins={[daygrid, timegrid, interaction, icalendar]}
      editable={true}
      selectable={true}
      selectMirror={true}
      eventStartEditable={true}
      eventDurationEditable={true}
      events={events}
      initialView="timeGridWeek"
      eventChange={onEventChange}
      eventAdd={onEventAdd}
      eventRemove={onEventRemove}
      select={onSelect}
      eventClick={onEventClick}
      headerToolbar={{
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay",
      }}
    />
  );
}
