"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "~/context/auth-context";
import { Navbar } from "~/components/navbar";

export default function Home() {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { isAuthenticated, user } = useAuth();

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
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0] ?? null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0] ?? null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for file processing logic
    console.log("File submitted:", selectedFile?.name);
  };

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#2563eb] via-[#06b6d4] via-[#10b981] to-[#fbbf24] pt-20">
        <div className="container mx-auto flex flex-col items-center justify-center gap-12 px-4 py-16 max-w-4xl">
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

          {/* Conditional Content */}
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
                  <div className="mt-4 flex gap-4">
                    <Link
                      href="/login"
                      className="rounded-xl border-2 border-gray-300 bg-white px-8 py-3 font-semibold text-gray-700 shadow-sm transition-all hover:border-gray-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      className="rounded-xl bg-[#009C3B] px-8 py-3 font-semibold text-white shadow-sm transition-all hover:bg-[#00b846] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2"
                    >
                      Create Account
                    </Link>
                  </div>
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
                    accept="image/*"
                    onChange={handleFileSelect}
                    aria-label="Upload file"
                  />
                  
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer"
                  >
                    <div className="flex flex-col items-center gap-6">
                      <svg
                        className={`h-20 w-20 transition-colors ${
                          selectedFile ? "text-green-500" : "text-gray-400"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        {selectedFile ? (
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
                        {selectedFile
                          ? selectedFile.name
                          : "Drag and drop your document here"}
                      </div>
                      <div className="text-sm text-gray-500">
                        or click to select a file
                      </div>
                    </div>
                  </label>

                  {selectedFile && (
                    <button
                      type="submit"
                      className="mt-10 rounded-xl bg-[#009C3B] px-8 py-4 font-semibold text-white shadow-md transition-all hover:bg-[#00b846] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2"
                    >
                      Process Document
                    </button>
                  )}
                </div>
              </form>
            </>
          )}
        </div>
      </main>
    </>
  );
}
