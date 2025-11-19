"use client";

import React from "react";
import { handleSignOut } from "./signOutAction";

export default function SignOutButton() {
  return (
    <form action={handleSignOut}>
      <button
        type="submit"
        className="rounded-xl border-2 border-gray-300 bg-white px-8 py-3 font-semibold text-gray-700 shadow-sm transition-all hover:border-gray-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
      >
        Sign Out
      </button>
    </form>
  );
}
