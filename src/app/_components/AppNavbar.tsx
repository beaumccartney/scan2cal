"use client";

import { useState } from "react";
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
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = (
    <>
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
    </>
  );

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur shadow">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-2xl font-bold text-gray-800">
            Scan2cal
          </Link>
          {isAuthenticated && (
            <nav className="hidden gap-3 text-sm font-semibold text-gray-600 sm:flex">
              {navLinks}
            </nav>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="hidden text-sm text-gray-600 sm:block">
                {user?.name}
              </div>
              <div className="hidden sm:block">
                <SignOutButton />
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen((prev) => !prev)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 sm:hidden"
              >
                {mobileOpen ? "Close" : "Menu"}
              </button>
            </>
          ) : (
            <SignInButton />
          )}
        </div>
      </div>
      {isAuthenticated && mobileOpen && (
        <div className="sm:hidden border-t border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700">
          <div className="flex flex-col gap-2">{navLinks}</div>
          <div className="mt-3">
            <SignOutButton />
          </div>
        </div>
      )}
    </header>
  );
}
