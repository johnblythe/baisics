import React from 'react';
import FormSection from './FormSection';
import { inputClasses } from './shared';

interface NotesProps {
  value: string | undefined;
  onChange: (value: string) => void;
}

export const Notes: React.FC<NotesProps> = ({ value, onChange }) => {
  return (
    <FormSection title="Additional Notes">
      <div>
        <label htmlFor="notes" className="sr-only">
          Notes
        </label>
        <textarea
          id="notes"
          rows={4}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Any additional notes about your progress this week..."
          className={inputClasses}
        />
      </div>
    </FormSection>
  );
};

export default Notes; 