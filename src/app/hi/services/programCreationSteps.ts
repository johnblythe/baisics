import { IntakeFormData, Program, Nutrition, WorkoutPlan } from "@/types";
import { sendMessage } from "@/utils/chat";
import type { ContentBlock } from '@anthropic-ai/sdk/src/resources/messages.js';
import { prisma } from '@/lib/prisma';

export interface ProgramStructure {
  name: string;
  description: string;
  phaseCount: number;
  phaseDurations: number[];
  phaseProgression: string[];
  overallGoals: string[];
}

export interface WorkoutStructure {
  daysPerWeek: number;
  sessionDuration: number;
  splitType: string;
  workoutDistribution: string[];
  exerciseSelectionRules: {
    compoundToIsolationRatio: string;
    exercisesPerWorkout: number;
    restPeriods: { [key: string]: number };
    setRanges: { [key: string]: number };
    repRanges: { [key: string]: number };
  };
}

interface SendMessageResponse {
  success: boolean;
  data?: {
    id: string;
    type: string;
    role: string;
    content: ContentBlock[];
    model: string;
    stop_reason: string | null;
    stop_sequence: string | null;
    usage: {
      input_tokens: number;
      output_tokens: number;
    };
  };
  error?: string;
}

// Additional interfaces for nutrition and review
interface ProgramReview {
  isComplete: boolean;
  isSafe: boolean;
  meetsClientNeeds: boolean;
  suggestedAdjustments: string[];
  warnings: string[];
  finalRecommendations: string[];
}

// Default values
const defaultProgramStructure: ProgramStructure = {
  name: '',
  description: '',
  phaseCount: 0,
  phaseDurations: [],
  phaseProgression: [],
  overallGoals: []
};

const defaultWorkoutStructure: WorkoutStructure = {
  daysPerWeek: 3,
  sessionDuration: 60,
  splitType: 'Full Body',
  workoutDistribution: [],
  exerciseSelectionRules: {
    compoundToIsolationRatio: '2:1',
    exercisesPerWorkout: 6,
    restPeriods: { default: 90 },
    setRanges: { default: 3 },
    repRanges: { default: 10 }
  }
};

const defaultWorkoutPlan: WorkoutPlan = {
  id: crypto.randomUUID(),
  workouts: [],
  nutrition: {
    dailyCalories: 2000,
    macros: { protein: 150, carbs: 200, fats: 70 }
  },
  phaseExplanation: '',
  phaseExpectations: '',
  phaseKeyPoints: [],
  splitType: 'Full Body'
};

// Prompt formatting functions
const formatProgramStructurePrompt = (intakeData: IntakeFormData): { role: string; content: string; }[] => {
  return [{
    role: 'user',
    content: `Based on the following client data, create a program structure:
${JSON.stringify(intakeData, null, 2)}

Please provide a response in the following JSON format:
{
  "name": string,
  "description": string,
  "phaseCount": number,
  "phaseDurations": number[],
  "phaseProgression": string[],
  "overallGoals": string[]
}`
  }];
};

const formatWorkoutStructurePrompt = (
  intakeData: IntakeFormData,
  programStructure: ProgramStructure
): { role: string; content: string; }[] => {
  return [{
    role: 'user',
    content: `Based on the following client data and program structure, create a workout structure:
Client Data: ${JSON.stringify(intakeData, null, 2)}
Program Structure: ${JSON.stringify(programStructure, null, 2)}

Please provide a response in the following JSON format:
{
  "daysPerWeek": number,
  "sessionDuration": number,
  "splitType": string,
  "workoutDistribution": string[],
  "exerciseSelectionRules": {
    "compoundToIsolationRatio": string,
    "exercisesPerWorkout": number,
    "restPeriods": { "default": number },
    "setRanges": { "default": number },
    "repRanges": { "default": number }
  }
}`
  }];
};

const formatWorkoutFocusPrompt = (
  intakeData: IntakeFormData,
  programStructure: ProgramStructure,
  workoutStructure: WorkoutStructure,
  dayNumber: number
): { role: string; content: string; }[] => {
  // Only include relevant data for determining focus
  const relevantData = {
    goals: intakeData.trainingGoal,
    experience: intakeData.experienceLevel,
    preferences: intakeData.trainingPreferences,
    daysPerWeek: workoutStructure.daysPerWeek,
    splitType: workoutStructure.splitType,
    distribution: workoutStructure.workoutDistribution
  };

  return [{
    role: 'user',
    content: `Create a workout focus for day ${dayNumber} of ${workoutStructure.daysPerWeek} based on:
${JSON.stringify(relevantData, null, 2)}

Provide a response ONLY in the following JSON format:
{
  "name": string,
  "focus": string,
  "warmup": {
    "duration": number,
    "activities": string[] // specific activities
  },
  "cooldown": {
    "duration": number,
    "activities": string[]
  },
  "dayNumber": number,
  "targetExerciseCount": number
}`
  }];
};

