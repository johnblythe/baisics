import { IntakeFormData, Program, Nutrition, WorkoutPlan } from "@/types";
import { sendMessage } from "@/utils/chat";
import type { ContentBlock } from '@anthropic-ai/sdk/src/resources/messages.js';
import { prisma } from '@/lib/prisma';
import { ExerciseMeasureUnit, ExerciseMeasureType, Exercise, ExerciseLibrary } from '@prisma/client';

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
  workoutStyle: {
    primary: string;    // 'strength', 'yoga', 'cardio', 'hybrid'
    secondary?: string;
  };
  workoutDistribution: string[];
  exerciseSelectionRules: {
    exercisesPerWorkout: number;
    defaultRestPeriod: number;  // in seconds
    preferredMeasureType?: 'reps' | 'time' | 'distance';  // optional default based on style
    // @NOTE: could be helpful in the future for more complex program creation
    // intensity: {
    //   type: string;           // 'weight-based', 'perceived-effort', 'heart-rate', 'time-based'
    //   parameters: {
    //     [key: string]: number | string;
    //   };
    // };
    // structureType: {
    //   format: string;         // 'sets-reps', 'time-based', 'flow-based', 'distance-based'
    //   details: {
    //     [key: string]: number | string;
    //   };
    // };
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
  workoutStyle: {
    primary: 'strength'
  },
  workoutDistribution: [],
  exerciseSelectionRules: {
    exercisesPerWorkout: 6,
    defaultRestPeriod: 90,
    preferredMeasureType: 'reps'
  }
};

