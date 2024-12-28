// Add this utility function near the top of the file, after the type definitions
export const formatCamelCase = (str: string) => {
  return str
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
    .trim();
};

export const formatUnderscoreDelimitedString = (str: string) => {
  return str.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

// Utility function to convert inches to feet and inches
export const convertHeightToFeetAndInches = (heightInInches: number): string => {
  const feet = Math.floor(heightInInches / 12);
  const inches = heightInInches % 12;
  return inches === 0 ? `${feet}′` : `${feet}′ ${inches}″`;
}