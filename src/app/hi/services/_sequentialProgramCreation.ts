import { IntakeFormData, Program, Nutrition, WorkoutPlan, Workout } from "@/types";
import { Difficulty, MovementPattern, MuscleGroup } from "@prisma/client";
import { sendMessage } from "@/utils/chat";
import type { ContentBlock } from '@anthropic-ai/sdk/src/resources/messages.js';
import { prisma } from '@/lib/prisma';

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

interface ProgramStructure {
  name: string;
  description: string;
  phaseCount: number;
  phaseDurations: number[];
  phaseProgression: string[];
  overallGoals: string[];
}

interface WorkoutStructure {
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

interface ProgramReview {
  isComplete: boolean;
  isSafe: boolean;
  meetsClientNeeds: boolean;
  suggestedAdjustments: string[];
  warnings: string[];
  finalRecommendations: string[];
}

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

const formatWorkoutDetailsPrompt = (
  intakeData: IntakeFormData,
  programStructure: ProgramStructure,
  workoutStructure: WorkoutStructure,
  phase: number
): { role: string; content: string; }[] => {
  return [{
    role: 'user',
    content: `Create detailed workouts for phase ${phase + 1} based on:
      Client Data: ${JSON.stringify(intakeData, null, 2)}
      Program Structure: ${JSON.stringify(programStructure, null, 2)}
      Workout Structure: ${JSON.stringify(workoutStructure, null, 2)}

      Provide a response ONLY in the following JSON format:
      {
        "id": string,
        "workouts": Array<{
          "name": string,
          "exercises": Array<{
            "name": string,
            "sets": number,
            "reps": number,
            "restPeriod": number // in seconds
          }>,
          "focus": string,
          "warmup": {
            "duration": number,
            "activities": string[]
          },
          "cooldown": {
            "duration": number,
            "activities": string[]
          },
          "dayNumber": number
        }>,
        "phaseExplanation": string,
        "phaseExpectations": string,
        "phaseKeyPoints": string[],
        "splitType": string,
        "nutrition": {
          "dailyCalories": number,
          "macros": {
            "protein": number,
            "carbs": number,
            "fats": number
          },
        }
      }`
  }];
};

const _formatNutritionPrompt = (
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

const _formatFinalReviewPrompt = (
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

export const saveProgramToDatabase = async (program: Program): Promise<void> => {
  try {
    if (!program?.name || !program?.user?.id) {
      throw new Error('Invalid program data');
    }

    const dbData = {
      id: program.id,
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

    console.log("🚀 ~ saveProgramToDatabase ~ dbData:", JSON.stringify(dbData, null, 2));

    await prisma.program.create({
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
  } catch (error) {
    console.error('Error in saveProgramToDatabase:', error);
    throw error;
  }
};

// Main function to create program sequentially
export const createProgramSequentially = async (
  intakeData: IntakeFormData,
  userId: string
): Promise<Program | null> => {
  try {
    // Step 1: Get program structure
    const programStructureResponse = await sendMessage(formatProgramStructurePrompt(intakeData), userId);
    const programStructure = parseAIResponse<ProgramStructure>(programStructureResponse, {
      name: '',
      description: '',
      phaseCount: 0,
      phaseDurations: [],
      phaseProgression: [],
      overallGoals: []
    });
    if (!programStructure.name) {
      throw new Error('Failed to generate program structure');
    }

    // Step 2: Get workout structure
    const workoutStructureResponse = await sendMessage(formatWorkoutStructurePrompt(intakeData, programStructure), userId);
    const workoutStructure = parseAIResponse<WorkoutStructure>(workoutStructureResponse, {
      daysPerWeek: intakeData.daysAvailable || 3,
      sessionDuration: intakeData.dailyBudget || 60,
      splitType: 'Full Body',
      workoutDistribution: [],
      exerciseSelectionRules: {
        compoundToIsolationRatio: '2:1',
        exercisesPerWorkout: 6,
        restPeriods: { default: 90 },
        setRanges: { default: 3 },
        repRanges: { default: 10 }
      }
    });
    
    if (!workoutStructure.workoutDistribution.length) {
      throw new Error('Failed to generate workout structure');
    }

    // Step 3: Get workout details
    const workoutPlans: WorkoutPlan[] = [];
    // programStructure.phaseCount
    for (let phase = 0; phase < 1; phase++) {
      console.log("prompt!",formatWorkoutDetailsPrompt(intakeData, programStructure, workoutStructure, phase));
      const workoutDetailsResponse = await sendMessage(
        formatWorkoutDetailsPrompt(intakeData, programStructure, workoutStructure, phase),
        userId
      );
      console.log("🚀 ~ workoutDetailsResponse:", JSON.stringify(workoutDetailsResponse, null, 2))
      const workoutDetails = parseAIResponse<WorkoutPlan>(workoutDetailsResponse, {
        id: crypto.randomUUID(),
        workouts: [],
        nutrition: {
          dailyCalories: 2000,
          macros: { protein: 150, carbs: 200, fats: 70 }
        },
        phaseExplanation: '', // @todo
        phaseExpectations: '', // @todo
        phaseKeyPoints: [], // @todo
        splitType: 'Full Body' // @todo
      });

      if (!workoutDetails.workouts.length) {
        throw new Error(`Failed to generate workout details for phase ${phase + 1}`);
      }

      const workoutPlan: WorkoutPlan = {
        id: workoutDetails.id,
        workouts: workoutDetails.workouts,
        nutrition: workoutDetails.nutrition,
        phaseExplanation: workoutDetails.phaseExplanation,
        phaseExpectations: workoutDetails.phaseExpectations,
        phaseKeyPoints: workoutDetails.phaseKeyPoints,
        splitType: workoutDetails.splitType
      };

      workoutPlans.push(workoutPlan);
    }

    // Step 4: Get nutrition plan
    // @TODO: need this?
    // const nutritionResponse = await sendMessage(formatNutritionPrompt(intakeData, programStructure));
    // const nutritionPlan = parseAIResponse<Nutrition>(nutritionResponse, {
    //   dailyCalories: 2000,
    //   macros: { protein: 150, carbs: 200, fats: 70 },
    //   // mealTiming: ['Pre-workout', 'Post-workout']
    // });
    // console.log("🚀 ~ nutritionPlan:", nutritionPlan)
    // console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")

    // if (!nutritionPlan) {
    //   throw new Error('Failed to generate nutrition plan');
    // }

    // Step 5: Final review and recommendations
    // const reviewResponse = await sendMessage(
    //   formatFinalReviewPrompt(intakeData, programStructure, workoutStructure, workoutPlans, nutritionPlan)
    // );
    // const review = parseAIResponse<ProgramReview>(reviewResponse, {
    //   isComplete: false,
    //   isSafe: false,
    //   meetsClientNeeds: false,
    //   suggestedAdjustments: [],
    //   warnings: [],
    //   finalRecommendations: []
    // });
    // console.log("🚀 ~ review:", review)
    // console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")

    // if (!review.isComplete || !review.isSafe || !review.meetsClientNeeds) {
    //   throw new Error('Program review failed: ' + review.warnings.join(', '));
    // }

    // Construct the final program
    const program: Program = {
      id: crypto.randomUUID(),
      name: programStructure.name,
      description: programStructure.description,
      workoutPlans,
      user: {
        id: userId,
        email: null,
        password: null,
        isPremium: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };

    // Save program to database
    await saveProgramToDatabase(program);

    return program;
  } catch (error) {
    console.error('Error in createProgramSequentially:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
    return null;
  }
};

// Main functions
export const getProgramStructure = async (intakeData: IntakeFormData) => {
  // ... rest of existing code ...
};

// "difficulty": string, // [${Object.values(Difficulty).join(', ')}]
//             "movementPattern": string, // [${Object.values(MovementPattern).join(', ')}]
//             "targetMuscles": string[], // [${Object.values(MuscleGroup).join(', ')}]
//             "secondaryMuscles": string[], // [${Object.values(MuscleGroup).join(', ')}]
//             "isCompound": boolean,
//             "description": string,
//             "instructions": string[],
//             "commonMistakes": string[],
//             "benefits": string[]