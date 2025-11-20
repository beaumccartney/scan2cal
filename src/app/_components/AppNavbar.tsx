"use client";

import Link from "next/link";
import SignOutButton from "./Authentication/SignOut/signOutButton";
import SignInButton from "./Authentication/SignIn/SignInButton";

export default function AppNavbar({
  isAuthenticated,
  user,
}: {
  isAuthenticated: boolean;
  user?: { name?: string | null };
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur shadow">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-4xl font-bold text-gray-800">
            Scan2cal
          </Link>
          {isAuthenticated && (
            <nav className="hidden gap-3 text-sm font-semibold text-gray-600 sm:flex">
              <Link
                href="/"
                className="rounded-lg px-3 py-2 transition hover:bg-gray-100"
              >
                Uploads
              </Link>
              <Link
                href="/pages/UserCalendars"
                className="rounded-lg px-3 py-2 transition hover:bg-gray-100"
              >
                My Calendars
              </Link>
            </nav>
          )}
        </div>
        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <div className="hidden text-sm text-gray-600 sm:block">
              {user?.name}
            </div>
            <SignOutButton />
          </div>
        ) : (
          <SignInButton />
        )}
      </div>
    </header>
  );
}
