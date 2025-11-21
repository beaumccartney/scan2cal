"use client";

import React, { useEffect, useRef, useState } from "react";
import type FullCalendar from "@fullcalendar/react";
import { useParams } from "next/navigation";
import type {
  CalendarApi,
  DateSelectArg,
  EventAddArg,
  EventChangeArg,
  EventRemoveArg,
  EventApi,
  EventInput,
  EventClickArg,
} from "@fullcalendar/core/index.js";
import { api } from "~/trpc/react";
import CalendarActions from "./saveCalendarandDeleteCalendar";
import CalendarToolbar from "./CalendarToolbar";
import LlmPanel from "./LlmPanel";
import CalendarGrid from "./CalendarGrid";
import CalendarStatusBadge from "./CalendarStatusBadge";
import EditEventModal from "./EditEventModal";

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
  const [showLlmPanel, setShowLlmPanel] = useState(false);
  const [editingEvent, setEditingEvent] = useState<{
    event: EventApi;
    title: string;
    start: string;
    end: string;
    allDay: boolean;
    location: string;
    notes: string;
  } | null>(null);
  const [calendarStatus, setCalendarStatus] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

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

  const handleEventClick = (clickInfo: EventClickArg) => {
    const { event } = clickInfo;
    const toDateTimeLocal = (date?: Date | null) => {
      if (!date) return "";
      const pad = (n: number) => n.toString().padStart(2, "0");
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };
    const toDateValue = (date?: Date | null) => {
      if (!date) return "";
      const pad = (n: number) => n.toString().padStart(2, "0");
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    };
    setEditingEvent({
      event,
      title: event.title,
      start: event.allDay ? toDateValue(event.start) : toDateTimeLocal(event.start),
      end: event.allDay ? toDateValue(event.end) : toDateTimeLocal(event.end),
      allDay: event.allDay,
      location: (event.extendedProps?.location as string) ?? "",
      notes: (event.extendedProps?.raw_line as string) ?? "",
    });
  };

  const handleEditField = (field: string, value: string | boolean) => {
    setEditingEvent((prev) =>
      prev ? { ...prev, [field]: value } : prev,
    );
  };

  const handleEditSave = () => {
    if (!editingEvent) return;
    const { event, title, allDay, location, notes } = editingEvent;
    const parseDate = (value: string, isAllDay: boolean) => {
      if (!value) return null;
      if (isAllDay) {
        return new Date(`${value}T00:00:00`);
      }
      return new Date(value);
    };
    const startDate =
      parseDate(editingEvent.start, allDay) ??
      event.start ??
      new Date();
    const endDate = parseDate(editingEvent.end, allDay);

    event.setProp("title", title || "Untitled event");
    // @ts-ignore
    event.setDates(startDate, endDate ?? undefined, { allDay });
    event.setExtendedProp("location", location);
    event.setExtendedProp("raw_line", notes);

    refreshEventsFromCalendar();
    setEditingEvent(null);
  };

  const handleEditDelete = () => {
    if (!editingEvent) return;
    editingEvent.event.remove();
    refreshEventsFromCalendar();
    setEditingEvent(null);
  };
// H andler for events generated by LLM panel
  const handleLlmEvents = (eventsFromLlm: EventInput[]) => {
    setLocalEvents(eventsFromLlm);
    setTempEvents(eventsFromLlm as Record<string, unknown>[]);
    setCalendarStatus({
      type: "success",
      text: `Loaded ${eventsFromLlm.length} event(s) from LLM output.`,
    });
  };

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
      <CalendarToolbar
        title={data.name}
        showLlmPanel={showLlmPanel}
        onToggleLlm={() => setShowLlmPanel((prev) => !prev)}
      />

      {showLlmPanel && (
        <LlmPanel
          calendarId={calendarIdNumber}
          onEventsGenerated={handleLlmEvents}
          status={calendarStatus}
        />
      )}

      <CalendarGrid
        calendarRef={cal_ref}
        events={localEvents}
        onEventChange={handleEventChange}
        onEventAdd={handleEventAdd}
        onEventRemove={handleEventRemove}
        onSelect={handleSelect}
        onEventClick={handleEventClick}
      />

      <div className="flex flex-wrap items-center gap-3">
        <CalendarActions
          calendarId={calendarIdNumber}
          initialName={data?.name}
          tempEvents={tempEvents}
        />
        {!showLlmPanel && <CalendarStatusBadge status={calendarStatus} />}
      </div>

      <EditEventModal
        editingEvent={editingEvent}
        onFieldChange={handleEditField}
        onSave={handleEditSave}
        onDelete={handleEditDelete}
        onClose={() => setEditingEvent(null)}
      />
    </div>
  );
}
