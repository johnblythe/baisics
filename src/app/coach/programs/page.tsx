'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MainLayout from '@/app/components/layouts/MainLayout';
import { Plus, BookOpen, Copy, Trash2, Tag, Users, Loader2 } from 'lucide-react';

type Filter = 'all' | 'templates' | 'assigned';

interface Program {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  difficulty: string | null;
  daysPerWeek: number | null;
  durationWeeks: number | null;
  isTemplate: boolean;
  isPublic: boolean;
  active: boolean;
  source: string | null;
  cloneCount: number;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
  ownerUser?: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
}

export default function CoachProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');
  const [savingTemplateId, setSavingTemplateId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPrograms();
  }, [filter]);

  async function fetchPrograms() {
    setLoading(true);
    try {
      const res = await fetch(`/api/programs/templates?filter=${filter}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setPrograms(data.templates || []);
    } catch (err) {
      console.error('Failed to fetch programs:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveAsTemplate(programId: string) {
    setSavingTemplateId(programId);
    try {
      const res = await fetch(`/api/programs/${programId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isTemplate: true }),
      });
      if (!res.ok) throw new Error('Failed to save as template');
      fetchPrograms();
    } catch (err) {
      console.error('Failed to save as template:', err);
    } finally {
      setSavingTemplateId(null);
    }
  }

  async function handleDelete(programId: string) {
    if (!window.confirm('Delete this program? This cannot be undone.')) return;
    setDeletingId(programId);
    try {
      const res = await fetch(`/api/programs/${programId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setPrograms((prev) => prev.filter((p) => p.id !== programId));
    } catch (err) {
      console.error('Failed to delete:', err);
    } finally {
      setDeletingId(null);
    }
  }

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'templates', label: 'Templates' },
    { key: 'assigned', label: 'Assigned' },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#0F172A]">Programs</h1>
              <p className="text-[#64748B] mt-1">
                Manage your program library
              </p>
            </div>
            <Link
              href="/coach/programs/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#EF5350] transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Create Program
            </Link>
          </div>

          {/* Filter pills */}
          <div className="flex gap-2 mb-6">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === f.key
                    ? 'bg-[#FF6B6B] text-white'
                    : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#FF6B6B]" />
            </div>
          )}

          {/* Empty state */}
          {!loading && programs.length === 0 && (
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FFE5E5] flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-[#FF6B6B]" />
              </div>
              <h3 className="text-xl font-semibold text-[#0F172A] mb-2">
                {filter === 'templates'
                  ? 'No templates yet'
                  : filter === 'assigned'
                  ? 'No assigned programs'
                  : 'No programs yet'}
              </h3>
              <p className="text-[#64748B] mb-6">
                Create your first program to start building your coaching library
              </p>
              <Link
                href="/coach/programs/create"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#EF5350] transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                Create Program
              </Link>
            </div>
          )}

          {/* Programs grid */}
          {!loading && programs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {programs.map((program) => (
                <div
                  key={program.id}
                  className="bg-white rounded-xl border border-[#E2E8F0] p-6 hover:shadow-lg hover:border-[#FF6B6B]/30 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <Link
                      href={`/coach/programs/${program.id}`}
                      className="flex-1 min-w-0"
                    >
                      <h3 className="font-semibold text-[#0F172A] group-hover:text-[#FF6B6B] transition-colors truncate">
                        {program.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                      {program.isTemplate && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-[#FFE5E5] text-[#FF6B6B] rounded-full">
                          Template
                        </span>
                      )}
                      {program.source === 'assigned' && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-600 rounded-full">
                          Assigned
                        </span>
                      )}
                    </div>
                  </div>

                  {program.description && (
                    <p className="text-sm text-[#64748B] line-clamp-2 mb-3">
                      {program.description}
                    </p>
                  )}

                  {/* Metadata */}
                  <div className="flex flex-wrap gap-2 mb-3 text-xs text-[#94A3B8]">
                    {program.category && (
                      <span className="px-2 py-0.5 bg-[#F1F5F9] rounded capitalize">
                        {program.category}
                      </span>
                    )}
                    {program.daysPerWeek && (
                      <span className="px-2 py-0.5 bg-[#F1F5F9] rounded">
                        {program.daysPerWeek}d/wk
                      </span>
                    )}
                    {program.durationWeeks && (
                      <span className="px-2 py-0.5 bg-[#F1F5F9] rounded">
                        {program.durationWeeks}wk
                      </span>
                    )}
                  </div>

                  {/* Client info if assigned (only show for actual client assignments) */}
                  {program.source === 'assigned' && program.ownerUser && (
                    <div className="flex items-center gap-2 mb-3 text-sm text-[#475569]">
                      <Users className="w-3.5 h-3.5" />
                      <span>
                        Assigned to {program.ownerUser.name || program.ownerUser.email}
                      </span>
                    </div>
                  )}

                  {program.cloneCount > 0 && (
                    <div className="text-xs text-[#94A3B8] mb-3">
                      Used {program.cloneCount} time{program.cloneCount !== 1 ? 's' : ''}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-[#F1F5F9]">
                    {!program.isTemplate && (
                      <button
                        onClick={() => handleSaveAsTemplate(program.id)}
                        disabled={savingTemplateId === program.id}
                        className="inline-flex items-center gap-1 text-xs font-medium text-[#64748B] hover:text-[#FF6B6B] transition-colors disabled:opacity-50"
                      >
                        <Tag className="w-3.5 h-3.5" />
                        {savingTemplateId === program.id ? 'Saving...' : 'Templatize'}
                      </button>
                    )}
                    <Link
                      href={`/coach/programs/${program.id}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#64748B] hover:text-[#0F172A] transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      View
                    </Link>
                    <button
                      onClick={() => handleDelete(program.id)}
                      disabled={deletingId === program.id}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#64748B] hover:text-red-500 transition-colors disabled:opacity-50 ml-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {deletingId === program.id ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
