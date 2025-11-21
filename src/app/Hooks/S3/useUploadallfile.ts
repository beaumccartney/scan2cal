"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

interface UploadJSONResult {
  url: string;
  key: string;
  contentType: string;
}

// allow the pdf and json file
const ALLOWED_TYPES = ["application/pdf", "application/json"];

export function useUploadAllfile() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadJSONResult[] | null>(null);

  const presignMutation = api.s3.presign.useMutation();
  const confirmMutation = api.s3.confirm.useMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list || list.length === 0) {
      setError("Please select at least one file.");
      setFiles([]);
      return;
    }

    const selected = Array.from(list);

    // check the file type
    const invalid = selected.find(
      (f) => !ALLOWED_TYPES.includes(f.type),
    );
    if (invalid) {
      setError("Please upload valid PDF files.");
      setFiles([]);
      return;
    }

    setFiles(selected);
    setError(null);
  };

  const uploadFile = async () => {
    if (files.length === 0) {
      setError("No file selected.");
      return;
    }

    try {
      setUploading(true);
      setError(null);

      //ask multiple presign s3 token
      const presigned = await presignMutation.mutateAsync({
        files: files.map((f) => ({
          filename: f.name,
          contentType: f.type,
        })),
      });
      // submit the multiple file to s3

     
      await Promise.all(
        files.map(async (file, i) => {
          const { url, key, contentType } = presigned[i];

          const uploadResponse = await fetch(url, {
            method: "PUT",
            headers: { "Content-Type": contentType },
            body: file,
          });

          if (!uploadResponse.ok) {
            throw new Error(
              `Upload failed for ${file.name} (status ${uploadResponse.status})`,
            );
          }

          // confirm files uploaded, and let the db insert the data in database
          await confirmMutation.mutateAsync({
            key,
            etag: url ?? null,
            size: file.size,
          });
        }),
      );

      setResult(presigned);
      return presigned;
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return {
    files,
    uploading,
    error,
    result,
    handleFileChange,
    uploadFile,
  };
}