const formatExercisesForFocusPrompt = (
  intakeData: IntakeFormData,
  programStructure: ProgramStructure,
  workoutStructure: WorkoutStructure,
  workoutFocus: { focus: string; targetExerciseCount: number }
): { role: string; content: string; }[] => {
  // Only include relevant data for exercise selection
  const relevantData = {
    goals: intakeData.trainingGoal,
    experience: intakeData.experienceLevel,
    preferences: intakeData.trainingPreferences,
    exerciseRules: workoutStructure.exerciseSelectionRules,
    focus: workoutFocus.focus,
    count: workoutFocus.targetExerciseCount
  };

  return [{
    role: 'user',
    content: `Create ${workoutFocus.targetExerciseCount} exercises for a ${workoutFocus.focus} focused workout based on:
${JSON.stringify(relevantData, null, 2)}

Provide a response ONLY in the following JSON format:
{
  "exercises": Array<{
    "name": string,
    "sets": number,
    "reps": number,
    "restPeriod": number
  }>
}`
  }];
};

const formatPhaseDetailsPrompt = (
  intakeData: IntakeFormData,
  programStructure: ProgramStructure,
  workoutStructure: WorkoutStructure,
  phase: number
): { role: string; content: string; }[] => {
  return [{
    role: 'user',
    content: `Create phase details for phase ${phase + 1} based on:
Client Data: ${JSON.stringify(intakeData, null, 2)}
Program Structure: ${JSON.stringify(programStructure, null, 2)}
Workout Structure: ${JSON.stringify(workoutStructure, null, 2)}

Provide a response ONLY in the following JSON format:
{
  "phaseExplanation": string,
  "phaseExpectations": string,
  "phaseKeyPoints": string[],
  "splitType": string
}`
  }];
};

const formatPhaseNutritionPrompt = (
  intakeData: IntakeFormData,
  programStructure: ProgramStructure,
  phase: number
): { role: string; content: string; }[] => {
  return [{
    role: 'user',
    content: `Create nutrition plan for phase ${phase + 1} based on:
Client Data: ${JSON.stringify(intakeData, null, 2)}
Program Structure: ${JSON.stringify(programStructure, null, 2)}

Provide a response ONLY in the following JSON format:
{
  "dailyCalories": number,
  "macros": {
    "protein": number,
    "carbs": number,
    "fats": number
  }
}`
  }];
};

// Additional prompt formatting functions
const formatNutritionPrompt = (
  intakeData: IntakeFormData,
  programStructure: ProgramStructure
): { role: string; content: string; }[] => {
  return [{
    role: 'user',
    content: `Create a nutrition plan based on:
Client Data: ${JSON.stringify(intakeData, null, 2)}
Program Structure: ${JSON.stringify(programStructure, null, 2)}

Please provide a response in the following JSON format:
{
  "dailyCalories": number,
  "macros": {
    "protein": number,
    "carbs": number,
    "fats": number
  },
  "supplements"?: string[],
  "restrictions"?: string[]
}`
  }];
};

const formatFinalReviewPrompt = (
  intakeData: IntakeFormData,
  programStructure: ProgramStructure,
  workoutStructure: WorkoutStructure,
  workoutPlans: WorkoutPlan[],
  nutritionPlan: Nutrition
): { role: string; content: string; }[] => {
  return [{
    role: 'user',
    content: `Review the complete program:
Client Data: ${JSON.stringify(intakeData, null, 2)}
Program Structure: ${JSON.stringify(programStructure, null, 2)}
Workout Structure: ${JSON.stringify(workoutStructure, null, 2)}
Workout Plans: ${JSON.stringify(workoutPlans, null, 2)}
Nutrition Plan: ${JSON.stringify(nutritionPlan, null, 2)}

Please provide a response in the following JSON format:
{
  "isComplete": boolean,
  "isSafe": boolean,
  "meetsClientNeeds": boolean,
  "suggestedAdjustments": string[],
  "warnings": string[],
  "finalRecommendations": string[]
}`
  }];
};

// Helper function to safely parse AI response
const parseAIResponse = <T>(response: SendMessageResponse, defaultValue: T): T => {
  try {
    if (response?.success && response?.data?.content) {
      const content = Array.isArray(response.data.content) 
        ? response.data.content.find(block => 'text' in block)?.text || ''
        : typeof response.data.content === 'string'
          ? response.data.content
          : '';
      
      if (content) {
        return JSON.parse(content) as T;
      }
    }
    return defaultValue;
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    return defaultValue;
  }
};

