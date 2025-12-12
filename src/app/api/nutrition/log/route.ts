import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { NutritionSource } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { date, protein, carbs, fats, calories, source, notes } = body;

    // Validate: need either macros (any of P/C/F) or calories
    const hasMacros = protein != null || carbs != null || fats != null;
    const hasCalories = calories != null;

    if (!hasMacros && !hasCalories) {
      return NextResponse.json(
        { error: 'Provide macros (protein, carbs, fats) or calories' },
        { status: 400 }
      );
    }

    // Default macros to 0 if not provided
    const p = protein ?? 0;
    const c = carbs ?? 0;
    const f = fats ?? 0;

    // Compute calories from macros if not provided
    const finalCalories = hasCalories ? calories : (p * 4 + c * 4 + f * 9);

    // Parse date or default to today
    const logDate = date ? new Date(date) : new Date();
    // Normalize to start of day (date only, no time)
    logDate.setHours(0, 0, 0, 0);

    // Upsert - one entry per user per day (LRU: new replaces old)
    const nutritionLog = await prisma.nutritionLog.upsert({
      where: {
        userId_date: {
          userId: session.user.id,
          date: logDate,
        },
      },
      update: {
        protein: Math.round(p),
        carbs: Math.round(c),
        fats: Math.round(f),
        calories: Math.round(finalCalories),
        source: source === 'screenshot' ? NutritionSource.SCREENSHOT : NutritionSource.MANUAL,
        notes: notes || null,
      },
      create: {
        userId: session.user.id,
        date: logDate,
        protein: Math.round(p),
        carbs: Math.round(c),
        fats: Math.round(f),
        calories: Math.round(finalCalories),
        source: source === 'screenshot' ? NutritionSource.SCREENSHOT : NutritionSource.MANUAL,
        notes: notes || null,
      },
    });

    return NextResponse.json(nutritionLog);
  } catch (error) {
    console.error('Error saving nutrition log:', error);
    return NextResponse.json(
      { error: 'Failed to save nutrition log' },
      { status: 500 }
    );
  }
}
