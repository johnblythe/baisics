/**
 * Verification script for persona seed data
 * Run: npx tsx prisma/verify-personas.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
  console.log('\n=== PERSONA SEED VERIFICATION ===\n');
  let passed = 0;
  let failed = 0;

  // Expected personas
  const expectedPersonas = [
    'alex@test.baisics.app',
    'sarah@test.baisics.app',
    'jordan@test.baisics.app',
    'chris@test.baisics.app',
    'kim@test.baisics.app',
    'taylor@test.baisics.app',
    'robert@test.baisics.app',
    'marcus@test.baisics.app',
    'priya@test.baisics.app',
    'derek@test.baisics.app',
    'maya@test.baisics.app',
  ];

  // 1. Verify all 11 personas exist with correct email addresses
  console.log('1. Checking all 11 personas exist...');
  const users = await prisma.user.findMany({
    where: { email: { in: expectedPersonas } },
  });
  if (users.length === 11) {
    console.log('   ✓ All 11 personas exist');
    passed++;
  } else {
    console.log(`   ✗ Expected 11 personas, found ${users.length}`);
    const found = users.map((u) => u.email);
    const missing = expectedPersonas.filter((e) => !found.includes(e));
    if (missing.length > 0) {
      console.log(`   Missing: ${missing.join(', ')}`);
    }
    failed++;
  }

  // 2. Verify Marcus has 18 workout logs
  console.log('\n2. Checking Marcus has 18 workout logs...');
  const marcus = await prisma.user.findUnique({
    where: { email: 'marcus@test.baisics.app' },
    include: {
      ownedPrograms: {
        include: {
          workoutLogs: true,
        },
      },
    },
  });
  const marcusLogs = marcus?.ownedPrograms.reduce((sum, p) => sum + p.workoutLogs.length, 0) ?? 0;
  if (marcusLogs === 18) {
    console.log(`   ✓ Marcus has ${marcusLogs} workout logs`);
    passed++;
  } else {
    console.log(`   ✗ Marcus has ${marcusLogs} workout logs (expected 18)`);
    failed++;
  }

  // 3. Verify Derek has 45 workout logs and milestones WORKOUT_10, WORKOUT_25
  console.log('\n3. Checking Derek has 45 workout logs and milestones...');
  const derek = await prisma.user.findUnique({
    where: { email: 'derek@test.baisics.app' },
    include: {
      ownedPrograms: {
        include: {
          workoutLogs: true,
        },
      },
      milestoneAchievements: true,
    },
  });
  const derekLogs = derek?.ownedPrograms.reduce((sum, p) => sum + p.workoutLogs.length, 0) ?? 0;
  const derekMilestones = derek?.milestoneAchievements.map((m) => m.type) ?? [];
  if (derekLogs === 45) {
    console.log(`   ✓ Derek has ${derekLogs} workout logs`);
    passed++;
  } else {
    console.log(`   ✗ Derek has ${derekLogs} workout logs (expected 45)`);
    failed++;
  }
  if (derekMilestones.includes('WORKOUT_10') && derekMilestones.includes('WORKOUT_25')) {
    console.log(`   ✓ Derek has WORKOUT_10 and WORKOUT_25 milestones`);
    passed++;
  } else {
    console.log(`   ✗ Derek milestones: ${derekMilestones.join(', ')} (expected WORKOUT_10, WORKOUT_25)`);
    failed++;
  }

  // 4. Verify Maya has 2 programs (one inactive, one active) and 65 total workouts
  console.log('\n4. Checking Maya has 2 programs and 65 workouts...');
  const maya = await prisma.user.findUnique({
    where: { email: 'maya@test.baisics.app' },
    include: {
      ownedPrograms: {
        include: {
          workoutLogs: true,
        },
      },
    },
  });
  const mayaPrograms = maya?.ownedPrograms ?? [];
  const mayaTotalLogs = mayaPrograms.reduce((sum, p) => sum + p.workoutLogs.length, 0);
  const mayaActiveCount = mayaPrograms.filter((p) => p.active).length;
  const mayaInactiveCount = mayaPrograms.filter((p) => !p.active).length;
  if (mayaPrograms.length === 2) {
    console.log(`   ✓ Maya has ${mayaPrograms.length} programs`);
    passed++;
  } else {
    console.log(`   ✗ Maya has ${mayaPrograms.length} programs (expected 2)`);
    failed++;
  }
  if (mayaActiveCount === 1 && mayaInactiveCount === 1) {
    console.log(`   ✓ Maya has 1 active, 1 inactive program`);
    passed++;
  } else {
    console.log(`   ✗ Maya has ${mayaActiveCount} active, ${mayaInactiveCount} inactive (expected 1, 1)`);
    failed++;
  }
  if (mayaTotalLogs === 65) {
    console.log(`   ✓ Maya has ${mayaTotalLogs} total workout logs`);
    passed++;
  } else {
    console.log(`   ✗ Maya has ${mayaTotalLogs} total workout logs (expected 65)`);
    failed++;
  }

  // 5. Verify Taylor's last workout is 14 days ago
  console.log('\n5. Checking Taylor last workout is 14 days ago...');
  const taylor = await prisma.user.findUnique({
    where: { email: 'taylor@test.baisics.app' },
    include: {
      ownedPrograms: {
        include: {
          workoutLogs: {
            orderBy: { completedAt: 'desc' },
            take: 1,
          },
        },
      },
    },
  });
  const taylorLastLog = taylor?.ownedPrograms
    .flatMap((p) => p.workoutLogs)
    .sort((a, b) => (b.completedAt?.getTime() ?? 0) - (a.completedAt?.getTime() ?? 0))[0];
  const daysSinceTaylorLast = taylorLastLog?.completedAt
    ? Math.round((Date.now() - taylorLastLog.completedAt.getTime()) / (1000 * 60 * 60 * 24))
    : null;
  if (daysSinceTaylorLast === 14) {
    console.log(`   ✓ Taylor's last workout was ${daysSinceTaylorLast} days ago`);
    passed++;
  } else {
    console.log(`   ✗ Taylor's last workout was ${daysSinceTaylorLast} days ago (expected 14)`);
    failed++;
  }

  // 6. Verify Alex has 0 workout logs
  console.log('\n6. Checking Alex has 0 workout logs...');
  const alex = await prisma.user.findUnique({
    where: { email: 'alex@test.baisics.app' },
    include: {
      ownedPrograms: {
        include: {
          workoutLogs: true,
        },
      },
    },
  });
  const alexLogs = alex?.ownedPrograms.reduce((sum, p) => sum + p.workoutLogs.length, 0) ?? 0;
  if (alexLogs === 0) {
    console.log(`   ✓ Alex has ${alexLogs} workout logs`);
    passed++;
  } else {
    console.log(`   ✗ Alex has ${alexLogs} workout logs (expected 0)`);
    failed++;
  }

  // 7. Verify streak data matches persona specs
  console.log('\n7. Checking streak data for key personas...');
  const streakChecks = [
    { email: 'alex@test.baisics.app', expectedCurrent: 0, expectedLongest: 0 },
    { email: 'sarah@test.baisics.app', expectedCurrent: 0, expectedLongest: 3 },
    { email: 'jordan@test.baisics.app', expectedCurrent: 7, expectedLongest: 7 },
    { email: 'taylor@test.baisics.app', expectedCurrent: 0, expectedLongest: 12 },
    { email: 'robert@test.baisics.app', expectedCurrent: 16, expectedLongest: 16 },
    { email: 'marcus@test.baisics.app', expectedCurrent: 21, expectedLongest: 21 },
    { email: 'priya@test.baisics.app', expectedCurrent: 21, expectedLongest: 21 },
    { email: 'derek@test.baisics.app', expectedCurrent: 40, expectedLongest: 40 },
  ];
  let streakPassed = 0;
  let streakFailed = 0;
  for (const check of streakChecks) {
    const user = await prisma.user.findUnique({
      where: { email: check.email },
      select: { name: true, streakCurrent: true, streakLongest: true },
    });
    if (user?.streakCurrent === check.expectedCurrent && user?.streakLongest === check.expectedLongest) {
      console.log(`   ✓ ${user.name}: current=${user.streakCurrent}, longest=${user.streakLongest}`);
      streakPassed++;
    } else {
      console.log(
        `   ✗ ${user?.name || check.email}: current=${user?.streakCurrent} (expected ${check.expectedCurrent}), longest=${user?.streakLongest} (expected ${check.expectedLongest})`
      );
      streakFailed++;
    }
  }
  if (streakFailed === 0) {
    console.log(`   ✓ All streak data correct`);
    passed++;
  } else {
    console.log(`   ✗ ${streakFailed}/${streakChecks.length} streak checks failed`);
    failed++;
  }

  // Summary
  console.log('\n=== VERIFICATION SUMMARY ===');
  console.log(`Passed: ${passed}/${passed + failed}`);
  console.log(`Failed: ${failed}/${passed + failed}`);

  if (failed === 0) {
    console.log('\n✅ ALL VERIFICATION CHECKS PASSED\n');
  } else {
    console.log('\n❌ SOME CHECKS FAILED\n');
    process.exit(1);
  }

  await prisma.$disconnect();
}

verify().catch((e) => {
  console.error(e);
  process.exit(1);
});
