import { IntakeFormData } from "@/types/user";

export const formatRestPeriod = (rest: number): string => {
  // If no rest period provided, return default
  if (!rest) return '60s';

  // If rest period is less than 60 seconds
  if (rest < 60) return `${rest}s`;

  return formatSecondsToMinutes(rest);
};

// simple helper to format seconds to minutes
export const formatSecondsToMinutes = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes} min${remainingSeconds ? ` ${remainingSeconds} s` : ''}`;
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
    const unit = exercise.measureUnit?.toLowerCase() || exercise.measure?.unit?.toLowerCase();
    const value = exercise.measureValue || exercise.measure?.value;

    let finalReturn = '';

    switch (type) {
      case 'time':
        if (unit === 'seconds') {
          if (value > 60) {
            finalReturn = `${formatSecondsToMinutes(value)}`;
            break;
          } else {
            finalReturn = `${value}s`;
            break;
          }
        }
        if (unit === 'minutes') {
          finalReturn = `${value}m`;
          break;
        }
        finalReturn = `${value} ${unit || 's'}`
        break;
      case 'distance':
        if (unit === 'meters') {
          finalReturn = `${value}m`;
          break;
        }
        if (unit === 'kilometers') {
          finalReturn = `${value}km`;
          break;
        }
        if (unit === 'miles') {
          finalReturn = `${value}mi`;
          break;
        }
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
    trainingGoal: Array.isArray(extractedData.goals?.value) ? extractedData.goals.value.join(', ') : extractedData.goals?.value,
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