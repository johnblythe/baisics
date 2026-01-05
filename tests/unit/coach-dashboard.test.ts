import { describe, it, expect } from 'vitest';

/**
 * Tests for Coach Dashboard Logic
 * Issue #210 - Coach UX: Settings, Client Branding & Dashboard Polish
 *
 * Business Rules:
 * - Coaches see their clients organized by status
 * - "Needs Attention" = client inactive 5+ days (with grace period for new clients)
 * - Active clients = inviteStatus === 'ACCEPTED' with client record
 * - Pending invites = inviteStatus === 'PENDING'
 */

interface Client {
  id: string;
  clientId: string | null;
  nickname: string | null;
  status: string;
  inviteStatus: string;
  inviteEmail: string | null;
  createdAt: string;
  client: {
    id: string;
    name: string | null;
    email: string | null;
    createdAt: string;
    currentProgram: {
      id: string;
      name: string;
      completedWorkouts: number;
      totalWorkouts: number;
      lastWorkout: string | null;
    } | null;
    lastCheckIn: string | null;
  } | null;
}

// Mirror the logic from coach/dashboard/page.tsx
function needsAttention(client: Client): boolean {
  if (!client.client) return false;

  // Grace period: skip clients < 5 days old
  const clientCreatedAt = new Date(client.client.createdAt);
  const daysSinceJoined = Math.floor(
    (Date.now() - clientCreatedAt.getTime()) / (24 * 60 * 60 * 1000)
  );
  if (daysSinceJoined < 5) return false;

  // Check days since last workout
  const lastWorkout = client.client.currentProgram?.lastWorkout;
  if (!lastWorkout) return true; // No workouts ever = needs attention

  const daysSinceWorkout = Math.floor(
    (Date.now() - new Date(lastWorkout).getTime()) / (24 * 60 * 60 * 1000)
  );

  return daysSinceWorkout >= 5;
}

// Filter helpers
function getActiveClients(clients: Client[]): Client[] {
  return clients.filter((c) => c.client && c.inviteStatus === 'ACCEPTED');
}

function getPendingInvites(clients: Client[]): Client[] {
  return clients.filter((c) => c.inviteStatus === 'PENDING');
}

function getClientsNeedingAttention(clients: Client[]): Client[] {
  return getActiveClients(clients).filter(needsAttention);
}

function getActiveThisWeek(clients: Client[]): Client[] {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return getActiveClients(clients).filter(
    (c) =>
      c.client?.currentProgram?.lastWorkout &&
      new Date(c.client.currentProgram.lastWorkout).getTime() > weekAgo
  );
}

