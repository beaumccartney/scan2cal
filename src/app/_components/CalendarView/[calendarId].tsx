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
  EventClickArg,
} from "@fullcalendar/core/index.js";
import { api } from "~/trpc/react";
import CalendarActions from "./saveCalendarandDeleteCalendar";


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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">{data.name}</h1>
        <button
          type="button"
          onClick={() => setShowLlmPanel((prev) => !prev)}
          className="rounded-lg border border-blue-200 px-3 py-1 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
        >
          {showLlmPanel ? "Hide LLM panel" : "Run LLM"}
        </button>
      </div>

    
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
        eventClick={handleEventClick}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
      />
    
      <CalendarActions
        calendarId={calendarIdNumber}
        initialName={data?.name}
        tempEvents={tempEvents}
      />
       
      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setEditingEvent(null)}
          />
          <div className="relative w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold">Edit event</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Title
                <input
                  type="text"
                  value={editingEvent.title}
                  onChange={(e) => handleEditField("title", e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={editingEvent.allDay}
                  onChange={(e) => handleEditField("allDay", e.target.checked)}
                />
                All-day event
              </label>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="text-sm font-medium text-gray-700">
                  Start
                  <input
                    type={editingEvent.allDay ? "date" : "datetime-local"}
                    value={editingEvent.start}
                    onChange={(e) => handleEditField("start", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-sm font-medium text-gray-700">
                  End
                  <input
                    type={editingEvent.allDay ? "date" : "datetime-local"}
                    value={editingEvent.end}
                    onChange={(e) => handleEditField("end", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </label>
              </div>
              <label className="text-sm font-medium text-gray-700">
                Location
                <input
                  type="text"
                  value={editingEvent.location}
                  onChange={(e) => handleEditField("location", e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm font-medium text-gray-700">
                Notes
                <textarea
                  value={editingEvent.notes}
                  onChange={(e) => handleEditField("notes", e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  rows={3}
                />
              </label>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={handleEditSave}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
              >
                Save changes
              </button>
              <button
                type="button"
                onClick={handleEditDelete}
                className="rounded-lg border border-red-200 px-4 py-2 text-red-600 transition hover:bg-red-50"
              >
                Delete event
              </button>
              <button
                type="button"
                onClick={() => setEditingEvent(null)}
                className="rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
