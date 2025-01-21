import { IntakeFormData } from "@/types";
import { useState } from "react";
import { convertToIntakeFormat } from "@/utils/formatters";
import { convertHeightToFeetAndInches } from "@/utils/formatting";
import { motion, AnimatePresence } from "framer-motion";

const ADDITIONAL_TOPICS = [
  {
    id: 'injuries',
    label: 'Previous Injuries & Medical History',
    description: 'Tell us about any injuries or conditions that might affect your training'
  },
  {
    id: 'fitness',
    label: 'Detailed Fitness History',
    description: 'Share more about your past workout experience and achievements'
  },
  {
    id: 'preferences',
    label: 'Exercise Preferences',
    description: 'Specific movements you enjoy or want to avoid'
  },
  {
    id: 'nutrition',
    label: 'Nutrition Details',
    description: 'Dietary restrictions, preferences, or specific goals'
  },
  {
    id: 'recovery',
    label: 'Recovery & Lifestyle',
    description: 'Sleep patterns, stress levels, and recovery habits'
  },
  {
    id: 'other',
    label: 'Other',
    description: 'Anything else that needs correction or clarification'
  }
];

interface DataReviewProps {
  intakeData: IntakeFormData;
  onConfirm: () => void;
  onRequestMore: (topics: string[]) => void;
}

function SummaryCard({ title, items }: { title: string; items: string[] }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700"
    >
      <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">{title}</h3>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li 
            key={idx} 
            className="text-sm text-gray-600 dark:text-gray-300 flex items-center space-x-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-blue-500"></span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export function DataReviewTransition({ intakeData, onConfirm, onRequestMore }: DataReviewProps) {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [showTopics, setShowTopics] = useState(false);
  const formattedIntakeData = convertToIntakeFormat(intakeData);

  // Format the intake data for display
  const summaryCards = [
    {
      title: "Personal Info",
      items: [
        `Height: ${convertHeightToFeetAndInches(formattedIntakeData.height) || 'Not specified'}`,
        `Weight: ${formattedIntakeData.weight || 'Not specified'}`,
        `Age: ${formattedIntakeData.age || 'Not specified'}`,
      ]
    },
    {
      title: "Training Goals",
      items: [
        `Primary: ${formattedIntakeData.trainingGoal || 'Not specified'}`,
        ...(formattedIntakeData.trainingPreferences && formattedIntakeData.trainingPreferences.length > 0 
          ? [`Preferences: ${formattedIntakeData.trainingPreferences.join(', ')}`] 
          : [])
      ]
    },
    {
      title: "Schedule",
      items: [
        `${formattedIntakeData.daysAvailable || 3} days per week`,
        `${formattedIntakeData.dailyBudget || 60} minutes per session`,
      ]
    },
    {
      title: "Training Environment",
      items: [
        `Location: ${formattedIntakeData.workoutEnvironment?.primary || 'Not specified'}`,
        `Equipment: ${formattedIntakeData.equipmentAccess?.type || 'Not specified'}`,
        ...(formattedIntakeData.equipmentAccess?.available && formattedIntakeData.equipmentAccess.available.length > 0
          ? [`Available: ${formattedIntakeData.equipmentAccess.available.join(', ')}`] 
          : [])
      ]
    },
    {
      title: "Style & Experience",
      items: [
        `Experience Level: ${formattedIntakeData.experienceLevel || 'Not specified'}`,
        `Primary Style: ${formattedIntakeData.workoutStyle?.primary || 'Not specified'}`,
        ...(formattedIntakeData.workoutStyle?.secondary 
          ? [`Secondary Style: ${formattedIntakeData.workoutStyle.secondary}`] 
          : [])
      ]
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto p-6 space-y-8"
    >
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Review Your Information</h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Let&apos;s make sure we have everything right before creating your program.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {summaryCards.map((card, idx) => (
          <SummaryCard key={idx} title={card.title} items={card.items} />
        ))}
        <motion.div 
          className="md:col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 shadow-lg border border-blue-100 dark:border-gray-600"
          whileHover={{ scale: 1.01 }}
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <span className="text-2xl">💪</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-2">Don&apos;t sweat it!</h3>
              <p className="text-blue-800/80 dark:text-gray-300 leading-relaxed">
                We can make changes to your program if needed. You can also upgrade and make as many programs as you&apos;d like.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex flex-col w-full gap-4 mt-8">
        <AnimatePresence mode="wait">
          {!showTopics ? (
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full">
              <motion.button
                key="confirm-button"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onConfirm}
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-lg font-semibold shadow-sm hover:shadow-md"
              >
                🚀 Looks good, let&apos;s go!
              </motion.button>
              
              <motion.button
                key="show-topics-button"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowTopics(true)}
                className="w-full sm:w-auto px-8 py-4 transition-colors font-medium text-sm"
              >
                📝 I&apos;d like to add or change some details
              </motion.button>
            </div>
          ) : (
            <motion.div 
              key="topics-container"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  What else would you like to tell us about?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Select any additional information you&apos;d like to share to help us create your perfect program.
                </p>
              </div>

              <div className="space-y-4">
                {ADDITIONAL_TOPICS.map((topic) => (
                  <motion.label 
                    key={topic.id} 
                    className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-150"
                    whileHover={{ scale: 1.01, x: 4 }}
                    transition={{ duration: 0.15 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="relative flex items-center h-6">
                      <input
                        type="checkbox"
                        checked={selectedTopics.includes(topic.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTopics([...selectedTopics, topic.id]);
                          } else {
                            setSelectedTopics(selectedTopics.filter(id => id !== topic.id));
                          }
                        }}
                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100 text-lg">
                        {topic.label}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {topic.description}
                      </p>
                    </div>
                  </motion.label>
                ))}
              </div>

              <div className="flex justify-end gap-4 mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowTopics(false)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (selectedTopics.length > 0) {
                      onRequestMore(selectedTopics);
                    }
                  }}
                  disabled={selectedTopics.length === 0}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm hover:shadow-md"
                >
                  Continue
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
} 