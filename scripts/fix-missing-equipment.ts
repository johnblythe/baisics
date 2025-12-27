/**
 * Fix missing equipment in ExerciseLibrary
 * Auto-populates based on exercise name keywords
 */
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
    }
  }
}

import { prisma } from '../src/lib/prisma';

// Equipment detection rules (order matters - more specific first)
const EQUIPMENT_RULES: { pattern: RegExp; equipment: string[] }[] = [
  // Specific bar types
  { pattern: /ez[- ]?bar/i, equipment: ['EZ Bar'] },
  { pattern: /\bt[- ]?bar\b/i, equipment: ['T-Bar'] },
  { pattern: /v[- ]?bar/i, equipment: ['V-Bar', 'Cable'] },
  { pattern: /trap bar/i, equipment: ['Trap Bar'] },
  { pattern: /axle/i, equipment: ['Axle', 'Barbell'] },

  // Main equipment types
  { pattern: /barbell/i, equipment: ['Barbell'] },
  { pattern: /dumbbell/i, equipment: ['Dumbbell'] },
  { pattern: /kettlebell/i, equipment: ['Kettlebell'] },
  { pattern: /cable/i, equipment: ['Cable'] },
  { pattern: /\b(resistance )?band(?! and glute)/i, equipment: ['Resistance Band'] },

  // Bench variations
  { pattern: /bench press/i, equipment: ['Barbell', 'Bench'] },
  { pattern: /bench dip/i, equipment: ['Bench'] },
  { pattern: /bench jump/i, equipment: ['Bench'] },
  { pattern: /bench sprint/i, equipment: ['Bench'] },
  { pattern: /incline.*press/i, equipment: ['Barbell', 'Bench'] },
  { pattern: /decline.*press/i, equipment: ['Barbell', 'Bench'] },
  { pattern: /flat bench/i, equipment: ['Bench'] },
  { pattern: /chest.?supported/i, equipment: ['Bench'] },

  // Bar exercises (without "barbell" in name)
  { pattern: /parallel bar/i, equipment: ['Parallel Bars'] },
  { pattern: /pull[- ]?up/i, equipment: ['Pull-Up Bar'] },
  { pattern: /chin[- ]?up/i, equipment: ['Pull-Up Bar'] },
  { pattern: /lat pulldown/i, equipment: ['Cable'] },

  // Exercises that imply barbell (no "bodyweight" prefix)
  { pattern: /^back squat$/i, equipment: ['Barbell', 'Squat Rack'] },
  { pattern: /^front squat$/i, equipment: ['Barbell', 'Squat Rack'] },
  { pattern: /^deadlift$/i, equipment: ['Barbell'] },
  { pattern: /^(conventional|sumo) deadlift$/i, equipment: ['Barbell'] },
  { pattern: /^bent[- ]?over row$/i, equipment: ['Barbell'] },
  { pattern: /^overhead press$/i, equipment: ['Barbell'] },
  { pattern: /^(hip|barbell) thrust/i, equipment: ['Barbell', 'Bench'] },
  { pattern: /^good morning/i, equipment: ['Barbell'] },
  { pattern: /^(power|hang|muscle) clean/i, equipment: ['Barbell'] },
  { pattern: /^(power|hang) snatch/i, equipment: ['Barbell'] },
  { pattern: /^pendlay row/i, equipment: ['Barbell'] },
  { pattern: /^rack pull/i, equipment: ['Barbell', 'Squat Rack'] },

  // Strongman equipment
  { pattern: /car deadlift/i, equipment: ['Strongman'] },
  { pattern: /atlas stone/i, equipment: ['Strongman'] },
  { pattern: /log press/i, equipment: ['Strongman'] },
  { pattern: /yoke/i, equipment: ['Strongman'] },

  // Machine exercises
  { pattern: /leg press/i, equipment: ['Machine'] },
  { pattern: /leg curl/i, equipment: ['Machine'] },
  { pattern: /leg extension/i, equipment: ['Machine'] },
  { pattern: /hack squat/i, equipment: ['Machine'] },
  { pattern: /smith machine/i, equipment: ['Smith Machine'] },
  { pattern: /seated row/i, equipment: ['Cable'] },

  // Goblet implies dumbbell/kettlebell
  { pattern: /goblet/i, equipment: ['Dumbbell'] },

  // Farmer's walk
  { pattern: /farmer/i, equipment: ['Dumbbell'] },
];

async function fix(dryRun = true) {
  console.log(dryRun ? '=== DRY RUN ===' : '=== APPLYING FIXES ===');
  console.log();

  const exercises = await prisma.exerciseLibrary.findMany({
    where: { equipment: { equals: [] } },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  console.log(`Found ${exercises.length} exercises with empty equipment\n`);

  let fixed = 0;
  const updates: { id: string; name: string; equipment: string[] }[] = [];

  for (const ex of exercises) {
    const detectedEquipment: Set<string> = new Set();

    for (const rule of EQUIPMENT_RULES) {
      if (rule.pattern.test(ex.name)) {
        rule.equipment.forEach(e => detectedEquipment.add(e));
      }
    }

    if (detectedEquipment.size > 0) {
      const equipment = Array.from(detectedEquipment);
      updates.push({ id: ex.id, name: ex.name, equipment });
      console.log(`  ${ex.name}`);
      console.log(`    → ${equipment.join(', ')}`);
      fixed++;
    }
  }

  console.log(`\nWould fix: ${fixed} exercises`);

  if (!dryRun && updates.length > 0) {
    console.log('\nApplying updates...');
    for (const update of updates) {
      await prisma.exerciseLibrary.update({
        where: { id: update.id },
        data: { equipment: update.equipment },
      });
    }
    console.log('Done!');
  }

  await prisma.$disconnect();
}

// Check for --apply flag
const dryRun = !process.argv.includes('--apply');
fix(dryRun);
