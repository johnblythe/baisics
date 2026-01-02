'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { UpgradeModal } from './UpgradeModal';

interface Program {
  id: string;
  name: string;
  createdAt: Date;
}

interface ProgramSelectorProps {
  currentProgram: Program;
  programs: Program[];
  isPremium?: boolean;
}

export function ProgramSelector({ currentProgram, programs, isPremium = false }: ProgramSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  // Sort programs by most recent first
  const sortedPrograms = [...programs].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // For free tier, only the most recent program is active
  const activeProgram = sortedPrograms[0];
  const isActiveProgram = (programId: string) => programId === activeProgram?.id;

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
    // Free tier: only allow selecting active (most recent) program
    if (!isPremium && !isActiveProgram(programId)) {
      setIsOpen(false);
      setShowUpgradeModal(true);
      return;
    }

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

  // If only one program, show simple title without dropdown
  if (programs.length <= 1) {
    return (
      <h1 className="text-3xl font-bold text-[#0F172A]">
        {currentProgram.name}
      </h1>
    );
  }

  return (
    <>
      <div className="relative group" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          className="inline-flex items-center gap-2 group text-3xl font-bold text-[#0F172A] hover:text-[#FF6B6B] transition-colors"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label="Select program"
          tabIndex={0}
        >
          {currentProgram.name}
          <svg
            className={`w-6 h-6 text-[#94A3B8] group-hover:text-[#FF6B6B] transition-transform duration-200 ${
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
            className="absolute z-50 w-full min-w-[300px] max-w-[400px] mt-2 bg-white rounded-xl shadow-lg border border-[#E2E8F0] py-1 overflow-hidden"
            role="listbox"
            tabIndex={-1}
          >
            {/* Pro badge for premium users */}
            {isPremium && (
              <div className="px-4 py-2 border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <span className="text-xs font-semibold text-[#FF6B6B] uppercase tracking-wide">
                  Pro Member
                </span>
              </div>
            )}

            {sortedPrograms.map((program, index) => {
              const isActive = isActiveProgram(program.id);
              const isLocked = !isPremium && !isActive;
              const isCurrent = program.id === currentProgram.id;

              return (
                <button
                  key={program.id}
                  onClick={() => handleProgramSelect(program.id)}
                  className={`w-full text-left px-4 py-3 transition-colors flex items-center justify-between gap-2 ${
                    isCurrent ? 'bg-[#F8FAFC]' : ''
                  } ${
                    isLocked
                      ? 'text-[#94A3B8] hover:bg-[#F8FAFC] cursor-pointer'
                      : 'text-[#0F172A] hover:bg-[#F8FAFC]'
                  }`}
                  role="option"
                  aria-selected={isCurrent}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`block font-medium truncate ${isLocked ? 'text-[#94A3B8]' : ''}`}>
                        {program.name}
                      </span>
                      {index === 0 && !isPremium && (
                        <span className="text-xs bg-[#FFE5E5] text-[#FF6B6B] px-2 py-0.5 rounded-full font-medium">
                          Active
                        </span>
                      )}
                    </div>
                    <span className="block text-sm text-[#64748B] mt-0.5">
                      {new Date(program.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  {/* Lock icon for non-active programs (free tier) */}
                  {isLocked && (
                    <div className="flex items-center gap-1 text-[#94A3B8]">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}

            {/* Create New Program */}
            <div className="border-t border-[#E2E8F0]">
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push('/program/create');
                }}
                className="w-full text-left px-4 py-3 text-[#0F172A] hover:bg-[#F8FAFC] transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5 text-[#FF6B6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="font-medium">Create New Program</span>
              </button>
            </div>

            {/* Upgrade prompt for free users with multiple programs */}
            {!isPremium && sortedPrograms.length > 1 && (
              <div className="px-4 py-3 border-t border-[#E2E8F0] bg-[#F8FAFC]">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setShowUpgradeModal(true);
                  }}
                  className="text-sm text-[#FF6B6B] hover:text-[#EF5350] font-medium flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Upgrade to switch freely
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        context="switch_program"
        currentProgramName={activeProgram?.name}
      />
    </>
  );
}
