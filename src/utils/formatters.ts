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


// Helper to get value from either old format (with .value wrapper) or new format (direct)
const getValue = (field: any): any => {
  if (field === null || field === undefined) return null;
  // Old format: { value: X, confidence: Y }
  if (typeof field === 'object' && 'value' in field) return field.value;
  // New format: direct value
  return field;
};

// Helper to convert extracted data to IntakeFormData format
// Supports both old format (with confidence scores) and new simplified format
export const convertToIntakeFormat = (extractedData: any): IntakeFormData => {
  const gender = getValue(extractedData.gender);
  const goals = getValue(extractedData.goals);
  const daysPerWeek = getValue(extractedData.daysPerWeek);
  const timePerDay = getValue(extractedData.timePerDay);
  const age = getValue(extractedData.age);
  const weight = getValue(extractedData.weight);
  const height = getValue(extractedData.height);
  const preferences = getValue(extractedData.preferences);
  const workoutEnv = getValue(extractedData.workoutEnvironment) || extractedData.workoutEnvironment;
  const equipment = getValue(extractedData.equipmentAccess) || extractedData.equipmentAccess;
  const style = getValue(extractedData.workoutStyle) || extractedData.workoutStyle;
  const additionalInfo = getValue(extractedData.additionalInfo);
  const experienceLevel = getValue(extractedData.experienceLevel);

  return {
    sex: gender || 'other',
    trainingGoal: Array.isArray(goals) ? goals.join(', ') : goals || '',
    daysAvailable: parseInt(daysPerWeek) || 3,
    dailyBudget: parseInt(timePerDay) || 60,
    age: age ? parseInt(age) : undefined,
    weight: weight ? parseInt(weight) : undefined,
    height: height ? parseInt(height) : undefined,
    trainingPreferences: Array.isArray(preferences)
      ? preferences
      : preferences
        ? String(preferences).split(',').map((p: string) => p.trim())
        : [],
    workoutEnvironment: {
      primary: workoutEnv?.primary || 'gym',
      limitations: workoutEnv?.limitations || []
    },
    equipmentAccess: {
      type: equipment?.type || 'full-gym',
      available: equipment?.available || []
    },
    workoutStyle: {
      primary: style?.primary || 'strength',
      secondary: style?.secondary
    },
    additionalInfo: additionalInfo || '',
    experienceLevel: experienceLevel || (additionalInfo?.toLowerCase?.().includes('experienced') ? 'intermediate' : 'beginner'),
    modificationRequest: getValue(extractedData.modificationRequest) || '',
  };
}