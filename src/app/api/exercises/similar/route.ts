import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Note: No auth required - exercise library is public data
// Used on /hi preview page where users aren't logged in yet
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const exerciseId = searchParams.get('exerciseId');
    const exerciseName = searchParams.get('exerciseName');

    if (!exerciseId && !exerciseName) {
      return NextResponse.json(
        { error: 'exerciseId or exerciseName is required' },
        { status: 400 }
      );
    }

    // Get the source exercise from library
    const sourceExercise = await prisma.exerciseLibrary.findFirst({
      where: exerciseId
        ? { exercises: { some: { id: exerciseId } } }
        : { name: exerciseName! },
    });

    if (!sourceExercise) {
      // Return empty array if exercise not in library
      return NextResponse.json({ exercises: [] });
    }

    // Find similar exercises by:
    // 1. Same movement pattern
    // 2. Same target muscles
    // 3. Similar difficulty
    const similarExercises = await prisma.exerciseLibrary.findMany({
      where: {
        AND: [
          { id: { not: sourceExercise.id } },
          {
            OR: [
              // Same movement pattern
              { movementPattern: sourceExercise.movementPattern },
              // Overlapping target muscles
              {
                targetMuscles: {
                  hasSome: sourceExercise.targetMuscles,
                },
              },
              // Variations of the same exercise
              {
                OR: [
                  { parentId: sourceExercise.id },
                  { id: sourceExercise.parentId || undefined },
                  { parentId: sourceExercise.parentId || undefined },
                ],
              },
            ],
          },
        ],
      },
      orderBy: [
        // Prioritize same movement pattern
        { movementPattern: 'asc' },
        { difficulty: 'asc' },
      ],
      take: 10,
    });

    // Score and sort by relevance
    const scoredExercises = similarExercises.map(exercise => {
      let score = 0;

      // Same movement pattern: +3
      if (exercise.movementPattern === sourceExercise.movementPattern) {
        score += 3;
      }

      // Overlapping target muscles: +2 per match
      const targetOverlap = exercise.targetMuscles.filter(m =>
        sourceExercise.targetMuscles.includes(m)
      ).length;
      score += targetOverlap * 2;

      // Same compound type: +1
      if (exercise.isCompound === sourceExercise.isCompound) {
        score += 1;
      }

      // Similar difficulty: +1
      if (exercise.difficulty === sourceExercise.difficulty) {
        score += 1;
      }

      // Is a variation: +2
      if (
        exercise.parentId === sourceExercise.id ||
        exercise.id === sourceExercise.parentId ||
        (sourceExercise.parentId && exercise.parentId === sourceExercise.parentId)
      ) {
        score += 2;
      }

      return { ...exercise, score };
    });

    // Sort by score descending
    scoredExercises.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      source: {
        id: sourceExercise.id,
        name: sourceExercise.name,
        movementPattern: sourceExercise.movementPattern,
        targetMuscles: sourceExercise.targetMuscles,
      },
      exercises: scoredExercises.slice(0, 8).map(ex => ({
        id: ex.id,
        name: ex.name,
        category: ex.category,
        equipment: ex.equipment,
        description: ex.description,
        difficulty: ex.difficulty,
        movementPattern: ex.movementPattern,
        targetMuscles: ex.targetMuscles,
        isCompound: ex.isCompound,
        videoUrl: ex.videoUrl,
        score: ex.score,
      })),
    });
  } catch (error) {
    console.error('Error finding similar exercises:', error);
    return NextResponse.json(
      { error: 'Failed to find similar exercises' },
      { status: 500 }
    );
  }
}
