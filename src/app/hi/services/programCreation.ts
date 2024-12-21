import { IntakeFormData } from "@/types";
import { newPrompt } from "@/app/start/prompts";
import { sendMessage } from "@/utils/chat";
import { prisma } from "@/lib/prisma";
import type { Message } from '@anthropic-ai/sdk/src/resources/messages.js';

interface AIWorkout {
  day: number;
  focus: string;
  warmup: {
    duration: number;
    activities: string[];
  };
  exercises: Array<{
    name: string;
    sets: number;
    reps: number;
    restPeriod: string;
    category: string;
    difficulty: string;
    formCues: string[];
    modifications: {
      easier: string;
      harder: string;
    };
  }>;
  cooldown: {
    duration: number;
    activities: string[];
  };
}

interface AIResponse {
  requiredProgramStructure: {
    durationWeeks: number;
    phaseExplanation: string;
    phaseExpectations: string[];
    phaseKeyPoints: string[];
  };
  workoutRequirements: {
    daysPerWeek: number;
  };
  workoutStructure: {
    workouts: AIWorkout[];
  };
  nutritionGuidelines: {
    dailyCalories: number;
    macros: {
      protein: string;
      carbs: string;
      fats: string;
    };
  };
  progressionRules: string[];
  promptInstructions: string;
}

interface SendMessageResponse {
  success: boolean;
  data?: Message;
  error?: string;
}

export async function createProgram(intakeData: IntakeFormData) {
  try {
    const prompt = newPrompt(intakeData);
    console.log("🚀 ~ createProgram ~ prompt:", prompt)
    
    const result = await sendMessage([{
      role: 'user',
      content: prompt
    }]) as SendMessageResponse;

    if (!result.success || !result.data?.content?.[0]) {
      throw new Error('Failed to generate program');
    }

    const responseText = result.data.content[0].text;
    console.log("🚀 ~ createProgram ~ responseText:", responseText)
    if (!responseText) {
      throw new Error('Invalid response format');
    }

    const programInstructions = JSON.parse(responseText) as AIResponse;

    // Transform the AI response into our program structure
    const phase = {
      phase: 1,
      durationWeeks: programInstructions.requiredProgramStructure.durationWeeks,
      phaseExplanation: programInstructions.requiredProgramStructure.phaseExplanation,
      phaseExpectations: programInstructions.requiredProgramStructure.phaseExpectations,
      phaseKeyPoints: programInstructions.requiredProgramStructure.phaseKeyPoints,
      bodyComposition: {
        bodyFatPercentage: 0, // Will be populated when user adds measurements
        muscleMassDistribution: "Balanced" // Default value
      },
      trainingPlan: {
        daysPerWeek: programInstructions.workoutRequirements.daysPerWeek,
        workouts: programInstructions.workoutStructure.workouts.map((workout) => ({
          day: workout.day,
          focus: workout.focus,
          warmup: workout.warmup,
          cooldown: workout.cooldown,
          exercises: workout.exercises.map((exercise) => ({
            name: exercise.name,
            sets: exercise.sets,
            reps: exercise.reps,
            restPeriod: exercise.restPeriod,
            category: exercise.category,
            difficulty: exercise.difficulty,
            formCues: exercise.formCues,
            modifications: exercise.modifications
          }))
        }))
      },
      nutrition: {
        dailyCalories: programInstructions.nutritionGuidelines.dailyCalories,
        macros: {
          protein: programInstructions.nutritionGuidelines.macros.protein,
          carbs: programInstructions.nutritionGuidelines.macros.carbs,
          fats: programInstructions.nutritionGuidelines.macros.fats
        }
      },
      progressionProtocol: programInstructions.progressionRules
    };

    return {
      programName: `${intakeData.trainingGoal} Focus Program`, // @todo: better name, from AI
      programDescription: programInstructions.promptInstructions,
      phases: [phase]
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
    const structurePrompt = newPrompt(intakeData);
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