'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MainLayout from '@/app/components/layouts/MainLayout';
import { BookmarkPlus, Copy, Globe, Lock, MoreVertical } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  difficulty: string | null;
  daysPerWeek: number | null;
  durationWeeks: number | null;
  isPublic: boolean;
  cloneCount: number;
  createdAt: string;
  updatedAt: string;
  _count: {
    clones: number;
  };
}

export default function MyTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const response = await fetch('/api/programs/templates');
        if (!response.ok) {
          throw new Error('Failed to fetch templates');
        }
        const data = await response.json();
        setTemplates(data.templates);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setIsLoading(false);
      }
    }

    fetchTemplates();
  }, []);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-6 h-6 border-2 border-[#F1F5F9] border-t-[#FF6B6B] rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-[#F8FAFC] min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-[#0F172A]">My Templates</h1>
              <p className="text-[#64748B] mt-1">
                Reusable programs you can assign to clients or use as starting points.
              </p>
            </div>
            <Link
              href="/program/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#EF5350] transition-colors"
            >
              <BookmarkPlus className="w-4 h-4" />
              Create Program
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {templates.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FFE5E5] flex items-center justify-center">
                <BookmarkPlus className="w-8 h-8 text-[#FF6B6B]" />
              </div>
              <h2 className="text-lg font-semibold text-[#0F172A] mb-2">
                No templates yet
              </h2>
              <p className="text-[#64748B] mb-6 max-w-sm mx-auto">
                Create a program and save it as a template to reuse it or assign it to clients.
              </p>
              <Link
                href="/program/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#EF5350] transition-colors"
              >
                Create Your First Program
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="bg-white rounded-xl border border-[#E2E8F0] p-6 hover:border-[#FF6B6B] transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          href={`/program/${template.id}`}
                          className="font-semibold text-[#0F172A] hover:text-[#FF6B6B] transition-colors truncate"
                        >
                          {template.name}
                        </Link>
                        {template.isPublic ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-emerald-700 bg-emerald-100 rounded-full">
                            <Globe className="w-3 h-3" />
                            Public
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-[#64748B] bg-[#F1F5F9] rounded-full">
                            <Lock className="w-3 h-3" />
                            Private
                          </span>
                        )}
                      </div>
                      {template.description && (
                        <p className="text-sm text-[#64748B] line-clamp-2 mb-2">
                          {template.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-[#94A3B8]">
                        {template.category && (
                          <span className="capitalize">{template.category}</span>
                        )}
                        {template.difficulty && (
                          <span className="capitalize">{template.difficulty}</span>
                        )}
                        {template.daysPerWeek && (
                          <span>{template.daysPerWeek} days/week</span>
                        )}
                        {template.cloneCount > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <Copy className="w-3 h-3" />
                            {template.cloneCount} uses
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/program/${template.id}`}
                        className="px-4 py-2 text-sm font-medium text-[#FF6B6B] hover:bg-[#FFE5E5] rounded-lg transition-colors"
                      >
                        View
                      </Link>
                    </div>
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
