import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Tests for Buddy Food Sharing Access Control
 *
 * Validates that food APIs correctly expand queries to include buddy data:
 * - Recipes list includes buddy recipes in OR clause
 * - Recipe detail allows buddy access, blocks strangers
 * - Recipe PATCH/DELETE remain owner-only
 * - Quick foods merge own + buddy items within 12-item cap
 * - Food staples return buddy staples capped at 3 per slot
 */

// ── Mocks ────────────────────────────────────────────────────────────

vi.mock('@/auth', () => ({ auth: vi.fn() }));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    recipe: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    quickFood: { findMany: vi.fn() },
    foodStaple: { findMany: vi.fn() },
  },
}));

vi.mock('@/lib/buddy', () => ({
  getBuddyUserIds: vi.fn(),
  isBuddy: vi.fn(),
}));

// Stub parse-helpers so recipe routes can import without issue
vi.mock('@/lib/ai/parse-helpers', () => ({
  validateIngredients: vi.fn(() => null),
  clamp: vi.fn((v: number, min: number, max: number) => Math.min(Math.max(v, min), max)),
}));

// Stub @prisma/client MealType enum used by food-staples route
vi.mock('@prisma/client', () => ({
  MealType: {
    BREAKFAST: 'BREAKFAST',
    LUNCH: 'LUNCH',
    DINNER: 'DINNER',
    SNACK: 'SNACK',
  },
}));

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getBuddyUserIds, isBuddy } from '@/lib/buddy';

const mockAuth = auth as ReturnType<typeof vi.fn>;
const mockGetBuddyUserIds = getBuddyUserIds as ReturnType<typeof vi.fn>;
const mockIsBuddy = isBuddy as ReturnType<typeof vi.fn>;
const mockRecipeFindMany = prisma.recipe.findMany as ReturnType<typeof vi.fn>;
const mockRecipeFindUnique = prisma.recipe.findUnique as ReturnType<typeof vi.fn>;
const mockRecipeUpdate = prisma.recipe.update as ReturnType<typeof vi.fn>;
const mockRecipeDelete = prisma.recipe.delete as ReturnType<typeof vi.fn>;
const mockQuickFoodFindMany = prisma.quickFood.findMany as ReturnType<typeof vi.fn>;
const mockFoodStapleFindMany = prisma.foodStaple.findMany as ReturnType<typeof vi.fn>;

// ── Helpers ──────────────────────────────────────────────────────────

const USER_ID = 'user-1';
const BUDDY_ID = 'buddy-2';
const STRANGER_ID = 'stranger-3';

function authed(userId = USER_ID) {
  mockAuth.mockResolvedValue({ user: { id: userId } });
}

beforeEach(() => {
  vi.clearAllMocks();
});

// =====================================================================
// 1. GET /api/recipes
// =====================================================================

describe('GET /api/recipes — buddy recipe expansion', () => {
  let GET: (req: Request) => Promise<Response>;

  beforeEach(async () => {
    const mod = await import('@/app/api/recipes/route');
    GET = mod.GET;
    authed();
  });

  it('includes buddy userId in OR clause when user has buddies', async () => {
    mockGetBuddyUserIds.mockResolvedValue([BUDDY_ID]);
    mockRecipeFindMany.mockResolvedValue([]);

    const req = new Request('http://localhost:3001/api/recipes');
    await GET(req);

    const callArgs = mockRecipeFindMany.mock.calls[0][0];
    const orClauses = callArgs.where.OR;

    // Should have 3 clauses: own, public, buddy
    expect(orClauses).toHaveLength(3);
    expect(orClauses[0]).toEqual({ userId: USER_ID });
    expect(orClauses[1]).toEqual({ isPublic: true });
    expect(orClauses[2]).toEqual({ userId: { in: [BUDDY_ID] } });
  });

  it('does NOT include buddy clause when user has no buddies', async () => {
    mockGetBuddyUserIds.mockResolvedValue([]);
    mockRecipeFindMany.mockResolvedValue([]);

    const req = new Request('http://localhost:3001/api/recipes');
    await GET(req);

    const callArgs = mockRecipeFindMany.mock.calls[0][0];
    const orClauses = callArgs.where.OR;

    // Only own + public — no buddy clause
    expect(orClauses).toHaveLength(2);
    expect(orClauses[0]).toEqual({ userId: USER_ID });
    expect(orClauses[1]).toEqual({ isPublic: true });
  });

  it('search filter works alongside buddy expansion', async () => {
    mockGetBuddyUserIds.mockResolvedValue([BUDDY_ID]);
    mockRecipeFindMany.mockResolvedValue([]);

    const req = new Request('http://localhost:3001/api/recipes?search=chicken');
    await GET(req);

    const callArgs = mockRecipeFindMany.mock.calls[0][0];

    // Both OR clauses and search name filter should be present
    expect(callArgs.where.OR).toHaveLength(3);
    expect(callArgs.where.name).toEqual({
      contains: 'chicken',
      mode: 'insensitive',
    });
  });
});

