"use client";

import { useState, useEffect, useRef } from "react";
import { Message } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { processUserMessage, processModificationRequest, saveDemoIntake } from "../actions";
import { ProgramDisplay } from "@/app/components/ProgramDisplay";
import { GeneratingProgramTransition } from "./GeneratingProgramTransition";
import { DataReviewTransition } from "./DataReviewTransition";
import { Program, IntakeFormData } from "@/types";
import { SAMPLE_PROFILES } from "@/utils/sampleUserPersonas";
import { User } from "@prisma/client";
import { getRandomWelcomeMessage } from "../utils/welcomeMessages";
import { useRouter } from "next/navigation";
import { uploadImages, deleteImage, type ImageUpload } from "@/app/start/actions";
import { createAnonUser, getUser } from "@/app/start/actions";
import { v4 as uuidv4 } from "uuid";
import exampleProgram from '../utils/example.json';

// Add type for example program phase
interface ExamplePhase {
  phase: number;
  bodyComposition: {
    bodyFatPercentage: number;
    muscleMassDistribution: string;
  };
  nutrition: {
    dailyCalories: number;
    macros: {
      protein: number;
      carbs: number;
      fats: number;
    };
    mealTiming: string[];
  };
  trainingPlan: {
    daysPerWeek: number;
    workouts: {
      dayNumber: number;
      exercises: {
        name: string;
        sets: number;
        reps: number;
        restPeriod: number;
      }[];
    }[];
  };
  durationWeeks: number;
  progressionProtocol: string;
};

interface ConversationalInterfaceProps {
  userId: string;
  user: User | null;
  initialProgram?: Program | null;
  onProgramChange?: (program: Program | null) => void;
}

