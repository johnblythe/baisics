"use server";

import { signIn } from "@/auth";

export async function signInAction(email: string) {
  return signIn("nodemailer", {
    email,
    redirect: false,
    // callbackUrl: "/auth/verify-request"
    callbackUrl: "/dashboard"
  });
} 