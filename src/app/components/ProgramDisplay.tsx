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
  const [isExpanded, setIsExpanded] = useState(true);
  const [activePlanIndex, setActivePlanIndex] = useState(0);
  const [isUpsellOpen, setIsUpsellOpen] = useState(false);
  const [userEmail, setUserEmail] = useState(initialUserEmail);

  const isPhaseUnlocked = (index: number) => {
    return index === 0 || userEmail;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Program Overview */}
      <div className="bg-white dark:bg-gray-800 shadow-lg">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">{program.name}</h1>
              {program.description && (
                <p className="text-blue-100 text-sm">{program.description}</p>
              )}
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-sm rounded-full backdrop-blur-sm transition"
            >
              {isExpanded ? 'Show Less' : 'Show More'}
            </button>
          </div>
        </div>

        {isExpanded && (
          <>
            {/* Workout Phase Navigation */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex justify-between px-4" aria-label="Workout Phases">
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
                        relative py-3 px-4 text-sm font-medium transition-all duration-200 flex items-center gap-2
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
              </nav>
            </div>
          </>
        )}
      </div>

      {/* Active Phase Content */}
      <div className="flex-1 overflow-y-auto">
        <ActivePhaseDisplay
          phase={program.workoutPlans[activePlanIndex]}
          isUnlocked={isPhaseUnlocked(activePlanIndex)}
          onRequestUpsell={onRequestUpsell}
        />
      </div>

      {/* Upsell Modal */}
      <UpsellModal
        isOpen={isUpsellOpen}
        onClose={() => setIsUpsellOpen(false)}
        onSubmit={(email) => {
          setUserEmail(email);
          setIsUpsellOpen(false);
        }}
      />
    </div>
  );
}