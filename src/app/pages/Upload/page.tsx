"use client";

import React from "react";
import { useUploadJSON } from "../../Hooks/S3/useUploadJSON";
import {useUploadAllfile} from "../../Hooks/S3/useUploadallfile"
import { db } from "~/server/db";
import { uploads } from "~/server/db/schema";

export default function () {
  const { files, handleFileChange, uploadFile, uploading, error, result } =
    useUploadAllfile();

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <h1 className="text-2xl font-semibold">Upload JSON to S3</h1>

      <input
        type="file"
        className="border p-2"
        multiple
        onChange={handleFileChange}
      />
      
      {files.length > 0 && (
        <ul className="text-sm text-gray-700">
          {files.map((f) => (
            <li key={f.name}>• {f.name}</li>
          ))}
        </ul>
      )}

      <button
        disabled={!files || uploading}
        onClick={uploadFile}
        className="rounded-md bg-blue-600 px-4 py-2 text-white"
      >
        {uploading ? "Uploading..." : "Upload file"}
      </button>

      

      {error && <p className="text-red-500">{error}</p>}
      {result && (
       <div className="text-green-600 text-sm">
        <p>Uploaded successfully:</p>
        <ul>
          {result.map((r) => (
            <li key={r.key}>{r.key}</li>
          ))}
        </ul>
      </div>
      )}
    </div>
  );
}