// =====================================================================
// 2. GET / PATCH / DELETE  /api/recipes/[id]
// =====================================================================

describe('GET /api/recipes/[id] — buddy access control', () => {
  let GET: (req: Request, ctx: { params: Promise<{ id: string }> }) => Promise<Response>;

  beforeEach(async () => {
    const mod = await import('@/app/api/recipes/[id]/route');
    GET = mod.GET;
    authed();
  });

  const ctx = (id = 'recipe-123') => ({
    params: Promise.resolve({ id }),
  });

  it('allows access to buddy\'s private recipe', async () => {
    mockRecipeFindUnique.mockResolvedValue({
      id: 'recipe-123',
      userId: BUDDY_ID,
      isPublic: false,
      user: { id: BUDDY_ID, name: 'Buddy', image: null },
    });
    mockIsBuddy.mockResolvedValue(true);

    const res = await GET(new Request('http://localhost:3001/api/recipes/recipe-123'), ctx());
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.id).toBe('recipe-123');
  });

  it('denies access to stranger\'s private recipe', async () => {
    mockRecipeFindUnique.mockResolvedValue({
      id: 'recipe-123',
      userId: STRANGER_ID,
      isPublic: false,
      user: { id: STRANGER_ID, name: 'Stranger', image: null },
    });
    mockIsBuddy.mockResolvedValue(false);

    const res = await GET(new Request('http://localhost:3001/api/recipes/recipe-123'), ctx());
    expect(res.status).toBe(403);
  });

  it('owner can always access own recipe', async () => {
    mockRecipeFindUnique.mockResolvedValue({
      id: 'recipe-123',
      userId: USER_ID,
      isPublic: false,
      user: { id: USER_ID, name: 'Me', image: null },
    });
    // isBuddy should not even matter for own recipe
    mockIsBuddy.mockResolvedValue(false);

    const res = await GET(new Request('http://localhost:3001/api/recipes/recipe-123'), ctx());
    expect(res.status).toBe(200);
  });

  it('public recipes accessible to anyone', async () => {
    mockRecipeFindUnique.mockResolvedValue({
      id: 'recipe-123',
      userId: STRANGER_ID,
      isPublic: true,
      user: { id: STRANGER_ID, name: 'Stranger', image: null },
    });
    mockIsBuddy.mockResolvedValue(false);

    const res = await GET(new Request('http://localhost:3001/api/recipes/recipe-123'), ctx());
    expect(res.status).toBe(200);
  });
});

describe('PATCH /api/recipes/[id] — owner-only mutation', () => {
  let PATCH: (req: Request, ctx: { params: Promise<{ id: string }> }) => Promise<Response>;

  beforeEach(async () => {
    const mod = await import('@/app/api/recipes/[id]/route');
    PATCH = mod.PATCH;
    authed();
  });

  const ctx = (id = 'recipe-123') => ({
    params: Promise.resolve({ id }),
  });

  it('returns 403 when buddy tries to PATCH', async () => {
    mockRecipeFindUnique.mockResolvedValue({
      id: 'recipe-123',
      userId: BUDDY_ID,
      isPublic: false,
    });

    const req = new Request('http://localhost:3001/api/recipes/recipe-123', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Renamed' }),
    });

    const res = await PATCH(req, ctx());
    expect(res.status).toBe(403);

    // Ensure no update was attempted
    expect(mockRecipeUpdate).not.toHaveBeenCalled();
  });
});

