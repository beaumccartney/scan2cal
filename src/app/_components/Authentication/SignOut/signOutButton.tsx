import React from "react";
import { signOut } from "~/server/auth/auth";

export default function SignOutButton() {
  return (
    <div className="h-4 w-10 bg-black hover:bg-amber-500">
      <button
        onClick={async () => {
          "use server";
          await signOut({ redirectTo: "/", redirect: true });
        }}
      >
        Sign Out
      </button>
    </div>
  );
}
