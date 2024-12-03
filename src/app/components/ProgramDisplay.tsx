// import { WorkoutPlanDisplayProps } from '../start/types';
import { WorkoutPlanDisplay } from './WorkoutPlanDisplay';
import { UpsellModal } from './UpsellModal';
import { useState } from 'react';
import { ProgramFullDisplay } from '../start/types';
import { generateWorkoutPDF } from '@/utils/pdf';

interface ProgramDisplayProps {
  program: ProgramFullDisplay;
  userEmail?: string | null;
  onRequestUpsell: () => void;
}

export function ProgramDisplay({ program, userEmail: initialUserEmail = null, onRequestUpsell }: ProgramDisplayProps) {
  const [activePlanIndex, setActivePlanIndex] = useState(0);
  const [isUpsellOpen, setIsUpsellOpen] = useState(false);
  const [userEmail, setUserEmail] = useState(initialUserEmail);
  const handleEmailSubmit = (email: string) => {
    setUserEmail(email);
    setIsUpsellOpen(false);
  };

  const handlePurchase = () => {
    setIsUpsellOpen(false);
  };

  if (!program) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">No program data available</p>
      </div>
    );
  }

  if (!program.workoutPlans || program.workoutPlans.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">No workout plans available</p>
      </div>
    );
  }

  const isPhaseUnlocked = (index: number) => {
    return userEmail || index === 0;
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Program Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
          <h1 className="text-3xl font-bold text-white mb-2">{program.name}</h1>
          {program.description && (
            <p className="text-blue-100 text-lg">{program.description}</p>
          )}
        </div>

        {/* Workout Phase Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex justify-between px-6" aria-label="Workout Phases">
            <div className="flex gap-1">
              {program.workoutPlans.map((plan, index) => (
                <button
                  key={`phase-${index}`}
                  onClick={() => {
                    setActivePlanIndex(index);
                    if (!isPhaseUnlocked(index)) {
                      setIsUpsellOpen(true);
                    }
                  }}
                  className={`
                    relative py-4 px-6 text-sm font-medium transition-all duration-200 flex items-center gap-2
                    ${
                      activePlanIndex === index
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }
                  `}
                >
                  <span className="relative z-10">Phase {index + 1}</span>
                  {!isPhaseUnlocked(index) && (
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill="currentColor" 
                      className="w-4 h-4"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  )}
                  {activePlanIndex === index && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400" />
                  )}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => userEmail ? generateWorkoutPDF(program) : onRequestUpsell()}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors duration-150"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="currentColor" 
                  className="w-4 h-4"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M6 2a1 1 0 00-1 1v18a1 1 0 001 1h12a1 1 0 001-1V3a1 1 0 00-1-1H6zm1 2h10v16H7V4zm2 2v2h6V6H9zm0 4v2h6v-2H9zm0 4v2h6v-2H9z" 
                    clipRule="evenodd" 
                  />
                </svg>
                Download PDF
              </button>

              {(!userEmail || (userEmail && !program.user.isPremium)) && (
                <button
                  onClick={onRequestUpsell}
                  className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full border border-blue-600 text-blue-600 bg-white hover:bg-blue-600 hover:text-white dark:bg-gray-800 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-500 dark:hover:text-white transition-all duration-150"
                >
                  <span>✨</span>
                  Upgrade
                </button>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Active Workout Plan */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 relative">
        {!isPhaseUnlocked(activePlanIndex) && (
          <div className="absolute inset-0 backdrop-blur-sm bg-white/30 dark:bg-gray-800/30 rounded-xl z-10 flex justify-center">
            <div className="text-center p-6 max-w-md mt-40">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="w-12 h-12 mx-auto mb-4 text-blue-600"
              >
                <path 
                  fillRule="evenodd" 
                  d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" 
                  clipRule="evenodd" 
                />
              </svg>
              <h3 className="text-xl font-bold mb-2">Unlock Advanced Training Phases</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Get access to all training phases and personalized workout plans by signing up.
              </p>
              <button
                onClick={onRequestUpsell}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Unlock Full Program
              </button>
            </div>
          </div>
        )}
        <WorkoutPlanDisplay 
          plan={program.workoutPlans[activePlanIndex]} 
          userEmail={userEmail || undefined}
        />
      </div>
    </div>
  );
}