'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Check, AlertCircle, BookOpen } from 'lucide-react';

interface Program {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  daysPerWeek: number | null;
  durationWeeks: number | null;
  isTemplate: boolean;
}

interface ProgramAssignModalProps {
  clientId: string;
  clientName: string;
  currentProgramName?: string | null;
  onClose: () => void;
  onAssigned?: () => void;
}

export function ProgramAssignModal({
  clientId,
  clientName,
  currentProgramName,
  onClose,
  onAssigned,
}: ProgramAssignModalProps) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchPrograms();
  }, []);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const fetchPrograms = async () => {
    try {
      // Fetch templates (programs created by this coach)
      const templatesRes = await fetch('/api/programs/templates');

      if (!templatesRes.ok) {
        throw new Error('Failed to fetch programs');
      }

      const templatesData = await templatesRes.json();
      const allPrograms = (templatesData.templates || []).map((t: Program) => ({
        ...t,
        isTemplate: true,
      }));

      setPrograms(allPrograms);
    } catch (err) {
      setError('Failed to load programs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = async (program: Program) => {
    if (currentProgramName) {
      const confirmed = window.confirm(
        `${clientName} already has "${currentProgramName}" active. Replace with "${program.name}"?`
      );
      if (!confirmed) return;
    }

    setAssigningId(program.id);
    setError(null);

    try {
      const response = await fetch('/api/programs/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programId: program.id,
          clientId,
          setAsActive: true,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to assign program');
      }

      setSuccess(`Assigned "${program.name}" to ${clientName}`);
      setTimeout(() => {
        onAssigned?.();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign');
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
          <div>
            <h2 className="text-lg font-semibold text-[#0F172A]">Assign Program</h2>
            <p className="text-sm text-[#64748B]">Select a program for {clientName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#64748B]" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh]">
          {isLoading && (
            <div className="px-6 py-12 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-[#64748B] mx-auto" />
              <p className="text-sm text-[#64748B] mt-2">Loading programs...</p>
            </div>
          )}

          {error && (
            <div className="mx-6 my-4 px-4 py-3 text-sm text-red-600 bg-red-50 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="mx-6 my-4 px-4 py-3 text-sm text-green-600 bg-green-50 rounded-lg flex items-center gap-2">
              <Check className="w-4 h-4" />
              {success}
            </div>
          )}

          {!isLoading && !success && programs.length === 0 && (
            <div className="px-6 py-12 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#F1F5F9] flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-[#64748B]" />
              </div>
              <p className="text-[#64748B] mb-4">No programs available</p>
              <a
                href="/program/create"
                className="text-sm text-[#FF6B6B] hover:text-[#EF5350] font-medium"
              >
                Create a program →
              </a>
            </div>
          )}

          {!isLoading && !success && programs.length > 0 && (
            <div className="divide-y divide-[#F1F5F9]">
              {programs.map((program) => (
                <button
                  key={program.id}
                  onClick={() => handleAssign(program)}
                  disabled={assigningId !== null}
                  className="w-full px-6 py-4 text-left hover:bg-[#F8FAFC] flex items-start gap-4 transition-colors disabled:opacity-50"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#FFE5E5] flex items-center justify-center flex-shrink-0">
                    {assigningId === program.id ? (
                      <Loader2 className="w-5 h-5 animate-spin text-[#FF6B6B]" />
                    ) : (
                      <BookOpen className="w-5 h-5 text-[#FF6B6B]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-[#0F172A] truncate">
                        {program.name}
                      </p>
                      {program.isTemplate && (
                        <span className="px-1.5 py-0.5 text-xs font-medium text-[#64748B] bg-[#F1F5F9] rounded">
                          Template
                        </span>
                      )}
                    </div>
                    {program.description && (
                      <p className="text-sm text-[#64748B] line-clamp-1 mt-0.5">
                        {program.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-[#94A3B8] mt-1">
                      {program.category && (
                        <span className="capitalize">{program.category}</span>
                      )}
                      {program.daysPerWeek && (
                        <span>{program.daysPerWeek} days/wk</span>
                      )}
                      {program.durationWeeks && (
                        <span>{program.durationWeeks} weeks</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E2E8F0] bg-[#F8FAFC]">
          <div className="flex items-center justify-between">
            <a
              href="/program/templates"
              className="text-sm text-[#64748B] hover:text-[#0F172A]"
            >
              Manage templates →
            </a>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#64748B] hover:text-[#0F172A] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
