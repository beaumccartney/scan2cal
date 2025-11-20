import Link from "next/link";
import CreateCalendarButton from "../../_components/CalendarView/CreateCalendarButton";
import { api } from "~/trpc/server";
import AppNavbar from "../../_components/AppNavbar";
import { auth } from "~/server/auth/auth";

export default async function UserCalendars() {
  const calendars = await api.calendar.listCalendars();
  const session = await auth();
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2563eb] via-[#06b6d4] via-[#10b981] to-[#fbbf24]">
      <AppNavbar isAuthenticated={!!session} user={session?.user} />
      <main className="mx-auto max-w-4xl space-y-6 p-6 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold drop-shadow">My Calendars</h1>
          <CreateCalendarButton />
        </div>
        {calendars.length === 0 ? (
          <p>No calendars</p>
        ) : (
          <ul className="space-y-4">
            {calendars.map((calendar) => (
              <li
                key={calendar.calendar_id}
                className="border border-black/30 bg-white/80 p-3 text-gray-900 shadow hover:bg-white"
              >
                <Link
                  href={`/pages/UserCalendars/${calendar.calendar_id}`}
                  className="block"
                >
                  <div className="text-lg font-semibold">{calendar.name}</div>
                  <div className="text-sm text-gray-600">
                    Saved on{" "}
                    {calendar.created_at
                      ? new Date(calendar.created_at).toLocaleString()
                      : "Unknown"}
                  </div>
                  <div className="text-sm text-gray-600">
                    Events stored:{" "}
                    {Array.isArray(calendar.events) ? calendar.events.length : 0}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
