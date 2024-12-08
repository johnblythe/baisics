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
          const programResult = await processUserMessage([...messages, userMessage], userId, true);
          if (programResult.success && programResult.program) {
            // Convert the program data to match ProgramFullDisplay type
            const displayProgram: ProgramFullDisplay = {
              id: userId, // or generate a unique ID
              name: programResult.program.programName,
              description: programResult.program.programDescription,
              createdBy: userId,
              createdAt: new Date(),
              updatedAt: new Date(),
              workoutPlans: programResult.program.phases.map(phase => ({
                id: `phase-${phase.phase}`,
                programId: userId,
                phase: phase.phase,
                durationWeeks: phase.durationWeeks,
                workouts: phase.trainingPlan.workouts,
                createdAt: new Date(),
                updatedAt: new Date()
              }))
            };

            setProgram(displayProgram);
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
  };

  const handleOpenUpsellModal = () => {
    setIsUpsellOpen(true);
  };

  const handleCloseUpsellModal = () => {
    setIsUpsellOpen(false);
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
    </div>
  );
} 