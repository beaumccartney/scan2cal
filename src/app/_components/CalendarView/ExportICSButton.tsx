"use client";

import { useState } from "react";
import type { EventInput } from "@fullcalendar/core/index.js";
import { eventsToICS } from "../utils/icsHelper";

interface CalendarInfo {
  calendar_id: number;
  name: string;
  events: EventInput[] | null;
}

export default function ExportICSButton({
  calendars,
}: {
  calendars: CalendarInfo[];
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | "">("");
  const [message, setMessage] = useState<string | null>(null);

  const handleExport = () => {
    if (typeof selectedId !== "number") {
      setMessage("Select a calendar first");
      return;
    }
    const calendar = calendars.find((c) => c.calendar_id === selectedId);
    if (!calendar) {
      setMessage("Calendar not found");
      return;
    }
    const events = Array.isArray(calendar.events) ? calendar.events : [];
    if (!events.length) {
      setMessage("Calendar has no events");
      return;
    }
    const icsData = eventsToICS(events, calendar.name ?? "calendar");
    const blob = new Blob([icsData], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(calendar.name ?? "calendar")
      .replace(/\s+/g, "-")
      .toLowerCase()}.ics`;
    a.click();
    URL.revokeObjectURL(url);
    setPickerOpen(false);
    setMessage(`Exported ${events.length} event(s)`);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          if (!calendars.length) {
            setMessage("No calendars to export");
            return;
          }
          setPickerOpen((prev) => !prev);
        }}
        className="rounded-lg border border-emerald-200 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
      >
        Export .ics
      </button>
      {pickerOpen && (
        <div className="absolute right-0 top-full z-20 mt-2 w-64 rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
          <label className="text-xs font-medium text-gray-600">
            Choose calendar
            <select
              value={selectedId}
              onChange={(e) =>
                setSelectedId(
                  e.target.value === ""
                    ? ""
                    : Number.parseInt(e.target.value, 10),
                )
              }
              className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select calendar</option>
              {calendars.map((calendar) => (
                <option
                  key={calendar.calendar_id}
                  value={calendar.calendar_id}
                >
                  {calendar.name}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={handleExport}
            className="mt-3 w-full rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Download .ics
          </button>
        </div>
      )}
      {message && <p className="mt-2 text-xs text-emerald-600">{message}</p>}
    </div>
  );
}
