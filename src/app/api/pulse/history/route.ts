import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStreak } from "@/lib/streaks";

const ALLOWED_DAYS = [7, 30, 90, 365];

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const { searchParams } = new URL(request.url);
    const daysParam = parseInt(searchParams.get("days") || "30", 10);
    const days = ALLOWED_DAYS.includes(daysParam) ? daysParam : 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [pulses, streak, goal, totalPulses] = await Promise.all([
      prisma.dailyPulse.findMany({
        where: {
          userId,
          date: { gte: startDate },
        },
        include: {
          photos: {
            select: { id: true, createdAt: true },
          },
        },
        orderBy: { date: "asc" },
      }),
      getStreak(userId),
      prisma.goal.findUnique({
        where: { userId },
        select: { targetWeight: true },
      }),
      prisma.dailyPulse.count({
        where: { userId },
      }),
    ]);

    const history = pulses.map((pulse) => ({
      date: pulse.date.toISOString().split("T")[0],
      displayDate: pulse.date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      weight: pulse.weight,
      photoCount: pulse.photos.length,
      hasNotes: !!pulse.notes,
    }));

    return NextResponse.json({
      history,
      streak: { current: streak.current, longest: streak.longest },
      targetWeight: goal?.targetWeight ?? null,
      totalPulses,
    });
  } catch (error) {
    console.error("Error fetching pulse history:", error);
    return NextResponse.json(
      { error: "Failed to fetch pulse history" },
      { status: 500 }
    );
  }
}
