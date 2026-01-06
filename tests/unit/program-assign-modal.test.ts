import { describe, it, expect } from 'vitest';

/**
 * Tests for Program Assignment Logic
 * Issue #206 - Coach Assignment UI
 *
 * Business Rules:
 * - Coaches can assign programs to clients from dashboard
 * - If client has active program, confirmation is required
 * - Assignment clones the template program to the client
 * - Programs are fetched from /api/programs/templates
 */

interface Program {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  daysPerWeek: number | null;
  durationWeeks: number | null;
  isTemplate: boolean;
}

interface AssignModalClient {
  id: string;
  name: string;
  currentProgram: string | null;
}

// Filter functions to mirror ProgramAssignModal logic
function filterProgramsByCategory(programs: Program[], category: string | null): Program[] {
  if (!category) return programs;
  return programs.filter(p => p.category === category);
}

function shouldShowReplaceWarning(
  client: AssignModalClient,
  selectedProgram: Program
): boolean {
  return client.currentProgram !== null;
}

function getProgramDisplayInfo(program: Program): {
  name: string;
  badge: string | null;
  details: string[];
} {
  const details: string[] = [];

  if (program.category) {
    details.push(program.category);
  }
  if (program.daysPerWeek) {
    details.push(`${program.daysPerWeek} days/wk`);
  }
  if (program.durationWeeks) {
    details.push(`${program.durationWeeks} weeks`);
  }

  return {
    name: program.name,
    badge: program.isTemplate ? 'Template' : null,
    details
  };
}

// Test fixtures
function createTestPrograms(): Program[] {
  return [
    {
      id: '1',
      name: 'Beginner Strength',
      description: 'A program for beginners',
      category: 'strength',
      daysPerWeek: 3,
      durationWeeks: 8,
      isTemplate: true
    },
    {
      id: '2',
      name: 'Advanced Hypertrophy',
      description: 'High volume program',
      category: 'hypertrophy',
      daysPerWeek: 5,
      durationWeeks: 12,
      isTemplate: true
    },
    {
      id: '3',
      name: 'Custom Program',
      description: null,
      category: null,
      daysPerWeek: 4,
      durationWeeks: null,
      isTemplate: true
    }
  ];
}

describe('Program Assign Modal - filterProgramsByCategory', () => {
  it('returns all programs when category is null', () => {
    const programs = createTestPrograms();
    const filtered = filterProgramsByCategory(programs, null);

    expect(filtered.length).toBe(3);
  });

  it('filters by strength category', () => {
    const programs = createTestPrograms();
    const filtered = filterProgramsByCategory(programs, 'strength');

    expect(filtered.length).toBe(1);
    expect(filtered[0].name).toBe('Beginner Strength');
  });

  it('filters by hypertrophy category', () => {
    const programs = createTestPrograms();
    const filtered = filterProgramsByCategory(programs, 'hypertrophy');

    expect(filtered.length).toBe(1);
    expect(filtered[0].name).toBe('Advanced Hypertrophy');
  });

  it('returns empty array for non-existent category', () => {
    const programs = createTestPrograms();
    const filtered = filterProgramsByCategory(programs, 'cardio');

    expect(filtered.length).toBe(0);
  });
});

describe('Program Assign Modal - shouldShowReplaceWarning', () => {
  it('returns true when client has current program', () => {
    const client: AssignModalClient = {
      id: 'c1',
      name: 'John',
      currentProgram: 'Old Program'
    };
    const program = createTestPrograms()[0];

    expect(shouldShowReplaceWarning(client, program)).toBe(true);
  });

  it('returns false when client has no program', () => {
    const client: AssignModalClient = {
      id: 'c1',
      name: 'John',
      currentProgram: null
    };
    const program = createTestPrograms()[0];

    expect(shouldShowReplaceWarning(client, program)).toBe(false);
  });
});

describe('Program Assign Modal - getProgramDisplayInfo', () => {
  it('returns all info for complete program', () => {
    const program = createTestPrograms()[0];
    const info = getProgramDisplayInfo(program);

    expect(info.name).toBe('Beginner Strength');
    expect(info.badge).toBe('Template');
    expect(info.details).toContain('strength');
    expect(info.details).toContain('3 days/wk');
    expect(info.details).toContain('8 weeks');
  });

  it('handles program with null fields', () => {
    const program = createTestPrograms()[2];
    const info = getProgramDisplayInfo(program);

    expect(info.name).toBe('Custom Program');
    expect(info.badge).toBe('Template');
    expect(info.details).toEqual(['4 days/wk']); // only daysPerWeek
  });

  it('shows Template badge for templates', () => {
    const program = createTestPrograms()[0];
    const info = getProgramDisplayInfo(program);

    expect(info.badge).toBe('Template');
  });

  it('shows no badge for non-templates', () => {
    const program: Program = {
      ...createTestPrograms()[0],
      isTemplate: false
    };
    const info = getProgramDisplayInfo(program);

    expect(info.badge).toBe(null);
  });
});

describe('Program Assign Modal - Assignment Scenarios', () => {
  it('client with no program gets assigned directly', () => {
    const client: AssignModalClient = {
      id: 'c1',
      name: 'New Client',
      currentProgram: null
    };
    const program = createTestPrograms()[0];

    // No warning needed
    expect(shouldShowReplaceWarning(client, program)).toBe(false);
  });

  it('client with existing program shows replacement warning', () => {
    const client: AssignModalClient = {
      id: 'c1',
      name: 'Existing Client',
      currentProgram: 'PPL Split'
    };
    const program = createTestPrograms()[0];

    // Warning needed
    expect(shouldShowReplaceWarning(client, program)).toBe(true);
  });

  it('programs display correct metadata', () => {
    const programs = createTestPrograms();

    const beginner = getProgramDisplayInfo(programs[0]);
    expect(beginner.details).toHaveLength(3);

    const advanced = getProgramDisplayInfo(programs[1]);
    expect(advanced.details).toHaveLength(3);

    const custom = getProgramDisplayInfo(programs[2]);
    expect(custom.details).toHaveLength(1);
  });
});
