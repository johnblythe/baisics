// Common styles
export const inputClasses = "mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-200";

export const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300";

// Common types
export interface Photo {
  type: 'FRONT' | 'BACK' | 'SIDE_LEFT' | 'SIDE_RIGHT' | 'CUSTOM';
  file: File | null;
  base64Data?: string;
}

export interface BodyMeasurementsData {
  chest: number | null;
  waist: number | null;
  hips: number | null;
  bicepLeft: number | null;
  bicepLeftFlex: number | null;
  bicepRight: number | null;
  bicepRightFlex: number | null;
  thighLeft: number | null;
  thighRight: number | null;
  calfLeft: number | null;
  calfRight: number | null;
}

export interface WellnessData {
  sleepHours: number | null;
  sleepQuality: number | null;
  energyLevel: number | null;
  stressLevel: number | null;
  soreness: number | null;
  recovery: number | null;
} 