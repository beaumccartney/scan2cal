"use client";

import { useRef, useState } from "react";
import { api } from "~/trpc/react";
import { parseICS } from "../utils/icsHelper";

export default function ImportICSButton() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const createCalendar = api.calendar.createCalendar.useMutation();
  const saveCalendar = api.calendar.saveLocalDb.useMutation();

  const handleImport = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const events = parseICS(text);
      if (!events.length) {
        setMessage("File contains no events.");
        return;
      }
      const calendarName =
        window.prompt("Name for the imported calendar?", file.name) ??
        file.name;
      const { calendarId } = await createCalendar.mutateAsync({
        name: calendarName,
      });
      await saveCalendar.mutateAsync({
        name: calendarName,
        events,
        calendarId,
      });
      setMessage(`Imported ${events.length} event(s) into ${calendarName}.`);
    } catch (err) {
      console.error(err);
      setMessage("Failed to import ICS.");
    } finally {
      e.target.value = "";
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
      >
        Import .ics
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".ics,text/calendar"
        className="hidden"
        onChange={handleImport}
      />
      {message && <p className="mt-2 text-xs text-blue-600">{message}</p>}
    </div>
  );
}
