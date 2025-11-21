"use client";

import React from "react";
//https://fullcalendar.io/docs/vertical-resource-view 
// User can edit the event，some function comes from Doc
interface EditingEventState {
  event: any;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  location: string;
  notes: string;
}

interface Props {
  editingEvent: EditingEventState | null;
  onFieldChange: (field: string, value: string | boolean) => void;
  onSave: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function EditEventModal({
  editingEvent,
  onFieldChange,
  onSave,
  onDelete,
  onClose,
}: Props) {
  if (!editingEvent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-semibold">Edit event</h3>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Title
            <input
              type="text"
              value={editingEvent.title}
              onChange={(e) => onFieldChange("title", e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={editingEvent.allDay}
              onChange={(e) => onFieldChange("allDay", e.target.checked)}
            />
            All-day event
          </label>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm font-medium text-gray-700">
              Start
              <input
                type={editingEvent.allDay ? "date" : "datetime-local"}
                value={editingEvent.start}
                onChange={(e) => onFieldChange("start", e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              End
              <input
                type={editingEvent.allDay ? "date" : "datetime-local"}
                value={editingEvent.end}
                onChange={(e) => onFieldChange("end", e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
          </div>
          <label className="text-sm font-medium text-gray-700">
            Location
            <input
              type="text"
              value={editingEvent.location}
              onChange={(e) => onFieldChange("location", e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Notes
            <textarea
              value={editingEvent.notes}
              onChange={(e) => onFieldChange("notes", e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              rows={3}
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            type="button"
            onClick={onSave}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
          >
            Save changes
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg border border-red-200 px-4 py-2 text-red-600 transition hover:bg-red-50"
          >
            Delete event
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
