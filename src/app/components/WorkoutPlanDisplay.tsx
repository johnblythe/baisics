import { useState } from 'react';
import { WorkoutPlan } from '@/types/program';
import { UpsellModal } from './UpsellModal';
import { Target, Brain, Activity, Key, Dumbbell, Apple, ChartLine } from 'lucide-react';
import { formatRestPeriod } from '@/utils/formatters';
import { ImageDropzone } from './ImageDropzone';
import Image from 'next/image';
import { UserImages } from '@prisma/client';
import { Program } from '@/types/program';

type UploadedImage = {
  id: string;
  sessionId: string;
  fileName: string;
  base64Data: string;
  createdAt: Date;
  aiDescription?: string;
};

// todo
interface ExtendedWorkoutPlan extends WorkoutPlan {
  phaseExplanation?: string;
  phaseExpectations?: string;
  phaseKeyPoints?: string[];
  bodyFatPercentage?: number;
  muscleMassDistribution?: string;
  name?: string;
  description?: string;
}

interface WorkoutPlanDisplayProps {
  program: Program;
  plan: ExtendedWorkoutPlan;
  userEmail?: string | null;
  onRequestUpsell?: () => void;
  onUploadImages?: (files: File[]) => void;
  onDeleteImage?: (imageId: string) => void;
}

