"use client";

import type { EventInput } from "@fullcalendar/core/index.js";
import CleanedUploadPanel from "./CleanedUploadPanel";
import CalendarStatusBadge from "./CalendarStatusBadge";

interface Props {
  calendarId: number;
  onEventsGenerated: (events: EventInput[]) => void;
  status: { type: "success" | "error"; text: string } | null;
}

export default function LlmPanel({
  calendarId,
  onEventsGenerated,
  status,
}: Props) {
  return (
    <div className="space-y-3 rounded-2xl border border-gray-200 bg-white/80 p-4 shadow">
      <CleanedUploadPanel
        calendarId={calendarId}
        onEventsGenerated={onEventsGenerated}
      />
      <CalendarStatusBadge status={status} />
    </div>
  );
}
