import { WorkoutPlanDisplayProps } from '../start/types';
import { WorkoutPlanDisplay } from './WorkoutPlanDisplay';
import { useState } from 'react';

interface ProgramDisplayProps {
  program: {
    id: string;
    name: string;
    description?: string;
    workoutPlans: WorkoutPlanDisplayProps[];
  };
  userEmail?: string | null;
}

export function ProgramDisplay({ program, userEmail = null }: ProgramDisplayProps) {
  const [activePlanIndex, setActivePlanIndex] = useState(0);

  console.log('ProgramDisplay render:', { program, activePlanIndex });

  if (!program) {
    console.error('Program is null or undefined');
    return <div>Error: No program data available</div>;
  }

  if (!program.workoutPlans || program.workoutPlans.length === 0) {
    console.error('No workout plans available');
    return <div>Error: No workout plans available</div>;
  }

  return (
    <div className="space-y-8">
      {/* Program Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">{program.name}</h1>
        {program.description && <p className="mb-4">{program.description}</p>}
      </div>

      {/* Workout Plan Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {program.workoutPlans.map((plan, index) => (
            <button
              key={`plan-${index}`}
              onClick={() => setActivePlanIndex(index)}
              className={`py-2 px-4 border-b-2 text-sm font-medium ${
                activePlanIndex === index
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Plan {index + 1}
            </button>
          ))}
        </nav>
      </div>

      {/* Active Workout Plan */}
      <WorkoutPlanDisplay 
        plan={program.workoutPlans[activePlanIndex]} 
        userEmail={userEmail}
      />
    </div>
  );
} 