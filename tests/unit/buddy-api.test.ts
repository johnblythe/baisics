import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    buddyGroup: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    buddyMembership: {
      findFirst: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('@/lib/buddy', () => ({
  generateInviteCode: vi.fn(),
  getUserBuddyGroup: vi.fn(),
  MAX_BUDDY_GROUP_SIZE: 5,
}));

// ---------------------------------------------------------------------------
// Imports (after mocks are declared)
// ---------------------------------------------------------------------------

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { generateInviteCode, getUserBuddyGroup } from '@/lib/buddy';

const mockAuth = auth as ReturnType<typeof vi.fn>;
const mockFindFirstMembership = prisma.buddyMembership.findFirst as ReturnType<typeof vi.fn>;
const mockCreateMembership = prisma.buddyMembership.create as ReturnType<typeof vi.fn>;
const mockDeleteMembership = prisma.buddyMembership.delete as ReturnType<typeof vi.fn>;
const mockCreateGroup = prisma.buddyGroup.create as ReturnType<typeof vi.fn>;
const mockFindUniqueGroup = prisma.buddyGroup.findUnique as ReturnType<typeof vi.fn>;
const mockDeleteGroup = prisma.buddyGroup.delete as ReturnType<typeof vi.fn>;
const mockGenerateInviteCode = generateInviteCode as ReturnType<typeof vi.fn>;
const mockGetUserBuddyGroup = getUserBuddyGroup as ReturnType<typeof vi.fn>;

// Silence console.error in tests
vi.spyOn(console, 'error').mockImplementation(() => {});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const USER_ID = 'user-abc-123';
const OTHER_USER_ID = 'user-xyz-789';
const GROUP_ID = 'group-001';
const INVITE_CODE = 'X4MN7P3R';

function mockSession(userId?: string) {
  if (!userId) {
    mockAuth.mockResolvedValue(null);
  } else {
    mockAuth.mockResolvedValue({ user: { id: userId } });
  }
}

function makeRequest(url: string, options?: RequestInit) {
  return new Request(url, options);
}

// ---------------------------------------------------------------------------
// POST /api/buddy — create a buddy group
// ---------------------------------------------------------------------------

describe('POST /api/buddy (create group)', () => {
  let POST: (req: Request) => Promise<Response>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import('@/app/api/buddy/route');
    POST = mod.POST;
  });

  it('returns 401 if not authenticated', async () => {
    mockSession();

    const req = makeRequest('http://localhost:3001/api/buddy', { method: 'POST' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 409 if user already in a group', async () => {
    mockSession(USER_ID);
    mockFindFirstMembership.mockResolvedValue({ id: 'mem-1', groupId: GROUP_ID, userId: USER_ID });

    const req = makeRequest('http://localhost:3001/api/buddy', { method: 'POST' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(409);
    expect(data.error).toBe('already_in_group');
  });

  it('creates group with invite code and returns 201', async () => {
    mockSession(USER_ID);
    mockFindFirstMembership.mockResolvedValue(null);
    mockGenerateInviteCode.mockResolvedValue(INVITE_CODE);

    const createdGroup = {
      id: GROUP_ID,
      inviteCode: INVITE_CODE,
      memberships: [
        {
          id: 'mem-1',
          userId: USER_ID,
          joinedAt: new Date(),
          user: { id: USER_ID, name: 'Test User', image: null, email: 'test@test.com' },
        },
      ],
    };
    mockCreateGroup.mockResolvedValue(createdGroup);

    const req = makeRequest('http://localhost:3001/api/buddy', { method: 'POST' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.group).toBeDefined();
    expect(data.group.inviteCode).toBe(INVITE_CODE);
    expect(data.group.memberships).toHaveLength(1);
  });

  it('calls generateInviteCode and prisma.buddyGroup.create with correct args', async () => {
    mockSession(USER_ID);
    mockFindFirstMembership.mockResolvedValue(null);
    mockGenerateInviteCode.mockResolvedValue(INVITE_CODE);
    mockCreateGroup.mockResolvedValue({ id: GROUP_ID, inviteCode: INVITE_CODE, memberships: [] });

    const req = makeRequest('http://localhost:3001/api/buddy', { method: 'POST' });
    await POST(req);

    expect(mockGenerateInviteCode).toHaveBeenCalledOnce();
    expect(mockCreateGroup).toHaveBeenCalledWith({
      data: {
        inviteCode: INVITE_CODE,
        memberships: {
          create: { userId: USER_ID },
        },
      },
      include: {
        memberships: {
          include: {
            user: { select: { id: true, name: true, image: true, email: true } },
          },
          orderBy: { joinedAt: 'asc' },
        },
      },
    });
  });
});

// ---------------------------------------------------------------------------
// GET /api/buddy — fetch current buddy group
// ---------------------------------------------------------------------------

describe('GET /api/buddy (fetch group)', () => {
  let GET: () => Promise<Response>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import('@/app/api/buddy/route');
    GET = mod.GET;
  });

  it('returns 401 if not authenticated', async () => {
    mockSession();

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns group data for authenticated user', async () => {
    mockSession(USER_ID);
    const groupData = { id: GROUP_ID, inviteCode: INVITE_CODE, memberships: [] };
    mockGetUserBuddyGroup.mockResolvedValue(groupData);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.group).toEqual(groupData);
  });

  it('returns null group when user has no group', async () => {
    mockSession(USER_ID);
    mockGetUserBuddyGroup.mockResolvedValue(null);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.group).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// POST /api/buddy/join — join a buddy group
// ---------------------------------------------------------------------------

describe('POST /api/buddy/join (join group)', () => {
  let POST: (req: Request) => Promise<Response>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import('@/app/api/buddy/join/route');
    POST = mod.POST;
  });

  it('returns 401 if not authenticated', async () => {
    mockSession();

    const req = makeRequest('http://localhost:3001/api/buddy/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: INVITE_CODE }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 400 for empty code', async () => {
    mockSession(USER_ID);

    const req = makeRequest('http://localhost:3001/api/buddy/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: '' }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('invalid_code');
  });

  it('returns 400 for code with wrong length', async () => {
    mockSession(USER_ID);

    const req = makeRequest('http://localhost:3001/api/buddy/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'ABC' }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('invalid_code');
    expect(data.message).toContain('8-character');
  });

  it('returns 409 if user already in a group', async () => {
    mockSession(USER_ID);
    mockFindFirstMembership.mockResolvedValue({ id: 'mem-1', groupId: GROUP_ID, userId: USER_ID });

    const req = makeRequest('http://localhost:3001/api/buddy/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: INVITE_CODE }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(409);
    expect(data.error).toBe('already_in_group');
  });

  it('returns 404 if code not found', async () => {
    mockSession(USER_ID);
    mockFindFirstMembership.mockResolvedValue(null);
    mockFindUniqueGroup.mockResolvedValue(null);

    const req = makeRequest('http://localhost:3001/api/buddy/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'ZZZZZZZZ' }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toBe('invalid_code');
    expect(data.message).toContain('No group found');
  });

  it('returns 409 if group is full (5 members)', async () => {
    mockSession(USER_ID);
    mockFindFirstMembership.mockResolvedValue(null);
    mockFindUniqueGroup.mockResolvedValue({
      id: GROUP_ID,
      inviteCode: INVITE_CODE,
      _count: { memberships: 5 },
      memberships: [],
    });

    const req = makeRequest('http://localhost:3001/api/buddy/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: INVITE_CODE }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(409);
    expect(data.error).toBe('group_full');
  });

  it('creates membership and returns 201 with updated group', async () => {
    mockSession(USER_ID);
    mockFindFirstMembership.mockResolvedValue(null);
    mockFindUniqueGroup
      // First call: find group by invite code
      .mockResolvedValueOnce({
        id: GROUP_ID,
        inviteCode: INVITE_CODE,
        _count: { memberships: 2 },
        memberships: [
          { id: 'mem-1', userId: OTHER_USER_ID, user: { id: OTHER_USER_ID, name: 'Other', image: null, email: 'other@test.com' } },
        ],
      })
      // Second call: return updated group after membership created
      .mockResolvedValueOnce({
        id: GROUP_ID,
        inviteCode: INVITE_CODE,
        memberships: [
          { id: 'mem-1', userId: OTHER_USER_ID, user: { id: OTHER_USER_ID, name: 'Other', image: null, email: 'other@test.com' } },
          { id: 'mem-2', userId: USER_ID, user: { id: USER_ID, name: 'Test', image: null, email: 'test@test.com' } },
        ],
      });
    mockCreateMembership.mockResolvedValue({ id: 'mem-2', groupId: GROUP_ID, userId: USER_ID });

    const req = makeRequest('http://localhost:3001/api/buddy/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: INVITE_CODE }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.group).toBeDefined();
    expect(data.group.memberships).toHaveLength(2);
    expect(mockCreateMembership).toHaveBeenCalledWith({
      data: { groupId: GROUP_ID, userId: USER_ID },
    });
  });

  it('normalizes code to uppercase', async () => {
    mockSession(USER_ID);
    mockFindFirstMembership.mockResolvedValue(null);
    mockFindUniqueGroup.mockResolvedValue(null);

    const req = makeRequest('http://localhost:3001/api/buddy/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'x4mn7p3r' }),
    });
    await POST(req);

    // The route normalizes to uppercase before querying
    expect(mockFindUniqueGroup).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { inviteCode: 'X4MN7P3R' },
      })
    );
  });

  it('trims whitespace from code', async () => {
    mockSession(USER_ID);
    mockFindFirstMembership.mockResolvedValue(null);
    mockFindUniqueGroup.mockResolvedValue(null);

    const req = makeRequest('http://localhost:3001/api/buddy/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: '  X4MN7P3R  ' }),
    });
    await POST(req);

    expect(mockFindUniqueGroup).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { inviteCode: 'X4MN7P3R' },
      })
    );
  });
});

// ---------------------------------------------------------------------------
// DELETE /api/buddy/members — leave buddy group
// ---------------------------------------------------------------------------

describe('DELETE /api/buddy/members (leave group)', () => {
  let DELETE: () => Promise<Response>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import('@/app/api/buddy/members/route');
    DELETE = mod.DELETE;
  });

  it('returns 401 if not authenticated', async () => {
    mockSession();

    const res = await DELETE();
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 404 if user not in a group', async () => {
    mockSession(USER_ID);
    mockFindFirstMembership.mockResolvedValue(null);

    const res = await DELETE();
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toBe('not_in_group');
  });

  it('removes membership when other members exist', async () => {
    mockSession(USER_ID);
    mockFindFirstMembership.mockResolvedValue({
      id: 'mem-1',
      groupId: GROUP_ID,
      userId: USER_ID,
      group: {
        id: GROUP_ID,
        _count: { memberships: 3 },
      },
    });
    mockDeleteMembership.mockResolvedValue({ id: 'mem-1' });

    const res = await DELETE();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockDeleteMembership).toHaveBeenCalledWith({ where: { id: 'mem-1' } });
    expect(mockDeleteGroup).not.toHaveBeenCalled();
  });

  it('deletes entire group when last member leaves', async () => {
    mockSession(USER_ID);
    mockFindFirstMembership.mockResolvedValue({
      id: 'mem-1',
      groupId: GROUP_ID,
      userId: USER_ID,
      group: {
        id: GROUP_ID,
        _count: { memberships: 1 },
      },
    });
    mockDeleteGroup.mockResolvedValue({ id: GROUP_ID });

    const res = await DELETE();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockDeleteGroup).toHaveBeenCalledWith({ where: { id: GROUP_ID } });
    expect(mockDeleteMembership).not.toHaveBeenCalled();
  });

  it('deletes group when _count.memberships is 0', async () => {
    mockSession(USER_ID);
    mockFindFirstMembership.mockResolvedValue({
      id: 'mem-1',
      groupId: GROUP_ID,
      userId: USER_ID,
      group: {
        id: GROUP_ID,
        _count: { memberships: 0 },
      },
    });
    mockDeleteGroup.mockResolvedValue({ id: GROUP_ID });

    const res = await DELETE();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockDeleteGroup).toHaveBeenCalledWith({ where: { id: GROUP_ID } });
  });
});