export function ConversationalInterface({ userId, user, initialProgram, onProgramChange }: ConversationalInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [extractedData, setExtractedData] = useState<IntakeFormData | null>(null);
  const [program, setProgram] = useState<Program | null>(null);
  const [isGeneratingProgram, setIsGeneratingProgram] = useState(false);
  const [isUpsellOpen, setIsUpsellOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(Math.floor(Math.random() * Object.keys(SAMPLE_PROFILES).length));
  const [isSaving, setIsSaving] = useState(false);
  const [showDataReview, setShowDataReview] = useState(false);
  const [localUserId, setLocalUserId] = useState(userId);
  const [localUser, setLocalUser] = useState(user);

  const router = useRouter();
  
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
    const messagesContainer = document.querySelector('.messages-container');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
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
      localUserId,
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
  const handleInitialIntake = async (userMessage: Message, userId: string) => {
    const result = await processUserMessage([...messages, userMessage], userId);
        
    if (result.success) {
      if (result.extractedData) {
        setExtractedData(result.extractedData);
      }
      
      if (result.readyForProgram && result.extractedData) {
        setIsTyping(false);
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: "Great! I have enough information. Let's review everything before creating your program." 
        }]);
        setShowDataReview(true);
        return;
      } else {
        setTimeout(() => {
          setMessages(prev => [...prev, { role: "assistant", content: result.message }]);
          setIsTyping(false);
        }, Math.random() * 1000 + 500);
      }
    }
  };

  const handleDataReviewConfirm = async () => {
    if (!extractedData) {
      console.error('No extracted data available');
      return;
    }

    setShowDataReview(false);
    setIsGeneratingProgram(true);
    setMessages(prev => [...prev, { 
      role: "assistant", 
      content: "Great! I'll create your personalized program now. Let me put that together for you..." 
    }]);

    // save the user's intake data
    try {
      const intakeResponse = await fetch(`/api/user/${localUserId}/intake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(extractedData)
      });

      if (!intakeResponse.ok) {
        throw new Error('Failed to save intake data');
      }

      await intakeResponse.json();
    } catch (error) {
      console.error('Error saving intake data:', error);
      // Continue with program creation even if intake save fails
    }

    try {
      // Step 1: Get program structure
      const structureResponse = await fetch('/api/program-creation/structure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intakeData: extractedData, userId: localUserId })
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
          intakeData: extractedData,
          programStructure,
          userId: localUserId
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
          intakeData: extractedData,
          programStructure,
          workoutStructure,
          phase,
          userId: localUserId
        })
      });
      const { phaseDetails } = await phaseResponse.json();

      // Get nutrition details
      const nutritionResponse = await fetch('/api/program-creation/details/nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intakeData: extractedData,
          programStructure,
          phase,
          userId: localUserId
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
            intakeData: extractedData,
            programStructure,
            workoutStructure,
            dayNumber: i + 1,
            userId: localUserId
          })
        });
        const { workoutFocus } = await focusResponse.json();

        // Then get the exercises for that focus
        const exercisesResponse = await fetch('/api/program-creation/details/exercises/list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            intakeData: extractedData,
            programStructure,
            workoutStructure,
            workoutFocus,
            userId: localUserId
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
      const program = {
        // id: programStructure.id, // TODO: does this actually get done?
        name: programStructure.name,
        description: programStructure.description,
        workoutPlans: [workoutDetails],
        user: {
          id: localUserId,
          email: localUser?.email || null,
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

      const { program: savedProgram, programId } = await saveResponse.json();
      setProgram(savedProgram);
      setIsGeneratingProgram(false);
      router.replace(`/hi?userId=${localUserId}&programId=${programId}`);

    } catch (error) {
      console.error('Error generating program:', error);
      setIsGeneratingProgram(false);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I encountered an error while creating your program. Please try again."
      }]);
    }
  };

  const handleRequestMoreDetails = (topics: string[]) => {
    setShowDataReview(false);
    
    const topicQuestions = {
      injuries: "Could you tell me about any past injuries or ongoing physical limitations that might affect your training?",
      fitness: "What types of workouts or sports have you done in the past, and what were your experiences with them?",
      preferences: "Are there specific exercises or types of movements you particularly enjoy or want to avoid?",
      nutrition: "Do you have any dietary restrictions or specific nutrition goals we should consider?",
      recovery: "How would you describe your typical sleep patterns and stress levels?",
      other: "Anything else that needs correction or clarification?"
    };
    
    const selectedQuestions = topics.map(topic => topicQuestions[topic as keyof typeof topicQuestions]).join("\n\n");
    
    setMessages(prev => [...prev, {
      role: "assistant",
      content: `I'd love to learn more to make your program even better. ${selectedQuestions}`
    }]);
    setIsTyping(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = { role: "user", content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      // Initialize user if this is their first message and they don't have a user ID
      const newUserId = uuidv4();
      if (!localUserId) {
        const result = await createAnonUser(newUserId);
        if (result.success && result.user) {
          setLocalUserId(result.user.id);
          setLocalUser(result.user);
          router.replace(`/hi?userId=${result.user.id}`);
        } else {
          throw new Error("Failed to create new user");
        }
      }

      if (program) {
        await handleProgramModification(userMessage, program);
      } else {
        // Pass the local user ID that we just created or already had
        await handleInitialIntake(userMessage, newUserId);
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

    // Check for test=true in URL params
    let isTest = false;
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      isTest = urlParams.get('test') === 'true';
    }

    if (isTest) {      
      if ((e.key === 'p' || e.key === 'P') && (e.shiftKey)) {
        e.preventDefault();
        const profiles = Object.values(SAMPLE_PROFILES);
        const profile = profiles[currentProfileIndex];
        
        const message = `Hi! ${profile.additionalInfo} I'm ${profile.age} years old, ${profile.sex}, ${profile.weight} lbs, ${profile.height} inches tall. My main goal is ${profile.trainingGoal.replace('_', ' ')}. I can train ${profile.daysAvailable} days per week and have about ${profile.dailyBudget} minutes per session. I prefer ${profile.trainingPreferences.join(', ')} for workouts.`;
        
        setInputValue(message);
        setCurrentProfileIndex(() => Math.floor(Math.random() * profiles.length));
        // incremental version
        // setCurrentProfileIndex((prev) => (prev + 1) % profiles.length);
      }

      if ((e.key === 'd' || e.key === 'D') && e.shiftKey) {
        e.preventDefault();
        loadDemoProgram();
      }
    }
  };

  const handleSaveProgram = async () => {
    if (!program) return;
    
    setIsSaving(true);
    try {
      // @ts-ignore
      const savedProgram = await createNewProgram(program, localUserId);
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
    if (!localUserId) {
      const newUserId = uuidv4();
      const result = await createAnonUser(newUserId);
      if (result.success && result.user) {
        return result.user;
      }
      throw new Error('Failed to create anonymous user');
    }

    const result = await getUser(localUserId);
    if (!result.success || !result.user) {
      const createResult = await createAnonUser(localUserId);
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
          createdBy: localUserId,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            id: localUserId,
            email: user?.email || "",
            createdAt: new Date(),
            updatedAt: new Date(),
            password: null,
            isPremium: false,
          },
          workoutPlans: exampleProgram.phases.map(phase => ({
            id: `phase-${phase.phase}`,
            userId: localUserId,
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
              userId: localUserId,
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
      <form 
        onSubmit={handleSubmit}
        className={`p-8 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-xl ${showDataReview || isGeneratingProgram ? 'hidden' : ''}`}
      >
        <div className="flex flex-col space-y-6">
          <div className="relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={!extractedData && !messages ? "Share your fitness journey and goals..." : "Keep the info coming!"}
              rows={4}
              autoFocus={true}
              className="w-full p-4 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all duration-300"
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-400 space-x-4 hidden">
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
            {!extractedData || !messages ? "Share Your Story" : "Tell me more"}
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
            userEmail={localUser?.email}
            onRequestUpsell={() => setIsUpsellOpen(!isUpsellOpen)}
            isUpsellOpen={isUpsellOpen}
            onCloseUpsell={() => setIsUpsellOpen(false)}
            onUploadImages={handleUploadImages}
            onDeleteImage={handleDeleteImage}
          />
        ) : showDataReview && extractedData ? (
          <DataReviewTransition
            intakeData={extractedData}
            onConfirm={handleDataReviewConfirm}
            onRequestMore={handleRequestMoreDetails}
          />
        ) : isGeneratingProgram ? (
          <GeneratingProgramTransition />
        ) : (
          <div className="flex-1 overflow-y-auto p-8 space-y-8 messages-container relative">
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
                    className={`max-w-[85%] p-6 rounded-2xl shadow-lg transition-all duration-300 hover:-translate-y-0.5 ${
                      message.role === "assistant"
                        ? "bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-750 shadow-lg border-2 border-gray-200 dark:border-gray-700"
                        : "bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-xl shadow-indigo-500/25"
                    }`}
                  >
                    <p className={`whitespace-pre-wrap text-lg leading-relaxed ${message.role === "assistant" ? "text-gray-800 dark:text-gray-100" : "text-white"}`}>{message.content}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400"
              >
                <div className="w-2.5 h-2.5 bg-current rounded-full animate-bounce" />
                <div className="w-2.5 h-2.5 bg-current rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                <div className="w-2.5 h-2.5 bg-current rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {renderFormSection()}
      </div>

  );
} 