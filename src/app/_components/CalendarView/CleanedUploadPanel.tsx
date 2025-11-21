"use client";

import { useMemo, useState } from "react";
import type { EventInput } from "@fullcalendar/core/index.js";
import { api } from "~/trpc/react";

interface Props {
  calendarId: number;
  onEventsGenerated: (events: EventInput[]) => void;
}

export default function CleanedUploadPanel({
  calendarId,
  onEventsGenerated,
}: Props) {
  const uploadsQuery = api.s3.listUploads.useQuery();
  const cleanedFolderQuery = api.s3.listCleanFolder.useQuery();
  const previewLlm = api.calendar.previewLlmEventsFromS3.useMutation();
  const deleteUpload = api.s3.deleteUpload.useMutation({
    onSuccess: () => void uploadsQuery.refetch(),
  });

  const [selectedCleanKeys, setSelectedCleanKeys] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const cleanedOptions = useMemo(() => {
    const s3Objects =
      cleanedFolderQuery.data?.objects
        ?.map((obj) => (obj.key ? obj.key.trim() : ""))
        .filter(Boolean) ?? [];
    const s3Set = new Set(s3Objects);

    const s3Options = s3Objects.map((key) => ({
      key,
      label: key,
    }));

    const uploadOptions =
      uploadsQuery.data
        ?.filter((u) => u.clean_key && s3Set.has(u.clean_key))
        .map((u) => ({
          key: u.clean_key!,
          label: u.clean_key!,
        })) ?? [];

    const merged = [...uploadOptions, ...s3Options];
    const deduped: { key: string; label: string }[] = [];
    const seen = new Set<string>();
    for (const opt of merged) {
      if (!opt.key || seen.has(opt.key)) continue;
      seen.add(opt.key);
      deduped.push(opt);
    }
    return deduped;
  }, [uploadsQuery.data, cleanedFolderQuery.data]);

  const handleGenerate = async () => {
    setError(null);
    setStatusMessage(null);
    if (!selectedCleanKeys.length) {
      setError("Select at least one cleaned file.");
      return;
    }

    try {
      const aggregated: EventInput[] = [];
      for (const key of selectedCleanKeys) {
        const cleanKey = key.trim();
        console.log(" Running LLM preview with clean key:", cleanKey);
        const res = await previewLlm.mutateAsync({
          calendarId,
          cleanKey,
        });
        const events = (res.events ?? []) as EventInput[];
        aggregated.push(...events);
      }

      if (aggregated.length === 0) {
        setStatusMessage({
          type: "error",
          text: "LLM finished but returned no events.",
        });
      } else {
        onEventsGenerated(aggregated);
        setStatusMessage({
          type: "success",
          text: `Loaded ${aggregated.length} events from ${selectedCleanKeys.length} file(s).`,
        });
      }
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Failed to generate events",
      );
      setStatusMessage(null);
    }
  };

  const handleDelete = async (uploadId: number) => {
    if (!window.confirm("Delete this upload and its cleaned text?")) return;
    try {
      await deleteUpload.mutateAsync({ uploadId });
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Failed to delete upload",
      );
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-gray-200 bg-white/80 p-4 shadow">
      <p className="text-sm text-gray-600">
        Choose a cleaned upload (from database or directly from S3) and run the
        LLM to generate events. Remove uploads you no longer need below.
      </p>
      <div className="space-y-3">
        <div className="flex flex-col gap-2 rounded-xl border border-gray-300 px-3 py-2 text-sm">
          <label className="font-semibold text-gray-700">
            Cleaned files
            <select
              value=""
              onChange={(e) => {
                const value = e.target.value;
                if (!value) return;
                setSelectedCleanKeys((prev) =>
                  prev.includes(value) ? prev : [...prev, value],
                );
              }}
              className="mt-1 w-full rounded-lg border border-gray-200 px-2 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select cleaned upload</option>
              {cleanedOptions.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
            {cleanedOptions.length === 0 && (
              <p className="mt-1 text-xs text-red-500">
                No cleaned files found in S3 yet.
              </p>
            )}
          </label>
          <div className="flex flex-wrap gap-2">
            {selectedCleanKeys.length === 0 && (
              <p className="text-xs text-gray-500">No files selected yet.</p>
            )}
            {selectedCleanKeys.map((key) => (
              <span
                key={key}
                className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700"
              >
                {key}
                <button
                  type="button"
                  className="ml-2 text-blue-500 hover:text-blue-800"
                  onClick={() =>
                    setSelectedCleanKeys((prev) =>
                      prev.filter((k) => k !== key),
                    )
                  }
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={previewLlm.isPending}
          className="w-full rounded-xl bg-emerald-600 py-3 text-white font-semibold shadow transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
        >
          {previewLlm.isPending ? "Generating..." : "Generate events"}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {statusMessage && (
          <p
            className={`text-sm ${
              statusMessage.type === "success"
                ? "text-emerald-600"
                : "text-red-600"
            }`}
          >
            {statusMessage.text}
          </p>
        )}
      </div>

      <div className="space-y-2 text-sm text-gray-700">
        <div className="flex items-center justify-between">
          <span className="font-semibold">Uploads</span>
          {uploadsQuery.isFetching && (
            <span className="text-xs text-gray-500">Refreshing...</span>
          )}
        </div>
        {uploadsQuery.data?.length ? (
          <ul className="space-y-2">
            {uploadsQuery.data.map((upload) => (
              <li
                key={upload.upload_id}
                className="flex flex-col gap-1 rounded-xl border border-gray-200 p-3 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="font-medium">{upload.name}</div>
                  {upload.clean_key && (
                    <div className="text-xs text-emerald-600 break-all">
                      {upload.clean_key}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(upload.upload_id)}
                  disabled={deleteUpload.isPending}
                  className="self-start rounded-lg border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deleteUpload.isPending ? "Deleting..." : "Delete"}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-gray-500">
            No uploads yet. Upload a file first.
          </p>
        )}
      </div>
    </div>
  );
}
