"use client";

import { useState } from "react";
import { useUploadAllfile } from "~/app/Hooks/S3/useUploadallfile";
import { api } from "~/trpc/react";
import AppNavbar from "./AppNavbar";

export default function HomePageClient({
  initialSession,
  children,
}: {
  initialSession: any;
  children?: React.ReactNode;
}) {
  const [session] = useState(initialSession);
  const isAuthenticated = !!session;
  const user = session?.user;

  const [isDragging, setIsDragging] = useState(false);
  const { files, handleFileChange, uploadFile, uploading, error, result } =
    useUploadAllfile();
  const uploadsQuery = api.s3.listUploads.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const deleteUpload = api.s3.deleteUpload.useMutation({
    onSuccess: () => uploadsQuery.refetch(),
  });

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      // Create a synthetic event to use with handleFileChange
      const syntheticEvent = {
        target: {
          files: droppedFiles,
        },
      } as React.ChangeEvent<HTMLInputElement>;
      handleFileChange(syntheticEvent);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length > 0) {
      await uploadFile();
      await uploadsQuery.refetch();
    }
  };

  const handleDeleteUpload = async (uploadId: number) => {
    if (!window.confirm("Delete this upload and its cleaned file?")) return;
    try {
      await deleteUpload.mutateAsync({ uploadId });
    } catch (err) {
      console.error(err);
      alert(
        err instanceof Error ? err.message : "Failed to delete the upload file",
      );
    }
  };

  return (
    <>
      <main className="flex min-h-screen flex-col bg-gradient-to-br from-[#2563eb] via-[#06b6d4] via-[#10b981] to-[#fbbf24]">
        <AppNavbar isAuthenticated={isAuthenticated} user={user} />
        <div className="container mx-auto flex flex-col items-center justify-center gap-8 px-4 py-10 max-w-6xl">
          {/* Service Name */}
          {/* <div className="text-center w-full mb-4">
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white drop-shadow-2xl mb-2 bg-white/10 backdrop-blur-sm px-8 py-4 rounded-2xl border border-white/20 inline-block">
              Scan2cal
            </h2>
          </div> */}
          
          {/* Call to Action */}
          <div className="text-center w-full">
            <h1 className="text-5xl font-bold tracking-tight text-white drop-shadow-lg sm:text-6xl">
              {isAuthenticated ? "Start Scanning" : "Transform Documents into Events"}
            </h1>
            <p className="mt-4 text-lg text-white/90 mx-auto max-w-2xl drop-shadow">
              {isAuthenticated
                ? "Upload your event documents and let us convert them into calendar events automatically"
                : "Sign in to convert your event documents into calendar appointments instantly"}
            </p>
          </div>
          {!isAuthenticated ? (
            // Not Logged In - Show Sign In Message
            <div className="w-full max-w-2xl mx-auto">
              <div className="rounded-3xl border-2 border-dashed border-white/30 bg-white/95 backdrop-blur-sm p-16 text-center shadow-2xl">
                <div className="flex flex-col items-center justify-center gap-6">
                  <svg
                    className="h-20 w-20 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <div className="text-2xl font-semibold text-gray-900">
                    Sign in to scan documents
                  </div>
                  <p className="text-gray-600">
                    Create an account or sign in to start converting your documents into calendar events
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Logged In - Show File Upload
            <>
              <form onSubmit={handleSubmit} className="w-full max-w-2xl">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`rounded-3xl border-2 border-dashed bg-white/95 backdrop-blur-sm p-16 text-center shadow-2xl transition-all ${
                    isDragging
                      ? "border-gray-400 bg-gray-50 scale-[1.02]"
                      : "border-gray-300 hover:border-gray-400 hover:animate-[jump_0.4s_ease-in-out]"
                  }`}
                >
                  <input
                    type="file"
                    id="file-upload"
                    className="sr-only"
                    accept="application/pdf,application/json"
                    multiple
                    onChange={handleFileChange}
                    aria-label="Upload file"
                  />

                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-6">
                      <svg
                        className={`h-20 w-20 transition-colors ${
                          files.length > 0 ? "text-green-500" : "text-gray-400"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        {files.length > 0 ? (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        ) : (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        )}
                      </svg>
                      <div className="text-lg font-medium text-gray-900">
                        {files.length > 0
                          ? files.length === 1
                            ? files[0]?.name
                            : `${files.length} files selected`
                          : "Drag and drop your document here"}
                      </div>
                      <div className="text-sm text-gray-500">
                        or click to select a file
                      </div>
                      {files.length > 0 && (
                        <ul className="text-sm text-gray-700 mt-4 space-y-1">
                          {files.map((f) => (
                            <li key={f.name}>• {f.name}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </label>

                  {files.length > 0 && (
                    <button
                      type="submit"
                      disabled={uploading}
                      className="mt-10 rounded-xl bg-[#009C3B] px-8 py-4 font-semibold text-white shadow-md transition-all hover:bg-[#00b846] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploading ? "Uploading..." : "Upload file"}
                    </button>
                  )}

                  {error && (
                    <p className="mt-4 text-red-500 text-sm">{error}</p>
                  )}

                  {result && result.length > 0 && (
                    <div className="mt-4 text-green-600 text-sm">
                      <p>Uploaded successfully:</p>
                      <ul className="mt-2 space-y-1">
                        {result.map((r) => (
                          <li key={r.key}>{r.key}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </form>

            

              <div className="w-full max-w-2xl space-y-3 rounded-2xl bg-white/90 p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Uploaded files
                  </h2>
                  {uploadsQuery.isFetching && (
                    <span className="text-sm text-gray-500">Refreshing...</span>
                  )}
                </div>
                {uploadsQuery.data?.length ? (
                  <ul className="space-y-2 text-sm text-gray-700">
                    {uploadsQuery.data.map((upload) => (
                      <li
                        key={upload.upload_id}
                        className="flex flex-col gap-1 rounded-xl border border-gray-200 p-3 md:flex-row md:items-center md:justify-between"
                      >
                        <div>
                          <div className="font-medium">{upload.name}</div>
                          <div className="text-xs text-gray-500">
                            {upload.upload_time
                              ? new Date(
                                  upload.upload_time,
                                ).toLocaleString()
                              : "Unknown time"}
                          </div>
                          {upload.clean_key && (
                            <div className="text-xs text-emerald-600 break-all">
                              clean: {upload.clean_key}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteUpload(upload.upload_id)}
                          disabled={deleteUpload.isPending}
                          className="self-start rounded-lg border border-red-200 px-3 py-1 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deleteUpload.isPending ? "Deleting..." : "Delete"}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">
                    No uploads recorded yet. Upload a document to see it here.
                  </p>
                )}
              </div>

              {children}
            </>
          )}
        </div>
      </main>
    </>
  );
}
