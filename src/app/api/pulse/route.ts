import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateStreak, getStreak } from "@/lib/streaks";

const MAX_PHOTOS = 4;

function parseDate(dateStr: string): Date | null {
  const match = dateStr.match(/^\d{4}-\d{2}-\d{2}$/);
  if (!match) return null;
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return null;
  return d;
}

function todayDate(): Date {
  const now = new Date();
  return new Date(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}T00:00:00`);
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");

    const date = dateParam ? parseDate(dateParam) : todayDate();
    if (!date) {
      return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD" }, { status: 400 });
    }

    const [pulse, previousPulse, streak] = await Promise.all([
      prisma.dailyPulse.findUnique({
        where: { userId_date: { userId, date } },
        include: { photos: { orderBy: { sortOrder: "asc" } } },
      }),
      prisma.dailyPulse.findFirst({
        where: { userId, date: { lt: date }, weight: { not: null } },
        orderBy: { date: "desc" },
      }),
      getStreak(userId),
    ]);

    const previousWeight = previousPulse?.weight ?? null;

    return NextResponse.json({ pulse, previousWeight, streak });
  } catch (error) {
    console.error("Error fetching daily pulse:", error);
    return NextResponse.json({ error: "Failed to fetch daily pulse" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { date: dateStr, weight, notes, photos } = body;

    if (!dateStr) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    const date = parseDate(dateStr);
    if (!date) {
      return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD" }, { status: 400 });
    }

    // Don't allow future dates
    const today = todayDate();
    if (date > today) {
      return NextResponse.json({ error: "Cannot log for a future date" }, { status: 400 });
    }

    // Reasonable date range — not before year 2000
    if (date.getFullYear() < 2000) {
      return NextResponse.json({ error: "Date too far in the past" }, { status: 400 });
    }

    // Validate weight if provided
    if (weight !== undefined && weight !== null) {
      if (typeof weight !== "number" || weight <= 0 || weight > 1500) {
        return NextResponse.json({ error: "Weight must be a positive number (max 1500)" }, { status: 400 });
      }
    }

    // Validate photos
    if (photos && (!Array.isArray(photos) || photos.length > MAX_PHOTOS)) {
      return NextResponse.json({ error: `Maximum ${MAX_PHOTOS} photos allowed` }, { status: 400 });
    }

    // Upsert the daily pulse
    const pulse = await prisma.dailyPulse.upsert({
      where: { userId_date: { userId, date } },
      create: {
        userId,
        date,
        weight: weight ?? null,
        notes: notes ?? null,
      },
      update: {
        weight: weight ?? null,
        notes: notes ?? null,
      },
    });

    // Handle photos if provided
    if (photos && photos.length > 0) {
      // Get current max sortOrder for this pulse
      const existingMax = await prisma.pulsePhoto.aggregate({
        where: { pulseId: pulse.id },
        _max: { sortOrder: true },
      });
      let nextOrder = (existingMax._max.sortOrder ?? -1) + 1;

      await prisma.pulsePhoto.createMany({
        data: photos.map((photo: { fileName: string; base64Data: string }) => ({
          pulseId: pulse.id,
          userId,
          fileName: photo.fileName,
          base64Data: photo.base64Data,
          sortOrder: nextOrder++,
        })),
      });
    }

    // Update streak after successful save
    const streak = await updateStreak(userId);

    // Fetch final pulse with photos included
    const pulseWithPhotos = await prisma.dailyPulse.findUnique({
      where: { id: pulse.id },
      include: { photos: { orderBy: { sortOrder: "asc" } } },
    });

    return NextResponse.json({ pulse: pulseWithPhotos, streak });
  } catch (error) {
    console.error("Error saving daily pulse:", error);
    return NextResponse.json({ error: "Failed to save daily pulse" }, { status: 500 });
  }
}