const defaultWorkoutPlan: WorkoutPlan = {
  id: crypto.randomUUID(),
  workouts: [],
  nutrition: {
    dailyCalories: 2000,
    macros: { protein: 150, carbs: 200, fats: 70 }
  },
  phase: 1,
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
Client Data: 
${JSON.stringify({
  ...intakeData,
  workoutEnvironment: intakeData.workoutEnvironment,
  equipmentAccess: intakeData.equipmentAccess,
  workoutStyle: intakeData.workoutStyle
}, null, 2)}

Program Structure: ${JSON.stringify(programStructure, null, 2)}

Consider the workout environment (${intakeData.workoutEnvironment.primary}), available equipment (${intakeData.equipmentAccess.type}), and preferred style (${intakeData.workoutStyle.primary}).

Please provide a response in the following JSON format:
{
  "daysPerWeek": number,
  "sessionDuration": number,
  "workoutStyle": {
    "primary": string,    // should align with client's preference
    "secondary": string   // optional
  },
  "workoutDistribution": string[],
  "exerciseSelectionRules": {
    "exercisesPerWorkout": number,
    "intensity": {
      "type": string,     // 'weight-based', 'perceived-effort', 'heart-rate', 'time-based'
      "parameters": {
        // Appropriate parameters based on workout style and environment
      }
    },
    "structureType": {
      "format": string,   // 'sets-reps', 'time-based', 'flow-based', 'distance-based'
      "details": {
        // Structure details appropriate for the format
      }
    }
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
  // Include relevant context for determining focus
  const relevantData = {
    goals: intakeData.trainingGoal,
    experience: intakeData.experienceLevel,
    preferences: intakeData.trainingPreferences,
    environment: intakeData.workoutEnvironment,
    equipment: intakeData.equipmentAccess,
    style: workoutStructure.workoutStyle,
    daysPerWeek: workoutStructure.daysPerWeek,
    workoutDistribution: workoutStructure.workoutDistribution
  };

  return [{
    role: 'user',
    content: `Create a workout focus for day ${dayNumber} of ${workoutStructure.daysPerWeek} based on:
${JSON.stringify(relevantData, null, 2)}

Consider the workout environment (${intakeData.workoutEnvironment.primary}) and available equipment when designing the focus.

Provide a response ONLY in the following JSON format:
{
  "name": string,
  "focus": string,
  "warmup": {
    "duration": number,
    "activities": string[] // specific activities suitable for the environment
  },
  "cooldown": {
    "duration": number,
    "activities": string[] // specific activities suitable for the environment
  },
  "dayNumber": number,
  "targetExerciseCount": number,
  "structureType": string // matches workoutStructure.exerciseSelectionRules.structureType.format
}`
  }];
};

const formatExercisesForFocusPrompt = (
  intakeData: IntakeFormData,
  programStructure: ProgramStructure,
  workoutStructure: WorkoutStructure,
  workoutFocus: { focus: string; targetExerciseCount: number }
): { role: string; content: string; }[] => {
  const relevantData = {
    goals: intakeData.trainingGoal,
    experience: intakeData.experienceLevel,
    preferences: intakeData.trainingPreferences,
    environment: intakeData.workoutEnvironment,
    equipment: intakeData.equipmentAccess,
    style: workoutStructure.workoutStyle,
    exerciseCount: workoutFocus.targetExerciseCount
  };

  return [{
    role: 'user',
    content: `Create ${workoutFocus.targetExerciseCount} exercises for a ${workoutFocus.focus} focused workout based on:
${JSON.stringify(relevantData, null, 2)}

Consider the workout environment (${intakeData.workoutEnvironment.primary}) and available equipment (${JSON.stringify(intakeData.equipmentAccess.available)}).

For time-based exercises, use 'seconds' for durations under 2 minutes, and 'minutes' for longer durations.
For distance-based exercises, use 'meters' for distances under 1000m, and 'km' for longer distances.

For each exercise:
- Provide appropriate intensity guidance (RPE, percentage of max, or descriptive level)
- Include important form cues, tempo guidance, or other trainer tips in the notes
- Consider the user's experience level when providing guidance

Provide a response ONLY in the following JSON format:
{
  "exercises": Array<{
    "name": string,
    "sets": number,
    "measure": {
      "type": "reps" | "time" | "distance",
      "value": number,
      "unit"?: "seconds" | "minutes" | "meters" | "km" | "miles"
    },
    "restPeriod": number,  // in seconds
    "equipment": string[], // required equipment from the available list
    "alternatives": string[], // alternative exercises if equipment unavailable
    "intensity"?: string,  // suggested intensity level (RPE, percentage, or descriptive)
    "notes"?: string      // form cues, tempo guidance, or other important tips
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

    console.log('Program to save:', {
      name: program.name,
      userId: program.user.id,
      workoutPlansCount: program.workoutPlans.length,
      firstPlan: program.workoutPlans[0] ? {
        workoutsCount: program.workoutPlans[0].workouts.length,
        firstWorkout: program.workoutPlans[0].workouts[0] ? {
          exercisesCount: program.workoutPlans[0].workouts[0].exercises.length,
          firstExercise: program.workoutPlans[0].workouts[0].exercises[0]
        } : null
      } : null
    });

    const dbData = {
      name: program.name,
      description: program.description || '',
      createdBy: program.user.id,
      workoutPlans: {
        create: program.workoutPlans.map(plan => {
          console.log('Processing plan:', {
            workoutsCount: plan.workouts.length,
            nutrition: plan.nutrition
          });

          return {
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
              create: plan.workouts.map(workout => {
                console.log('Processing workout:', {
                  name: workout.name,
                  exercisesCount: workout.exercises.length
                });

                return {
                  name: workout.name || '',
                  dayNumber: workout.dayNumber || 1,
                  focus: workout.focus || '',
                  warmup: JSON.stringify(workout.warmup) || '',
                  cooldown: JSON.stringify(workout.cooldown) || '',
                  exercises: {
                    create: workout.exercises.map(exercise => {
                      console.log('Processing exercise:', {
                        name: exercise.name,
                        measure: exercise.measure,
                        restPeriod: exercise.restPeriod
                      });

                      // For backwards compatibility and DB constraints
                      const reps = exercise.measure.type === 'reps' ? Math.round(exercise.measure.value) : 0;
                      
                      // Convert measure type to enum
                      const measureType = exercise.measure.type.toUpperCase() as ExerciseMeasureType;
                      console.log("🚀 ~ saveProgramToDatabase ~ measureType:", measureType)
                      
                      // Convert measure unit to enum
                      let measureUnit: ExerciseMeasureUnit | null = null;
                      if (exercise.measure.unit) {
                        switch (exercise.measure.unit) {
                          case 'seconds':
                            measureUnit = 'SECONDS';
                            break;
                          case 'minutes':
                            measureUnit = 'SECONDS'; // Convert to seconds for consistency
                            exercise.measure.value *= 60;
                            break;
                          case 'meters':
                            measureUnit = 'METERS';
                            break;
                          case 'km':
                            measureUnit = 'KILOMETERS';
                            break;
                          default:
                            measureUnit = null;
                        }
                      }
                      
                      const exerciseData = {
                        name: exercise.name,
                        sets: exercise.sets,
                        reps: reps,
                        restPeriod: Math.round(exercise.restPeriod),
                        measureType: measureType as ExerciseMeasureType,
                        measureValue: exercise.measure.value,
                        measureUnit: measureUnit as ExerciseMeasureUnit,
                        intensity: 0, // Default to 0 since we'll store the description in notes
                        notes: `${exercise.intensity || ''} ${exercise.notes || ''}`.trim() || null,
                        exerciseLibrary: {
                          connectOrCreate: {
                            where: { name: exercise.name },
                            create: {
                              name: exercise.name,
                              category: exercise.category || 'default'
                            }
                          }
                        }
                      };

                      console.log('Full exercise data being saved:', JSON.stringify(exerciseData, null, 2));
                      
                      return exerciseData;
                    })
                  }
                };
              })
            }
          };
        })
      }
    };

    console.log('Attempting to save with dbData structure:', {
      name: dbData.name,
      workoutPlansCount: dbData.workoutPlans.create.length,
      firstPlan: dbData.workoutPlans.create[0] ? {
        workoutsCount: dbData.workoutPlans.create[0].workouts.create.length,
        firstWorkout: dbData.workoutPlans.create[0].workouts.create[0] ? {
          exercisesCount: dbData.workoutPlans.create[0].workouts.create[0].exercises.create.length
        } : null
      } : null
    });

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
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: (error as any).code,
        meta: (error as any).meta,
        target: (error as any).target
      });
    }
    throw error;
  }
};

// Main functions
export const getProgramStructure = async (intakeData: IntakeFormData, userId: string) => {
  const response = await sendMessage(formatProgramStructurePrompt(intakeData), userId);
  return parseAIResponse<ProgramStructure>(response, defaultProgramStructure);
};

export const getWorkoutStructure = async (intakeData: IntakeFormData, programStructure: ProgramStructure, userId: string) => {
  const response = await sendMessage(formatWorkoutStructurePrompt(intakeData, programStructure), userId);
  return parseAIResponse<WorkoutStructure>(response, defaultWorkoutStructure);
};

export const getWorkoutFocus = async (
  intakeData: IntakeFormData,
  programStructure: ProgramStructure,
  workoutStructure: WorkoutStructure,
  dayNumber: number,
  userId: string
) => {
  const response = await sendMessage(formatWorkoutFocusPrompt(intakeData, programStructure, workoutStructure, dayNumber), userId);
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
  workoutFocus: { focus: string; targetExerciseCount: number },
  userId: string
) => {
  const response = await sendMessage(formatExercisesForFocusPrompt(intakeData, programStructure, workoutStructure, workoutFocus), userId);
  return parseAIResponse(response, {
    exercises: []
  });
};

export const getPhaseDetails = async (
  intakeData: IntakeFormData,
  programStructure: ProgramStructure,
  workoutStructure: WorkoutStructure,
  phase: number,
  userId: string
) => {
  const response = await sendMessage(formatPhaseDetailsPrompt(intakeData, programStructure, workoutStructure, phase), userId);
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
  phase: number,
  userId: string
) => {
  const response = await sendMessage(formatPhaseNutritionPrompt(intakeData, programStructure, phase), userId);
  return parseAIResponse(response, {
    dailyCalories: 2000,
    macros: { protein: 150, carbs: 200, fats: 70 }
  });
};

// @todo: get this or something like it operational
export const getFinalReview = async (
  intakeData: IntakeFormData,
  programStructure: ProgramStructure,
  workoutStructure: WorkoutStructure,
  workoutPlans: WorkoutPlan[],
  nutritionPlan: Nutrition,
  userId: string
) => {
  const response = await sendMessage(
    formatFinalReviewPrompt(intakeData, programStructure, workoutStructure, workoutPlans, nutritionPlan),
    userId
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