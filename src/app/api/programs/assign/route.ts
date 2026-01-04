import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/programs/assign
 * Assigns a program to a client by cloning it.
 * The coach remains the author (createdBy), client becomes owner (userId).
 *
 * Coach Tier Use Case:
 * 1. Coach creates/has a program or template
 * 2. Coach assigns it to a client
 * 3. Client gets their own copy (clone) to track workouts
 * 4. Coach can see client's program via createdBy filter
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const coachId = session.user.id;
    const body = await request.json();
    const { programId, clientId, setAsActive = true } = body;

    if (!programId) {
      return NextResponse.json({ error: 'programId is required' }, { status: 400 });
    }

    if (!clientId) {
      return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
    }

    // Verify the source program exists and coach has access
    const sourceProgram = await prisma.program.findUnique({
      where: { id: programId },
      include: {
        workoutPlans: {
          include: {
            workouts: {
              include: {
                exercises: true,
              },
            },
          },
        },
      },
    });

    if (!sourceProgram) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    // Coach must be the author of the program (or it's a public template)
    if (sourceProgram.createdBy !== coachId && !sourceProgram.isPublic) {
      return NextResponse.json(
        { error: 'You can only assign programs you created' },
        { status: 403 }
      );
    }

    // Verify client exists and coach has relationship with them
    const coachClientRelation = await prisma.coachClient.findFirst({
      where: {
        coachId,
        clientId,
        inviteStatus: 'ACCEPTED',
        status: 'ACTIVE',
      },
    });

    if (!coachClientRelation) {
      return NextResponse.json(
        { error: 'Client not found or not in your client list' },
        { status: 403 }
      );
    }

    // Fetch client details
    const client = await prisma.user.findUnique({
      where: { id: clientId },
      select: { id: true, name: true, email: true },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client user not found' }, { status: 404 });
    }

    // Use transaction to ensure atomic operation
    const assignedProgram = await prisma.$transaction(async (tx) => {
      // Deactivate client's current programs first (if setting as active)
      if (setAsActive) {
        await tx.program.updateMany({
          where: {
            userId: clientId,
            active: true,
          },
          data: { active: false },
        });
      }

      // Create the cloned program for the client
      const slug = `${sourceProgram.slug || sourceProgram.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

      const newProgram = await tx.program.create({
        data: {
          name: sourceProgram.name,
          slug,
          description: sourceProgram.description,
          createdBy: coachId, // Coach remains author
          userId: clientId, // Client is the owner/tracker
          active: setAsActive,
          source: 'assigned',
          isTemplate: false,
          isPublic: false,
          clonedFromId: sourceProgram.id,
          category: sourceProgram.category,
          difficulty: sourceProgram.difficulty,
          durationWeeks: sourceProgram.durationWeeks,
          daysPerWeek: sourceProgram.daysPerWeek,
          equipment: sourceProgram.equipment,
          goals: sourceProgram.goals,
          author: sourceProgram.author,
          tags: sourceProgram.tags,
          workoutPlans: {
            create: sourceProgram.workoutPlans.map((plan) => ({
              phase: plan.phase,
              phaseName: plan.phaseName,
              phaseDurationWeeks: plan.phaseDurationWeeks,
              daysPerWeek: plan.daysPerWeek,
              dailyCalories: plan.dailyCalories,
              proteinGrams: plan.proteinGrams,
              carbGrams: plan.carbGrams,
              fatGrams: plan.fatGrams,
              splitType: plan.splitType,
              phaseExplanation: plan.phaseExplanation,
              phaseExpectations: plan.phaseExpectations,
              phaseKeyPoints: plan.phaseKeyPoints,
              mealTiming: plan.mealTiming,
              progressionProtocol: plan.progressionProtocol,
              user: { connect: { id: clientId } }, // Client's workout plan
              workouts: {
                create: plan.workouts.map((workout) => ({
                  name: workout.name,
                  dayNumber: workout.dayNumber,
                  focus: workout.focus,
                  warmup: workout.warmup,
                  cooldown: workout.cooldown,
                  exercises: {
                    create: workout.exercises.map((exercise) => ({
                      name: exercise.name,
                      sets: exercise.sets,
                      reps: exercise.reps,
                      restPeriod: exercise.restPeriod,
                      intensity: exercise.intensity,
                      measureType: exercise.measureType,
                      measureValue: exercise.measureValue,
                      measureUnit: exercise.measureUnit,
                      notes: exercise.notes,
                      instructions: exercise.instructions,
                      sortOrder: exercise.sortOrder,
                      exerciseLibrary: {
                        connect: { id: exercise.exerciseLibraryId },
                      },
                    })),
                  },
                })),
              },
            })),
          },
        },
        select: {
          id: true,
          name: true,
          active: true,
        },
      });

      // Increment clone count on source
      await tx.program.update({
        where: { id: sourceProgram.id },
        data: { cloneCount: { increment: 1 } },
      });

      return newProgram;
    });

    return NextResponse.json({
      success: true,
      program: assignedProgram,
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
      },
    });
  } catch (error) {
    console.error('Assign program error:', error);
    return NextResponse.json(
      { error: 'Failed to assign program' },
      { status: 500 }
    );
  }
}
