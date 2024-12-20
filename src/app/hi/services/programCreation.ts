import { IntakeFormData, ProgramAIResponse, Program, WorkoutPlan, Workout, Exercise, ModificationAnalysis } from "@/types/program";
import { generateProgramStructurePrompt, generatePhaseDetailsPrompt } from "@/app/start/prompts";
import { sendMessage } from "@/utils/chat";
import { prisma } from "@/lib/prisma";

export async function createProgram(intakeData: IntakeFormData) {
  try {
    // Step 1: Generate program structure
    const structurePrompt = generateProgramStructurePrompt(intakeData);
    console.log("🚀 ~ createProgram ~ structurePrompt:", structurePrompt)
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

    // Step 2: Generate each phase's details
    const phases = [];
    for (let i = 1; i <= programStructure.totalPhases; i++) {
      const phasePrompt = generatePhaseDetailsPrompt(
        intakeData,
        programStructure,
        i
      );

      const phaseResult = await sendMessage([{
        role: 'user',
        content: phasePrompt
      }]);

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

export async function analyzeModificationRequest(
  modificationRequest: string
): Promise<ModificationAnalysis> {
  const analysisPrompt = `Analyze this program modification request: "${modificationRequest}"

  Determine:
  1. The type of modification (exercises, nutrition, capacity, or multiple)
  2. Specific details about what needs to change
  3. Whether the change should apply to all phases or just the current phase
  4. If there are multiple requests combined into one

  Return a JSON object matching this exact structure:
  {
    "type": "exercises" | "nutrition" | "capacity" | "multiple",
    "details": {
      "exerciseChanges": {
        "exercisesToRemove": ["exercise names"],
        "exercisesToAdd": ["exercise names"],
        "exerciseModifications": {
          "exercise name": {
            "sets": number,
            "reps": number,
            "restPeriod": "string"
          }
        }
      },
      "nutritionChanges": {
        "calories": boolean,
        "macros": boolean,
        "mealTiming": boolean
      },
      "capacityChanges": {
        "daysPerWeek": number,
        "timePerSession": number
      }
    },
    "affectsAllPhases": boolean,
    "subRequests": ["individual requests if multiple"],
    "confidence": number
  }

  Only include the relevant sections based on the type of modification.
  Confidence should be between 0 and 1, indicating how confident you are in the analysis.`;

  const analysisResult = await sendMessage([{
    role: 'user',
    content: analysisPrompt
  }]);

  if (!analysisResult.success) {
    throw new Error('Failed to analyze modification request');
  }

  const analysis: ModificationAnalysis = JSON.parse(
    analysisResult.data?.content?.[0]?.text || '{}'
  );

  return analysis;
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

    // Analyze the modification request
    const analysis = await analyzeModificationRequest(modificationRequest);

    // Convert UserIntake to IntakeFormData
    const intakeData: IntakeFormData = {
      sex: userIntake.sex as 'male' | 'female' | 'other',
      trainingGoal: userIntake.trainingGoal,
      daysAvailable: analysis.details.capacityChanges?.daysPerWeek || userIntake.daysAvailable,
      dailyBudget: analysis.details.capacityChanges?.timePerSession || userIntake.dailyBudget || undefined,
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

    // Generate modified phase details with analysis context
    const phasePrompt = generatePhaseDetailsPrompt(
      intakeData,
      programStructure,
      1, // Since we're only dealing with one phase
      currentPhase,
      modificationRequest,
      analysis // Pass analysis to the prompt generator
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
      dailyCalories: analysis.type === 'nutrition' && analysis.details.nutritionChanges?.calories 
        ? phaseDetails.nutrition.dailyCalories 
        : currentPhase.dailyCalories,
      proteinGrams: analysis.type === 'nutrition' && analysis.details.nutritionChanges?.macros 
        ? phaseDetails.nutrition.macros.protein 
        : currentPhase.proteinGrams,
      carbGrams: analysis.type === 'nutrition' && analysis.details.nutritionChanges?.macros 
        ? phaseDetails.nutrition.macros.carbs 
        : currentPhase.carbGrams,
      fatGrams: analysis.type === 'nutrition' && analysis.details.nutritionChanges?.macros 
        ? phaseDetails.nutrition.macros.fats 
        : currentPhase.fatGrams,
      mealTiming: analysis.type === 'nutrition' && analysis.details.nutritionChanges?.mealTiming 
        ? phaseDetails.nutrition.mealTiming 
        : currentPhase.mealTiming,
      progressionProtocol: phaseDetails.progressionProtocol,
      daysPerWeek: analysis.details.capacityChanges?.daysPerWeek || currentPhase.daysPerWeek,
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

// Helper function to transform AI response to Program format
export function transformAIResponseToProgram(aiResponse: ProgramAIResponse, userId: string): Program {
  return {
    id: `draft-${Date.now()}`,
    name: aiResponse.programName,
    description: aiResponse.programDescription,
    createdBy: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: userId,
      email: "",
      createdAt: new Date(),
      updatedAt: new Date(),
      password: null,
      isPremium: false,
    },
    workoutPlans: aiResponse.phases.map(phase => ({
      id: `phase-${phase.phase}`,
      phase: phase.phase,
      bodyFatPercentage: phase.bodyComposition.bodyFatPercentage,
      muscleMassDistribution: phase.bodyComposition.muscleMassDistribution,
      dailyCalories: phase.nutrition.dailyCalories,
      proteinGrams: phase.nutrition.macros.protein,
      carbGrams: phase.nutrition.macros.carbs,
      fatGrams: phase.nutrition.macros.fats,
      mealTiming: phase.nutrition.mealTiming,
      progressionProtocol: phase.progressionProtocol,
      daysPerWeek: phase.trainingPlan.daysPerWeek,
      durationWeeks: phase.durationWeeks,
      createdAt: new Date(),
      updatedAt: new Date(),
      workouts: phase.trainingPlan.workouts.map(workout => ({
        id: `workout-${workout.day}`,
        workoutPlanId: `phase-${phase.phase}`,
        dayNumber: workout.day,
        exercises: workout.exercises.map(exercise => ({
          id: `exercise-${exercise.name}-${workout.day}`,
          workoutId: `workout-${workout.day}`,
          name: exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          restPeriod: exercise.restPeriod,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    }))
  };
} 