export interface WizardFormData {
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
}

export interface WizardStep {
  question: string;
  inputType: 'text' | 'number' | 'select' | 'multiselect' | 'image';
  key: keyof WizardFormData;
  options?: string[];
  placeholder?: string;
  validation?: (value: any) => boolean;
} 