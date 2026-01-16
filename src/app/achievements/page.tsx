'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import MainLayout from '@/app/components/layouts/MainLayout';
import { MilestoneBadgeGrid, MilestoneCelebrationModal } from '@/components/milestones';
import { getMilestoneConfig, formatVolume, MILESTONES } from '@/lib/milestones';
import { MilestoneType } from '@prisma/client';
import { Trophy, Dumbbell, Flame, ArrowLeft, Share2 } from 'lucide-react';
import Link from 'next/link';

interface MilestoneData {
  type: MilestoneType;
  earnedAt: string;
  totalWorkouts: number;
  totalVolume: number | null;
}

interface MilestoneResponse {
  milestones: MilestoneData[];
  stats: {
    totalWorkouts: number;
    totalVolume: number;
  };
}

// Wrapper component to handle Suspense for useSearchParams
export default function AchievementsPage() {
  return (
    <Suspense
      fallback={
        <MainLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-6 h-6 border-2 border-[#F1F5F9] border-t-[#FF6B6B] rounded-full animate-spin" />
          </div>
        </MainLayout>
      }
    >
      <AchievementsContent />
    </Suspense>
  );
}

function AchievementsContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState<MilestoneResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneType | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Check for milestone param to show celebration
  useEffect(() => {
    const milestone = searchParams.get('milestone') as MilestoneType | null;
    if (milestone && MILESTONES.some((m) => m.type === milestone)) {
      setSelectedMilestone(milestone);
      setShowCelebration(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchMilestones();
    }
  }, [status, router]);

  const fetchMilestones = async () => {
    try {
      const response = await fetch('/api/milestones');
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Failed to fetch milestones:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBadgeClick = (type: MilestoneType, earned: boolean) => {
    if (earned) {
      setSelectedMilestone(type);
      setShowCelebration(true);
    }
  };

  const handleCloseCelebration = () => {
    setShowCelebration(false);
    setSelectedMilestone(null);
    // Remove the milestone param from URL
    if (searchParams.get('milestone')) {
      router.replace('/achievements');
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-6 h-6 border-2 border-[#F1F5F9] border-t-[#FF6B6B] rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  const earnedMilestones = data?.milestones.map((m) => ({
    type: m.type,
    earnedAt: new Date(m.earnedAt),
  })) || [];

  const totalWorkouts = data?.stats.totalWorkouts || 0;
  const totalVolume = data?.stats.totalVolume || 0;
  const earnedCount = earnedMilestones.length;

  return (
    <MainLayout>
      <div className="bg-[#F8FAFC] min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <Link
              href="/dashboard"
              className="p-2 -ml-2 text-[#64748B] hover:text-[#0F172A] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Trophy className="w-8 h-8 text-[#FF6B6B]" />
            <h1 className="text-2xl font-bold text-[#0F172A]">Achievements</h1>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 text-center">
              <div className="text-2xl font-bold text-[#0F172A]">{totalWorkouts}</div>
              <div className="text-xs text-[#64748B]">Total Workouts</div>
            </div>
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 text-center">
              <div className="text-2xl font-bold text-[#0F172A]">{earnedCount}</div>
              <div className="text-xs text-[#64748B]">Badges Earned</div>
            </div>
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 text-center">
              <div className="text-2xl font-bold text-[#0F172A]">
                {totalVolume >= 1000 ? formatVolume(totalVolume) : `${Math.round(totalVolume)}`}
              </div>
              <div className="text-xs text-[#64748B]">Volume Lifted</div>
            </div>
          </div>

          {/* Lifetime Milestones */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 mb-6">
            <div className="flex items-center gap-2 mb-6">
              <Dumbbell className="w-5 h-5 text-[#64748B]" />
              <h2 className="text-lg font-semibold text-[#0F172A]">Lifetime Milestones</h2>
            </div>
            <p className="text-sm text-[#64748B] mb-6">
              These badges are earned forever. Take a break, come back—your progress is always here.
            </p>

            <MilestoneBadgeGrid
              earnedMilestones={earnedMilestones}
              totalWorkouts={totalWorkouts}
              onBadgeClick={handleBadgeClick}
            />
          </div>

          {/* Milestone Details (when tapped) */}
          {selectedMilestone && !showCelebration && (
            <MilestoneDetailCard
              type={selectedMilestone}
              milestoneData={data?.milestones.find((m) => m.type === selectedMilestone)}
              onClose={() => setSelectedMilestone(null)}
            />
          )}

          {/* Encouragement for new users */}
          {earnedCount === 0 && (
            <div className="bg-gradient-to-br from-[#FF6B6B]/10 to-[#FF6B6B]/5 rounded-xl border border-[#FF6B6B]/20 p-6 text-center">
              <Flame className="w-12 h-12 text-[#FF6B6B] mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-[#0F172A] mb-2">
                Ready to start your journey?
              </h3>
              <p className="text-sm text-[#64748B] mb-4">
                Complete your first workout to earn the &ldquo;Day One&rdquo; badge!
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6B6B] hover:bg-[#EF5350] text-white rounded-lg font-medium transition-colors"
              >
                Start Workout
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Celebration Modal */}
      {showCelebration && selectedMilestone && (
        <MilestoneCelebrationModal
          type={selectedMilestone}
          totalWorkouts={totalWorkouts}
          totalVolume={totalVolume}
          earnedMilestones={earnedMilestones}
          userName={session?.user?.name || 'Athlete'}
          onClose={handleCloseCelebration}
        />
      )}
    </MainLayout>
  );
}

// Detail card component for viewing a specific milestone
function MilestoneDetailCard({
  type,
  milestoneData,
  onClose,
}: {
  type: MilestoneType;
  milestoneData?: MilestoneData;
  onClose: () => void;
}) {
  const config = getMilestoneConfig(type);
  if (!config) return null;

  const earned = !!milestoneData;
  const earnedAt = milestoneData ? new Date(milestoneData.earnedAt) : null;

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className={`bg-gradient-to-br ${config.gradient} p-6 text-center text-white`}>
          <h3 className="text-xl font-bold mb-1">{config.name}</h3>
          <p className="text-white/80 text-sm">{config.threshold} workouts</p>
        </div>
        <div className="p-6">
          <p className="text-[#64748B] text-sm italic text-center mb-4">
            &ldquo;{config.quote}&rdquo;
          </p>

          {earned && earnedAt && (
            <div className="text-center text-sm text-[#64748B] mb-4">
              Earned {earnedAt.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          )}

          <div className="flex gap-2">
            {earned && (
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#FF6B6B] hover:bg-[#EF5350] text-white rounded-lg transition-colors">
                <Share2 className="w-4 h-4" />
                Share
              </button>
            )}
            <button
              onClick={onClose}
              className={`${earned ? 'flex-1' : 'w-full'} px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#0F172A] rounded-lg transition-colors`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
