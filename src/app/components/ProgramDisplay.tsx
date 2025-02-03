import { Program } from '@/types';
import { WorkoutPlanDisplay } from './WorkoutPlanDisplay';
import { UpsellModal } from './UpsellModal';
import { useEffect, useState, useRef } from 'react';
import { User } from '@prisma/client';
import { getUser } from '../start/actions';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';
interface ProgramDisplayProps {
  program: Program;
  userEmail?: string | null;
  onRequestUpsell: () => void;
  isUpsellOpen?: boolean;
  onCloseUpsell?: () => void;
}

export function ProgramDisplay({ 
  program, 
  userEmail: initialUserEmail = null, 
  onRequestUpsell,
  isUpsellOpen = false,
  onCloseUpsell,
}: ProgramDisplayProps) {
  const [activePlanIndex, setActivePlanIndex] = useState(0);
  const [userEmail, setUserEmail] = useState(initialUserEmail);
  const [isExpanded, setIsExpanded] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const workoutPlanRef = useRef<any>(null);

  const handleEmailSubmit = async (email: string) => {
    setUserEmail(email);
    
    // Immediately fetch and update user state
    const userId = new URLSearchParams(window.location.search).get('userId');
    if (userId) {
      const result = await getUser(userId);
      if (result.success && result.user) {
        setUser(result.user);
      }
    }
    
    onCloseUpsell?.();
  };

  const handleSuccessfulSubmit = async () => {
    try {
      // Wait for the next tick to ensure user state is updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (workoutPlanRef.current) {
        await workoutPlanRef.current.generateWorkoutPDF(program);
      }
    } catch (error) {
      console.error('Error handling successful submit:', error);
    }
  };

  const handlePurchase = () => {
    onCloseUpsell?.();
  };

  useEffect(() => {
    const fetchUser = async () => {
      const userId = new URLSearchParams(window.location.search).get('userId');
      if (userId) {
        const result = await getUser(userId);
        if (result.success && result.user) {
          setUser(result.user);
          setUserEmail(result.user.email);
        }
      }
    };

    fetchUser();
  }, []);

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
    <div className="space-y-6 px-2 md:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Program Overview */}

      <DisclaimerBanner 
        variant="inline" 
        showAcknowledgeButton={false}
      />
      
      {isExpanded && (
        <>
          {/* Active Workout Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-0 md:px-6 lg:p-6 relative">
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
              ref={workoutPlanRef}
              program={program}
              plan={program.workoutPlans[activePlanIndex]} 
              userEmail={userEmail || undefined}
              user={user}
              onRequestUpsell={onRequestUpsell}
            />
          </div>
        </>
      )}

      <UpsellModal
        isOpen={isUpsellOpen}
        onClose={() => onCloseUpsell?.()}
        onEmailSubmit={handleEmailSubmit}
        onPurchase={handlePurchase}
        userEmail={userEmail}
        user={user}
        onSuccessfulSubmit={handleSuccessfulSubmit}
      />
    </div>
  );
}