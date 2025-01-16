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

export const formatExerciseMeasure = (exercise: any) => {
  // If we have reps and it's not 0, show that
  if (exercise.reps) { // db version
    return `${exercise.reps || exercise.measure?.reps}`;
  } else if (exercise.measure?.type === 'reps') { // api version
    return `${exercise.measure.value}`;
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