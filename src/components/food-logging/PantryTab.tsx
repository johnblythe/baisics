'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Clock, ChefHat, Pin, Plus, Users, Copy, Check, LogOut, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { MyRecipesSidebar } from './MyRecipesSidebar';
import { BuddyBadge, type BuddyUser } from './BuddyBadge';
import type { QuickFoodItem } from './QuickPills';
import type { FoodStaple } from '@/hooks/useStaples';
import type { Recipe } from './MyRecipesSidebar';

interface BuddyGroupMember {
  id: string;
  joinedAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    email: string | null;
  };
}

interface BuddyGroupData {
  id: string;
  inviteCode: string;
  createdAt: string;
  memberships: BuddyGroupMember[];
}

interface PantryTabProps {
  quickFoods: QuickFoodItem[];
  onQuickAdd: (item: QuickFoodItem) => void;
  onCreateRecipe?: () => void;
  onSidebarRecipeAdd?: (recipe: Recipe) => void;
  recipeSidebarRefreshTrigger?: number;
  staples?: Record<string, FoodStaple[]>;
  onManageStaples?: (mealSlot: string) => void;
  onLogStaple?: (staple: FoodStaple) => void;
}

const MEAL_SLOTS = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'] as const;

const MEAL_LABELS: Record<string, string> = {
  BREAKFAST: 'Breakfast',
  LUNCH: 'Lunch',
  DINNER: 'Dinner',
  SNACK: 'Snack',
};

const cardStyle = 'bg-white rounded-xl border border-[#E2E8F0] p-4';
const itemHover = 'hover:bg-[#F8FAFC] transition-colors';

