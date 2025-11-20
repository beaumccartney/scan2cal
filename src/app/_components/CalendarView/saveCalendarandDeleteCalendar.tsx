"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "~/trpc/react";

interface CalendarActionsProps {
  calendarId: number;              
  initialName?: string | null;     
  tempEvents: unknown[];           
}

export default function CalendarActions({
  calendarId,
  initialName,
  tempEvents,
}: CalendarActionsProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const saveEvents = api.calendar.saveLocalDb.useMutation({
    onError: (err) => setError(err.message ?? "Failed to save calendar"),
     onSuccess: () => {
     router.push("/pages/UserCalendars");
    },
  });

  const deleteCalendar = api.calendar.deleteCalendar.useMutation({
    onError: (err) => setError(err.message ?? "Failed to delete calendar"),
    onSuccess: () => {
     
      router.push("/pages/UserCalendars");
    },
  });

  async function handleSave() {
    setError(null);
    

    const namePrompt = window.prompt(
      "Name this calendar",
      initialName ?? "Untitled calendar",
    );
    const finalName =
      namePrompt?.trim() || initialName || "Untitled calendar";

    await saveEvents.mutateAsync({
      name: finalName,
      events: tempEvents,
      calendarId,
    });
  }

  async function handleDelete() {
    setError(null);

    const ok = window.confirm(
      `Are you sure you want to delete this calendar? This action cannot be undone.`,
    );
    if (!ok) return;

    await deleteCalendar.mutateAsync({
      calendarId,
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-4">
        {/* Save 按钮 */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saveEvents.isPending}
          className="self-start rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:from-amber-500 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saveEvents.isPending ? "Saving..." : "Save calendar"}
        </button>

        {/* Delete 按钮 */}
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleteCalendar.isPending}
          className="self-start rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {deleteCalendar.isPending ? "Deleting..." : "Delete calendar"}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}