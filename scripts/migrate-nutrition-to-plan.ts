/**
 * Migrate nutrition data from WorkoutPlan to NutritionPlan
 *
 * This script queries WorkoutPlans that have complete nutrition data
 * (dailyCalories, proteinGrams, carbGrams, fatGrams all not null)
 * and creates corresponding NutritionPlan records with programId.
 *
 * Usage:
 *   npx tsx scripts/migrate-nutrition-to-plan.ts               # Dry run (preview)
 *   npx tsx scripts/migrate-nutrition-to-plan.ts --apply       # Apply changes
 */
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from .env.local
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2]
        .trim()
        .replace(/^["']|["']$/g, "");
    }
  }
  console.log("Loaded env from .env.local");
} else {
  console.log("Warning: .env.local not found");
}

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface WorkoutPlanWithProgram {
  id: string;
  programId: string;
  phase: number;
  dailyCalories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  program: {
    id: string;
    createdAt: Date;
  };
}

async function migrateNutritionData(dryRun = true) {
  console.log(dryRun ? "\n=== DRY RUN ===" : "\n=== APPLYING MIGRATION ===");
  console.log("Migrating nutrition data from WorkoutPlan to NutritionPlan\n");

  // Query WorkoutPlans with complete nutrition data
  // The schema has non-nullable Int fields, so all records have these values
  const workoutPlans = await prisma.workoutPlan.findMany({
    where: {
      // All nutrition fields are non-nullable in schema, so just query all
      programId: { not: undefined },
    },
    select: {
      id: true,
      programId: true,
      phase: true,
      dailyCalories: true,
      proteinGrams: true,
      carbGrams: true,
      fatGrams: true,
      program: {
        select: {
          id: true,
          createdAt: true,
        },
      },
    },
  }) as WorkoutPlanWithProgram[];

  console.log(`Found ${workoutPlans.length} WorkoutPlans with nutrition data`);

  if (workoutPlans.length === 0) {
    console.log("No records to migrate.");
    await prisma.$disconnect();
    return;
  }

  // Check for existing NutritionPlans to avoid duplicates
  const existingPlans = await prisma.nutritionPlan.findMany({
    where: {
      programId: { not: null },
    },
    select: {
      programId: true,
      phaseNumber: true,
    },
  });

  const existingKey = (programId: string, phaseNumber: number) =>
    `${programId}:${phaseNumber}`;
  const existingSet = new Set(
    existingPlans.map((p) => existingKey(p.programId!, p.phaseNumber))
  );

  console.log(`Found ${existingPlans.length} existing NutritionPlans`);

  // Group by program+phase to dedupe (in case multiple workout plans per phase)
  const uniquePlans = new Map<string, WorkoutPlanWithProgram>();
  for (const wp of workoutPlans) {
    const key = existingKey(wp.programId, wp.phase);
    if (!existingSet.has(key) && !uniquePlans.has(key)) {
      uniquePlans.set(key, wp);
    }
  }

  console.log(`${uniquePlans.size} new NutritionPlans to create (after deduping)\n`);

  if (uniquePlans.size === 0) {
    console.log("All records already migrated.");
    await prisma.$disconnect();
    return;
  }

  // Preview first few records
  const previewCount = Math.min(5, uniquePlans.size);
  console.log(`Preview of first ${previewCount} records to create:`);
  let i = 0;
  for (const [, wp] of uniquePlans) {
    if (i >= previewCount) break;
    console.log(
      `  Program ${wp.programId.slice(0, 8)}... Phase ${wp.phase}: ${wp.dailyCalories} cal, ${wp.proteinGrams}g P, ${wp.carbGrams}g C, ${wp.fatGrams}g F`
    );
    i++;
  }
  if (uniquePlans.size > previewCount) {
    console.log(`  ... and ${uniquePlans.size - previewCount} more`);
  }
  console.log();

  if (dryRun) {
    console.log("Dry run complete. Run with --apply to create records.");
    await prisma.$disconnect();
    return;
  }

  // Create NutritionPlan records
  let created = 0;
  let errors = 0;

  for (const [, wp] of uniquePlans) {
    try {
      await prisma.nutritionPlan.create({
        data: {
          programId: wp.programId,
          phaseNumber: wp.phase,
          dailyCalories: wp.dailyCalories,
          proteinGrams: wp.proteinGrams,
          carbGrams: wp.carbGrams,
          fatGrams: wp.fatGrams,
          effectiveDate: wp.program.createdAt,
        },
      });
      created++;

      if (created % 50 === 0) {
        console.log(`  Created ${created}/${uniquePlans.size}...`);
      }
    } catch (err) {
      errors++;
      console.error(`  Error creating plan for program ${wp.programId}:`, err);
    }
  }

  console.log(`\nMigration complete:`);
  console.log(`  Created: ${created}`);
  if (errors > 0) {
    console.log(`  Errors: ${errors}`);
  }

  // Verify final count
  const finalCount = await prisma.nutritionPlan.count({
    where: { programId: { not: null } },
  });
  console.log(`  Total program NutritionPlans now: ${finalCount}`);

  await prisma.$disconnect();
}

const dryRun = !process.argv.includes("--apply");
migrateNutritionData(dryRun).catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
