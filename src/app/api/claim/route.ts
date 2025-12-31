import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/auth";
import crypto from "crypto";

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
    const token = crypto.randomBytes(32).toString("hex");

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
        token,
        expiresAt,
      },
    });

    // Trigger magic link email via NextAuth
    // The callbackUrl includes the claim token so we can process it on login
    const callbackUrl = `/dashboard?claim=${token}`;

    await signIn("nodemailer", {
      email: email.toLowerCase(),
      redirect: false,
      callbackUrl,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Claim error:", error);
    return NextResponse.json(
      { error: "Failed to process claim" },
      { status: 500 }
    );
  }
}
