/**
 * Audit ExerciseLibrary for data quality issues
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

async function audit() {
  const exercises = await prisma.exerciseLibrary.findMany({
    select: {
      id: true,
      name: true,
      equipment: true,
      instructions: true,
    },
    orderBy: { name: 'asc' },
  });

  console.log(`Total exercises in library: ${exercises.length}\n`);

  // Find exercises with empty equipment that look like they need it
  const suspiciousEmpty: string[] = [];
  const equipmentKeywords = ['dumbbell', 'barbell', 'kettlebell', 'cable', 'machine', 'band', 'bench', 'bar'];

  for (const ex of exercises) {
    if (ex.equipment.length === 0) {
      const nameLower = ex.name.toLowerCase();
      for (const kw of equipmentKeywords) {
        if (nameLower.includes(kw)) {
          suspiciousEmpty.push(ex.name);
          break;
        }
      }
    }
  }

  console.log(`=== MISSING EQUIPMENT (name suggests equipment needed) ===`);
  console.log(`Found: ${suspiciousEmpty.length}`);
  for (const name of suspiciousEmpty) {
    console.log(`  - ${name}`);
  }

  // Find exercises with empty instructions
  const emptyInstructions = exercises.filter(e => e.instructions.length === 0);
  console.log(`\n=== MISSING INSTRUCTIONS ===`);
  console.log(`Found: ${emptyInstructions.length}`);
  for (const ex of emptyInstructions.slice(0, 20)) {
    console.log(`  - ${ex.name}`);
  }
  if (emptyInstructions.length > 20) {
    console.log(`  ... and ${emptyInstructions.length - 20} more`);
  }

  // Summary
  console.log(`\n=== SUMMARY ===`);
  console.log(`Total exercises: ${exercises.length}`);
  console.log(`Missing equipment (suspicious): ${suspiciousEmpty.length}`);
  console.log(`Missing instructions: ${emptyInstructions.length}`);

  await prisma.$disconnect();
}

audit().catch(console.error);
