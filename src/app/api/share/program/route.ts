import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const programId = searchParams.get('programId');

    if (!programId) {
      return NextResponse.json({ error: 'programId required' }, { status: 400 });
    }

    const program = await prisma.program.findUnique({
      where: { id: programId },
      include: {
        user: {
          select: { name: true },
        },
        workoutPlans: {
          include: {
            workouts: {
              include: {
                exercises: { orderBy: { sortOrder: 'asc' } },
              },
            },
          },
        },
        workoutLogs: {
          where: { status: 'completed' },
        },
        stats: {
          orderBy: { createdAt: 'desc' },
          take: 2,
        },
      },
    });

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    // Calculate stats
    const totalWorkouts = program.workoutPlans.reduce(
      (acc, plan) => acc + plan.workouts.length,
      0
    );
    const completedWorkouts = program.workoutLogs.length;
    const totalExercises = program.workoutPlans.reduce(
      (acc, plan) =>
        acc + plan.workouts.reduce((w, workout) => w + workout.exercises.length, 0),
      0
    );
    const phases = program.workoutPlans.length;

    // Weight progress
    let weightChange = null;
    if (program.stats.length >= 2 && program.stats[0].weight && program.stats[1].weight) {
      weightChange = {
        current: program.stats[0].weight,
        previous: program.stats[1].weight,
        change: program.stats[0].weight - program.stats[1].weight,
      };
    }

    // Get workout focus areas
    const focusAreas = [
      ...new Set(
        program.workoutPlans.flatMap((plan) =>
          plan.workouts.map((w) => w.focus)
        )
      ),
    ].slice(0, 4);

    const shareData = {
      id: program.id,
      name: program.name,
      description: program.description,
      createdBy: program.user.name || 'BAISICS User',
      createdAt: program.createdAt,
      stats: {
        phases,
        totalWorkouts,
        completedWorkouts,
        completionRate: totalWorkouts > 0
          ? Math.round((completedWorkouts / totalWorkouts) * 100)
          : 0,
        totalExercises,
        weightChange,
      },
      focusAreas,
      daysPerWeek: program.workoutPlans[0]?.daysPerWeek || 0,
    };

    return NextResponse.json(shareData);
  } catch (error) {
    console.error('Error fetching share data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch share data' },
      { status: 500 }
    );
  }
}

// Generate shareable link
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { programId } = await request.json();

    if (!programId) {
      return NextResponse.json({ error: 'programId required' }, { status: 400 });
    }

    // Verify ownership
    const program = await prisma.program.findFirst({
      where: {
        id: programId,
        createdBy: session.user.id,
      },
    });

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    // Generate share URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://baisics.app';
    const shareUrl = `${baseUrl}/share/${programId}`;
    const ogImageUrl = `${baseUrl}/api/og?programId=${programId}`;

    return NextResponse.json({
      shareUrl,
      ogImageUrl,
      title: `${program.name} - My BAISICS Program`,
      description: program.description || 'Check out my personalized AI-generated fitness program!',
    });
  } catch (error) {
    console.error('Error generating share link:', error);
    return NextResponse.json(
      { error: 'Failed to generate share link' },
      { status: 500 }
    );
  }
}
