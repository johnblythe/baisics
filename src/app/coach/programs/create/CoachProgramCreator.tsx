'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ProgramBuilder } from '@/app/program/create/components/ProgramBuilder';
import { createCoachProgram, CoachProgramFormData } from './actions';
import { Upload, Wrench, FileText, Loader2 } from 'lucide-react';

type Tab = 'build' | 'import';

interface CoachProgramCreatorProps {
  clientId: string | null;
  clientName: string | null;
}

export function CoachProgramCreator({ clientId, clientName }: CoachProgramCreatorProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('build');
  const [isTemplate, setIsTemplate] = useState(!clientId);

  // Import tab state
  const [importText, setImportText] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBuildSave = async (data: any) => {
    const coachData: CoachProgramFormData = {
      ...data,
      isTemplate: clientId ? false : isTemplate,
      clientId: clientId || undefined,
    };

    const result = await createCoachProgram(coachData);

    if (clientId && result.assignedProgramId) {
      router.push(`/coach/clients/${clientId}`);
    } else {
      router.push('/coach/programs');
    }

    return result;
  };

  const handleParse = async () => {
    setParsing(true);
    setParseError(null);
    setParsedData(null);

    try {
      const formData: Record<string, string> = {};

      if (importFile) {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(importFile);
        });
        formData.file = base64;
        formData.fileName = importFile.name;
      } else if (importText.trim()) {
        formData.text = importText.trim();
      } else {
        setParseError('Please paste text or upload a file');
        setParsing(false);
        return;
      }

      const res = await fetch('/api/programs/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to parse');

      setParsedData(data.parsed);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Failed to parse program');
    } finally {
      setParsing(false);
    }
  };

  const handleImportSave = async () => {
    if (!parsedData) return;
    setSaving(true);
    setSaveError(null);

    try {
      const res = await fetch('/api/programs/import/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parsed: parsedData,
          isTemplate: clientId ? false : isTemplate,
          clientId: clientId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');

      if (clientId) {
        router.push(`/coach/clients/${clientId}`);
      } else {
        router.push('/coach/programs');
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save program');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Tab selector */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('build')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === 'build'
              ? 'bg-[#FF6B6B] text-white'
              : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'
          }`}
        >
          <Wrench className="w-4 h-4" />
          Build
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === 'import'
              ? 'bg-[#FF6B6B] text-white'
              : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'
          }`}
        >
          <Upload className="w-4 h-4" />
          Import
        </button>
      </div>

      {/* Template toggle (only when no clientId) */}
      {!clientId && (
        <div className="mb-6 flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isTemplate}
              onChange={(e) => setIsTemplate(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-[#E2E8F0] peer-focus:ring-2 peer-focus:ring-[#FF6B6B]/50 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF6B6B]"></div>
          </label>
          <span className="text-sm text-[#475569]">
            Save as template (reusable for multiple clients)
          </span>
        </div>
      )}

      {/* Build tab */}
      {activeTab === 'build' && (
        <ProgramBuilder onSave={handleBuildSave} />
      )}

      {/* Import tab */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          {!parsedData ? (
            <>
              {/* Text input */}
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">
                  Paste program text
                </label>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  rows={12}
                  className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl bg-white text-[#0F172A] focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent resize-y font-mono text-sm"
                  placeholder={`Day 1 - Upper Body\nBench Press 4x8\nBarbell Row 4x8\nOverhead Press 3x10\nDumbbell Curl 3x12\n\nDay 2 - Lower Body\nSquat 4x6\nRomanian Deadlift 3x10\nLeg Press 3x12\nCalf Raise 4x15`}
                />
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-[#E2E8F0]" />
                <span className="text-sm text-[#94A3B8]">or</span>
                <div className="flex-1 h-px bg-[#E2E8F0]" />
              </div>

              {/* File upload */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  className="hidden"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-3 border-2 border-dashed border-[#E2E8F0] rounded-xl text-[#64748B] hover:border-[#FF6B6B] hover:text-[#FF6B6B] transition-colors w-full justify-center"
                >
                  <FileText className="w-5 h-5" />
                  {importFile ? importFile.name : 'Upload PDF, DOCX, or TXT file'}
                </button>
              </div>

              {parseError && (
                <div className="px-4 py-3 bg-red-50 text-red-600 text-sm rounded-lg">
                  {parseError}
                </div>
              )}

              <button
                onClick={handleParse}
                disabled={parsing || (!importText.trim() && !importFile)}
                className="w-full px-4 py-3 bg-[#FF6B6B] text-white rounded-xl font-medium hover:bg-[#EF5350] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {parsing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Parsing...
                  </>
                ) : (
                  'Parse Program'
                )}
              </button>
            </>
          ) : (
            <>
              {/* Preview parsed data */}
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
                <h3 className="text-lg font-semibold text-[#0F172A] mb-4">
                  {parsedData.program?.name || 'Parsed Program'}
                </h3>
                {parsedData.workouts?.map((workout: any, i: number) => (
                  <div key={i} className="mb-4 last:mb-0">
                    <h4 className="font-medium text-[#0F172A] mb-2">
                      {workout.name || `Workout ${i + 1}`}
                    </h4>
                    <div className="space-y-1">
                      {workout.exercises?.map((ex: any, j: number) => (
                        <div key={j} className="text-sm text-[#475569] pl-4">
                          {ex.name} — {ex.sets}x{ex.reps || ex.measureValue}
                          {ex.restPeriod ? ` (${ex.restPeriod}s rest)` : ''}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {saveError && (
                <div className="px-4 py-3 bg-red-50 text-red-600 text-sm rounded-lg">
                  {saveError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setParsedData(null)}
                  className="flex-1 px-4 py-3 border border-[#E2E8F0] text-[#475569] rounded-xl font-medium hover:bg-[#F8FAFC] transition-colors"
                >
                  Back to Edit
                </button>
                <button
                  onClick={handleImportSave}
                  disabled={saving}
                  className="flex-1 px-4 py-3 bg-[#FF6B6B] text-white rounded-xl font-medium hover:bg-[#EF5350] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : clientId ? (
                    `Save & Assign to ${clientName}`
                  ) : (
                    'Save Program'
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
