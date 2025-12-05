'use client';

import { useState } from 'react';
import { WorkoutUploadModal } from '@/components/WorkoutUploadModal';

export default function WorkoutUploadTest() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main className="container mx-auto p-4 min-h-screen">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold">Workout File Upload Test</h1>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Upload Program
        </button>

        <WorkoutUploadModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </main>
  );
} 