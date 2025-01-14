"use client";

import { useState, useEffect, useRef } from "react";
import { Message, ExtractedData } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { processUserMessage } from "../actions";
import { ProgramDisplay } from "@/app/components/ProgramDisplay";
import { GeneratingProgramTransition } from "./GeneratingProgramTransition";
import { SAMPLE_PROFILES } from "@/app/components/IntakeForm";
import { Program } from "@/types";
import { User } from "@prisma/client";
import { getRandomWelcomeMessage } from "../utils/welcomeMessages";
import { createNewProgram } from "@/app/start/actions";
import { processModificationRequest } from "../actions";
import exampleProgram from '../utils/example.json';
import { createAnonUser, getUser } from "@/app/start/actions";
import { v4 as uuidv4 } from "uuid";
import { saveDemoIntake } from "../actions";
import { useRouter } from "next/navigation";
import { uploadImages, deleteImage, type ImageUpload } from "@/app/start/actions";

interface ConversationalInterfaceProps {
  userId: string;
  user: User | null;
  initialProgram?: Program | null;
  onProgramChange?: (program: Program | null) => void;
}

export function ConversationalInterface({ userId, user, initialProgram }: ConversationalInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [_extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [program, setProgram] = useState<Program | null>(null);
  // const [initialProgram, setInitialProgram] = useState<Program | null>(null);
  const [isGeneratingProgram, setIsGeneratingProgram] = useState(false);
  const [isUpsellOpen, setIsUpsellOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const router = useRouter();
  
  // Add effect to notify parent of program changes
  // useEffect(() => {
  //   onProgramChange?.(program);
  // }, [program, onProgramChange]);

  useEffect(() => {
    if (initialProgram) {
      setProgram(initialProgram);
    }
  }, [initialProgram]);

  // Add escape key handler
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isUpsellOpen) {
        setIsUpsellOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isUpsellOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Initial welcome message with typing effect
    setIsTyping(true);
    setTimeout(() => {
      setMessages([
        {
          role: "assistant",
          content: getRandomWelcomeMessage(),
        },
      ]);
      setIsTyping(false);
    }, 1000);
  }, []);
  
  useEffect(() => {
    if (isGeneratingProgram) {
      setInputValue("");
      const textArea = document.querySelector('textarea');
      if (textArea) {
        // textArea.disabled = true;
      }
    }
  }, [isGeneratingProgram]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle program modification request
  // -- not ready for the big leagues just yet
  const handleProgramModification = async (userMessage: Message, program: Program) => {
    setIsGeneratingProgram(true);
    const result = await processModificationRequest(
      [...messages, userMessage],
      userId,
      program,
      inputValue
    );
    if (result?.success) {
      if (result.needsClarification) {
        // AI needs more information
        setIsGeneratingProgram(false);
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            role: "assistant", 
            content: result.message 
          }]);
          setIsTyping(false);
        }, Math.random() * 1000 + 500);
      } else {
        // AI has modified the program
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            role: "assistant", 
            content: `I've made the requested changes: ${result.message}` 
          }]);
          setProgram(result.program ? result.program.program as Program : null);
          setIsGeneratingProgram(false);
          setIsTyping(false);
        }, Math.random() * 1000 + 500);
      }
    } else {
      setIsGeneratingProgram(false);
      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: result?.message || "Sorry, I couldn't process that request. Please try again."
      }]);
    }
  };

  // Work on getting the right data from the user to generate a program
  const handleInitialIntake = async (userMessage: Message) => {
    // First check if this response completes our data gathering
    const result = await processUserMessage([...messages, userMessage], userId);
        
    if (result.success) {
      if (result.extractedData) {
        setExtractedData(result.extractedData);
      }
      
      // enough data gathered to generate a program
      if (result.readyForProgram) {
        setIsTyping(false);
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: "Great! I have enough information to create your personalized program now. Let me put that together for you..." 
        }]);
        setIsGeneratingProgram(true);

        try {
          // Step 1: Get program structure
          const structureResponse = await fetch('/api/program-creation/structure', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ intakeData: result.extractedData })
          });
          const { programStructure } = await structureResponse.json();

          setMessages(prev => [...prev, {
            role: "assistant",
            content: "I've designed the overall program structure. Now creating your workout plan..."
          }]);

          // Step 2: Get workout structure
          const workoutResponse = await fetch('/api/program-creation/workout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              intakeData: result.extractedData,
              programStructure 
            })
          });
          const { workoutStructure } = await workoutResponse.json();

          setMessages(prev => [...prev, {
            role: "assistant",
            content: "Workout structure is ready. Now creating your detailed program..."
          }]);

          // Step 3: Get workout details in parallel
          const phase = 0;
          const daysPerWeek = workoutStructure.daysPerWeek;

          // Get phase details
          const phaseResponse = await fetch('/api/program-creation/details/phase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              intakeData: result.extractedData,
              programStructure,
              workoutStructure,
              phase
            })
          });
          const { phaseDetails } = await phaseResponse.json();

          // Get nutrition details
          const nutritionResponse = await fetch('/api/program-creation/details/nutrition', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              intakeData: result.extractedData,
              programStructure,
              phase
            })
          });
          const { nutrition } = await nutritionResponse.json();

          // Get exercises for each day in parallel
          const exercisePromises = Array.from({ length: daysPerWeek }, async (_, i) => {
            // First get the workout focus
            const focusResponse = await fetch('/api/program-creation/details/exercises/focus', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                intakeData: result.extractedData,
                programStructure,
                workoutStructure,
                dayNumber: i + 1
              })
            });
            const { workoutFocus } = await focusResponse.json();

            // Then get the exercises for that focus
            const exercisesResponse = await fetch('/api/program-creation/details/exercises/list', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                intakeData: result.extractedData,
                programStructure,
                workoutStructure,
                workoutFocus
              })
            });
            const { exercises } = await exercisesResponse.json();

            return {
              ...workoutFocus,
              exercises: exercises.exercises
            };
          });

          const workouts = await Promise.all(exercisePromises);

          // Combine all the pieces
          const workoutDetails = {
            workouts,
            ...phaseDetails,
            nutrition
          };

          // Final step: Construct and save program
          console.log("🚀 ~ handleInitialIntake ~ programStructure:", programStructure)
          const program = {
            // id: programStructure.id, // TODO: does this actually get done?
            name: programStructure.name,
            description: programStructure.description,
            workoutPlans: [workoutDetails],
            user: {
              id: userId,
              email: user?.email || null,
              password: null,
              isPremium: false,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          };

          // Save program to database
          const saveResponse = await fetch('/api/program-creation/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(program)
          });

          if (!saveResponse.ok) {
            throw new Error('Failed to save program');
          }

          const { program: savedProgram } = await saveResponse.json();
          console.log("🚀 ~ handleInitialIntake ~ savedProgram:", savedProgram)
          setProgram(savedProgram);
          setIsGeneratingProgram(false);
          router.replace(`/hi?userId=${userId}&programId=${savedProgram.id}`);

        } catch (error) {
          console.error('Error generating program:', error);
          setIsGeneratingProgram(false);
          setMessages(prev => [...prev, {
            role: "assistant",
            content: "I encountered an error while creating your program. Please try again."
          }]);
        }
      } else {
        // Just continue the conversation
        setTimeout(() => {
          setMessages(prev => [...prev, { role: "assistant", content: result.message }]);
          setIsTyping(false);
        }, Math.random() * 1000 + 500);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = { role: "user", content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      if (program) {
        await handleProgramModification(userMessage, program);
      } else {
        await handleInitialIntake(userMessage);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "I'm sorry, I encountered an error. Please try again.",
        },
      ]);
      setIsTyping(false);
      setIsGeneratingProgram(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.metaKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
    
    if ((e.key === 'p' || e.key === 'P') && (e.shiftKey)) {
      e.preventDefault();
      const profiles = Object.values(SAMPLE_PROFILES);
      const profile = profiles[currentProfileIndex];
      
      const message = `Hi! ${profile.additionalInfo} I'm ${profile.age} years old, ${profile.sex}, ${profile.weight} lbs, ${profile.height} inches tall. My main goal is ${profile.trainingGoal.replace('_', ' ')}. I can train ${profile.daysAvailable} days per week and have about ${profile.dailyBudget} minutes per session. I prefer ${profile.trainingPreferences.join(', ')} for workouts.`;
      
      setInputValue(message);
      setCurrentProfileIndex((prev) => (prev + 1) % profiles.length);
    }

    if ((e.key === 'd' || e.key === 'D') && e.shiftKey) {
      e.preventDefault();
      loadDemoProgram();
    }
  };

  // todo: can likely remove
  // const handleOpenUpsellModal = () => {
  //   setIsUpsellOpen(true);
  // };

  // const handleCloseUpsellModal = () => {
  //   setIsUpsellOpen(false);
  // };

  const handleSaveProgram = async () => {
    if (!program) return;
    
    setIsSaving(true);
    try {
      // @ts-ignore
      const savedProgram = await createNewProgram(program, userId);
      if (savedProgram) {
        // @ts-ignore
        setProgram(savedProgram);
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "Your program has been saved! You can now access it anytime from your dashboard."
        }]);
      }
    } catch (error) {
      console.error("Failed to save program:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I'm sorry, I encountered an error while saving your program. Please try again."
      }]);
    } finally {
      setIsSaving(false);
    }
  };

  const demoUser = async () => {
    if (!userId) {
      const newUserId = uuidv4();
      const result = await createAnonUser(newUserId);
      if (result.success && result.user) {
        return result.user;
      }
      throw new Error('Failed to create anonymous user');
    }

    const result = await getUser(userId);
    if (!result.success || !result.user) {
      const createResult = await createAnonUser(userId);
      if (!createResult.success || !createResult.user) {
        throw new Error('Failed to create/get user');
      }
      return createResult.user;
    }

    return result.user;
  };

  const loadDemoProgram = async () => {
    try {
      const user = await demoUser();
      
      // Save demo intake using server action
      const demoIntake = await saveDemoIntake(user.id);
      console.log("🚀 ~ loadDemoProgram ~ demoIntake:", demoIntake)

      // Add intake conversation to message history
      setMessages([
        {
          role: "assistant",
          content: getRandomWelcomeMessage()
        },
        {
          role: "user",
          content: `Hi! I'm 30, male, 180lbs, 6'0" tall. Looking to build muscle. Can train 5 days/week, 90 mins/session. Athletic background, looking to build muscle while maintaining conditioning.`
        },
        {
          role: "assistant",
          content: "Great! I have all the information I need. Let me create your program..."
        }
      ]);
      
      setIsGeneratingProgram(true);
      
      // Simulate a brief loading state
      setTimeout(() => {
        const transformedProgram = {
          id: `draft-${Date.now()}`,
          name: exampleProgram.programName,
          description: exampleProgram.programDescription,
          createdBy: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            id: userId,
            email: user?.email || "",
            createdAt: new Date(),
            updatedAt: new Date(),
            password: null,
            isPremium: false,
          },
          workoutPlans: exampleProgram.phases.map(phase => ({
            id: `phase-${phase.phase}`,
            userId,
            programId: `draft-${Date.now()}`,
            phase: phase.phase,
            bodyFatPercentage: phase.bodyComposition.bodyFatPercentage,
            muscleMassDistribution: phase.bodyComposition.muscleMassDistribution,
            dailyCalories: phase.nutrition.dailyCalories,
            proteinGrams: phase.nutrition.macros.protein,
            carbGrams: phase.nutrition.macros.carbs,
            fatGrams: phase.nutrition.macros.fats,
            mealTiming: phase.nutrition.mealTiming,
            progressionProtocol: phase.progressionProtocol,
            daysPerWeek: phase.trainingPlan.daysPerWeek,
            durationWeeks: phase.durationWeeks,
            createdAt: new Date(),
            updatedAt: new Date(),
            workouts: phase.trainingPlan.workouts.map(workout => ({
              id: `workout-${workout.day}`,
              workoutPlanId: `phase-${phase.phase}`,
              dayNumber: workout.day,
              createdAt: new Date(),
              updatedAt: new Date(),
              exercises: workout.exercises.map(exercise => ({
                id: `exercise-${exercise.name}-${workout.day}`,
                workoutId: `workout-${workout.day}`,
                name: exercise.name,
                sets: exercise.sets,
                reps: exercise.reps,
                restPeriod: exercise.restPeriod,
                createdAt: new Date(),
                updatedAt: new Date(),
              }))
            }))
          }))
        };

        // @ts-ignore
        setProgram(transformedProgram);
        setIsGeneratingProgram(false);
        
        // Add a message to show it's demo mode
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "Demo program loaded! You can now test program modifications."
        }]);
      }, 1000);
    } catch (error) {
      console.error("Failed to load demo program:", error);
      setIsGeneratingProgram(false);
    }
  };

  // Add image handling functions
  const handleUploadImages = async (files: File[]) => {
    console.log('ConversationalInterface: Starting image upload');
    try {
      // Convert files to base64
      const imagePromises = files.map(file => {
        return new Promise<ImageUpload>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              fileName: file.name,
              base64Data: reader.result as string,
              userId: userId,
              programId: program?.id,
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      const imageUploads = await Promise.all(imagePromises);
      console.log('ConversationalInterface: Images converted to base64', imageUploads);

      const result = await uploadImages(imageUploads);
      
      if (!result.success) {
        throw new Error('Failed to upload images');
      }
      
      console.log('ConversationalInterface: Images uploaded successfully', result);
      // Update program state or trigger a refresh if needed
      // setProgram(...)
    } catch (error) {
      console.error('ConversationalInterface: Error uploading images:', error);
      throw error;
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    console.log('ConversationalInterface: Starting image deletion', imageId);
    try {
      const result = await deleteImage(imageId);
      if (!result.success) {
        throw new Error('Failed to delete image');
      }
      console.log('ConversationalInterface: Image deleted successfully');
    } catch (error) {
      console.error('ConversationalInterface: Error deleting image:', error);
      throw error;
    }
  };

  // Update the form section based on whether we have a program
  const renderFormSection = () => {
    if (program) {
      return (
        <form onSubmit={handleSubmit} className="hidden p-8 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-xl">
          <div className="flex flex-col space-y-6">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Have any feedback about your program? Let me know if you'd like any adjustments..."
              rows={3}
              className="w-full p-4 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all duration-300"
            />
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={handleSaveProgram}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-lg rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:-translate-y-0.5"
              >
                {isSaving ? "Saving..." : "Save My Custom Program"}
              </button>
              <button
                type="submit"
                className="flex-1 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:-translate-y-0.5"
              >
                Request Changes
              </button>
            </div>
          </div>
        </form>
      );
    }

    // Original form for initial conversation
    return (
      <form onSubmit={handleSubmit} className="p-8 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-xl">
        <div className="flex flex-col space-y-6">
          <div className="relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Share your fitness journey and goals..."
              rows={4}
              autoFocus={true}
              className="w-full p-4 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all duration-300"
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-400 space-x-4">
              <span>⌘ + Return</span>
              <span className="opacity-50">⌥P for sample</span>
              {!program && <span className="opacity-50">⇧D for demo program</span>}
            </div>
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:-translate-y-0.5"
          >
            Share Your Story
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className={`flex flex-col min-h-[80vh] bg-gradient-to-b from-white via-indigo-50/30 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-xl shadow-xl ${program ? 'max-w-full' : 'max-w-3xl mx-auto'}`}>
      {program ? (
        <ProgramDisplay 
          program={program} 
          userEmail={user?.email}
          onRequestUpsell={() => setIsUpsellOpen(!isUpsellOpen)}
          isUpsellOpen={isUpsellOpen}
          onCloseUpsell={() => setIsUpsellOpen(false)}
          onUploadImages={handleUploadImages}
          onDeleteImage={handleDeleteImage}
        />
      ) : isGeneratingProgram ? (
        <GeneratingProgramTransition />
      ) : (
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[85%] p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 ${
                    message.role === "assistant"
                      ? "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-lg leading-relaxed">{message.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-2 text-indigo-600"
            >
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {renderFormSection()}
    </div>
  );
} 