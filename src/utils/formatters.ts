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