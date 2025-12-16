'use client';

import React from 'react';
import Link from 'next/link';

export interface ProgramCardProps {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  difficulty: string | null;
  durationWeeks: number | null;
  daysPerWeek: number | null;
  equipment: string[];
  goals: string[];
  author: string | null;
  cloneCount?: number;
  popularityScore?: number;
  source: 'static' | 'database' | 'user';
  onClaim?: (id: string, source: 'static' | 'database') => void;
  isLoading?: boolean;
}

// v2a color palette
const COLORS = {
  coral: '#FF6B6B',
  coralDark: '#EF5350',
  coralLight: '#FFE5E5',
  navy: '#0F172A',
  navyLight: '#1E293B',
  gray50: '#F8FAFC',
  gray100: '#F1F5F9',
  gray400: '#94A3B8',
  gray600: '#475569',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-emerald-100 text-emerald-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-red-100 text-red-700',
};

export default function ProgramCard({
  id,
  name,
  slug,
  description,
  category,
  difficulty,
  durationWeeks,
  daysPerWeek,
  equipment,
  goals,
  author,
  cloneCount = 0,
  source,
  onClaim,
  isLoading = false,
}: ProgramCardProps) {
  const difficultyClass = DIFFICULTY_COLORS[difficulty || 'beginner'] || DIFFICULTY_COLORS.beginner;

  const handleClaim = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClaim && source !== 'user') {
      onClaim(id, source as 'static' | 'database');
    }
  };

  const CardContent = () => (
    <>
      {/* Header - Navy gradient */}
      <div
        className="p-5 text-white"
        style={{ background: `linear-gradient(to bottom right, ${COLORS.navy}, ${COLORS.navyLight})` }}
      >
        <div className="flex items-start justify-between mb-3">
          {difficulty && (
            <span className={`text-xs px-2 py-1 rounded-full ${difficultyClass}`}>
              {difficulty}
            </span>
          )}
          {category && (
            <span
              className="text-xs px-2 py-1 rounded-full capitalize"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              {category}
            </span>
          )}
        </div>
        <h3 className="text-lg font-bold mb-1 line-clamp-1">{name}</h3>
        {description && (
          <p className="text-sm text-white/70 line-clamp-2">{description}</p>
        )}
      </div>

      {/* Stats */}
      <div className="p-5">
        <div className="grid grid-cols-3 gap-3 mb-4">
          {daysPerWeek && (
            <div className="text-center">
              <div className="text-xl font-bold" style={{ color: COLORS.navy }}>
                {daysPerWeek}
              </div>
              <div className="text-xs" style={{ color: COLORS.gray400 }}>Days/Week</div>
            </div>
          )}
          {durationWeeks && (
            <div className="text-center">
              <div className="text-xl font-bold" style={{ color: COLORS.navy }}>
                {durationWeeks}
              </div>
              <div className="text-xs" style={{ color: COLORS.gray400 }}>Weeks</div>
            </div>
          )}
          {cloneCount > 0 && (
            <div className="text-center">
              <div className="text-xl font-bold" style={{ color: COLORS.navy }}>
                {cloneCount}
              </div>
              <div className="text-xs" style={{ color: COLORS.gray400 }}>Users</div>
            </div>
          )}
        </div>

        {/* Goals */}
        {goals.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {goals.slice(0, 2).map((goal) => (
              <span
                key={goal}
                className="text-xs px-2 py-1 rounded"
                style={{ backgroundColor: COLORS.gray100, color: COLORS.gray600 }}
              >
                {goal}
              </span>
            ))}
            {goals.length > 2 && (
              <span className="text-xs px-1" style={{ color: COLORS.gray400 }}>
                +{goals.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Equipment preview */}
        {equipment.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {equipment.slice(0, 3).map((eq) => (
              <span
                key={eq}
                className="text-xs px-2 py-0.5 rounded border"
                style={{
                  backgroundColor: COLORS.gray50,
                  color: COLORS.gray600,
                  borderColor: COLORS.gray100
                }}
              >
                {eq}
              </span>
            ))}
            {equipment.length > 3 && (
              <span className="text-xs px-1" style={{ color: COLORS.gray400 }}>
                +{equipment.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Author & CTA */}
        <div
          className="flex items-center justify-between pt-3 border-t"
          style={{ borderColor: COLORS.gray100 }}
        >
          {author && (
            <span className="text-xs" style={{ color: COLORS.gray400 }}>
              by {author}
            </span>
          )}
          {source === 'user' ? (
            <span
              className="text-xs font-medium"
              style={{ color: COLORS.coral }}
            >
              Your Program →
            </span>
          ) : (
            <button
              onClick={handleClaim}
              disabled={isLoading}
              className="text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 font-medium"
              style={{
                backgroundColor: COLORS.coral,
                color: 'white',
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = COLORS.coralDark}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = COLORS.coral}
            >
              {isLoading ? 'Claiming...' : 'Claim Program'}
            </button>
          )}
        </div>
      </div>
    </>
  );

  if (source === 'user') {
    return (
      <Link
        href={`/dashboard/${id}`}
        className="block bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all border-2"
        style={{ borderColor: COLORS.coralLight }}
      >
        <CardContent />
      </Link>
    );
  }

  return (
    <div
      className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all border"
      style={{ borderColor: COLORS.gray100 }}
    >
      <Link href={`/templates/${slug}`}>
        <div
          className="p-5 text-white"
          style={{ background: `linear-gradient(to bottom right, ${COLORS.navy}, ${COLORS.navyLight})` }}
        >
          <div className="flex items-start justify-between mb-3">
            {difficulty && (
              <span className={`text-xs px-2 py-1 rounded-full ${difficultyClass}`}>
                {difficulty}
              </span>
            )}
            {category && (
              <span
                className="text-xs px-2 py-1 rounded-full capitalize"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                {category}
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold mb-1 line-clamp-1">{name}</h3>
          {description && (
            <p className="text-sm text-white/70 line-clamp-2">{description}</p>
          )}
        </div>
      </Link>

      {/* Stats */}
      <div className="p-5">
        <div className="grid grid-cols-3 gap-3 mb-4">
          {daysPerWeek && (
            <div className="text-center">
              <div className="text-xl font-bold" style={{ color: COLORS.navy }}>
                {daysPerWeek}
              </div>
              <div className="text-xs" style={{ color: COLORS.gray400 }}>Days/Week</div>
            </div>
          )}
          {durationWeeks && (
            <div className="text-center">
              <div className="text-xl font-bold" style={{ color: COLORS.navy }}>
                {durationWeeks}
              </div>
              <div className="text-xs" style={{ color: COLORS.gray400 }}>Weeks</div>
            </div>
          )}
          {cloneCount > 0 && (
            <div className="text-center">
              <div className="text-xl font-bold" style={{ color: COLORS.navy }}>
                {cloneCount}
              </div>
              <div className="text-xs" style={{ color: COLORS.gray400 }}>Users</div>
            </div>
          )}
        </div>

        {/* Goals */}
        {goals.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {goals.slice(0, 2).map((goal) => (
              <span
                key={goal}
                className="text-xs px-2 py-1 rounded"
                style={{ backgroundColor: COLORS.gray100, color: COLORS.gray600 }}
              >
                {goal}
              </span>
            ))}
            {goals.length > 2 && (
              <span className="text-xs px-1" style={{ color: COLORS.gray400 }}>
                +{goals.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Equipment preview */}
        {equipment.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {equipment.slice(0, 3).map((eq) => (
              <span
                key={eq}
                className="text-xs px-2 py-0.5 rounded border"
                style={{
                  backgroundColor: COLORS.gray50,
                  color: COLORS.gray600,
                  borderColor: COLORS.gray100
                }}
              >
                {eq}
              </span>
            ))}
            {equipment.length > 3 && (
              <span className="text-xs px-1" style={{ color: COLORS.gray400 }}>
                +{equipment.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Author & CTA */}
        <div
          className="flex items-center justify-between pt-3 border-t"
          style={{ borderColor: COLORS.gray100 }}
        >
          {author ? (
            <span className="text-xs" style={{ color: COLORS.gray400 }}>
              by {author}
            </span>
          ) : (
            <span />
          )}
          <button
            onClick={handleClaim}
            disabled={isLoading}
            className="text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 font-medium"
            style={{
              backgroundColor: COLORS.coral,
              color: 'white',
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = COLORS.coralDark}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = COLORS.coral}
          >
            {isLoading ? 'Claiming...' : 'Claim Program'}
          </button>
        </div>
      </div>
    </div>
  );
}