describe('DELETE /api/recipes/[id] — owner-only mutation', () => {
  let DELETE: (req: Request, ctx: { params: Promise<{ id: string }> }) => Promise<Response>;

  beforeEach(async () => {
    const mod = await import('@/app/api/recipes/[id]/route');
    DELETE = mod.DELETE;
    authed();
  });

  const ctx = (id = 'recipe-123') => ({
    params: Promise.resolve({ id }),
  });

  it('returns 403 when buddy tries to DELETE', async () => {
    mockRecipeFindUnique.mockResolvedValue({
      id: 'recipe-123',
      userId: BUDDY_ID,
      isPublic: false,
    });

    const req = new Request('http://localhost:3001/api/recipes/recipe-123', {
      method: 'DELETE',
    });

    const res = await DELETE(req, ctx());
    expect(res.status).toBe(403);

    // Ensure no delete was attempted
    expect(mockRecipeDelete).not.toHaveBeenCalled();
  });
});

// =====================================================================
// 3. GET /api/quick-foods
// =====================================================================

describe('GET /api/quick-foods — buddy item merging', () => {
  let GET: () => Promise<Response>;

  beforeEach(async () => {
    const mod = await import('@/app/api/quick-foods/route');
    GET = mod.GET;
    authed();
  });

  function makeFoods(prefix: string, count: number) {
    return Array.from({ length: count }, (_, i) => ({
      id: `${prefix}-${i}`,
      name: `${prefix} food ${i}`,
      userId: prefix === 'own' ? USER_ID : BUDDY_ID,
      calories: 200,
      protein: 20,
      carbs: 25,
      fat: 8,
      isStarter: false,
      user: { id: prefix === 'own' ? USER_ID : BUDDY_ID, name: prefix, image: null },
    }));
  }

  it('returns own items first, buddy items fill remaining slots', async () => {
    const ownFoods = makeFoods('own', 5);
    const buddyFoods = makeFoods('buddy', 4);

    mockQuickFoodFindMany
      .mockResolvedValueOnce(ownFoods)   // first call: own foods
      .mockResolvedValueOnce(buddyFoods); // second call: buddy foods
    mockGetBuddyUserIds.mockResolvedValue([BUDDY_ID]);

    const res = await GET();
    const data = await res.json();

    // 5 own + 4 buddy = 9
    expect(data).toHaveLength(9);
    // Own items come first
    expect(data.slice(0, 5).every((f: { userId: string }) => f.userId === USER_ID)).toBe(true);
    // Buddy items follow
    expect(data.slice(5).every((f: { userId: string }) => f.userId === BUDDY_ID)).toBe(true);

    // Second findMany should request remaining = 12 - 5 = 7 slots
    const buddyCall = mockQuickFoodFindMany.mock.calls[1][0];
    expect(buddyCall.take).toBe(7);
  });

  it('no buddy items when own items fill all 12 slots', async () => {
    const ownFoods = makeFoods('own', 12);

    mockQuickFoodFindMany.mockResolvedValueOnce(ownFoods);
    mockGetBuddyUserIds.mockResolvedValue([BUDDY_ID]);

    const res = await GET();
    const data = await res.json();

    expect(data).toHaveLength(12);
    // Only one findMany call — no buddy query issued
    expect(mockQuickFoodFindMany).toHaveBeenCalledTimes(1);
  });

  it('only non-starter buddy foods included (isStarter: false)', async () => {
    mockQuickFoodFindMany
      .mockResolvedValueOnce(makeFoods('own', 3))
      .mockResolvedValueOnce([]);
    mockGetBuddyUserIds.mockResolvedValue([BUDDY_ID]);

    await GET();

    const buddyCall = mockQuickFoodFindMany.mock.calls[1][0];
    expect(buddyCall.where.isStarter).toBe(false);
  });

  it('no buddy query when user has no buddies', async () => {
    mockQuickFoodFindMany.mockResolvedValueOnce(makeFoods('own', 3));
    mockGetBuddyUserIds.mockResolvedValue([]);

    const res = await GET();
    const data = await res.json();

    expect(data).toHaveLength(3);
    expect(mockQuickFoodFindMany).toHaveBeenCalledTimes(1);
  });
});

// =====================================================================
// 4. GET /api/food-staples
// =====================================================================

