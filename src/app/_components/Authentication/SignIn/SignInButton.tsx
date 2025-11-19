"use client";

import { FcGoogle } from "react-icons/fc";
import { handleSignIn } from "./signInAction";

export default function SignInButton() {
  return (
    <form action={handleSignIn}>
      <button
        type="submit"
        className="flex items-center gap-3 rounded-xl border-2 border-gray-300 bg-white px-8 py-3 font-semibold text-gray-700 shadow-sm transition-all hover:border-gray-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
      >
        <FcGoogle className="h-5 w-5" />
        Login with Google
      </button>
    </form>
  );
}
