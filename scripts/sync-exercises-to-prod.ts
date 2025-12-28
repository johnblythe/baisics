/**
 * Sync exercise data to production
 *
 * Imports all 1062 exercises from local export to prod.
 * Includes equipment data already populated.
 *
 * Usage:
 *   npx tsx scripts/sync-exercises-to-prod.ts               # Dry run (local)
 *   npx tsx scripts/sync-exercises-to-prod.ts --apply       # Apply (local)
 *   npx tsx scripts/sync-exercises-to-prod.ts --prod        # Dry run (prod)
 *   npx tsx scripts/sync-exercises-to-prod.ts --prod --apply  # Apply (prod)
 *
 * Prerequisite: vercel env pull .env.production --environment=production
 */
import * as fs from "fs";
import * as path from "path";

// Load env from appropriate file
const useProd = process.argv.includes("--prod");
const envFile = useProd ? ".env.production" : ".env.local";
const envPath = path.join(__dirname, "..", envFile);

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
  console.log(`Loaded env from ${envFile}`);
} else {
  console.log(`Warning: ${envFile} not found`);
}

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface ExerciseData {
  id: string;
  name: string;
  category: string;
  equipment: string[];
  description: string | null;
  instructions: string[];
  commonMistakes: string[];
  benefits: string[];
  difficulty: string;
  isCompound: boolean;
  movementPattern: string;
  targetMuscles: string[];
  secondaryMuscles: string[];
  videoUrl: string | null;
  images: string[];
  createdAt: string;
  updatedAt: string;
  sortOrder: number;
  defaultTier: string;
  contraindications: string[];
  environments: string[];
}

async function syncExercises(dryRun = true) {
  console.log(dryRun ? "\n=== DRY RUN ===" : "\n=== APPLYING TO DATABASE ===");

  const dbUrl = process.env.DATABASE_URL || "";
  const isProduction =
    dbUrl.includes("neon") ||
    dbUrl.includes("supabase") ||
    dbUrl.includes("pooler");
  console.log(`Target: ${isProduction ? "PRODUCTION" : "LOCAL"}\n`);

  // Load full exercise data
  const dataPath = path.join(__dirname, "exercise-full-data.json");
  if (!fs.existsSync(dataPath)) {
    console.error("Error: exercise-full-data.json not found");
    console.error("Generate it with: npx tsx -e \"...\" (see sync script)");
    process.exit(1);
  }

  const exercises: ExerciseData[] = JSON.parse(
    fs.readFileSync(dataPath, "utf-8")
  );
  console.log(`Loaded ${exercises.length} exercises from local export`);

  // Check current state
  const currentCount = await prisma.exerciseLibrary.count();
  console.log(`Current exercises in database: ${currentCount}`);

  if (currentCount === 0) {
    console.log("\nNo exercises found - will import all...");

    if (dryRun) {
      console.log(`Would import ${exercises.length} exercises`);
    } else {
      let imported = 0;
      for (const ex of exercises) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, createdAt, updatedAt, ...data } = ex;

        await prisma.exerciseLibrary.create({
          data: {
            ...data,
            difficulty: data.difficulty as
              | "BEGINNER"
              | "INTERMEDIATE"
              | "EXPERT",
            movementPattern: data.movementPattern as
              | "PUSH"
              | "PULL"
              | "SQUAT"
              | "HINGE"
              | "LUNGE"
              | "ROTATION"
              | "CARRY"
              | "PLANK"
              | "OTHER",
            targetMuscles: data.targetMuscles as any[],
            secondaryMuscles: data.secondaryMuscles as any[],
            defaultTier: data.defaultTier as "TIER_1" | "TIER_2" | "TIER_3",
          },
        });

        imported++;
        if (imported % 100 === 0) {
          console.log(`  Imported ${imported}/${exercises.length}...`);
        }
      }
      console.log(`\nImported ${imported} exercises`);
    }
  } else {
    console.log("\nExercises exist - updating with local data...");

    // Create name map
    const localExerciseMap = new Map<string, ExerciseData>();
    for (const ex of exercises) {
      localExerciseMap.set(ex.name.toLowerCase(), ex);
    }

    const dbExercises = await prisma.exerciseLibrary.findMany({
      select: { id: true, name: true },
    });

    let updated = 0;
    let created = 0;
    const existingNames = new Set(dbExercises.map((e) => e.name.toLowerCase()));

    // Update existing
    for (const dbEx of dbExercises) {
      const localEx = localExerciseMap.get(dbEx.name.toLowerCase());
      if (localEx) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, createdAt, updatedAt, ...data } = localEx;

        if (!dryRun) {
          await prisma.exerciseLibrary.update({
            where: { id: dbEx.id },
            data: {
              ...data,
              difficulty: data.difficulty as
                | "BEGINNER"
                | "INTERMEDIATE"
                | "EXPERT",
              movementPattern: data.movementPattern as
                | "PUSH"
                | "PULL"
                | "SQUAT"
                | "HINGE"
                | "LUNGE"
                | "ROTATION"
                | "CARRY"
                | "PLANK"
                | "OTHER",
              targetMuscles: data.targetMuscles as any[],
              secondaryMuscles: data.secondaryMuscles as any[],
              defaultTier: data.defaultTier as "TIER_1" | "TIER_2" | "TIER_3",
            },
          });
        }
        updated++;
      }
    }

    // Create missing
    for (const ex of exercises) {
      if (!existingNames.has(ex.name.toLowerCase())) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, createdAt, updatedAt, ...data } = ex;

        if (!dryRun) {
          await prisma.exerciseLibrary.create({
            data: {
              ...data,
              difficulty: data.difficulty as
                | "BEGINNER"
                | "INTERMEDIATE"
                | "EXPERT",
              movementPattern: data.movementPattern as
                | "PUSH"
                | "PULL"
                | "SQUAT"
                | "HINGE"
                | "LUNGE"
                | "ROTATION"
                | "CARRY"
                | "PLANK"
                | "OTHER",
              targetMuscles: data.targetMuscles as any[],
              secondaryMuscles: data.secondaryMuscles as any[],
              defaultTier: data.defaultTier as "TIER_1" | "TIER_2" | "TIER_3",
            },
          });
        }
        created++;
      }
    }

    console.log(`\nSummary:`);
    console.log(`  Would update: ${updated}`);
    console.log(`  Would create: ${created}`);
  }

  // Final count
  if (!dryRun) {
    const finalCount = await prisma.exerciseLibrary.count();
    const withEquipment = await prisma.exerciseLibrary.count({
      where: { equipment: { isEmpty: false } },
    });
    console.log(`\nFinal state:`);
    console.log(`  Total exercises: ${finalCount}`);
    console.log(`  With equipment: ${withEquipment}`);
  }

  await prisma.$disconnect();
}

const dryRun = !process.argv.includes("--apply");
syncExercises(dryRun).catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
