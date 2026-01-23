import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { trackEvent, AnalyticsCategory, AnalyticsEvent } from "@/lib/analytics";

interface TrackPayload {
  category: AnalyticsCategory;
  event: AnalyticsEvent;
  metadata?: Record<string, unknown>;
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body: TrackPayload = await req.json();

    await trackEvent({
      category: body.category,
      event: body.event,
      userId: session?.user?.id,
      metadata: body.metadata,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics track error:", error);
    return NextResponse.json({ error: "Failed to track" }, { status: 500 });
  }
}
