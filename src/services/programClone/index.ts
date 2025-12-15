import { prisma } from '@/lib/prisma';
import { PROGRAM_TEMPLATES, ProgramTemplate } from '@/data/templates';
import { getOrCreateExercise } from '@/utils/exerciseMatcher';
import type { ExerciseMeasureType, ExerciseMeasureUnit } from '@prisma/client';

/**
 * Program Clone Service
 *
 * Handles cloning programs from:
 * 1. Static templates (from PROGRAM_TEMPLATES)
 * 2. Database programs (other users' public programs or templates)
 */

export interface CloneResult {
  success: boolean;
  programId?: string;
  programName?: string;
  error?: string;
}

/**
 * Clone a static template to user's account
 */
export async function cloneStaticTemplate(
  templateId: string,
  userId: string
): Promise<CloneResult> {
  const template = PROGRAM_TEMPLATES.find((t) => t.id === templateId);

  if (!template) {
    return { success: false, error: 'Template not found' };
  }

  try {
    // Create slug from template name
    const slug = `${template.slug}-${Date.now()}`;

    // Build workout data from template preview
    const workoutData = await buildWorkoutsFromTemplate(template);

    const program = await prisma.program.create({
      data: {
        name: template.name,
        slug,
        description: template.description,
        createdBy: userId,
        source: 'template',
        isTemplate: false,
        isPublic: false,
        category: template.category,
        difficulty: template.difficulty,
        durationWeeks: template.durationWeeks,
        daysPerWeek: template.daysPerWeek,
        equipment: template.equipment,
        goals: template.goals,
        author: template.author,
        tags: [template.category, template.difficulty, template.structure.splitType],
        workoutPlans: {
          create: {
            phase: 1,
            daysPerWeek: template.daysPerWeek,
            dailyCalories: 2500, // Default, user can customize
            proteinGrams: 150,
            carbGrams: 250,
            fatGrams: 80,
            splitType: template.structure.splitType,
            phaseExplanation: `${template.name} - ${template.structure.splitType} split`,
            phaseExpectations: template.features.join('. '),
            phaseKeyPoints: template.features,
            user: { connect: { id: userId } },
            workouts: {
              create: workoutData,
            },
          },
        },
      },
    });

    return {
      success: true,
      programId: program.id,
      programName: program.name,
    };
  } catch (error) {
    console.error('Failed to clone static template:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Clone a database program to user's account
 */
export async function cloneDatabaseProgram(
  sourceProgramId: string,
  userId: string
): Promise<CloneResult> {
  try {
    // Load source program with all relations
    const source = await prisma.program.findUnique({
      where: { id: sourceProgramId },
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

    if (!source) {
      return { success: false, error: 'Source program not found' };
    }

    // Check if program is public or a template
    if (!source.isPublic && !source.isTemplate && source.createdBy !== userId) {
      return { success: false, error: 'Program is not available for cloning' };
    }

    // Create the cloned program
    const slug = `${source.slug || source.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

    const cloned = await prisma.program.create({
      data: {
        name: source.name,
        slug,
        description: source.description,
        createdBy: userId,
        source: 'template',
        isTemplate: false,
        isPublic: false,
        clonedFromId: source.id,
        category: source.category,
        difficulty: source.difficulty,
        durationWeeks: source.durationWeeks,
        daysPerWeek: source.daysPerWeek,
        equipment: source.equipment,
        goals: source.goals,
        author: source.author,
        tags: source.tags,
        workoutPlans: {
          create: source.workoutPlans.map((plan) => ({
            phase: plan.phase,
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
            user: { connect: { id: userId } },
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
    });

    // Increment clone count on source
    await prisma.program.update({
      where: { id: source.id },
      data: { cloneCount: { increment: 1 } },
    });

    return {
      success: true,
      programId: cloned.id,
      programName: cloned.name,
    };
  } catch (error) {
    console.error('Failed to clone database program:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Universal clone function - handles both static templates and DB programs
 */
export async function cloneProgram(
  sourceId: string,
  userId: string,
  sourceType: 'static' | 'database' = 'database'
): Promise<CloneResult> {
  if (sourceType === 'static') {
    return cloneStaticTemplate(sourceId, userId);
  }
  return cloneDatabaseProgram(sourceId, userId);
}

/**
 * Build workout data from static template preview
 */
async function buildWorkoutsFromTemplate(template: ProgramTemplate) {
  const workouts = [];

  for (const preview of template.workoutPreview) {
    const exercises = [];

    for (let i = 0; i < preview.exercises.length; i++) {
      const exerciseName = preview.exercises[i];

      // Get or create exercise in library
      const libraryEntry = await getOrCreateExercise(exerciseName, 'default');

      exercises.push({
        name: exerciseName,
        sets: 3,
        reps: 10,
        restPeriod: 90,
        intensity: 0,
        measureType: 'REPS' as ExerciseMeasureType,
        measureValue: 10,
        measureUnit: 'LB' as ExerciseMeasureUnit,
        sortOrder: i,
        exerciseLibrary: {
          connect: { id: libraryEntry.id },
        },
      });
    }

    workouts.push({
      name: preview.name,
      dayNumber: preview.day,
      focus: preview.focus,
      warmup: JSON.stringify({
        duration: 5,
        activities: ['Light cardio', 'Dynamic stretching'],
      }),
      cooldown: JSON.stringify({
        duration: 5,
        activities: ['Static stretching', 'Foam rolling'],
      }),
      exercises: {
        create: exercises,
      },
    });
  }

  return workouts;
}

/**
 * Get template programs for the library (combines static + DB templates)
 */
export async function getLibraryPrograms(options?: {
  category?: string;
  difficulty?: string;
  daysPerWeek?: number;
  search?: string;
  includeStatic?: boolean;
  limit?: number;
  offset?: number;
}) {
  const {
    category,
    difficulty,
    daysPerWeek,
    search,
    includeStatic = true,
    limit = 50,
    offset = 0,
  } = options || {};

  // Build where clause for DB programs
  const where: any = {
    OR: [{ isTemplate: true }, { isPublic: true }],
  };

  if (category) {
    where.category = category;
  }
  if (difficulty) {
    where.difficulty = difficulty;
  }
  if (daysPerWeek) {
    where.daysPerWeek = daysPerWeek;
  }
  if (search) {
    where.AND = [
      {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { tags: { hasSome: [search.toLowerCase()] } },
        ],
      },
    ];
  }

  // Fetch DB programs
  const dbPrograms = await prisma.program.findMany({
    where,
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      category: true,
      difficulty: true,
      durationWeeks: true,
      daysPerWeek: true,
      equipment: true,
      goals: true,
      author: true,
      cloneCount: true,
      popularityScore: true,
      isTemplate: true,
      createdAt: true,
    },
    orderBy: [{ popularityScore: 'desc' }, { cloneCount: 'desc' }],
    take: limit,
    skip: offset,
  });

  // Unified program type for library display
  type LibraryProgram = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    category: string | null;
    difficulty: string | null;
    durationWeeks: number | null;
    daysPerWeek: number | null;
    equipment: string[];
    goals: string[];
    author: string | null;
    cloneCount: number;
    popularityScore: number;
    source: 'database' | 'static';
  };

  // Convert DB programs to unified format
  const programs: LibraryProgram[] = dbPrograms.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug || p.id,
    description: p.description,
    category: p.category,
    difficulty: p.difficulty,
    durationWeeks: p.durationWeeks,
    daysPerWeek: p.daysPerWeek,
    equipment: p.equipment,
    goals: p.goals,
    author: p.author,
    cloneCount: p.cloneCount,
    popularityScore: p.popularityScore,
    source: 'database' as const,
  }));

  // Add static templates if requested
  if (includeStatic) {
    let staticTemplates = PROGRAM_TEMPLATES.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      description: t.description,
      category: t.category,
      difficulty: t.difficulty,
      durationWeeks: t.durationWeeks,
      daysPerWeek: t.daysPerWeek,
      equipment: t.equipment,
      goals: t.goals,
      author: t.author || null,
      cloneCount: 0,
      popularityScore: t.popularityScore,
      source: 'static' as const,
    }));

    // Apply filters to static templates
    if (category) {
      staticTemplates = staticTemplates.filter((t) => t.category === category);
    }
    if (difficulty) {
      staticTemplates = staticTemplates.filter((t) => t.difficulty === difficulty);
    }
    if (daysPerWeek) {
      staticTemplates = staticTemplates.filter((t) => t.daysPerWeek === daysPerWeek);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      staticTemplates = staticTemplates.filter(
        (t) =>
          t.name.toLowerCase().includes(searchLower) ||
          t.description.toLowerCase().includes(searchLower)
      );
    }

    // Merge and sort by popularity
    programs.push(...staticTemplates);
    programs.sort((a, b) => b.popularityScore - a.popularityScore);
  }

  return programs.slice(0, limit);
}

/**
 * Get user's own programs
 */
export async function getUserPrograms(userId: string) {
  return prisma.program.findMany({
    where: {
      createdBy: userId,
      isTemplate: false,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      category: true,
      difficulty: true,
      durationWeeks: true,
      daysPerWeek: true,
      equipment: true,
      goals: true,
      clonedFromId: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: 'desc' },
  });
}
