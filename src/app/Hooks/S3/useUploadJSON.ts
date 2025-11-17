"use client";

import { useState } from "react";
import { db } from "~/server/db";
import { api } from "~/trpc/react";
import { uploads } from "~/server/db/schema";

interface UploadJSONResult {
  url: string;
  key: string;
  contentType: string;
}

export function useUploadJSON() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadJSONResult[] | null>(null);

  const presignMutation = api.s3.presign.useMutation();
  const confirmMutation = api.s3.confirm.useMutation();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;

    if (!selected) {
      setError("Please select a file.");
      setFile(null);
      return;
    }

    if (selected.type !== "application/json") {
      setError("Please upload a valid JSON file.");
      setFile(null);
      return;
    }

    setFile(selected);
    setError(null);
  };

  const uploadFile = async () => {
    if (!file) {
      setError("No file selected.");
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const presigned = await presignMutation.mutateAsync({
        filename: file.name,
        contentType: file.type,
      });

      const { url, key, contentType } = presigned[0];

      const uploadResponse = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": contentType },
        body: file,
      });
      const confirmResponse = await confirmMutation.mutateAsync({
        key: key,
        etag: url ?? null,
        size: file.size,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed with status ${uploadResponse.status}`);
      }

      setResult(presigned);

      return { key, url };
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return {
    file,
    uploading,
    error,
    result,
    handleFileChange,
    uploadFile,
  };
}
