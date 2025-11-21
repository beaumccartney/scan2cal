"use client";

export default function CalendarToolbar({
  title,
  showLlmPanel,
  onToggleLlm,
}: {
  title?: string | null;
  showLlmPanel: boolean;
  onToggleLlm: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-xl font-semibold">{title ?? "Calendar"}</h1>
      <button
        type="button"
        onClick={onToggleLlm}
        className="rounded-lg border border-blue-200 px-3 py-1 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
      >
        {showLlmPanel ? "Hide smart import" : "Use smart import"}
      </button>
    </div>
  );
}
