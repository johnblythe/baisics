"use client";

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
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
import { createAnonUser, getUser } from "@/lib/actions/user";
import { v4 as uuidv4 } from "uuid";
import exampleProgram from '../utils/example.json';
import { ConversationalIntakeRef } from './ConversationalIntakeContainer';
import { sendGTMEvent } from "@next/third-parties/google";
import { useStreamingGeneration, GenerationProgress } from "@/hooks/useStreamingGeneration";
import { convertToIntakeFormat } from "@/utils/formatters";
import { clearWelcomeData } from "@/components/ClaimWelcomeBanner";

// Quick start prompts for new users
const QUICK_PROMPTS = [
  { label: '💪 Build Muscle', message: "I want to build muscle and get stronger. I can train 4-5 days per week." },
  { label: '🔥 Lose Weight', message: "I want to lose weight and get in better shape. Looking for something I can stick with." },
  { label: '⚡ Get Stronger', message: "I want to focus on building strength. Interested in compound lifts and progressive overload." },
  { label: '🎯 General Fitness', message: "I just want to get healthier and more fit overall. Not sure where to start." },
];

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
  initialExtractedData?: IntakeFormData | null;
  onProgramChange?: (program: Program | null) => void;
  preventNavigation?: boolean;
}

export const ConversationalInterface = forwardRef<ConversationalIntakeRef, ConversationalInterfaceProps>(({ userId, user, initialProgram, initialExtractedData, onProgramChange, preventNavigation }, ref) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [extractedData, setExtractedData] = useState<IntakeFormData | null>(initialExtractedData || null);
  const [program, setProgram] = useState<Program | null>(null);
  const [isGeneratingProgram, setIsGeneratingProgram] = useState(false);
  const [isUpsellOpen, setIsUpsellOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(Math.floor(Math.random() * Object.keys(SAMPLE_PROFILES).length));
  const [isSaving, setIsSaving] = useState(false);
  const [showDataReview, setShowDataReview] = useState(false);
  const [localUserId, setLocalUserId] = useState(userId);
  const [localUser, setLocalUser] = useState(user);
  const isReturningUser = !!initialExtractedData;
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress | undefined>(undefined);

  const router = useRouter();

  // Streaming generation hook with phase tracking
  const {
    generate: generateStreaming,
    isGenerating: isStreamGenerating,
    phases: streamedPhases,
    programMeta: streamedProgramMeta,
  } = useStreamingGeneration({
    onProgress: (progress) => {
      setGenerationProgress(progress);
    },
    onPhase: (phase, phaseNumber, totalPhases) => {
      console.log(`[UI] Phase ${phaseNumber} received, total: ${totalPhases}`);
    },
    onProgramMeta: (meta) => {
      console.log(`[UI] Program meta received: ${meta.name}`);
    },
    onComplete: (result) => {
      if (result.success && result.savedProgram) {
        setProgram(result.program);
        setIsGeneratingProgram(false);
        sendGTMEvent({ event: 'program created successfully', value: result.savedProgram });
        clearWelcomeData(); // Clear claim welcome banner when user creates their own program

        // Navigate to appropriate page
        const isAuthenticated = localUser?.email;
        if (isAuthenticated) {
          router.replace(`/dashboard/${result.savedProgram.id}`);
        } else {
          router.replace(`/program/review?userId=${localUserId}&programId=${result.savedProgram.id}`);
        }
      }
    },
    onError: (error) => {
      console.error('Generation error:', error);
      setIsGeneratingProgram(false);
      setGenerationProgress(undefined);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I encountered an error while creating your program. Please try again."
      }]);
    },
  });

  useEffect(() => {
    if (initialProgram) {
      setProgram(initialProgram);
    }
  }, [initialProgram]);

  // Set custom welcome message for returning users (#107)
  useEffect(() => {
    if (isReturningUser && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: `Good to see you again! Last time we set you up with ${(initialExtractedData as any)?.daysPerWeek || 'a few'} days a week focused on ${(initialExtractedData as any)?.goals || 'your fitness'}. Ready for something new, or want to keep building on that?`
      }]);
    }
  }, [isReturningUser, initialExtractedData, messages.length]);

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
    // Initial welcome message with typing effect (skip for returning users - they get custom message)
    if (isReturningUser) return;

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
  }, [isReturningUser]);
  
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
  const handleInitialIntake = async (userMessage: Message, _: string) => {
    // Pass existing extractedData so returning users don't get asked redundant questions (#107)
    const result = await processUserMessage([...messages, userMessage], localUserId, extractedData as any);
        
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
    setGenerationProgress({ stage: 'idle', message: 'Starting...', progress: 0 });
    setMessages(prev => [...prev, {
      role: "assistant",
      content: "Great! I'll create your personalized program now. Let me put that together for you..."
    }]);

    // Track the actual userId to use (React state updates are async)
    let activeUserId = localUserId;

    // Create user if we don't have one
    if (!activeUserId) {
      const newUserId = uuidv4();
      const result = await createAnonUser(newUserId);
      if (result.success && result.user) {
        activeUserId = result.user.id;
        setLocalUserId(result.user.id);
        setLocalUser(result.user);
      } else {
        console.error('Failed to create anonymous user');
        setIsGeneratingProgram(false);
        setGenerationProgress(undefined);
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "I encountered an error while creating your program. Please try again."
        }]);
        return;
      }
    }

    // Convert extractedData to intake format and use streaming generation
    const intakeData = convertToIntakeFormat(extractedData);
    generateStreaming({
      userId: activeUserId,
      intakeData,
      context: { generationType: 'new' as const },
    });
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

    sendGTMEvent({ event: 'chat message sent', value: inputValue.trim() })
    
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: inputValue,
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Create user if we don't have one and we're in the landing page flow
    if (preventNavigation && !localUserId) {
      const newUserId = uuidv4();
      const result = await createAnonUser(newUserId);
      if (result.success && result.user) {
        setLocalUserId(result.user.id);
        setLocalUser(result.user);
      } else {
        console.error('Failed to create anonymous user');
        setIsTyping(false);
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "I encountered an error. Please try again."
        }]);
        return;
      }
    }

    // If we have a program, handle as modification request
    if (program) {
      await handleProgramModification(userMessage, program);
      return;
    }

    // If preventNavigation is true, handle the conversation in place
    await handleInitialIntake(userMessage, localUserId);
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

  // Update the form section based on whether we have a program
  const renderFormSection = () => {
    if (program) {
      return (
        <form onSubmit={handleSubmit} className="hidden p-6 border-t border-[#F1F5F9] bg-white rounded-b-xl">
          <div className="flex flex-col space-y-4">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Have any feedback about your program? Let me know if you'd like any adjustments..."
              rows={3}
              className="w-full p-4 border-2 border-[#F1F5F9] rounded-xl bg-[#F8FAFC] text-[#0F172A] placeholder-[#94A3B8] focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B] resize-none transition-all duration-300"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            />
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleSaveProgram}
                className="flex-1 px-6 py-3 bg-[#0F172A] text-white text-base font-semibold rounded-xl hover:bg-[#1E293B] transition-all duration-300"
              >
                {isSaving ? "Saving..." : "Save Program"}
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-[#FF6B6B] hover:bg-[#EF5350] text-white text-base font-semibold rounded-xl shadow-lg shadow-[#FF6B6B]/25 transition-all duration-300"
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
        className={`mt-6 ${showDataReview || isGeneratingProgram ? 'hidden' : ''}`}
      >
        <div className="flex flex-col space-y-5">
          <div className="relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={!extractedData && !messages ? "Share your fitness journey and goals..." : "Keep the info coming!"}
              rows={4}
              autoFocus={true}
              className="w-full p-5 border-2 border-[#F1F5F9] rounded-xl bg-[#F8FAFC] text-[#0F172A] placeholder-[#94A3B8] focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B] resize-none transition-all duration-300 text-base"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            />
            <div className="hidden lg:block absolute bottom-4 right-4 text-xs text-[#94A3B8]" style={{ fontFamily: "'Space Mono', monospace" }}>
              ⌘ + Return to send
            </div>
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="px-8 py-4 bg-[#FF6B6B] hover:bg-[#EF5350] text-white text-lg font-semibold rounded-xl shadow-lg shadow-[#FF6B6B]/25 hover:shadow-xl hover:shadow-[#FF6B6B]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            {!extractedData || !messages ? "Share Your Story" : "Tell me more"}
          </button>
        </div>
      </form>
    );
  };

  // Expose the prefillAndSubmit me1d through the ref
  useImperativeHandle(ref, () => ({
    prefillAndSubmit: (message: string) => {
      setInputValue(message);
      // Use requestAnimationFrame to ensure the input value is set before submitting
      requestAnimationFrame(() => {
        handleSubmit({ preventDefault: () => {} } as React.FormEvent);
      });
    }
  }));

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
      `}</style>

      <div
        className={`flex flex-col min-h-[calc(100vh-10rem)] ${program ? 'max-w-full' : 'max-w-5xl mx-auto px-6 py-10'}`}
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        {program ? (
          <ProgramDisplay
            program={program}
            userEmail={localUser?.email}
            onRequestUpsell={() => setIsUpsellOpen(!isUpsellOpen)}
            isUpsellOpen={isUpsellOpen}
            onCloseUpsell={() => setIsUpsellOpen(false)}
          />
        ) : showDataReview && extractedData ? (
          <DataReviewTransition
            intakeData={extractedData}
            onConfirm={handleDataReviewConfirm}
            onRequestMore={handleRequestMoreDetails}
          />
        ) : isGeneratingProgram ? (
          <GeneratingProgramTransition
            progress={generationProgress}
            phases={streamedPhases}
            programMeta={streamedProgramMeta}
          />
        ) : (
          <div className="flex-1 flex flex-col">
            {/* Hero Section - shows when conversation just started */}
            {messages.length <= 1 && !isTyping && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
              >
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0F172A] mb-3">
                  Let&apos;s Build Your Program
                </h1>
                <p className="text-[#64748B] text-lg md:text-xl">
                  Tell me about your goals, or pick one below to get started
                </p>
              </motion.div>
            )}

            {/* Chat Messages Container */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 messages-container relative bg-white rounded-2xl border border-[#F1F5F9] shadow-sm">
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
                      className={`max-w-[85%] p-5 rounded-2xl transition-all duration-300 ${
                        message.role === "assistant"
                          ? "bg-[#0F172A] text-white shadow-lg"
                          : "bg-white border-l-4 border-[#FF6B6B] text-[#0F172A] shadow-sm"
                      }`}
                    >
                      <p className={`whitespace-pre-wrap text-base leading-relaxed ${message.role === "assistant" ? "text-white" : "text-[#0F172A]"}`}>
                        {message.content}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center space-x-2"
                >
                  <div className="w-2 h-2 bg-[#FF6B6B] rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-[#FF6B6B] rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
                  <div className="w-2 h-2 bg-[#FF6B6B] rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Start Prompts - shows when conversation just started */}
            {messages.length <= 1 && !isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6"
              >
                <p className="text-sm text-[#94A3B8] mb-4 text-center">Quick start:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {QUICK_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setInputValue(prompt.message);
                        // Auto-submit after a brief delay so user sees what was filled
                        setTimeout(() => {
                          handleSubmit({ preventDefault: () => {} } as React.FormEvent);
                        }, 100);
                      }}
                      className="px-5 py-4 bg-[#F8FAFC] hover:bg-[#FFE5E5] border border-[#E2E8F0] hover:border-[#FF6B6B] rounded-xl text-sm font-medium text-[#0F172A] transition-all duration-200"
                    >
                      {prompt.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}

        {renderFormSection()}
      </div>
    </>
  );
});

ConversationalInterface.displayName = 'ConversationalInterface'; 