describe('Coach Dashboard - needsAttention Logic', () => {
  const now = Date.now();
  const daysAgo = (days: number) => new Date(now - days * 24 * 60 * 60 * 1000).toISOString();

  it('should return false if client has no user record', () => {
    const client: Client = {
      id: '1',
      clientId: null,
      nickname: 'Test',
      status: 'ACTIVE',
      inviteStatus: 'PENDING',
      inviteEmail: 'test@example.com',
      createdAt: daysAgo(10),
      client: null,
    };
    expect(needsAttention(client)).toBe(false);
  });

  it('should return false for new clients (< 5 days old)', () => {
    const client: Client = {
      id: '1',
      clientId: 'u1',
      nickname: null,
      status: 'ACTIVE',
      inviteStatus: 'ACCEPTED',
      inviteEmail: null,
      createdAt: daysAgo(10),
      client: {
        id: 'u1',
        name: 'New User',
        email: 'new@example.com',
        createdAt: daysAgo(3), // Client joined 3 days ago
        currentProgram: null, // No program yet
        lastCheckIn: null,
      },
    };
    expect(needsAttention(client)).toBe(false);
  });

  it('should return true for client with no workouts after grace period', () => {
    const client: Client = {
      id: '1',
      clientId: 'u1',
      nickname: null,
      status: 'ACTIVE',
      inviteStatus: 'ACCEPTED',
      inviteEmail: null,
      createdAt: daysAgo(30),
      client: {
        id: 'u1',
        name: 'Inactive User',
        email: 'inactive@example.com',
        createdAt: daysAgo(10), // Joined 10 days ago
        currentProgram: null, // Still no program
        lastCheckIn: null,
      },
    };
    expect(needsAttention(client)).toBe(true);
  });

  it('should return true for client inactive 5+ days', () => {
    const client: Client = {
      id: '1',
      clientId: 'u1',
      nickname: null,
      status: 'ACTIVE',
      inviteStatus: 'ACCEPTED',
      inviteEmail: null,
      createdAt: daysAgo(30),
      client: {
        id: 'u1',
        name: 'Lapsed User',
        email: 'lapsed@example.com',
        createdAt: daysAgo(20),
        currentProgram: {
          id: 'p1',
          name: 'Test Program',
          completedWorkouts: 5,
          totalWorkouts: 12,
          lastWorkout: daysAgo(7), // Last workout 7 days ago
        },
        lastCheckIn: null,
      },
    };
    expect(needsAttention(client)).toBe(true);
  });

  it('should return false for recently active client', () => {
    const client: Client = {
      id: '1',
      clientId: 'u1',
      nickname: null,
      status: 'ACTIVE',
      inviteStatus: 'ACCEPTED',
      inviteEmail: null,
      createdAt: daysAgo(30),
      client: {
        id: 'u1',
        name: 'Active User',
        email: 'active@example.com',
        createdAt: daysAgo(20),
        currentProgram: {
          id: 'p1',
          name: 'Test Program',
          completedWorkouts: 8,
          totalWorkouts: 12,
          lastWorkout: daysAgo(2), // Worked out 2 days ago
        },
        lastCheckIn: null,
      },
    };
    expect(needsAttention(client)).toBe(false);
  });

  it('should return false for client exactly at 5-day threshold', () => {
    const client: Client = {
      id: '1',
      clientId: 'u1',
      nickname: null,
      status: 'ACTIVE',
      inviteStatus: 'ACCEPTED',
      inviteEmail: null,
      createdAt: daysAgo(30),
      client: {
        id: 'u1',
        name: 'Edge Case User',
        email: 'edge@example.com',
        createdAt: daysAgo(20),
        currentProgram: {
          id: 'p1',
          name: 'Test Program',
          completedWorkouts: 5,
          totalWorkouts: 12,
          lastWorkout: daysAgo(4), // Last workout 4 days ago (< 5)
        },
        lastCheckIn: null,
      },
    };
    expect(needsAttention(client)).toBe(false);
  });
});

describe('Coach Dashboard - Client Filtering', () => {
  const now = Date.now();
  const daysAgo = (days: number) => new Date(now - days * 24 * 60 * 60 * 1000).toISOString();

  const mockClients: Client[] = [
    // Active client - recent workout
    {
      id: '1',
      clientId: 'u1',
      nickname: 'John',
      status: 'ACTIVE',
      inviteStatus: 'ACCEPTED',
      inviteEmail: null,
      createdAt: daysAgo(30),
      client: {
        id: 'u1',
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: daysAgo(30),
        currentProgram: {
          id: 'p1',
          name: 'PPL',
          completedWorkouts: 10,
          totalWorkouts: 24,
          lastWorkout: daysAgo(1),
        },
        lastCheckIn: daysAgo(7),
      },
    },
    // Active client - needs attention (no recent workout)
    {
      id: '2',
      clientId: 'u2',
      nickname: 'Sarah',
      status: 'ACTIVE',
      inviteStatus: 'ACCEPTED',
      inviteEmail: null,
      createdAt: daysAgo(60),
      client: {
        id: 'u2',
        name: 'Sarah Smith',
        email: 'sarah@example.com',
        createdAt: daysAgo(60),
        currentProgram: {
          id: 'p2',
          name: 'Beginner',
          completedWorkouts: 3,
          totalWorkouts: 12,
          lastWorkout: daysAgo(10),
        },
        lastCheckIn: daysAgo(14),
      },
    },
    // Pending invite
    {
      id: '3',
      clientId: null,
      nickname: 'Mike',
      status: 'ACTIVE',
      inviteStatus: 'PENDING',
      inviteEmail: 'mike@example.com',
      createdAt: daysAgo(2),
      client: null,
    },
    // New client (grace period)
    {
      id: '4',
      clientId: 'u4',
      nickname: null,
      status: 'ACTIVE',
      inviteStatus: 'ACCEPTED',
      inviteEmail: null,
      createdAt: daysAgo(3),
      client: {
        id: 'u4',
        name: 'New User',
        email: 'new@example.com',
        createdAt: daysAgo(3),
        currentProgram: null,
        lastCheckIn: null,
      },
    },
  ];

  it('should correctly identify active clients', () => {
    const active = getActiveClients(mockClients);
    expect(active.length).toBe(3);
    expect(active.map((c) => c.id)).toEqual(['1', '2', '4']);
  });

  it('should correctly identify pending invites', () => {
    const pending = getPendingInvites(mockClients);
    expect(pending.length).toBe(1);
    expect(pending[0].id).toBe('3');
  });

  it('should correctly identify clients needing attention', () => {
    const needAttention = getClientsNeedingAttention(mockClients);
    expect(needAttention.length).toBe(1);
    expect(needAttention[0].id).toBe('2'); // Sarah - last workout 10 days ago
  });

  it('should correctly identify clients active this week', () => {
    const activeThisWeek = getActiveThisWeek(mockClients);
    expect(activeThisWeek.length).toBe(1);
    expect(activeThisWeek[0].id).toBe('1'); // John - last workout 1 day ago
  });
});

