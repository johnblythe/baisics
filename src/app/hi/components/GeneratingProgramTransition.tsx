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
        className="text-center space-y-8"
      >
        <h2 className="text-2xl font-bold mb-8">
          Creating Your Custom Program
        </h2>

        <div className="space-y-6">
          {steps.map((step, index) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.5 }}
              className="flex items-center space-x-3"
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
                className="w-2 h-2 bg-blue-500 rounded-full"
              />
              <span>{step}</span>
            </motion.div>
          ))}
        </div>

        <motion.div
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          className="mt-12 text-gray-500"
        >
          Just a moment while we put everything together...
        </motion.div>
      </motion.div>
    </div>
  );
} 