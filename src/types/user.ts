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
  additionalInfo?: string;
  confidence: {
    [key: string]: number; // 0-1 confidence score for each field
  };
} 