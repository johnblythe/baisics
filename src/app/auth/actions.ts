"use server";

import { signIn } from "@/auth";

export async function signInAction(email: string) {
  return signIn("email", {
    email,
    redirect: false,
    // callbackUrl: "/auth/verify-request"
    callbackUrl: "/dashboard"
  });
} 