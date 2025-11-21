"use client";

type Status = {
  type: "success" | "error";
  text: string;
} | null;

export default function CalendarStatusBadge({ status }: { status: Status }) {
  if (!status) return null;
  return (
    <span
      className={`text-sm ${
        status.type === "success" ? "text-emerald-600" : "text-red-600"
      }`}
    >
      {status.text}
    </span>
  );
}
