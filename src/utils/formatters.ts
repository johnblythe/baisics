import { IntakeFormData } from "@/types/user";

export const formatRestPeriod = (rest: number): string => {
  // If no rest period provided, return default
  if (!rest) return '60s';

  // If rest period is less than 60 seconds
  if (rest < 60) return `${rest}s`;

  // Convert to minutes and seconds
  const minutes = Math.floor(rest / 60);
  const seconds = rest % 60;
  
  return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
};

// more of a getter tbh
export const formatExerciseUnit = (
  exercise: any,
  format: 'short' | 'long' = 'short',
  style: 'lower' | 'upper' | 'mixed' = 'lower'
) => {
  let unit = '';
  if (exercise.measureUnit) {
    unit = exercise.measureUnit;
  } else if (exercise.measure?.unit) {
    unit = exercise.measure.unit;
  }

  if (style === 'lower') {
    unit = unit.toLowerCase();
  } else if (style === 'upper') {
    unit = unit.toUpperCase();
  } else if (style === 'mixed') {
    unit = unit.toLowerCase();
    unit = unit.charAt(0).toUpperCase() + unit.slice(1);
  }

  if (format === 'short') {
    return unit.slice(0, 1);
  } else {
    return unit;
  }
}

export const formatExerciseMeasure = (exercise: any) => {
  // If we have reps and it's not 0, show that
  if (exercise.reps) { // db version
    return `${exercise.reps || exercise.measure?.reps} reps`;
  } else if (exercise.measure?.type === 'reps') { // api version
    return `${exercise.measure.value} reps`;
  }

  try {
    const type = exercise.measureType ? exercise.measureType.toLowerCase() : exercise.measure?.type?.toLowerCase();
    const unit = exercise.measureUnit || exercise.measure?.unit;
    const value = exercise.measureValue || exercise.measure?.value;

    let finalReturn = '';
    switch (type) {
      case 'time':
        if (unit === 'seconds') finalReturn = `${value}s`;
        if (unit === 'minutes') finalReturn = `${value}m`;
        finalReturn = `${value} ${unit || 's'}`
        break;
      case 'distance':
        if (unit === 'meters') finalReturn = `${value}m`;
        if (unit === 'kilometers') finalReturn = `${value}km`;
        if (unit === 'miles') finalReturn = `${value}mi`;
        finalReturn = `${value} ${unit || 'm'}`
        break;
      default:
        finalReturn = unit ? `${value} ${unit}` : value;
    }

    return finalReturn.toLowerCase();
  } catch (error) {
    console.error('Error formatting exercise measure:', error);
    return '-';
  }
}; 


// Helper to convert extracted data to IntakeFormData format
export const convertToIntakeFormat = (extractedData: any): IntakeFormData => {
  return {
    sex: extractedData.gender?.value || 'other',
    trainingGoal: extractedData.goals?.value,
    daysAvailable: parseInt(extractedData.daysPerWeek?.value) || 3,
    dailyBudget: parseInt(extractedData.timePerDay?.value) || 60,
    age: extractedData.age?.value ? parseInt(extractedData.age.value) : undefined,
    weight: extractedData.weight?.value ? parseInt(extractedData.weight.value) : undefined,
    height: extractedData.height?.value ? parseInt(extractedData.height.value) : undefined,
    trainingPreferences: extractedData.preferences?.value ? 
      extractedData.preferences.value.split(',').map((p: string) => p.trim()) : 
      [],
    workoutEnvironment: {
      primary: extractedData.workoutEnvironment?.value?.primary || 'gym',
      limitations: extractedData.workoutEnvironment?.value?.limitations || []
    },
    equipmentAccess: {
      type: extractedData.equipmentAccess?.value?.type || 'full-gym',
      available: extractedData.equipmentAccess?.value?.available || []
    },
    workoutStyle: {
      primary: extractedData.workoutStyle?.value?.primary || 'strength',
      secondary: extractedData.workoutStyle?.value?.secondary
    },
    additionalInfo: extractedData.additionalInfo?.value || '',
    experienceLevel: extractedData.additionalInfo?.value?.toLowerCase().includes('experienced') ? 'intermediate' : 'beginner',
    modificationRequest: extractedData.modificationRequest?.value || '',
  };
}