// --- Gym Buddy Management Section ---
function GymBuddySection() {
  const [group, setGroup] = useState<BuddyGroupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [showJoinInput, setShowJoinInput] = useState(false);

  const fetchGroup = useCallback(async () => {
    try {
      const res = await fetch('/api/buddy');
      const data = await res.json();
      setGroup(data.group);
    } catch {
      // no group
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGroup(); }, [fetchGroup]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/buddy', { method: 'POST' });
      const data = await res.json();
      if (res.ok) setGroup(data.group);
    } finally {
      setCreating(false);
    }
  };

  const handleLeave = async () => {
    if (!confirm('Leave this buddy group? Their items will no longer appear in your library.')) return;
    setLeaving(true);
    try {
      await fetch('/api/buddy/members', { method: 'DELETE' });
      setGroup(null);
    } finally {
      setLeaving(false);
    }
  };

  const handleCopyCode = async () => {
    if (!group) return;
    const url = `${window.location.origin}/buddy/join?code=${group.inviteCode}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Join my Gym Buddy group on BAISICS', url });
        return;
      } catch { /* fallback to clipboard */ }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoin = async () => {
    if (!joinCode || joinCode.length !== 8) {
      setJoinError('Enter a valid 8-character code');
      return;
    }
    setJoining(true);
    setJoinError(null);
    try {
      const res = await fetch('/api/buddy/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: joinCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to join');
      setGroup(data.group);
      setShowJoinInput(false);
      setJoinCode('');
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : 'Failed to join');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className={cardStyle}>
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-[#FF6B6B]" />
          <h3 className="font-medium text-[#0F172A]">Gym Buddy</h3>
        </div>
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 text-[#94A3B8] animate-spin" />
        </div>
      </div>
    );
  }

  // Active group state
  if (group) {
    return (
      <div className={cardStyle}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#FF6B6B]" />
            <h3 className="font-medium text-[#0F172A]">Gym Buddy</h3>
          </div>
          <button
            type="button"
            onClick={handleLeave}
            disabled={leaving}
            className="text-xs text-[#94A3B8] hover:text-red-500 transition-colors flex items-center gap-1"
          >
            <LogOut className="w-3 h-3" />
            {leaving ? 'Leaving...' : 'Leave'}
          </button>
        </div>

        {/* Member avatars */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex -space-x-2">
            {group.memberships.map((m) => (
              <BuddyBadge
                key={m.id}
                user={m.user as BuddyUser}
                size={28}
              />
            ))}
          </div>
          <span className="text-xs text-[#64748B]">
            {group.memberships.length} member{group.memberships.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Invite code + share */}
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-[#F8FAFC] rounded-lg px-3 py-2 font-mono text-sm tracking-[0.2em] text-[#0F172A] text-center">
            {group.inviteCode}
          </div>
          <button
            type="button"
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#FF6B6B] text-white text-sm rounded-lg hover:bg-[#EF5350] transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Share'}
          </button>
        </div>
      </div>
    );
  }

  // Empty state — no group
  return (
    <div className={cardStyle}>
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-[#FF6B6B]" />
        <h3 className="font-medium text-[#0F172A]">Gym Buddy</h3>
      </div>

      <p className="text-sm text-[#64748B] mb-4">
        Pair up with a partner to share recipes, quick foods, and staples.
      </p>

      {showJoinInput ? (
        <div className="space-y-2 mb-3">
          <input
            type="text"
            value={joinCode}
            onChange={(e) => {
              setJoinCode(e.target.value.toUpperCase().replace(/[^23456789ABCDEFGHJKMNPQRSTUVWXYZ]/g, '').slice(0, 8));
              setJoinError(null);
            }}
            placeholder="Enter code"
            className="w-full px-3 py-2 text-center font-mono text-sm tracking-[0.2em] border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent outline-none"
            maxLength={8}
            autoFocus
          />
          {joinError && <p className="text-xs text-red-500 text-center">{joinError}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setShowJoinInput(false); setJoinCode(''); setJoinError(null); }}
              className="flex-1 py-2 text-sm text-[#64748B] hover:text-[#0F172A] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleJoin}
              disabled={joining || joinCode.length !== 8}
              className="flex-1 py-2 bg-[#FF6B6B] text-white text-sm rounded-lg hover:bg-[#EF5350] transition-colors disabled:opacity-50"
            >
              {joining ? 'Joining...' : 'Join'}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating}
            className="flex-1 py-2 bg-[#FF6B6B] text-white text-sm rounded-lg hover:bg-[#EF5350] transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Create Group
          </button>
          <button
            type="button"
            onClick={() => setShowJoinInput(true)}
            className="flex-1 py-2 border border-[#E2E8F0] text-[#0F172A] text-sm rounded-lg hover:bg-[#F8FAFC] transition-colors"
          >
            Join Group
          </button>
        </div>
      )}
    </div>
  );
}

export function PantryTab({
  quickFoods,
  onQuickAdd,
  onCreateRecipe,
  onSidebarRecipeAdd,
  recipeSidebarRefreshTrigger,
  staples,
  onManageStaples,
  onLogStaple,
}: PantryTabProps) {
  const displayFoods = quickFoods.slice(0, 8);

  const hasStaples = staples && MEAL_SLOTS.some((slot) => staples[slot]?.length > 0);

  return (
    <div className="space-y-6">
      {/* Gym Buddy Section — full width above the grid */}
      <GymBuddySection />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Recent Foods */}
        <div className={cardStyle}>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-[#FF6B6B]" />
            <h3 className="font-medium text-[#0F172A]">Recent Foods</h3>
          </div>

          {displayFoods.length === 0 ? (
            <p className="text-sm text-[#94A3B8] text-center py-4">
              No recent foods yet
            </p>
          ) : (
            <div className="space-y-1">
              {displayFoods.map((food) => (
                <button
                  key={food.id}
                  type="button"
                  onClick={() => onQuickAdd(food)}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg group ${itemHover}`}
                >
                  <span className="relative flex-shrink-0">
                    {food.emoji && <span className="text-lg">{food.emoji}</span>}
                    {food.buddyUser && (
                      <span className="absolute -bottom-1 -right-1">
                        <BuddyBadge user={food.buddyUser} size={14} />
                      </span>
                    )}
                  </span>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-sm font-medium text-[#0F172A] truncate">
                      {food.name}
                    </div>
                    <div className="text-xs text-[#94A3B8]">{Math.round(food.calories)} cal</div>
                  </div>
                  <Plus className="w-4 h-4 text-[#94A3B8] opacity-0 group-hover:opacity-100 group-hover:text-[#FF6B6B] transition-all flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Column 2: My Recipes */}
        <div className={cardStyle}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-[#FF6B6B]" />
              <h3 className="font-medium text-[#0F172A]">My Recipes</h3>
            </div>
            <Link
              href="/nutrition/recipes"
              className="text-xs text-[#FF6B6B] hover:text-[#EF5350] font-medium transition-colors"
            >
              See all &rarr;
            </Link>
          </div>

          <MyRecipesSidebar
            onRecipeAdd={onSidebarRecipeAdd}
            onCreateRecipe={onCreateRecipe}
            maxItems={6}
            refreshTrigger={recipeSidebarRefreshTrigger}
          />

          {onCreateRecipe && (
            <button
              type="button"
              onClick={onCreateRecipe}
              className="w-full mt-3 py-2 border-2 border-dashed border-[#E2E8F0] rounded-lg text-sm text-[#94A3B8] hover:border-[#FF6B6B] hover:text-[#FF6B6B] transition-colors flex items-center justify-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Create Recipe
            </button>
          )}
        </div>

        {/* Column 3: My Staples */}
        <div className={cardStyle}>
          <div className="flex items-center gap-2 mb-3">
            <Pin className="w-4 h-4 text-[#FF6B6B]" />
            <h3 className="font-medium text-[#0F172A]">My Staples</h3>
          </div>

          {!hasStaples ? (
            <div className="border-2 border-dashed border-[#E2E8F0] rounded-lg p-6 text-center">
              <Pin className="w-6 h-6 text-[#94A3B8] mx-auto mb-2" />
              <p className="text-sm text-[#94A3B8]">
                Pin foods you eat regularly
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {MEAL_SLOTS.map((slot) => {
                const slotStaples = staples?.[slot];
                if (!slotStaples || slotStaples.length === 0) return null;

                return (
                  <div key={slot}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-[#475569] uppercase tracking-wide">
                        {MEAL_LABELS[slot]}
                      </span>
                      {onManageStaples && (
                        <button
                          type="button"
                          onClick={() => onManageStaples(slot)}
                          className="text-xs text-[#FF6B6B] hover:text-[#EF5350] font-medium transition-colors"
                        >
                          Manage
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {slotStaples.map((staple) => (
                        <button
                          key={staple.id}
                          type="button"
                          onClick={() => onLogStaple?.(staple)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF5F5] hover:bg-[#FFE5E5] border border-[#FF6B6B]/20 rounded-full transition-colors group text-sm"
                        >
                          {staple.emoji && (
                            <span className="text-sm">{staple.emoji}</span>
                          )}
                          <span className="font-medium text-[#0F172A]">
                            {staple.name}
                          </span>
                          <span className="text-[#94A3B8] text-xs">
                            {Math.round(staple.calories)}
                          </span>
                          <Plus className="w-3.5 h-3.5 text-[#FF6B6B] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PantryTab;