export function WorkoutPlanDisplay({ program, userEmail: initialUserEmail, plan, onRequestUpsell, onUploadImages, onDeleteImage }: WorkoutPlanDisplayProps) {
  const [isUpsellOpen, setIsUpsellOpen] = useState(false);
  const [userEmail, setUserEmail] = useState(initialUserEmail);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(null);
  const [deletingImageIds, setDeletingImageIds] = useState<Set<string>>(new Set());

  const handleUpsell = () => {
    if (onRequestUpsell) {
      onRequestUpsell();
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!onDeleteImage) return;
    setDeletingImageIds(prev => new Set([...prev, imageId]));
    try {
      await onDeleteImage(imageId);
    } finally {
      setDeletingImageIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(imageId);
        return newSet;
      });
    }
  };

  const handleFilesChange = (files: File[]) => {
    setUploadFiles(files);
  };

  const handleUploadImages = async (files: File[]) => {
    if (!onUploadImages) return;
    try {
      await onUploadImages(files);
      setUploadFiles([]);
    } catch (error) {
      console.error('Error uploading images:', error);
    }
  };

  const nutrition = plan.nutrition;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 rounded-xl shadow-xl overflow-hidden">
        {/* Background Texture */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_75%,rgba(255,255,255,0.1))]" style={{ backgroundSize: '60px 60px' }}></div>
        </div>
        
        {/* Content */}
        <div className="relative px-8 py-12">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-white">
                {program.name || "Flibb flubb"}
              </h1>
              <p className="text-lg text-indigo-100">
                {program.description || "awelfkj fjekwfjw ef alwkefj alwef awelkfjaw elfkj awelfkj awelfk jawef"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {}} // Add download functionality
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-sm transition-all duration-300 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PDF
              </button>
              {!userEmail && (
                <button
                  onClick={handleUpsell}
                  className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                >
                  ✨ Upgrade
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overview Section */}
      <div className="relative bg-gradient-to-b from-white via-indigo-50/30 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
        {/* Background Texture */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.03),transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(99,102,241,0.01)_25%,transparent_25%,transparent_75%,rgba(99,102,241,0.01)_75%,rgba(99,102,241,0.01))]" style={{ backgroundSize: '60px 60px' }}></div>
        </div>

        {/* Phase Navigation */}
        <div className="relative border-b border-gray-100 dark:border-gray-700">
          <div className="px-8 py-4">
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                Phase 1
              </button>
              {/* Add more phase buttons as needed */}
            </div>
          </div>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
          {/* Phase Overview Section */}
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
            <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-4 mb-6">
              <h3 className="text-indigo-600 dark:text-indigo-400 font-medium">Phase Overview</h3>
            </div>
            <div className="space-y-6">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900 rounded-lg mt-1">
                  <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h4 className="text-gray-900 dark:text-gray-100 mb-2 font-semibold">Why This Phase</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {plan?.phaseExplanation || "This phase focuses on building foundational strength and muscle mass through progressive overload and compound movements."}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-lg mt-1">
                  <Activity className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="text-gray-900 dark:text-gray-100 mb-2 font-semibold">What to Expect</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {plan?.phaseExpectations || "You'll start with moderate weights to perfect form, gradually increasing intensity. Expect to feel challenged but not overwhelmed."}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900 dark:to-yellow-900 rounded-lg mt-1">
                  <Key className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h4 className="text-gray-900 dark:text-gray-100 mb-2 font-semibold">Keys to Success</h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    {(plan?.phaseKeyPoints || [
                      "Focus on form over weight",
                      "Track your progress each session",
                      "Ensure adequate rest between workouts"
                    ]).map((point, index) => (
                      <li key={`key-point-${index}`} className="flex items-center">
                        <Dumbbell className="w-4 h-4 mr-2 text-amber-600 dark:text-amber-400" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Nutrition Section */}
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
            <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-4 mb-6">
              <h3 className="text-red-600 dark:text-red-400 font-medium">Nutrition</h3>
            </div>
            <div className="space-y-3">
              {[
                { id: 'calories', label: 'Daily Calories', value: `${nutrition?.dailyCalories} kcals` },
                { id: 'protein', label: 'Protein', value: `${nutrition?.macros?.protein}g` },
                { id: 'carbs', label: 'Carbs', value: `${nutrition?.macros?.carbs}g` },
                { id: 'fats', label: 'Fats', value: `${nutrition?.macros?.fats}g` }
              ].map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5">
                  <span className="text-gray-600 dark:text-gray-300">{item.label}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{item.value}</span>
                </div>
              ))}

              {!userEmail && (
                <p className="mt-8 text-sm text-gray-600 dark:text-gray-400">
                  ✨ <button onClick={handleUpsell} className="text-indigo-600 dark:text-indigo-400 hover:underline">Upgrade to premium</button> for detailed meal plans. COMING SOON: recipes and grocery lists!
                </p>
              )}
            </div>
          </div>

          {/* Body Composition Section */}
          <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
            <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-4 mb-6">
              <h3 className="text-indigo-600 dark:text-indigo-400 font-medium">Body Composition</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-700 rounded-lg transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                <span className="text-gray-600 dark:text-gray-300">Body Fat:</span>
                <span className="font-medium text-gray-900 dark:text-white">{plan?.bodyFatPercentage}%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-700 rounded-lg transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                <span className="text-gray-600 dark:text-gray-300">Muscle Distribution:</span>
                <span className="font-medium text-gray-900 dark:text-white">{plan?.muscleMassDistribution}</span>
              </div>

              {/* Image Gallery */}
              <div className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {program.userImages?.filter(image => !image.deletedAt).map((image) => (
                    <div 
                      key={image.id} 
                      className="relative group bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="relative overflow-hidden rounded-xl cursor-pointer">
                        <Image
                          src={image.base64Data}
                          alt={image.fileName}
                          width={400}
                          height={192}
                          className={`w-full h-48 object-cover object-top transition-all duration-300 ${
                            deletingImageIds.has(image.id) ? 'opacity-50' : ''
                          }`}
                          // @ts-ignore
                          onClick={() => setSelectedImage(image)}
                        />
                        {onDeleteImage && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteImage(image.id);
                            }}
                            className="absolute top-2 right-2 p-2 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                            disabled={deletingImageIds.has(image.id)}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Dropzone */}
                  {onUploadImages && (
                    <ImageDropzone
                      files={uploadFiles}
                      onFilesChange={setUploadFiles}
                      onUploadImages={handleUploadImages}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Progress Stats Section */}
          <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
            <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-lg p-4 mb-6">
              <h3 className="text-emerald-600 dark:text-emerald-400 font-medium">Progress Stats</h3>
            </div>
            
            {!userEmail ? (
              <div>
                <div className="filter blur-sm pointer-events-none">
                  <div className="h-32 bg-gradient-to-r from-blue-100 to-indigo-50 dark:from-blue-900 dark:to-indigo-800 rounded-lg mb-4" />
                  <div className="h-32 bg-gradient-to-r from-green-100 to-emerald-50 dark:from-green-900 dark:to-emerald-800 rounded-lg" />
                </div>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                  <div className="bg-white/95 dark:bg-gray-800/95 p-6 rounded-xl shadow-xl w-full max-w-sm border border-gray-100 dark:border-gray-700">
                    <p className="font-semibold text-gray-900 dark:text-white mb-4">
                      Transform Your Journey
                    </p>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-3 mb-6">
                      <li className="flex items-center">
                        <span className="mr-2 text-indigo-600">✓</span> Weekly progress photos
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2 text-indigo-600">✓</span> Body measurements tracking
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2 text-indigo-600">✓</span> Strength progression analytics
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2 text-indigo-600">✓</span> Smart goal adjustments
                      </li>
                    </ul>
                    <button
                      onClick={handleUpsell}
                      className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                    >
                      Unlock Progress Tracking
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="h-32 bg-gradient-to-r from-blue-100 to-indigo-50 dark:from-blue-900 dark:to-indigo-800 rounded-lg shadow-lg" />
                <div className="h-32 bg-gradient-to-r from-green-100 to-emerald-50 dark:from-green-900 dark:to-emerald-800 rounded-lg shadow-lg" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Training Schedule */}
      <div className="relative space-y-6">
        {/* Background Texture */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.03),transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(99,102,241,0.01)_25%,transparent_25%,transparent_75%,rgba(99,102,241,0.01)_75%,rgba(99,102,241,0.01))]" style={{ backgroundSize: '60px 60px' }}></div>
        </div>

        {/* Schedule Content */}
        <div className="relative">
          {plan.workouts
            .sort((a, b) => (a.dayNumber || 0) - (b.dayNumber || 0))
            .map((workout) => (
              <div
                key={workout.id || `workout-${workout.dayNumber}`}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
              >
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 p-6 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">{workout.name ? `${workout.name}` : ``}</h3>
                  {workout.focus && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{workout.focus}</p>
                  )}
                </div>
                <div className="p-6 space-y-6">
                  {/* Warmup Section */}
                  {workout.warmup && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 shadow-sm">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-5 w-5" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <path d="M12 2v4" />
                          <path d="M12 18v4" />
                          <path d="m4.93 4.93 2.83 2.83" />
                          <path d="m16.24 16.24 2.83 2.83" />
                          <path d="M2 12h4" />
                          <path d="M18 12h4" />
                          <path d="m4.93 19.07 2.83-2.83" />
                          <path d="m16.24 7.76 2.83-2.83" />
                        </svg>
                        Warmup {workout.warmup.duration ? `(${workout.warmup.duration} mins)` : ''}
                      </h4>
                      <ul className="list-disc list-inside text-sm text-blue-800 dark:text-blue-200 space-y-1">
                        {workout.warmup.activities?.map((activity, idx) => (
                          <li key={`warmup-${workout.id}-${activity}-${idx}`}>{activity}</li>
                        )) || <li key={`warmup-${workout.id}-default`}>General warmup</li>}
                      </ul>
                    </div>
                  )}

                  {/* Main Workout */}
                  <div>
                    {/* Header */}
                    <div className="grid font-bold grid-cols-12 gap-4 text-sm text-left mb-2 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 p-4 rounded-lg">
                      <div className="col-span-6">Exercise</div>
                      <div className="col-span-1">Sets</div>
                      <div className="col-span-2">Reps</div>
                      <div className="col-span-3">Rest</div>
                    </div>
                    {/* Exercise Rows */}
                    <div className="space-y-2">
                      {workout.exercises.map((exercise, exerciseIndex) => (
                        <div
                          key={`exercise-${workout.id}-${exercise.name}-${exerciseIndex}`}
                          className="grid grid-cols-12 gap-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 rounded-lg px-4"
                        >
                          <div className="col-span-6 font-medium">{exercise.name}</div>
                          <div className="col-span-1">{exercise.sets}</div>
                          <div className="col-span-2">{exercise.reps}</div>
                          <div className="col-span-3">{formatRestPeriod(typeof exercise.restPeriod === 'string' ? parseInt(exercise.restPeriod) : exercise.restPeriod)}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cooldown Section */}
                  {workout.cooldown && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 shadow-sm">
                      <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-5 w-5" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
                        </svg>
                        Cooldown {workout.cooldown.duration ? `(${workout.cooldown.duration} mins)` : ''}
                      </h4>
                      <ul className="list-disc list-inside text-sm text-green-800 dark:text-green-200 space-y-1">
                        {workout.cooldown.activities?.map((activity, idx) => (
                          <li key={`cooldown-${workout.id}-${activity}-${idx}`}>{activity}</li>
                        )) || <li key={`cooldown-${workout.id}-default`}>General cooldown</li>}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>

      <UpsellModal
        isOpen={isUpsellOpen}
        onClose={() => setIsUpsellOpen(false)}
        onEmailSubmit={(email: string) => {
          setUserEmail(email);
          setIsUpsellOpen(false);
        }}
        onPurchase={() => setIsUpsellOpen(false)}
        userEmail={userEmail}
      />
    </div>
  );
}
