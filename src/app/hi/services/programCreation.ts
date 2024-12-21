import { IntakeFormData, ProgramStructure, WorkoutPlan, Workout, Exercise } from "@/types";
import { generateProgramStructurePrompt, generatePhaseDetailsPrompt } from "@/app/start/prompts";
import { sendMessage } from "@/utils/chat";
import { prisma } from "@/lib/prisma";

export async function createProgram(intakeData: IntakeFormData) {
  try {
    const structurePrompt = generateProgramStructurePrompt(intakeData);
    console.log("🚀 ~ createProgram ~ structurePrompt:", structurePrompt)
    const structureResult = await sendMessage([{
      role: 'user',
      content: structurePrompt
    }]);
    console.log("🚀 ~ createProgram ~ structureResult:", structureResult)

    if (!structureResult.success) {
      throw new Error('Failed to generate program structure');
    }

    const programStructure: ProgramStructure = JSON.parse(
      structureResult.data?.content?.[0]?.text || '{}'
    );

    const phases = [];
    for (let i = 1; i <= 1; i++) {
      const phasePrompt = generatePhaseDetailsPrompt(
        intakeData,
        programStructure,
        i
      );
      console.log("🚀 ~ createProgram ~ phasePrompt:", phasePrompt)

      const phaseResult = await sendMessage([{
        role: 'user',
        content: phasePrompt
      }]);
      console.log("🚀 ~ createProgram ~ phaseResult:", JSON.stringify(phaseResult.data?.content?.[0]?.text, null, 2))

      if (!phaseResult.success) {
        throw new Error(`Failed to generate phase ${i} details`);
      }

      const phaseDetails = JSON.parse(
        phaseResult.data?.content?.[0]?.text || '{}'
      );
      phases.push(phaseDetails);
    }

    // get a cooler name from the AI
    return {
      programName: `${intakeData.trainingGoal} Focus Program`,
      programDescription: programStructure.overallProgression.join('. '),
      phases
    };
  } catch (error) {
    console.error('Program creation failed:', error);
    throw error;
  }
}

export async function modifyProgram(
  currentProgram: any,
  modificationRequest: string,
  intakeData: IntakeFormData
) {
  try {
    // Step 1: Generate modification structure
    const structurePrompt = generateProgramStructurePrompt(intakeData);
    const structureResult = await sendMessage([{
      role: 'user',
      content: structurePrompt
    }]);

    if (!structureResult.success) {
      throw new Error('Failed to generate program structure');
    }

    const programStructure: ProgramStructure = JSON.parse(
      structureResult.data?.content?.[0]?.text || '{}'
    );
    console.log("🚀 ~ programStructure:", programStructure)

    // Validate phase count matches current program
    if (programStructure.totalPhases !== currentProgram.workoutPlans.length) {
      programStructure.totalPhases = currentProgram.workoutPlans.length;
    }

    // Step 2: Generate each phase's modified details
    const phases = [];
    for (let i = 1; i <= programStructure.totalPhases; i++) {
      const currentPhase = currentProgram.workoutPlans[i - 1];
      const phasePrompt = generatePhaseDetailsPrompt(
        intakeData,
        programStructure,
        i,
        currentPhase, // Pass current phase for reference
        modificationRequest // Pass modification request
      );

      const phaseResult = await sendMessage([{
        role: 'user',
        content: phasePrompt
      }]);

      console.log("🚀 ~ phaseResult:", JSON.stringify(phaseResult.data?.content?.[0]?.text, null, 2))

      if (!phaseResult.success) {
        throw new Error(`Failed to generate phase ${i} details`);
      }

      const phaseDetails = JSON.parse(
        phaseResult.data?.content?.[0]?.text || '{}'
      );
      phases.push(phaseDetails);
    }

    // Step 3: Combine into final program
    return {
      programName: currentProgram.name,
      programDescription: `${currentProgram.description} (Modified: ${modificationRequest})`,
      phases
    };
  } catch (error) {
    console.error('Program modification failed:', error);
    throw error;
  }
}

export async function modifyPhase(
  userId: string,
  currentPhase: WorkoutPlan,
  modificationRequest: string
) {
  try {
    // Get user's intake data
    const userIntake = await prisma.userIntake.findUnique({
      where: { userId }
    });

    if (!userIntake) {
      throw new Error('User intake data not found');
    }

    // Convert UserIntake to IntakeFormData
    const intakeData: IntakeFormData = {
      sex: userIntake.sex as 'male' | 'female' | 'other',
      trainingGoal: userIntake.trainingGoal,
      daysAvailable: userIntake.daysAvailable,
      dailyBudget: userIntake.dailyBudget || undefined,
      age: userIntake.age || undefined,
      weight: userIntake.weight || undefined,
      height: userIntake.height || undefined,
      experienceLevel: userIntake.experienceLevel || 'intermediate',
      trainingPreferences: userIntake.trainingPreferences,
      additionalInfo: userIntake.additionalInfo || '',
      modificationRequest
    };

    // Create a minimal program structure for this phase
    const programStructure: ProgramStructure = {
      totalPhases: 1,
      phaseStructure: [{
        phase: currentPhase.phase,
        durationWeeks: currentPhase.durationWeeks,
        focus: currentPhase.muscleMassDistribution || 'maintain current focus',
        progressionStrategy: currentPhase.progressionProtocol?.[0] || 'progressive overload',
        targetIntensity: 'maintain current intensity'
      }],
      overallProgression: [],
      estimatedTimePerWorkout: intakeData.dailyBudget || 60
    };

    // Generate modified phase details
    const phasePrompt = generatePhaseDetailsPrompt(
      intakeData,
      programStructure,
      1, // Since we're only dealing with one phase
      currentPhase,
      modificationRequest
    );

    const phaseResult = await sendMessage([{
      role: 'user',
      content: phasePrompt
    }]);

    if (!phaseResult.success) {
      throw new Error('Failed to generate phase details');
    }

    const phaseDetails = JSON.parse(
      phaseResult.data?.content?.[0]?.text || '{}'
    );

    // Transform the phase details to match WorkoutPlan structure
    const modifiedPhase: WorkoutPlan = {
      ...currentPhase,
      bodyFatPercentage: phaseDetails.bodyComposition.bodyFatPercentage,
      muscleMassDistribution: phaseDetails.bodyComposition.muscleMassDistribution,
      dailyCalories: phaseDetails.nutrition.dailyCalories,
      proteinGrams: phaseDetails.nutrition.macros.protein,
      carbGrams: phaseDetails.nutrition.macros.carbs,
      fatGrams: phaseDetails.nutrition.macros.fats,
      mealTiming: phaseDetails.nutrition.mealTiming,
      progressionProtocol: phaseDetails.progressionProtocol,
      daysPerWeek: phaseDetails.trainingPlan.daysPerWeek,
      workouts: phaseDetails.trainingPlan.workouts.map((workout: Workout) => ({
        id: `workout-${workout.day}`,
        workoutPlanId: currentPhase.id,
        dayNumber: workout.day,
        exercises: workout.exercises.map((exercise: Exercise) => ({
          id: `exercise-${exercise.name}-${workout.day}`,
          workoutId: `workout-${workout.day}`,
          name: exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          restPeriod: exercise.restPeriod,
          category: exercise.category,
          difficulty: exercise.difficulty
        }))
      }))
    };

    return modifiedPhase;
  } catch (error) {
    console.error('Phase modification failed:', error);
    throw error;
  }
} 