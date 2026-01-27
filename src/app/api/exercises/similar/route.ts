import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Body part keywords for name-based matching when targetMuscles is empty
const BODY_PART_KEYWORDS: Record<string, string[]> = {
  LOWER: ['calf', 'calves', 'leg', 'squat', 'lunge', 'hamstring', 'quad', 'glute', 'hip', 'deadlift', 'rdl'],
  UPPER_PUSH: ['chest', 'push', 'press', 'bench', 'shoulder', 'delt', 'tricep', 'dip'],
  UPPER_PULL: ['pull', 'row', 'lat', 'back', 'bicep', 'curl', 'chin', 'pulldown'],
  CORE: ['ab', 'core', 'crunch', 'plank', 'oblique', 'twist'],
};

function getBodyPartFromName(name: string): string | null {
  const lower = name.toLowerCase();
  for (const [bodyPart, keywords] of Object.entries(BODY_PART_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      return bodyPart;
    }
  }
  return null;
}

function extractNameKeywords(name: string): string[] {
  // Extract meaningful words from exercise name for matching
  const lower = name.toLowerCase();
  const words = lower.split(/[\s\-_]+/).filter(w => w.length > 2);
  // Filter out common non-descriptive words
  const stopWords = ['the', 'with', 'and', 'for', 'assisted', 'weighted', 'single', 'double', 'leg', 'arm'];
  return words.filter(w => !stopWords.includes(w));
}

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
    // 3. Same category (fallback for when targetMuscles is empty)
    // 4. Variations
    const similarExercises = await prisma.exerciseLibrary.findMany({
      where: {
        AND: [
          { id: { not: sourceExercise.id } },
          {
            OR: [
              // Same movement pattern
              { movementPattern: sourceExercise.movementPattern },
              // Overlapping target muscles (only if source has them)
              ...(sourceExercise.targetMuscles.length > 0 ? [{
                targetMuscles: {
                  hasSome: sourceExercise.targetMuscles,
                },
              }] : []),
              // Same category (useful fallback)
              { category: sourceExercise.category },
              // Variations of the same exercise
              ...(sourceExercise.id || sourceExercise.parentId ? [{
                OR: [
                  { parentId: sourceExercise.id },
                  ...(sourceExercise.parentId ? [
                    { id: sourceExercise.parentId },
                    { parentId: sourceExercise.parentId },
                  ] : []),
                ],
              }] : []),
            ],
          },
        ],
      },
      orderBy: [
        { category: 'asc' },
        { difficulty: 'asc' },
      ],
      take: 20, // Fetch more, filter down after scoring
    });

    // Determine if we need fallback matching (when targetMuscles is empty)
    const sourceHasTargetMuscles = sourceExercise.targetMuscles.length > 0;
    const sourceBodyPart = getBodyPartFromName(sourceExercise.name);
    const sourceKeywords = extractNameKeywords(sourceExercise.name);

    // Score and sort by relevance
    const scoredExercises = similarExercises.map(exercise => {
      let score = 0;

      const exerciseBodyPart = getBodyPartFromName(exercise.name);
      const exerciseKeywords = extractNameKeywords(exercise.name);

      // CRITICAL: Body part mismatch penalty (prevents Calf Raises → Pushup)
      if (sourceBodyPart && exerciseBodyPart && sourceBodyPart !== exerciseBodyPart) {
        score -= 10; // Heavy penalty for different body parts
      }

      // Body part match bonus (when names clearly indicate same area)
      if (sourceBodyPart && exerciseBodyPart && sourceBodyPart === exerciseBodyPart) {
        score += 4;
      }

      // Name keyword overlap: +2 per shared keyword
      const keywordOverlap = exerciseKeywords.filter(kw =>
        sourceKeywords.includes(kw)
      ).length;
      score += keywordOverlap * 2;

      // Same movement pattern: +3 (but less reliable when data is bad)
      if (exercise.movementPattern === sourceExercise.movementPattern) {
        score += sourceHasTargetMuscles ? 3 : 1; // Reduced weight when we can't verify
      }

      // Overlapping target muscles: +2 per match
      const targetOverlap = exercise.targetMuscles.filter(m =>
        sourceExercise.targetMuscles.includes(m)
      ).length;
      score += targetOverlap * 2;

      // Same category: +2 (useful fallback when targetMuscles empty)
      if (exercise.category === sourceExercise.category) {
        score += 2;
      }

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

    // Sort by score descending and filter out mismatches (negative scores)
    scoredExercises.sort((a, b) => b.score - a.score);
    const filteredExercises = scoredExercises.filter(ex => ex.score > 0);

    return NextResponse.json({
      source: {
        id: sourceExercise.id,
        name: sourceExercise.name,
        movementPattern: sourceExercise.movementPattern,
        targetMuscles: sourceExercise.targetMuscles,
      },
      exercises: filteredExercises.slice(0, 8).map(ex => ({
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
