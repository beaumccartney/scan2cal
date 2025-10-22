"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";

export function Navbar() {
  const isAuthenticated = false;

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleGoogleLogin = () => {
    // TODO: Implement Google OAuth
    console.log("Google Login clicked from navbar");
  };

  // this closes the dropdown when you click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Generate avatar color based on username (Brazil theme)
  const getAvatarColor = (username: string) => {
    const colors = [
      "bg-[#009C3B]",
      "bg-[#00b846]",
      "bg-[#007a2e]",
      "bg-[#002776]",
      "bg-[#003da5]",
      "bg-[#FFDF00]",
      "bg-[#ffc700]",
      "bg-[#009C3B]",
    ];
    const index = username.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Get initials from username
  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/20 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-gray-900 hover:opacity-80 transition-opacity">
          🗓️ Scan2Cal
        </Link>

        {/* Auth Section */}
        <div className="flex items-center gap-4">
          {!isAuthenticated ? (
            <button
              onClick={handleGoogleLogin}
              className="flex items-center gap-2 rounded-lg bg-white border-2 border-gray-300 px-4 py-2 font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400/50 focus:ring-offset-2"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
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
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
              >
                <svg
                  className={`h-4 w-4 text-gray-500 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg">
                  <div className="p-3 border-b border-gray-200">
                    <p className="text-xs text-gray-500">Signed in</p>
                  </div>
                  <button
                    onClick={() => {
                      // logout();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors rounded-b-lg"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
