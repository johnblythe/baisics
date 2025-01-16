import { IntakeFormData } from "@/types";
import { useState } from "react";
import { convertToIntakeFormat } from "@/utils/formatters";
import { convertHeightToFeetAndInches } from "@/utils/formatting";

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
  }
];

interface DataReviewProps {
  intakeData: IntakeFormData;
  onConfirm: () => void;
  onRequestMore: (topics: string[]) => void;
}

function SummaryCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
      <h3 className="font-semibold mb-2">{title}</h3>
      <ul className="space-y-1">
        {items.map((item, idx) => (
          <li key={idx} className="text-sm text-gray-600 dark:text-gray-300">{item}</li>
        ))}
      </ul>
    </div>
  );
}

function TopicsSelector({ 
  topics, 
  selected, 
  onChange 
}: { 
  topics: typeof ADDITIONAL_TOPICS;
  selected: string[];
  onChange: (topics: string[]) => void;
}) {
  return (
    <div className="space-y-2 mt-4">
      {topics.map((topic) => (
        <label key={topic.id} className="flex items-start space-x-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={selected.includes(topic.id)}
            onChange={(e) => {
              if (e.target.checked) {
                onChange([...selected, topic.id]);
              } else {
                onChange(selected.filter(id => id !== topic.id));
              }
            }}
            className="mt-1"
          />
          <div>
            <div className="font-medium">{topic.label}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{topic.description}</div>
          </div>
        </label>
      ))}
    </div>
  );
}

export function DataReviewTransition({ intakeData, onConfirm, onRequestMore }: DataReviewProps) {
  console.log("🚀 ~ DataReviewTransition ~ intakeData:", intakeData)
  const formattedIntakeData = convertToIntakeFormat(intakeData);
  console.log("🚀 ~ DataReviewTransition ~ formattedIntakeData:", formattedIntakeData)
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [showTopics, setShowTopics] = useState(false);

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
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Review Your Information</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Let&apos;s make sure we have everything right before creating your program.
        </p>
      </div>
      
      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {summaryCards.map((card, idx) => (
          <SummaryCard key={idx} title={card.title} items={card.items} />
        ))}
        <div className="md:col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 shadow-lg border border-blue-100 dark:border-gray-600">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <span className="text-2xl">💪</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Don&apos;t sweat it!</h3>
              <p className="text-blue-800/80 dark:text-gray-300 leading-relaxed">
                There&apos;s no commitment yet, you can request changes if needed. You can also upgrade and make as many programs as you&apos;d like.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
        <button
          onClick={onConfirm}
          className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          🚀 Looks good, let&apos;s go!
        </button>
        
        <div className="relative w-full sm:w-auto">
          {!showTopics ? (
            <button
              onClick={() => setShowTopics(true)}
              className="w-full px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
            >
            📝 I&apos;d Like to Add or Change Details
            </button>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 space-y-4">
              <h3 className="font-semibold">What else would you like to tell us about?</h3>
              <TopicsSelector
                topics={ADDITIONAL_TOPICS}
                selected={selectedTopics}
                onChange={setSelectedTopics}
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setShowTopics(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (selectedTopics.length > 0) {
                      onRequestMore(selectedTopics);
                    }
                  }}
                  disabled={selectedTopics.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 