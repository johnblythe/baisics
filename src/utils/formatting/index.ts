// Add this utility function near the top of the file, after the type definitions
export const formatCamelCase = (str: string) => {
  return str
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
    .trim();
};