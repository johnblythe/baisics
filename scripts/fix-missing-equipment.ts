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
  { pattern: /ez[- ]?bar/i, equipment: ['EZ Bar'] },
  { pattern: /\bt[- ]?bar\b/i, equipment: ['T-Bar'] },
  { pattern: /v[- ]?bar/i, equipment: ['V-Bar', 'Cable'] },
  { pattern: /trap bar/i, equipment: ['Trap Bar'] },
  { pattern: /barbell/i, equipment: ['Barbell'] },
  { pattern: /dumbbell/i, equipment: ['Dumbbell'] },
  { pattern: /kettlebell/i, equipment: ['Kettlebell'] },
  { pattern: /cable/i, equipment: ['Cable'] },
  { pattern: /\b(resistance )?band(?! and glute)/i, equipment: ['Resistance Band'] },
  { pattern: /bench press/i, equipment: ['Barbell', 'Bench'] },
  { pattern: /bench dip/i, equipment: ['Bench'] },
  { pattern: /bench jump/i, equipment: ['Bench'] },
  { pattern: /bench sprint/i, equipment: ['Bench'] },
  { pattern: /incline.*press/i, equipment: ['Barbell', 'Bench'] },
  { pattern: /flat bench/i, equipment: ['Bench'] },
  { pattern: /parallel bar/i, equipment: ['Parallel Bars'] },
  { pattern: /pull[- ]?up/i, equipment: ['Pull-Up Bar'] },
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
