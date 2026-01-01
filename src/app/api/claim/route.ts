import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, emailConfig } from "@/lib/email";
import { magicLinkTemplate } from "@/lib/email/templates/magic-link";
import crypto from "crypto";

// Create a magic link token and send email (v4 compatible)
async function sendMagicLinkEmail(email: string, callbackUrl: string) {
  const baseUrl = process.env.NEXTAUTH_URL || "https://www.baisics.app";

  // Generate a random token
  const token = crypto.randomBytes(32).toString("hex");

  // Token expires in 24 hours
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Hash the token for storage (next-auth hashes tokens before storing)
  const secret = process.env.NEXTAUTH_SECRET!;
  const hashedToken = crypto
    .createHash("sha256")
    .update(`${token}${secret}`)
    .digest("hex");

  // Store the verification token
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: hashedToken,
      expires,
    },
  });

  // Build the magic link URL
  const params = new URLSearchParams({
    callbackUrl,
    token,
    email,
  });
  const url = `${baseUrl}/api/auth/callback/email?${params}`;

  // Send the email
  const emailHtml = magicLinkTemplate({ signInLink: url });
  await sendEmail({
    to: email,
    subject: "Sign in to Baisics",
    html: emailHtml,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, source, toolData } = body;

    if (!email || !source) {
      return NextResponse.json(
        { error: "Email and source are required" },
        { status: 400 }
      );
    }

    // Generate a unique token for this claim
    const claimToken = crypto.randomBytes(32).toString("hex");

    // Claim expires in 24 hours
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Mark any existing unused claims for this email as used (superseded)
    await prisma.pendingClaim.updateMany({
      where: {
        email: email.toLowerCase(),
        used: false,
      },
      data: {
        used: true,
      },
    });

    // Create new pending claim
    await prisma.pendingClaim.create({
      data: {
        email: email.toLowerCase(),
        source,
        toolData: toolData || null,
        token: claimToken,
        expiresAt,
      },
    });

    // Trigger magic link email
    // The callbackUrl includes the claim token so we can process it on login
    const callbackUrl = `/dashboard?claim=${claimToken}`;
    await sendMagicLinkEmail(email.toLowerCase(), callbackUrl);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Claim error:", error);
    return NextResponse.json(
      { error: "Failed to process claim" },
      { status: 500 }
    );
  }
}
