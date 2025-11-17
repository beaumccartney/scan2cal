import Link from "next/link";
import { api } from "~/trpc/server";

export default async function UserCalendars() {
  const calendars = await api.calendar.listCalendars();

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold">My Calendars</h1>
      {calendars.length === 0 ? (
        <p>No calendars</p>
      ) : (
        <ul className="space-y-4">
          {calendars.map((calendar) => (
            <li
              key={calendar.calendar_id}
              className="border p-2 hover:bg-gray-50"
            >
              <Link
                href={`/pages/UserCalendars/${calendar.calendar_id}`}
                className="block"
              >
                <div>{calendar.name}</div>
                <div>
                  Saved on{" "}
                  {calendar.created_at
                    ? new Date(calendar.created_at).toLocaleString()
                    : "Unknown"}
                </div>
                <div>
                  Events stored:{" "}
                  {Array.isArray(calendar.events) ? calendar.events.length : 0}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
