"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

export default function CreateCalendarButton() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const createCalendar = api.calendar.createCalendar.useMutation({
    onError: (err) => {
      setError(err.message ?? "Failed to create calendar");
    },
  });

  const handleCreate = async () => {
    setError(null);
    const name = window.prompt("Calendar name", "Untitled calendar");
    const trimmedName = name?.trim();
    if (!trimmedName) return;

    try {
      const result = await createCalendar.mutateAsync({
        name: trimmedName,
      });
      router.push(`/pages/UserCalendars/${result.calendarId}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleCreate}
        disabled={createCalendar.isPending}
        className="rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
      >
        {createCalendar.isPending ? "Creating..." : "Create calendar"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
