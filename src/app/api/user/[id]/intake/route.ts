import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

type IntakePayload = {
  gender: { value: string; confidence: number };
  goals: { value: string; confidence: number };
  daysPerWeek: { value: string; confidence: number };
  timePerDay: { value: string; confidence: number };
  age: { value: string; confidence: number };
  weight: { value: string; confidence: number };
  height: { value: string; confidence: number };
  workoutEnvironment: {
    value: { primary: string; limitations: string[] };
    confidence: number;
  };
  equipmentAccess: {
    value: { type: string; available: string[] };
    confidence: number;
  };
  workoutStyle: {
    value: { primary: string; secondary: string };
    confidence: number;
  };
  preferences: { value: string; confidence: number };
  additionalInfo: { value: string; confidence: number };
};

// Helper to map gender to sex
const mapGenderToSex = (gender: string) => {
  switch (gender.toLowerCase()) {
    case 'male':
      return 'man';
    case 'female':
      return 'woman';
    default:
      return 'other';
  }
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {id: userId} = await params;
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const intake = await prisma.userIntake.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!intake) {
      return NextResponse.json({ error: 'Intake not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, intake });
  } catch (error) {
    console.error('Error fetching intake:', error);
    return NextResponse.json(
      { error: 'Failed to fetch intake data' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const {id: userId} = await params;
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const payload = (await request.json()) as IntakePayload;

    // Store extra data as JSON in additionalInfo
    const extraData = {
      workoutEnvironment: payload.workoutEnvironment.value,
      equipmentAccess: payload.equipmentAccess.value,
      workoutStyle: payload.workoutStyle.value,
      timePerDay: parseInt(payload.timePerDay.value),
      originalAdditionalInfo: payload.additionalInfo.value,
    };

    // Split preferences into array and combine with workout styles
    const preferences = payload.preferences.value
      .split(',')
      .map(p => p.trim())
      .filter(Boolean);
    const trainingPreferences = [
      ...preferences,
      payload.workoutStyle.value.primary,
      payload.workoutStyle.value.secondary,
    ].filter(Boolean);

    const intakeData = {
      userId,
      sex: mapGenderToSex(payload.gender.value),
      trainingGoal: Array.isArray(payload.goals.value) 
        ? payload.goals.value.join(',') 
        : payload.goals.value,
      daysAvailable: parseInt(payload.daysPerWeek.value),
      dailyBudget: parseInt(payload.timePerDay.value),
      age: parseInt(payload.age.value),
      weight: parseInt(payload.weight.value),
      height: parseInt(payload.height.value),
      trainingPreferences,
      additionalInfo: JSON.stringify(extraData),
    };

    const savedIntake = await prisma.userIntake.upsert({
      where: { userId },
      update: intakeData,
      create: intakeData,
    });

    return NextResponse.json({ success: true, intake: savedIntake });
  } catch (error) {
    console.error('Error saving intake:', error);
    return NextResponse.json(
      { error: 'Failed to save intake data' },
      { status: 500 }
    );
  }
} 