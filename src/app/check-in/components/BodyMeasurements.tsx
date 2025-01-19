import React from 'react';
import FormSection from './FormSection';
import { inputClasses, labelClasses, BodyMeasurementsData } from './shared';

interface BodyMeasurementsProps extends BodyMeasurementsData {
  onChange: (key: keyof BodyMeasurementsData, value: number | null) => void;
}

export const BodyMeasurements: React.FC<BodyMeasurementsProps> = (props) => {
  const { onChange, ...measurements } = props;

  const renderInput = (key: keyof BodyMeasurementsData, label: string) => (
    <div>
      <label htmlFor={key} className={labelClasses}>
        {label}
      </label>
      <input
        type="number"
        id={key}
        step="0.25"
        value={measurements[key] || ''}
        onChange={(e) => onChange(key, e.target.value ? Number(e.target.value) : null)}
        className={inputClasses}
      />
    </div>
  );

  return (
    <FormSection title="Body Measurements">
      <div className="space-y-6">
        {/* Core Measurements */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Core</h3>
          <div className="grid grid-cols-3 gap-6">
            {renderInput('chest', 'Chest (in)')}
            {renderInput('waist', 'Waist (in)')}
            {renderInput('hips', 'Hips (in)')}
          </div>
        </div>

        {/* Arms */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Arms</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              {renderInput('bicepLeft', 'Left Bicep (in)')}
              {renderInput('bicepLeftFlex', 'Left Bicep Flexed (in)')}
            </div>
            <div className="space-y-4">
              {renderInput('bicepRight', 'Right Bicep (in)')}
              {renderInput('bicepRightFlex', 'Right Bicep Flexed (in)')}
            </div>
          </div>
        </div>

        {/* Legs */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Legs</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              {renderInput('thighLeft', 'Left Thigh (in)')}
              {renderInput('calfLeft', 'Left Calf (in)')}
            </div>
            <div className="space-y-4">
              {renderInput('thighRight', 'Right Thigh (in)')}
              {renderInput('calfRight', 'Right Calf (in)')}
            </div>
          </div>
        </div>
      </div>
    </FormSection>
  );
};

export default BodyMeasurements; 