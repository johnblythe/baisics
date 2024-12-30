import { Program } from '@/types';
import { WorkoutPlanDisplay } from './WorkoutPlanDisplay';
import { UpsellModal } from './UpsellModal';
import { useState } from 'react';
// import { generateWorkoutPDF } from '@/utils/pdf';

interface ProgramDisplayProps {
  program: Program;
  userEmail?: string | null;
  onRequestUpsell: () => void;
  isUpsellOpen?: boolean;
  onCloseUpsell?: () => void;
  onUploadImages?: (files: File[]) => Promise<void>;
  onDeleteImage?: (imageId: string) => Promise<void>;
}

export function ProgramDisplay({ 
  program, 
  userEmail: initialUserEmail = null, 
  onRequestUpsell,
  isUpsellOpen = false,
  onCloseUpsell,
  onUploadImages,
  onDeleteImage
}: ProgramDisplayProps) {
  const [activePlanIndex, setActivePlanIndex] = useState(0);
  const [userEmail, setUserEmail] = useState(initialUserEmail);
  const [isExpanded, setIsExpanded] = useState(true);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [deletingImage, setDeletingImage] = useState(false);
  
  const handleEmailSubmit = (email: string) => {
    setUserEmail(email);
    onCloseUpsell?.();
  };

  const handlePurchase = () => {
    onCloseUpsell?.();
  };

  const handleUploadImages = async (files: File[]) => {
    console.log('ProgramDisplay: handleUploadImages called with files:', files);
    if (!onUploadImages) {
      console.warn('ProgramDisplay: onUploadImages prop is not provided');
      return;
    }
    setUploadingImages(true);
    try {
      console.log('ProgramDisplay: Calling parent onUploadImages function');
      await onUploadImages(files);
      console.log('ProgramDisplay: Upload completed successfully');
    } catch (error) {
      console.error('ProgramDisplay: Error uploading images:', error);
      // Optionally add error handling UI here
      throw error; // Re-throw to let parent components handle the error
    } finally {
      setUploadingImages(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!onDeleteImage) return;
    setDeletingImage(true);
    try {
      await onDeleteImage(imageId);
    } catch (error) {
      console.error('Error deleting image:', error);
    } finally {
      setDeletingImage(false);
    }
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
      {/* <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"> */}

        {isExpanded && (
          <>
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
                program={program}
                plan={program.workoutPlans[activePlanIndex]} 
                userEmail={userEmail || undefined}
                onRequestUpsell={onRequestUpsell}
                onUploadImages={handleUploadImages}
                onDeleteImage={handleDeleteImage}
              />
            </div>
          </>
        )}
      {/* </div> */}

      <UpsellModal
        isOpen={isUpsellOpen}
        onClose={() => onCloseUpsell?.()}
        onEmailSubmit={handleEmailSubmit}
        onPurchase={handlePurchase}
        userEmail={userEmail}
      />
    </div>
  );
}