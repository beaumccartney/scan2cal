"use client";

import Link from "next/link";
import { useAuth } from "~/context/auth-context";
import { useState, useRef, useEffect } from "react";

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
            <>
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 font-medium text-gray-700 transition-colors hover:text-gray-900"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-[#009C3B] px-4 py-2 font-medium text-white shadow-sm transition-all hover:bg-[#00b846] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
              >
                {/* Avatar */}
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${getAvatarColor(user.username)} text-sm font-bold text-white shadow-md`}
                >
                  {getInitials(user.username)}
                </div>
                {/* Username */}
                <span className="font-medium text-gray-900">{user.username}</span>
                {/* Dropdown Arrow */}
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
                    <p className="text-sm font-medium text-gray-900">{user.username}</p>
                    <p className="text-xs text-gray-500">Signed in</p>
                  </div>
                  <button
                    onClick={() => {
                      logout();
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