describe('GET /api/food-staples — buddy staples with per-slot cap', () => {
  let GET: (req: Request) => Promise<Response>;

  beforeEach(async () => {
    const mod = await import('@/app/api/food-staples/route');
    GET = mod.GET;
    authed();
  });

  function makeStaple(id: string, userId: string, mealSlot: string) {
    return {
      id,
      userId,
      mealSlot,
      name: `staple-${id}`,
      calories: 300,
      protein: 25,
      carbs: 30,
      fat: 10,
      sortOrder: 0,
      user: { id: userId, name: userId === USER_ID ? 'Me' : 'Buddy', image: null },
    };
  }

  it('returns { staples, buddyStaples } shape', async () => {
    mockFoodStapleFindMany
      .mockResolvedValueOnce([makeStaple('s1', USER_ID, 'BREAKFAST')])
      .mockResolvedValueOnce([makeStaple('bs1', BUDDY_ID, 'BREAKFAST')]);
    mockGetBuddyUserIds.mockResolvedValue([BUDDY_ID]);

    const req = new Request('http://localhost:3001/api/food-staples');
    const res = await GET(req);
    const data = await res.json();

    expect(data).toHaveProperty('staples');
    expect(data).toHaveProperty('buddyStaples');
    expect(data.staples).toHaveLength(1);
    expect(data.buddyStaples).toHaveLength(1);
  });

  it('caps buddy staples at 3 per meal slot', async () => {
    const ownStaples = [makeStaple('s1', USER_ID, 'BREAKFAST')];
    // 5 buddy staples all in BREAKFAST — should be capped at 3
    const allBuddyStaples = [
      makeStaple('bs1', BUDDY_ID, 'BREAKFAST'),
      makeStaple('bs2', BUDDY_ID, 'BREAKFAST'),
      makeStaple('bs3', BUDDY_ID, 'BREAKFAST'),
      makeStaple('bs4', BUDDY_ID, 'BREAKFAST'),
      makeStaple('bs5', BUDDY_ID, 'BREAKFAST'),
    ];

    mockFoodStapleFindMany
      .mockResolvedValueOnce(ownStaples)
      .mockResolvedValueOnce(allBuddyStaples);
    mockGetBuddyUserIds.mockResolvedValue([BUDDY_ID]);

    const req = new Request('http://localhost:3001/api/food-staples');
    const res = await GET(req);
    const data = await res.json();

    expect(data.buddyStaples).toHaveLength(3);
  });

  it('caps per slot independently — 3 BREAKFAST + 3 LUNCH OK', async () => {
    mockFoodStapleFindMany
      .mockResolvedValueOnce([]) // own staples
      .mockResolvedValueOnce([
        makeStaple('b1', BUDDY_ID, 'BREAKFAST'),
        makeStaple('b2', BUDDY_ID, 'BREAKFAST'),
        makeStaple('b3', BUDDY_ID, 'BREAKFAST'),
        makeStaple('b4', BUDDY_ID, 'BREAKFAST'), // 4th BREAKFAST — dropped
        makeStaple('l1', BUDDY_ID, 'LUNCH'),
        makeStaple('l2', BUDDY_ID, 'LUNCH'),
        makeStaple('l3', BUDDY_ID, 'LUNCH'),
        makeStaple('l4', BUDDY_ID, 'LUNCH'), // 4th LUNCH — dropped
      ]);
    mockGetBuddyUserIds.mockResolvedValue([BUDDY_ID]);

    const req = new Request('http://localhost:3001/api/food-staples');
    const res = await GET(req);
    const data = await res.json();

    // 3 BREAKFAST + 3 LUNCH = 6
    expect(data.buddyStaples).toHaveLength(6);
  });

  it('gracefully degrades if buddy query fails', async () => {
    mockFoodStapleFindMany
      .mockResolvedValueOnce([makeStaple('s1', USER_ID, 'BREAKFAST')]);
    // getBuddyUserIds itself throws
    mockGetBuddyUserIds.mockRejectedValue(new Error('buddy table missing'));

    const req = new Request('http://localhost:3001/api/food-staples');
    const res = await GET(req);
    const data = await res.json();

    // Should still return own staples; buddyStaples defaults to empty
    expect(res.status).toBe(200);
    expect(data.staples).toHaveLength(1);
    expect(data.buddyStaples).toHaveLength(0);
  });

  it('returns empty buddyStaples when user has no buddies', async () => {
    mockFoodStapleFindMany.mockResolvedValueOnce([makeStaple('s1', USER_ID, 'LUNCH')]);
    mockGetBuddyUserIds.mockResolvedValue([]);

    const req = new Request('http://localhost:3001/api/food-staples');
    const res = await GET(req);
    const data = await res.json();

    expect(data.staples).toHaveLength(1);
    expect(data.buddyStaples).toHaveLength(0);
    // Only one findMany call (own staples); no buddy query
    expect(mockFoodStapleFindMany).toHaveBeenCalledTimes(1);
  });
});
