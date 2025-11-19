"use server";

import { signIn } from "~/server/auth/auth";

export async function handleSignIn() {
  await signIn("google", { redirectTo: "/" });
}
