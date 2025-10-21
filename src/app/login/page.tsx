"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "~/context/auth-context";
import { useRouter } from "next/navigation";
import { Navbar } from "~/components/navbar";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // fake login logic for now
    login(username);
    // Redirect to home
    router.push("/");
  };

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#2563eb] via-[#06b6d4] via-[#10b981] to-[#fbbf24] pt-20">
      <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16">
        {/* Logo/Header */}
        <div className="text-center">
          <Link href="/" className="group">
            <h1 className="text-5xl font-bold tracking-tight text-white drop-shadow-lg transition-opacity group-hover:opacity-80 sm:text-6xl">
              🗓️ Scan2Cal
            </h1>
          </Link>
          <p className="mt-4 text-lg text-white/90 drop-shadow">
            Welcome back
          </p>
        </div>

        {/* Login Form */}
        <div className="w-full max-w-md rounded-2xl bg-white/95 backdrop-blur-sm p-10 shadow-2xl">
          <h2 className="mb-8 text-center text-3xl font-semibold text-gray-900">
            Sign In
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 transition-colors focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/20"
                placeholder="Enter your username"
                required
                aria-required="true"
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 transition-colors focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/20"
                placeholder="Enter your password"
                required
                aria-required="true"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full rounded-xl bg-[#009C3B] py-3 font-semibold text-white shadow-md transition-all hover:bg-[#00b846] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2"
            >
              Sign In
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">or</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-[#009C3B] hover:underline"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <Link
          href="/"
          className="text-white/90 drop-shadow hover:text-white hover:underline"
        >
          ← Back to home
        </Link>
      </div>
    </main>
    </>
  );
}
