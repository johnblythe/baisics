'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Program {
  id: string;
  name: string;
  createdAt: Date;
}

interface ProgramSelectorProps {
  currentProgram: Program;
  programs: Program[];
}

export function ProgramSelector({ currentProgram, programs }: ProgramSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  // Sort programs by most recent first
  const sortedPrograms = [...programs].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProgramSelect = (programId: string) => {
    setIsOpen(false);
    router.push(`/dashboard/${programId}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      setIsOpen(!isOpen);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative group" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className="inline-flex items-center gap-2 group text-3xl font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select program"
        tabIndex={0}
      >
        {currentProgram.name}
        <svg 
          className={`w-6 h-6 text-gray-400 group-hover:text-indigo-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      
      {isOpen && (
        <div 
          className="absolute z-50 w-full min-w-[300px] max-w-[400px] mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 overflow-hidden"
          role="listbox"
          tabIndex={-1}
        >
          {sortedPrograms.map((program) => (
            <button
              key={program.id}
              onClick={() => handleProgramSelect(program.id)}
              className={`w-full text-left px-4 py-3 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                program.id === currentProgram.id ? 'bg-gray-50 dark:bg-gray-700/50' : ''
              }`}
              role="option"
              aria-selected={program.id === currentProgram.id}
            >
              <span className="block font-medium">{program.name}</span>
              <span className="block text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {new Date(program.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 