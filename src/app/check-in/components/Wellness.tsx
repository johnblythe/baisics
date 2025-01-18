import React from 'react';
import FormSection from './FormSection';
import { inputClasses, labelClasses, WellnessData } from './shared';

interface WellnessProps extends WellnessData {
  onChange: (key: keyof WellnessData, value: number | null) => void;
}

export const Wellness: React.FC<WellnessProps> = (props) => {
  const { onChange, ...wellness } = props;

  const renderInput = (
    key: keyof WellnessData,
    label: string,
    options?: { min?: number; max?: number; step?: number }
  ) => (
    <div>
      <label htmlFor={key} className={labelClasses}>
        {label}
      </label>
      <input
        type="number"
        id={key}
        min={options?.min}
        max={options?.max}
        step={options?.step ?? 1}
        value={wellness[key] || ''}
        onChange={(e) => onChange(key, e.target.value ? Number(e.target.value) : null)}
        className={inputClasses}
      />
    </div>
  );

  return (
    <FormSection title="Wellness">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          {renderInput('sleepHours', 'Sleep (hours)', { step: 0.5 })}
          {renderInput('sleepQuality', 'Sleep Quality (1-10)', { min: 1, max: 10 })}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {renderInput('energyLevel', 'Energy Level (1-10)', { min: 1, max: 10 })}
          {renderInput('stressLevel', 'Stress Level (1-10)', { min: 1, max: 10 })}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {renderInput('soreness', 'Soreness (1-10)', { min: 1, max: 10 })}
          {renderInput('recovery', 'Recovery (1-10)', { min: 1, max: 10 })}
        </div>
      </div>
    </FormSection>
  );
};

export default Wellness; 