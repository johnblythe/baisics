import { ExerciseMeasureType, ExerciseMeasureUnit } from '@prisma/client';

interface WorkoutFileResponse {
  program: {
    name: string;
    description: string;
  };
  workoutPlan: {
    daysPerWeek: number;
    splitType: string;
    phase: number;
    phaseExplanation: string;
    phaseExpectations: string;
    phaseKeyPoints: string[];
    progressionProtocol: string[];
  };
  workouts: {
    name: string;
    focus: string;
    dayNumber: number;
    warmup?: string;
    cooldown?: string;
    exercises: {
      name: string;
      sets: number;
      category: 'primary' | 'secondary' | 'isolation' | 'other';
      measure: {
        type: ExerciseMeasureType;
        value: number;
        unit?: ExerciseMeasureUnit;
      };
      restPeriod: number;
      intensity: number;
      notes?: string;
    }[];
  }[];
}

interface WorkoutFileError {
  error: true;
  reason: string;
  details: string[];
}

export const workoutFilePrompt = `
You are analyzing a workout document. Convert it into a structured program format that matches our database schema.

Required Response Format:
{
  "program": {
    "name": string,
    "description": string
  },
  "workoutPlan": {
    "daysPerWeek": number,
    "splitType": string,
    "phase": number,
    "phaseExplanation": string,
    "phaseExpectations": string,
    "phaseKeyPoints": string[],
    "progressionProtocol": string[]
  },
  "workouts": [
    {
      "name": string,
      "focus": string,
      "dayNumber": number,
      "warmup": string?,
      "cooldown": string?,
      "exercises": [
        {
          "name": string,
          "sets": number,
          "category": "primary" | "secondary" | "isolation" | "other",
          "measure": {
            "type": "REPS" | "TIME" | "DISTANCE" | "WEIGHT" | "BODY_WEIGHT",
            "value": number,
            "unit"?: "KG" | "LB" | "PERCENT" | "SECONDS" | "METERS" | "KILOMETERS"  // Optional - omit for REPS
          },
          "restPeriod": number,  // in seconds
          "intensity": number,    // 0-100 for percentage
          "notes": string        // Include form cues, tempo, alternatives here
        }
      ]
    }
  ]
}

Critical Requirements:
1. Exercise Ordering: Exercises MUST be ordered by category:
   - "primary": Compound movements (squats, deadlifts, bench press)
   - "secondary": Variation lifts (split squats, RDLs, incline press)
   - "isolation": Accessory work (curls, lateral raises)
   - "other": Cardio, mobility work

2. Measurements:
   - For time: type=TIME, unit=SECONDS (convert minutes if needed)
   - For distance: type=DISTANCE, unit=METERS or KILOMETERS
   - For weight-based: type=WEIGHT, unit=KG or LB
   - For bodyweight: type=BODY_WEIGHT, no unit needed
   - For standard rep schemes: type=REPS, NO UNIT (leave unit empty/null)
   - PERCENT is ONLY for percentage of 1RM (e.g., "80% of max")

3. Environment Grouping:
   - Group exercises by environment (gym, pool, outdoors)
   - Maximum ONE environment change per workout
   - Note environment changes in the workout's focus field

Error Response Format:
{
  "error": true,
  "reason": string,
  "details": string[]
}
`;

export type { WorkoutFileResponse, WorkoutFileError }; 