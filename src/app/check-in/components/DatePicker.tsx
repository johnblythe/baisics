import React from 'react';
import FormSection from './FormSection';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
}

const inputClasses = "mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-[#FF6B6B] dark:focus:ring-[#FF6B6B] focus:border-transparent hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-200";

export const DatePicker: React.FC<DatePickerProps> = ({ value, onChange }) => {
  return (
    <FormSection title="Check-in Date">
      <div className="max-w-xs">
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClasses}
        />
      </div>
    </FormSection>
  );
};

export default DatePicker; 