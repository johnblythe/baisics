import { IntakeFormData } from "@/types";
import { useState } from "react";
import { convertToIntakeFormat } from "@/utils/formatters";
import { convertHeightToFeetAndInches } from "@/utils/formatting";
import { motion, AnimatePresence } from "framer-motion";

const ADDITIONAL_TOPICS = [
  {
    id: 'injuries',
    label: 'Injuries & Limitations',
    description: 'Past injuries or physical limitations'
  },
  {
    id: 'fitness',
    label: 'Fitness Background',
    description: 'Your workout history and experience'
  },
  {
    id: 'preferences',
    label: 'Exercise Preferences',
    description: 'Movements you enjoy or want to avoid'
  },
  {
    id: 'nutrition',
    label: 'Nutrition',
    description: 'Dietary needs or restrictions'
  },
  {
    id: 'other',
    label: 'Something Else',
    description: 'Corrections or clarifications'
  }
];

interface DataReviewProps {
  intakeData: IntakeFormData;
  onConfirm: () => void;
  onRequestMore: (topics: string[]) => void;
}

// Compact data row component
function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#F1F5F9] last:border-0">
      <span className="text-sm text-[#64748B]">{label}</span>
      <span className="text-sm font-medium text-[#0F172A]">{value}</span>
    </div>
  );
}

// Section component with icon
function DataSection({
  icon,
  title,
  children,
  delay = 0
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="bg-white rounded-xl border border-[#E2E8F0] p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] flex items-center justify-center text-[#64748B]">
          {icon}
        </div>
        <h3 className="font-semibold text-[#0F172A]">{title}</h3>
      </div>
      <div className="space-y-0">
        {children}
      </div>
    </motion.div>
  );
}

export function DataReviewTransition({ intakeData, onConfirm, onRequestMore }: DataReviewProps) {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [showTopics, setShowTopics] = useState(false);
  const formattedIntakeData = convertToIntakeFormat(intakeData);

  const toggleTopic = (id: string) => {
    setSelectedTopics(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
      `}</style>

      <div
        className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#F8FAFC] to-white"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F0FDF4] border border-[#BBF7D0] mb-4"
            >
              <svg className="w-4 h-4 text-[#22C55E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm font-medium text-[#16A34A]">Ready to build your program</span>
            </motion.div>

            <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A] mb-2">
              Quick Review
            </h1>
            <p className="text-[#64748B]">
              Make sure everything looks right
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!showTopics ? (
              <motion.div
                key="review"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Data Grid - 2 columns on desktop */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Profile */}
                  <DataSection
                    delay={0.15}
                    icon={
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    }
                    title="Profile"
                  >
                    <DataRow label="Height" value={convertHeightToFeetAndInches(formattedIntakeData.height) || '—'} />
                    <DataRow label="Weight" value={formattedIntakeData.weight ? `${formattedIntakeData.weight} lbs` : '—'} />
                    <DataRow label="Age" value={formattedIntakeData.age ? `${formattedIntakeData.age} years` : '—'} />
                  </DataSection>

                  {/* Schedule */}
                  <DataSection
                    delay={0.2}
                    icon={
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    }
                    title="Schedule"
                  >
                    <DataRow label="Days per week" value={`${formattedIntakeData.daysAvailable || 3} days`} />
                    <DataRow label="Session length" value={`${formattedIntakeData.dailyBudget || 60} min`} />
                  </DataSection>

                  {/* Goal */}
                  <DataSection
                    delay={0.25}
                    icon={
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    }
                    title="Goal"
                  >
                    <div className="py-2">
                      <p className="text-sm text-[#0F172A] leading-relaxed">
                        {formattedIntakeData.trainingGoal || 'General fitness'}
                      </p>
                    </div>
                  </DataSection>

                  {/* Setup */}
                  <DataSection
                    delay={0.3}
                    icon={
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    }
                    title="Setup"
                  >
                    <DataRow label="Location" value={formattedIntakeData.workoutEnvironment?.primary || 'Gym'} />
                    <DataRow label="Equipment" value={formattedIntakeData.equipmentAccess?.type || 'Full gym'} />
                    <DataRow label="Experience" value={formattedIntakeData.experienceLevel || 'Intermediate'} />
                  </DataSection>
                </div>

                {/* Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="pt-4 space-y-3"
                >
                  <button
                    onClick={onConfirm}
                    className="w-full py-4 bg-[#FF6B6B] hover:bg-[#EF5350] text-white text-lg font-semibold rounded-xl shadow-lg shadow-[#FF6B6B]/25 hover:shadow-xl hover:shadow-[#FF6B6B]/30 transition-all duration-200"
                  >
                    Create My Program
                  </button>

                  <button
                    onClick={() => setShowTopics(true)}
                    className="w-full py-3 text-[#64748B] hover:text-[#0F172A] text-sm font-medium transition-colors"
                  >
                    Wait, I want to add more details
                  </button>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="topics"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Topics selection */}
                <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
                  <h3 className="font-semibold text-[#0F172A] mb-1">What would you like to add?</h3>
                  <p className="text-sm text-[#64748B] mb-4">Select any topics you&apos;d like to discuss</p>

                  <div className="space-y-2">
                    {ADDITIONAL_TOPICS.map((topic) => {
                      const isSelected = selectedTopics.includes(topic.id);
                      return (
                        <button
                          key={topic.id}
                          onClick={() => toggleTopic(topic.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-150 text-left ${
                            isSelected
                              ? 'border-[#FF6B6B] bg-[#FFF5F5]'
                              : 'border-[#F1F5F9] hover:border-[#E2E8F0] bg-[#F8FAFC]'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                            isSelected
                              ? 'border-[#FF6B6B] bg-[#FF6B6B]'
                              : 'border-[#CBD5E1]'
                          }`}>
                            {isSelected && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className={`font-medium ${isSelected ? 'text-[#0F172A]' : 'text-[#475569]'}`}>
                              {topic.label}
                            </p>
                            <p className="text-xs text-[#94A3B8]">{topic.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowTopics(false);
                      setSelectedTopics([]);
                    }}
                    className="flex-1 py-3 text-[#64748B] hover:text-[#0F172A] font-medium rounded-xl border border-[#E2E8F0] hover:border-[#CBD5E1] transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      if (selectedTopics.length > 0) {
                        onRequestMore(selectedTopics);
                      }
                    }}
                    disabled={selectedTopics.length === 0}
                    className="flex-1 py-3 bg-[#0F172A] hover:bg-[#1E293B] text-white font-medium rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
}