describe('Coach Dashboard - Stats Calculations', () => {
  const now = Date.now();
  const daysAgo = (days: number) => new Date(now - days * 24 * 60 * 60 * 1000).toISOString();

  it('should handle empty client list', () => {
    const clients: Client[] = [];
    expect(getActiveClients(clients).length).toBe(0);
    expect(getPendingInvites(clients).length).toBe(0);
    expect(getClientsNeedingAttention(clients).length).toBe(0);
    expect(getActiveThisWeek(clients).length).toBe(0);
  });

  it('should handle all pending (no accepted clients)', () => {
    const clients: Client[] = [
      {
        id: '1',
        clientId: null,
        nickname: null,
        status: 'ACTIVE',
        inviteStatus: 'PENDING',
        inviteEmail: 'a@example.com',
        createdAt: daysAgo(1),
        client: null,
      },
      {
        id: '2',
        clientId: null,
        nickname: null,
        status: 'ACTIVE',
        inviteStatus: 'PENDING',
        inviteEmail: 'b@example.com',
        createdAt: daysAgo(2),
        client: null,
      },
    ];
    expect(getActiveClients(clients).length).toBe(0);
    expect(getPendingInvites(clients).length).toBe(2);
  });

  it('should count progress correctly', () => {
    const client: Client = {
      id: '1',
      clientId: 'u1',
      nickname: null,
      status: 'ACTIVE',
      inviteStatus: 'ACCEPTED',
      inviteEmail: null,
      createdAt: daysAgo(30),
      client: {
        id: 'u1',
        name: 'Test',
        email: 'test@example.com',
        createdAt: daysAgo(30),
        currentProgram: {
          id: 'p1',
          name: 'Test',
          completedWorkouts: 8,
          totalWorkouts: 12,
          lastWorkout: daysAgo(1),
        },
        lastCheckIn: null,
      },
    };

    const program = client.client?.currentProgram;
    expect(program?.completedWorkouts).toBe(8);
    expect(program?.totalWorkouts).toBe(12);

    const progressPercent = program
      ? Math.round((program.completedWorkouts / program.totalWorkouts) * 100)
      : 0;
    expect(progressPercent).toBe(67);
  });
});

