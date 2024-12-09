"use client";

import { useState, useEffect, useRef } from "react";
import { Message, ExtractedData } from "../types";
import { motion, AnimatePresence } from "framer-motion";
import { processUserMessage } from "../actions";
import { ProgramDisplay } from "@/app/components/ProgramDisplay";
import { GeneratingProgramTransition } from "./GeneratingProgramTransition";
import { SAMPLE_PROFILES } from "@/app/components/IntakeForm";
import { ProgramFullDisplay } from "@/app/start/types";
import { User } from "@prisma/client";
import { getRandomWelcomeMessage } from "../utils/welcomeMessages";
import { createNewProgram } from "@/app/start/actions";
import { processModificationRequest } from "../actions";
import exampleProgram from '../utils/example.json';

interface ConversationalInterfaceProps {
  userId: string;
  user: User | null;
}

export function ConversationalInterface({ userId, user }: ConversationalInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [program, setProgram] = useState<ProgramFullDisplay | null>(null);
  const [isGeneratingProgram, setIsGeneratingProgram] = useState(false);
  const [isUpsellOpen, setIsUpsellOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = { role: "user", content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      if (program) {
        // Handle program modification request
        setIsGeneratingProgram(true);
        const result = await processModificationRequest(
          [...messages, userMessage],
          userId,
          program,
          inputValue
        );
        
        if (result.success) {
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
              setProgram(result.program);
              setIsGeneratingProgram(false);
              setIsTyping(false);
            }, Math.random() * 1000 + 500);
          }
        } else {
          setIsGeneratingProgram(false);
          setIsTyping(false);
          setMessages(prev => [...prev, {
            role: "assistant",
            content: result.message || "Sorry, I couldn't process that request. Please try again."
          }]);
        }
      } else {
        // First check if this response completes our data gathering
        const result = await processUserMessage([...messages, userMessage], userId);
        
        if (result.success) {
          if (result.extractedData) {
            setExtractedData(result.extractedData);
          }
          
          // If we have enough data to generate a program
          if (result.readyForProgram) {
            // Show typing dots briefly, then transition to program generation
            setTimeout(() => {
              setIsTyping(false);
              setMessages(prev => [...prev, { 
                role: "assistant", 
                content: "Great! I have enough information to create your personalized program now. Let me put that together for you..." 
              }]);
              setIsGeneratingProgram(true);
            }, 1000);

            // Generate the program
            const programResult = await processUserMessage([...messages, userMessage], userId, result.extractedData, true);
            if (programResult.success && programResult.program) {
              // Transform the AI response to match DB structure
              const transformedProgram = {
                id: `draft-${Date.now()}`, // Temporary ID for draft program
                name: programResult.program.programName,
                description: programResult.program.programDescription,
                createdBy: userId,
                // createdAt: new Date(),
                // updatedAt: new Date(),
                user: {
                  id: userId,
                  email: user?.email || "",
                  // createdAt: new Date(),
                  // updatedAt: new Date(),
                },
                workoutPlans: programResult.program.phases.map(phase => ({
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
                  // createdAt: new Date(),
                  // updatedAt: new Date(),
                  workouts: phase.trainingPlan.workouts.map(workout => ({
                    id: `workout-${workout.day}`,
                    workoutPlanId: `phase-${phase.phase}`,
                    dayNumber: workout.day,
                    // createdAt: new Date(),
                    // updatedAt: new Date(),
                    exercises: workout.exercises.map(exercise => ({
                      id: `exercise-${exercise.name}-${workout.day}`,
                      workoutId: `workout-${workout.day}`,
                      name: exercise.name,
                      sets: exercise.sets,
                      reps: exercise.reps,
                      restPeriod: exercise.restPeriod,
                      // createdAt: new Date(),
                      // updatedAt: new Date(),
                    }))
                  }))
                }))
              };

              setProgram(transformedProgram as ProgramFullDisplay);
              setIsGeneratingProgram(false);
            }
          } else {
            // Just continue the conversation
            setTimeout(() => {
              setMessages(prev => [...prev, { role: "assistant", content: result.message }]);
              setIsTyping(false);
            }, Math.random() * 1000 + 500);
          }
        }
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
    // Cmd + Enter to send
    if (e.key === 'Enter' && e.metaKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
    
    // Option/Alt + P to cycle through profiles
    if ((e.key === 'p' || e.key === 'P') && (e.shiftKey)) {
      e.preventDefault();
      const profiles = Object.values(SAMPLE_PROFILES);
      const profile = profiles[currentProfileIndex];
      
      const message = `Hi! ${profile.additionalInfo} I'm ${profile.age} years old, ${profile.sex}, ${profile.weight} lbs, ${profile.height} inches tall. My main goal is ${profile.trainingGoal.replace('_', ' ')}. I can train ${profile.daysAvailable} days per week and have about ${profile.dailyBudget} minutes per session. I prefer ${profile.trainingPreferences.join(', ')} for workouts.`;
      
      setInputValue(message);
      setCurrentProfileIndex((prev) => (prev + 1) % profiles.length);
    }

    // New shortcut: Shift + D to load demo program
    if ((e.key === 'd' || e.key === 'D') && e.shiftKey) {
      e.preventDefault();
      loadDemoProgram();
    }
  };

  const handleOpenUpsellModal = () => {
    setIsUpsellOpen(true);
  };

  const handleCloseUpsellModal = () => {
    setIsUpsellOpen(false);
  };

  const handleSaveProgram = async () => {
    if (!program) return;
    
    setIsSaving(true);
    try {
      const savedProgram = await createNewProgram(program, userId);
      if (savedProgram) {
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

  const loadDemoProgram = () => {
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

      setProgram(transformedProgram);
      setIsGeneratingProgram(false);
      
      // Add a message to show it's demo mode
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Demo program loaded! You can now test program modifications."
      }]);
    }, 1000);
  };

  // Update the form section based on whether we have a program
  const renderFormSection = () => {
    if (program) {
      return (
        <form onSubmit={handleSubmit} className="p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex flex-col space-y-4">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Have any feedback about your program? Let me know if you'd like any adjustments..."
              rows={3}
              className="w-full p-4 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={handleSaveProgram}
                // disabled={isSaving}
                className="flex-1 px-8 py-4 bg-green-500 text-white text-lg rounded-xl hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? "Saving..." : "Save My Custom Program"}
              </button>
              <button
                type="submit"
                // disabled={!inputValue.trim() || isTyping}
                className="flex-1 px-8 py-4 bg-blue-500 text-white text-lg rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
      <form onSubmit={handleSubmit} className="p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex flex-col space-y-4">
          <div className="relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Share your fitness journey and goals..."
              rows={4}
              autoFocus={true}
              className="w-full p-4 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
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
            className="px-8 py-4 bg-blue-500 text-white text-lg rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Share Your Story
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="flex flex-col min-h-[80vh] bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-lg shadow-lg">
      {program ? (
        <ProgramDisplay 
          program={program} 
          userEmail={user?.email}
          onRequestUpsell={handleOpenUpsellModal}
        />
      ) : isGeneratingProgram ? (
        <GeneratingProgramTransition />
      ) : (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
                  className={`max-w-[85%] p-6 rounded-2xl ${
                    message.role === "assistant"
                      ? "bg-white dark:bg-gray-800 shadow-md"
                      : "bg-blue-500 text-white"
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
              className="flex items-center space-x-2 text-gray-500"
            >
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {renderFormSection()}
    </div>
  );
} 