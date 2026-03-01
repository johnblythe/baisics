'use client';

import React from 'react';

export interface BuddyUser {
  id: string;
  name: string | null;
  image: string | null;
}

interface BuddyBadgeProps {
  user: BuddyUser;
  size?: number;
}

// Deterministic color from userId hash
function getColorFromId(id: string): string {
  const colors = [
    '#FF6B6B', '#7C3AED', '#059669', '#D97706',
    '#2563EB', '#DC2626', '#7C2D12', '#4338CA',
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getInitial(name: string | null, id: string): string {
  if (name) return name.charAt(0).toUpperCase();
  return id.charAt(0).toUpperCase();
}

export function BuddyBadge({ user, size = 18 }: BuddyBadgeProps) {
  const displayName = user.name || 'Buddy';

  return (
    <div
      className="relative inline-flex items-center justify-center rounded-full flex-shrink-0 ring-1 ring-white"
      style={{ width: size, height: size }}
      title={`From ${displayName}'s library`}
    >
      {user.image ? (
        <img
          src={user.image}
          alt={displayName}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <div
          className="w-full h-full rounded-full flex items-center justify-center text-white font-bold"
          style={{
            backgroundColor: getColorFromId(user.id),
            fontSize: size * 0.55,
          }}
        >
          {getInitial(user.name, user.id)}
        </div>
      )}
    </div>
  );
}

export default BuddyBadge;
