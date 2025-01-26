"use client";

import { motion } from "framer-motion";

const steps = [
  "Analyzing your information...",
  "Designing your program structure...",
  "Calculating optimal progressions...",
  "Finalizing your personalized plan..."
];

export function GeneratingProgramTransition() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto text-center space-y-8"
      >
        <div className="space-y-2">
          <div className="h-0.5 w-12 bg-indigo-600/30 dark:bg-indigo-400/30 mx-auto mb-4"></div>
          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase">Building Your Program</p>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Creating Your Custom Program
          </h2>
        </div>

        <div className="relative">
          <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-lg opacity-0 blur-xl transition duration-500 group-hover:opacity-30 dark:group-hover:opacity-20"></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-8 space-y-6">
            {steps.map((step, index) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.5 }}
                className="flex items-center gap-4"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.5
                  }}
                  className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400 flex-shrink-0"
                />
                <span className="text-gray-600 dark:text-gray-300 text-lg">{step}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          animate={{
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          className="text-gray-500 dark:text-gray-400 text-lg"
        >
          Just a moment while we put everything together...
        </motion.div>
      </motion.div>
    </div>
  );
} 