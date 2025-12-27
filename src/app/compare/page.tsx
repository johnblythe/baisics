'use client';

import { useState, useEffect } from 'react';

interface ComparisonFile {
  name: string;
  persona: string;
  type: 'lean' | 'full';
}

interface Exercise {
  name?: string;
  sets?: number;
  measure?: { type?: string; value?: number };
  category?: string;
  equipment?: string[];
  instructions?: string[];
  alternatives?: string[];
  notes?: string;
}

interface Workout {
  dayNumber?: number;
  name?: string;
  focus?: string;
  warmup?: {
    duration?: number;
    activities?: string[];
  };
  cooldown?: {
    duration?: number;
    activities?: string[];
  };
  exercises?: Exercise[];
}

interface Phase {
  phaseNumber?: number;
  name?: string;
  focus?: string;
  splitType?: string;
  durationWeeks?: number;
  workouts?: Workout[];
  nutrition?: {
    dailyCalories?: number;
    macros?: { protein?: number; carbs?: number; fats?: number };
  };
}

interface Program {
  name?: string;
  description?: string;
  totalWeeks?: number;
  phases?: Phase[];
  error?: string;
}

export default function ComparePage() {
  const [files, setFiles] = useState<ComparisonFile[]>([]);
  const [fileA, setFileA] = useState<string>('');
  const [fileB, setFileB] = useState<string>('');
  const [dataA, setDataA] = useState<unknown>(null);
  const [dataB, setDataB] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/compare/files')
      .then(res => res.json())
      .then(data => setFiles(data.files || []))
      .catch(console.error);
  }, []);

  const loadFile = async (filename: string, setter: (d: unknown) => void) => {
    if (!filename) {
      setter(null);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/compare/files?name=${encodeURIComponent(filename)}`);
      const data = await res.json();
      setter(data.content);
    } catch (e) {
      console.error(e);
      setter({ error: 'Failed to load' });
    }
    setLoading(false);
  };

  useEffect(() => { loadFile(fileA, setDataA); }, [fileA]);
  useEffect(() => { loadFile(fileB, setDataB); }, [fileB]);

  // Group files by persona
  const personas = Array.from(new Set(files.map(f => f.persona)));

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6">A/B Program Comparison</h1>

      {/* Selectors */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Side A</label>
          <select
            value={fileA}
            onChange={e => setFileA(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2"
          >
            <option value="">Select file...</option>
            {personas.map(persona => (
              <optgroup key={persona} label={persona}>
                {files.filter(f => f.persona === persona).map(f => (
                  <option key={f.name} value={f.name}>
                    {f.type.toUpperCase()} - {f.persona}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Side B</label>
          <select
            value={fileB}
            onChange={e => setFileB(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2"
          >
            <option value="">Select file...</option>
            {personas.map(persona => (
              <optgroup key={persona} label={persona}>
                {files.filter(f => f.persona === persona).map(f => (
                  <option key={f.name} value={f.name}>
                    {f.type.toUpperCase()} - {f.persona}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      {/* Quick select same persona */}
      <div className="mb-6 flex flex-wrap gap-2">
        {personas.map(persona => (
          <button
            key={persona}
            onClick={() => {
              const leanFile = files.find(f => f.persona === persona && f.type === 'lean');
              const fullFile = files.find(f => f.persona === persona && f.type === 'full');
              if (leanFile) setFileA(leanFile.name);
              if (fullFile) setFileB(fullFile.name);
            }}
            className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-sm"
          >
            {persona}
          </button>
        ))}
      </div>

      {loading && <div className="text-center py-4">Loading...</div>}

      {/* Side by side comparison */}
      <div className="grid grid-cols-2 gap-4">
        <ProgramView data={dataA} label="A" filename={fileA} />
        <ProgramView data={dataB} label="B" filename={fileB} />
      </div>
    </div>
  );
}

function ProgramView({ data, label, filename }: { data: unknown; label: string; filename: string }) {
  if (!data) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 min-h-[200px] flex items-center justify-center text-gray-500">
        Select a file for Side {label}
      </div>
    );
  }

  const program = data as Program;

  if (program.error) {
    return (
      <div className="bg-red-900/30 rounded-lg p-4">
        <div className="text-red-400">Error: {program.error}</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 overflow-auto max-h-[80vh]">
      <div className="text-xs text-gray-500 mb-2">{filename}</div>

      {/* Program header */}
      <h2 className="text-xl font-bold text-coral-400 mb-1">{program.name || 'Unnamed Program'}</h2>
      <p className="text-gray-400 text-sm mb-3">{program.description}</p>
      <div className="text-xs text-gray-500 mb-4">{program.totalWeeks} weeks</div>

      {/* Phases */}
      {program.phases?.map((phase, pi) => (
        <PhaseSection key={pi} phase={phase} />
      ))}
    </div>
  );
}

function PhaseSection({ phase }: { phase: Phase }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="mb-4 border border-gray-700 rounded">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-2 bg-gray-700 text-left flex justify-between items-center"
      >
        <span className="font-medium">
          Phase {phase.phaseNumber}: {phase.name}
        </span>
        <span className="text-gray-400 text-sm">
          {phase.splitType} • {phase.durationWeeks}wk
        </span>
      </button>

      {expanded && (
        <div className="p-3 space-y-3">
          <p className="text-sm text-gray-400">{phase.focus}</p>

          {/* Nutrition */}
          {phase.nutrition && (
            <div className="text-xs bg-gray-900 p-2 rounded">
              <span className="text-gray-500">Nutrition: </span>
              {phase.nutrition.dailyCalories} cal |
              P:{phase.nutrition.macros?.protein}g
              C:{phase.nutrition.macros?.carbs}g
              F:{phase.nutrition.macros?.fats}g
            </div>
          )}

          {/* Workouts */}
          {phase.workouts?.map((workout, wi) => (
            <WorkoutSection key={wi} workout={workout} />
          ))}
        </div>
      )}
    </div>
  );
}

function WorkoutSection({ workout }: { workout: Workout }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-600 rounded">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-2 py-1 bg-gray-750 text-left flex justify-between items-center text-sm"
      >
        <span>Day {workout.dayNumber}: {workout.name}</span>
        <span className="text-gray-500">{workout.exercises?.length || 0} exercises</span>
      </button>

      {expanded && (
        <div className="p-2 space-y-2">
          {/* Warmup */}
          {workout.warmup && (
            <div className="bg-yellow-900/20 border border-yellow-800/30 p-2 rounded text-xs">
              <div className="font-medium text-yellow-400 mb-1">
                Warmup ({workout.warmup.duration}min)
              </div>
              <ul className="text-gray-400 space-y-0.5">
                {workout.warmup.activities?.map((act, i) => (
                  <li key={i}>• {act}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Exercises */}
          {workout.exercises?.map((ex, ei) => (
            <div key={ei} className="bg-gray-900 p-2 rounded text-xs">
              <div className="flex justify-between">
                <span className="font-medium">{ex.name}</span>
                <span className="text-gray-500">
                  {ex.sets} × {ex.measure?.value} {ex.measure?.type}
                </span>
              </div>
              <div className="text-gray-500 mt-1">
                <span className={`inline-block px-1 rounded mr-2 ${
                  ex.category === 'primary' ? 'bg-blue-900 text-blue-300' :
                  ex.category === 'secondary' ? 'bg-green-900 text-green-300' :
                  'bg-gray-700 text-gray-400'
                }`}>
                  {ex.category}
                </span>
                {ex.equipment?.join(', ')}
              </div>
              {ex.notes && (
                <div className="mt-1 text-yellow-400/70 italic">
                  {ex.notes}
                </div>
              )}
              {ex.instructions && ex.instructions.length > 0 && (
                <div className="mt-1 text-gray-400">
                  {ex.instructions.slice(0, 2).map((inst, i) => (
                    <div key={i} className="truncate">• {inst}</div>
                  ))}
                </div>
              )}
              {ex.alternatives && ex.alternatives.length > 0 && (
                <div className="mt-1 text-gray-500">
                  Alts: {ex.alternatives.join(', ')}
                </div>
              )}
            </div>
          ))}

          {/* Cooldown */}
          {workout.cooldown && (
            <div className="bg-blue-900/20 border border-blue-800/30 p-2 rounded text-xs">
              <div className="font-medium text-blue-400 mb-1">
                Cooldown ({workout.cooldown.duration}min)
              </div>
              <ul className="text-gray-400 space-y-0.5">
                {workout.cooldown.activities?.map((act, i) => (
                  <li key={i}>• {act}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
