import { ExtractedData } from './user';

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  success: boolean;
  message: string;
  extractedData?: ExtractedData;
}

export interface AnalysisRequirements {
  matchClientPreferences: boolean;  // Match days, equipment, preferences
  phaseRequirements: {
    minPhases: number;  // 3
    maxPhases: number;  // 4
    minWeeksPerPhase: number;  // 4
    maxWeeksPerPhase: number;  // 6
  };
  requireMacroRecommendations: boolean;
  requireProgressionProtocols: boolean;
  requireStructuredWorkouts: boolean;  // Sets, reps, rest periods
  considerInjuryLimitations: boolean;
}

export interface ProgramStructure {
  totalPhases: number;
  phaseStructure: Array<{
    phase: number;
    durationWeeks: number;
    focus: string;
    progressionStrategy: string;
    targetIntensity: string;
  }>;
  overallProgression: string[];
  estimatedTimePerWorkout: number;
} 