describe('Coach Dashboard - Display Name Logic', () => {
  it('should prefer nickname over client name', () => {
    const getDisplayName = (client: Client): string => {
      return client.nickname || client.client?.name || 'Unknown';
    };

    const clientWithNickname: Client = {
      id: '1',
      clientId: 'u1',
      nickname: 'Johnny',
      status: 'ACTIVE',
      inviteStatus: 'ACCEPTED',
      inviteEmail: null,
      createdAt: new Date().toISOString(),
      client: {
        id: 'u1',
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: new Date().toISOString(),
        currentProgram: null,
        lastCheckIn: null,
      },
    };

    expect(getDisplayName(clientWithNickname)).toBe('Johnny');
  });

  it('should fall back to client name if no nickname', () => {
    const getDisplayName = (client: Client): string => {
      return client.nickname || client.client?.name || 'Unknown';
    };

    const clientNoNickname: Client = {
      id: '1',
      clientId: 'u1',
      nickname: null,
      status: 'ACTIVE',
      inviteStatus: 'ACCEPTED',
      inviteEmail: null,
      createdAt: new Date().toISOString(),
      client: {
        id: 'u1',
        name: 'Jane Doe',
        email: 'jane@example.com',
        createdAt: new Date().toISOString(),
        currentProgram: null,
        lastCheckIn: null,
      },
    };

    expect(getDisplayName(clientNoNickname)).toBe('Jane Doe');
  });

  it('should return Unknown if no name available', () => {
    const getDisplayName = (client: Client): string => {
      return client.nickname || client.client?.name || 'Unknown';
    };

    const pendingClient: Client = {
      id: '1',
      clientId: null,
      nickname: null,
      status: 'ACTIVE',
      inviteStatus: 'PENDING',
      inviteEmail: 'unknown@example.com',
      createdAt: new Date().toISOString(),
      client: null,
    };

    expect(getDisplayName(pendingClient)).toBe('Unknown');
  });
});

describe('Coach Dashboard - Sorting for Needs Attention', () => {
  const now = Date.now();
  const daysAgo = (days: number) => new Date(now - days * 24 * 60 * 60 * 1000).toISOString();

  it('should sort needs attention by days since last workout (most urgent first)', () => {
    const clients: Client[] = [
      {
        id: '1',
        clientId: 'u1',
        nickname: 'Less Urgent',
        status: 'ACTIVE',
        inviteStatus: 'ACCEPTED',
        inviteEmail: null,
        createdAt: daysAgo(60),
        client: {
          id: 'u1',
          name: 'User 1',
          email: 'u1@example.com',
          createdAt: daysAgo(60),
          currentProgram: {
            id: 'p1',
            name: 'Program',
            completedWorkouts: 5,
            totalWorkouts: 12,
            lastWorkout: daysAgo(6), // 6 days ago
          },
          lastCheckIn: null,
        },
      },
      {
        id: '2',
        clientId: 'u2',
        nickname: 'Most Urgent',
        status: 'ACTIVE',
        inviteStatus: 'ACCEPTED',
        inviteEmail: null,
        createdAt: daysAgo(60),
        client: {
          id: 'u2',
          name: 'User 2',
          email: 'u2@example.com',
          createdAt: daysAgo(60),
          currentProgram: {
            id: 'p2',
            name: 'Program',
            completedWorkouts: 2,
            totalWorkouts: 12,
            lastWorkout: daysAgo(14), // 14 days ago
          },
          lastCheckIn: null,
        },
      },
      {
        id: '3',
        clientId: 'u3',
        nickname: 'No Program',
        status: 'ACTIVE',
        inviteStatus: 'ACCEPTED',
        inviteEmail: null,
        createdAt: daysAgo(60),
        client: {
          id: 'u3',
          name: 'User 3',
          email: 'u3@example.com',
          createdAt: daysAgo(30),
          currentProgram: null, // No program - should be most urgent
          lastCheckIn: null,
        },
      },
    ];

    const getDaysSinceLastActivity = (client: Client): number => {
      const lastWorkout = client.client?.currentProgram?.lastWorkout;
      if (!lastWorkout) return Infinity; // No workouts = highest priority
      return Math.floor((now - new Date(lastWorkout).getTime()) / (24 * 60 * 60 * 1000));
    };

    const sortedByUrgency = getClientsNeedingAttention(clients).sort(
      (a, b) => getDaysSinceLastActivity(b) - getDaysSinceLastActivity(a)
    );

    expect(sortedByUrgency[0].id).toBe('3'); // No program = most urgent
    expect(sortedByUrgency[1].id).toBe('2'); // 14 days
    expect(sortedByUrgency[2].id).toBe('1'); // 6 days
  });
});