// Database functions
export const saveProgramToDatabase = async (program: Program): Promise<Program> => {
  try {
    if (!program?.name || !program?.user?.id) {
      throw new Error('Invalid program data');
    }

    const dbData = {
      name: program.name,
      description: program.description || '',
      createdBy: program.user.id,
      workoutPlans: {
        create: program.workoutPlans.map(plan => ({
          phase: 1, // @todo
          bodyFatPercentage: 0, // @todo
          muscleMassDistribution: "Balanced", // @todo
          dailyCalories: plan.nutrition.dailyCalories,
          phaseExplanation: plan.phaseExplanation || '',
          phaseExpectations: plan.phaseExpectations || '',
          phaseKeyPoints: plan.phaseKeyPoints || [],
          proteinGrams: plan.nutrition.macros.protein,
          carbGrams: plan.nutrition.macros.carbs,
          fatGrams: plan.nutrition.macros.fats,
          daysPerWeek: plan.workouts.length,
          user: { 
            connect: { 
              id: program.user.id
            } 
          },
          workouts: {
            create: plan.workouts.map(workout => ({
              name: workout.name || '',
              dayNumber: workout.dayNumber || 1,
              focus: workout.focus || '',
              warmup: JSON.stringify(workout.warmup) || '',
              cooldown: JSON.stringify(workout.cooldown) || '',
              exercises: {
                create: workout.exercises.map(exercise => ({
                  name: exercise.name,
                  sets: exercise.sets,
                  reps: exercise.reps,
                  restPeriod: Number(exercise.restPeriod),
                  exerciseLibrary: {
                    connectOrCreate: {
                      where: { name: exercise.name },
                      create: {
                        name: exercise.name,
                        category: exercise.category || 'default',
                      }
                    }
                  }
                }))
              }
            }))
          }
        }))
      }
    };

    const savedProgram = await prisma.program.create({
      data: dbData,
      include: {
        workoutPlans: {
          include: {
            workouts: {
              include: {
                exercises: true
              }
            }
          }
        }
      }
    });

    return savedProgram as unknown as Program;
  } catch (error) {
    console.error('Error in saveProgramToDatabase:', error);
    throw error;
  }
};

// Main functions
export const getProgramStructure = async (intakeData: IntakeFormData) => {
  const response = await sendMessage(formatProgramStructurePrompt(intakeData));
  return parseAIResponse<ProgramStructure>(response, defaultProgramStructure);
};

export const getWorkoutStructure = async (intakeData: IntakeFormData, programStructure: ProgramStructure) => {
  const response = await sendMessage(formatWorkoutStructurePrompt(intakeData, programStructure));
  return parseAIResponse<WorkoutStructure>(response, defaultWorkoutStructure);
};

export const getWorkoutFocus = async (
  intakeData: IntakeFormData,
  programStructure: ProgramStructure,
  workoutStructure: WorkoutStructure,
  dayNumber: number
) => {
  const response = await sendMessage(formatWorkoutFocusPrompt(intakeData, programStructure, workoutStructure, dayNumber));
  return parseAIResponse(response, {
    name: '',
    focus: '',
    warmup: { duration: 0, activities: [] },
    cooldown: { duration: 0, activities: [] },
    dayNumber,
    targetExerciseCount: workoutStructure.exerciseSelectionRules.exercisesPerWorkout
  });
};

export const getExercisesForFocus = async (
  intakeData: IntakeFormData,
  programStructure: ProgramStructure,
  workoutStructure: WorkoutStructure,
  workoutFocus: { focus: string; targetExerciseCount: number }
) => {
  const response = await sendMessage(formatExercisesForFocusPrompt(intakeData, programStructure, workoutStructure, workoutFocus));
  return parseAIResponse(response, {
    exercises: []
  });
};

export const getPhaseDetails = async (
  intakeData: IntakeFormData,
  programStructure: ProgramStructure,
  workoutStructure: WorkoutStructure,
  phase: number
) => {
  const response = await sendMessage(formatPhaseDetailsPrompt(intakeData, programStructure, workoutStructure, phase));
  return parseAIResponse(response, {
    phaseExplanation: '',
    phaseExpectations: '',
    phaseKeyPoints: [],
    splitType: 'Full Body'
  });
};

export const getPhaseNutrition = async (
  intakeData: IntakeFormData,
  programStructure: ProgramStructure,
  phase: number
) => {
  const response = await sendMessage(formatPhaseNutritionPrompt(intakeData, programStructure, phase));
  return parseAIResponse(response, {
    dailyCalories: 2000,
    macros: { protein: 150, carbs: 200, fats: 70 }
  });
};

export const getFinalReview = async (
  intakeData: IntakeFormData,
  programStructure: ProgramStructure,
  workoutStructure: WorkoutStructure,
  workoutPlans: WorkoutPlan[],
  nutritionPlan: Nutrition
) => {
  const response = await sendMessage(
    formatFinalReviewPrompt(intakeData, programStructure, workoutStructure, workoutPlans, nutritionPlan)
  );
  return parseAIResponse<ProgramReview>(response, {
    isComplete: false,
    isSafe: false,
    meetsClientNeeds: false,
    suggestedAdjustments: [],
    warnings: [],
    finalRecommendations: []
  });
}; 