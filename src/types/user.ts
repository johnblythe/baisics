export interface IntakeFormData {
  trainingGoal: string;
  experienceLevel: string;
  daysAvailable: number;
  dailyBudget?: number;
  age?: number;
  weight?: number;
  height?: number;
  sex?: 'male' | 'female' | 'other';
  trainingPreferences?: string[];
  workoutEnvironment: {
    primary: 'gym' | 'home' | 'travel' | 'outdoors';
    limitations?: string[];
  };
  equipmentAccess: {
    type: 'full-gym' | 'minimal' | 'bodyweight' | 'specific';
    available: string[];
  };
  workoutStyle: {
    primary: 'strength' | 'yoga' | 'cardio' | 'hybrid';
    secondary?: 'strength' | 'yoga' | 'cardio' | 'hybrid';
  };
  additionalInfo?: string;
  modificationRequest?: string;
}

export interface UserIntakeSummary {
  id: string;
  userId: string;
  intakeData: IntakeFormData;
  confidenceScores: {
    [key: string]: number;
  };
  analysisNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExtractedData {
  sex?: string;
  trainingGoal?: string;
  daysAvailable?: number;
  dailyBudget?: number;
  age?: number;
  weight?: number;
  height?: number;
  trainingPreferences?: string[];
  workoutEnvironment?: {
    primary: string;      // 'gym', 'home', 'travel', 'outdoors'
    limitations?: string[];
  };
  equipmentAccess?: {
    type: string;         // 'full-gym', 'minimal', 'bodyweight', 'specific'
    available?: string[]; // specific equipment available
  };
  workoutStyle?: {
    primary: string;      // 'strength', 'yoga', 'cardio', 'hybrid'
    secondary?: string;   // optional secondary focus
  };
  additionalInfo?: string;
  confidence: {
    [key: string]: number; // 0-1 confidence score for each field
  };
} 