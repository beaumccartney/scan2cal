"use client";

import React from "react";
import { useUploadJSON } from "../../Hooks/S3/useUploadJSON";
import { db } from "~/server/db";
import { uploads } from "~/server/db/schema";

export default function UploadJSONPage() {
  const { file, handleFileChange, uploadFile, uploading, error, result } =
    useUploadJSON();

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <h1 className="text-2xl font-semibold">Upload JSON to S3</h1>

      <input
        type="file"
        accept=".json"
        className="border p-2"
        onChange={handleFileChange}
      />

      <button
        disabled={!file || uploading}
        onClick={uploadFile}
        className="rounded-md bg-blue-600 px-4 py-2 text-white"
      >
        {uploading ? "Uploading..." : "Upload JSON"}
      </button>

      {error && <p className="text-red-500">{error}</p>}
      {result && (
        <p className="text-green-600">
          ✅ Uploaded successfully: {result[0].key}
        </p>
      )}
    </div>
  );
}
