/**
 * Export ExerciseLibrary to JSON seed file
 * Run: npx tsx scripts/export-exercises.ts
 */

import { prisma } from '../src/lib/prisma';
import { writeFileSync } from 'fs';
import { join } from 'path';

async function exportExercises() {
  console.log('Fetching exercises from database...');

  const exercises = await prisma.exerciseLibrary.findMany({
    orderBy: { name: 'asc' },
  });

  console.log(`Found ${exercises.length} exercises`);

  // Write to seed file
  const outputPath = join(__dirname, '../prisma/seed-data/exercises.json');

  writeFileSync(
    outputPath,
    JSON.stringify(exercises, null, 2),
    'utf-8'
  );

  console.log(`Exported to ${outputPath}`);

  // Also log some stats
  const categories = [...new Set(exercises.map(e => e.category))];
  const withInstructions = exercises.filter(e => e.instructions.length > 0).length;

  console.log('\nStats:');
  console.log(`  Categories: ${categories.join(', ')}`);
  console.log(`  With instructions: ${withInstructions}/${exercises.length}`);
}

exportExercises()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
