import React from 'react';
import FormSection from './FormSection';

interface BodyStatsProps {
  weight: number | null;
  bodyFat: number | null;
  onWeightChange: (value: number | null) => void;
  onBodyFatChange: (value: number | null) => void;
}

const inputClasses = "mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-200";

export const BodyStats: React.FC<BodyStatsProps> = ({
  weight,
  bodyFat,
  onWeightChange,
  onBodyFatChange,
}) => {
  return (
    <FormSection title="Body Stats">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Weight (lbs)
            </label>
            <input
              type="number"
              id="weight"
              step="0.1"
              value={weight || ''}
              onChange={(e) => onWeightChange(e.target.value ? Number(e.target.value) : null)}
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="bodyFat" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Body Fat %
            </label>
            <input
              type="number"
              id="bodyFat"
              step="0.1"
              value={bodyFat || ''}
              onChange={(e) => onBodyFatChange(e.target.value ? Number(e.target.value) : null)}
              className={inputClasses}
            />
          </div>
        </div>
      </div>
    </FormSection>
  );
};

export default BodyStats; 