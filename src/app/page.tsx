"use client";

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

  const handleGoogleLogin = () => {
    // TODO: Implement Google OAuth
    console.log("Google Login clicked");
  };

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#2563eb] via-[#06b6d4] via-[#10b981] to-[#fbbf24] pt-20">
        <div className="container mx-auto flex flex-col items-center justify-center gap-12 px-4 py-16 max-w-4xl">
          {/* Call to Action */}
          <div className="text-center w-full">
            <h1 className="text-5xl font-bold tracking-tight text-white drop-shadow-lg sm:text-6xl">
              {isAuthenticated ? "Start Scanning" : "🗓️ Scan2Cal"}
            </h1>
            <p className="mt-4 text-lg text-white/90 mx-auto max-w-2xl drop-shadow">
              {isAuthenticated 
                ? "Upload your event documents and let us convert them into calendar events automatically"
                : "Transform documents into calendar events instantly"}
            </p>
          </div>

          {/* Conditional Content */}
          {!isAuthenticated ? (
            // Not Logged In - Show Google Login
            <div className="w-full max-w-md mx-auto">
              <div className="rounded-3xl bg-white/95 backdrop-blur-sm p-12 text-center shadow-2xl">
                <div className="flex flex-col items-center justify-center gap-6">
                  <svg
                    className="h-16 w-16 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <div className="text-2xl font-semibold text-gray-900">
                    Get Started
                  </div>
                  <p className="text-gray-600">
                    Sign in with your Google account to start converting documents into calendar events
                  </p>
                  
                  {/* Google Login Button */}
                  <button
                    onClick={handleGoogleLogin}
                    className="mt-2 flex w-full items-center justify-center gap-3 rounded-xl border-2 border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 shadow-md transition-all hover:bg-gray-50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-400/50 focus:ring-offset-2"
                    aria-label="Login with Google"
                  >
                    <svg className="h-6 w-6" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Login with Google
                  </button>
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
