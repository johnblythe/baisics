import { Dialog } from '@headlessui/react';
import { Apple, Scale, Tag, Database, Brain, Dumbbell } from 'lucide-react';

interface MacrosGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MacrosGuideModal({ isOpen, onClose }: MacrosGuideModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Background overlay */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

      {/* Modal container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="relative w-full max-w-3xl rounded-2xl bg-white dark:bg-gray-800 shadow-xl overflow-y-auto max-h-[90vh]">
          {/* Header with gradient */}
          <div className="relative overflow-hidden rounded-t-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-10" />
            <div className="relative px-8 py-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
                  <Apple className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <Dialog.Title className="text-4xl font-bold text-gray-900 dark:text-white">
                  Quick Guide to (Counting) Macros
                </Dialog.Title>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
                Master the basics of macro tracking to optimize your nutrition and reach your fitness goals faster.
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-6 space-y-6">
            {/* What Are Macros */}
            <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                  <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">What Are Macros?</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Macronutrients (macros) are the three main nutrients your body needs: proteins, fats, and carbohydrates. Alcohol is sometimes considered a fourth macro.
              </p>
            </section>

            {/* Caloric Values */}
            <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                  <Scale className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Caloric Values</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Protein', value: '4 calories per gram' },
                  { label: 'Carbs', value: '4 calories per gram' },
                  { label: 'Fat', value: '9 calories per gram' },
                  { label: 'Alcohol', value: '7 calories per gram' }
                ].map((item) => (
                  <div key={item.label} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                    <div className="font-medium text-gray-900 dark:text-white mb-1">{item.label}</div>
                    <div className="text-gray-600 dark:text-gray-300">{item.value}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Daily Needs */}
            <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                  <Dumbbell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Daily Needs</h2>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Based on lean body mass</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Protein', value: '0.5-2g per pound' },
                  { label: 'Fat', value: '0.35-0.7g per pound' },
                  { label: 'Carbs', value: '0.5-2g per pound', note: 'Flexible based on goals' }
                ].map((item) => (
                  <div key={item.label} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                    <div className="font-medium text-gray-900 dark:text-white mb-1">{item.label}</div>
                    <div className="text-gray-600 dark:text-gray-300">{item.value}</div>
                    {item.note && <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.note}</div>}
                  </div>
                ))}
              </div>
            </section>

            {/* Reading Labels */}
            <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                  <Tag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Reading Labels</h2>
              </div>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="text-indigo-600 dark:text-indigo-400">•</span>
                  Focus only on total Protein, Fat, and Carbs
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-indigo-600 dark:text-indigo-400">•</span>
                  Ignore daily value percentages
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-indigo-600 dark:text-indigo-400">•</span>
                  Watch serving sizes - multiply accordingly
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-indigo-600 dark:text-indigo-400">•</span>
                  No need to track individual components (like saturated fat or sugar)
                </li>
              </ul>
            </section>

            {/* Foods Without Labels */}
            <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                  <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Foods Without Labels</h2>
              </div>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="text-indigo-600 dark:text-indigo-400">•</span>
                  Use reliable online databases
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-indigo-600 dark:text-indigo-400">•</span>
                  Weigh raw meat (nutrition facts are for raw weight)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-indigo-600 dark:text-indigo-400">•</span>
                  Restaurant nutrition info usually available online
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-indigo-600 dark:text-indigo-400">•</span>
                  Use a food scale for accuracy
                </li>
              </ul>
            </section>

            {/* Why Count Macros */}
            <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                  <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Why Count Macros vs. Calories?</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                While calories matter for weight loss, macro counting ensures:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: 'Muscle', desc: 'Preservation through adequate protein' },
                  { title: 'Hormones', desc: 'Function through sufficient fat' },
                  { title: 'Performance', desc: 'Training through appropriate carbs' }
                ].map((item) => (
                  <div key={item.title} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                    <div className="font-medium text-gray-900 dark:text-white mb-1">{item.title}</div>
                    <div className="text-gray-600 dark:text-gray-300">{item.desc}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Pro Tips */}
            <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                  <Scale className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Pro Tips</h2>
              </div>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="text-indigo-600 dark:text-indigo-400">•</span>
                  Get a food scale for accuracy
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-indigo-600 dark:text-indigo-400">•</span>
                  Track raw meat weight
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-indigo-600 dark:text-indigo-400">•</span>
                  &ldquo;Free&rdquo; vegetables don&apos;t need counting (high fiber, low-calorie)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-indigo-600 dark:text-indigo-400">•</span>
                  You don&apos;t need to count macros forever - use it as a tool when needed
                </li>
              </ul>
            </section>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 