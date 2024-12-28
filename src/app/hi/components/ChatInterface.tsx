"use client";

import { useState } from "react";
import { ImageDropzone } from "@/app/components/ImageDropzone";
import { IntakeFormData } from "@/types";

interface ChatInterfaceProps {
  userId: string;
}

// Define the conversation flow steps
interface ConversationStep {
  question: string;
  inputType: 'text' | 'number' | 'select' | 'multiselect' | 'image';
  key: keyof IntakeFormData; // This will map to your form data
  options?: string[];
  placeholder?: string;
  validation?: (value: any) => boolean;
}

const conversationFlow: ConversationStep[] = [
  {
    question: `Hi there! I&apos;m excited to help you create a personalized fitness program. To get started, what are your main fitness goals?`,
    inputType: 'select',
    key: 'trainingGoal',
    options: [
      'Weight Loss',
      'Muscle Gain',
      'Strength',
      'Endurance',
      'General Fitness'
    ]
  },
  {
    question: `Great choice! How would you describe your current fitness level?`,
    inputType: 'select',
    key: 'experienceLevel',
    options: [
      'Beginner',
      'Intermediate',
      'Advanced'
    ]
  },
  {
    question: "How many days per week can you commit to training?",
    inputType: 'number',
    key: 'daysAvailable',
    validation: (value: number) => value >= 1 && value <= 7
  },
  // Add more steps as needed
];

export function ChatInterface({ userId }: ChatInterfaceProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<IntakeFormData>>({});
  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const step = conversationFlow[currentStep];
    
    // Validate the answer if needed
    if (step.validation && !step.validation(currentAnswer)) {
      // Show error message
      return;
    }

    // Save the answer
    setAnswers(prev => ({
      ...prev,
      [step.key]: currentAnswer
    }));

    // Animate transition
    setIsTransitioning(true);
    
    // Move to next step
    setTimeout(() => {
      setCurrentStep(prev => prev + 1);
      setCurrentAnswer('');
      setIsTransitioning(false);
    }, 300);
  };

  const renderInput = (step: ConversationStep) => {
    switch (step.inputType) {
      case 'select':
        return (
          <select
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 mt-4"
          >
            <option value="">Select an option...</option>
            {step.options?.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 mt-4"
            placeholder={step.placeholder}
            min={1}
            max={7}
          />
        );
      
      case 'image':
        return (
          <div className="mt-4">
            <ImageDropzone
              onFilesChange={(files) => {
                // Handle image upload
              }}
              files={[]}
            />
          </div>
        );
      
      default:
        return (
          <input
            type="text"
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 mt-4"
            placeholder={step.placeholder}
          />
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        {currentStep < conversationFlow.length ? (
          <div className="space-y-6">
            {/* Progress indicator */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${(currentStep / conversationFlow.length) * 100}%` }}
              ></div>
            </div>

            {/* Question */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <p className="text-lg mb-4">
                {conversationFlow[currentStep].question}
              </p>

              <form onSubmit={handleSubmit}>
                {renderInput(conversationFlow[currentStep])}
                
                <button
                  type="submit"
                  disabled={!currentAnswer}
                  className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                >
                  Continue
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Thanks for sharing!</h2>
            <p>We&apos;re generating your personalized program...</p>
          </div>
        )}
      </div>
    </div>
  );
} 