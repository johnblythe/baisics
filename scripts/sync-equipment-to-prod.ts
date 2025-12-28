/**
 * Sync exercise equipment data to production
 *
 * Usage:
 *   npx tsx scripts/sync-equipment-to-prod.ts               # Dry run (local)
 *   npx tsx scripts/sync-equipment-to-prod.ts --apply       # Apply (local)
 *   npx tsx scripts/sync-equipment-to-prod.ts --prod        # Dry run (prod)
 *   npx tsx scripts/sync-equipment-to-prod.ts --prod --apply  # Apply (prod)
 *
 * Prerequisite: vercel env pull .env.production --environment=production
 *
 * This script reads from exercise-equipment-data.json and applies
 * equipment updates to the database, matching by exercise name.
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

import { prisma } from "../src/lib/prisma";

interface ExerciseEquipment {
  id: string;
  name: string;
  equipment: string[];
}

async function syncEquipment(dryRun = true) {
  console.log(dryRun ? "=== DRY RUN ===" : "=== APPLYING TO DATABASE ===");

  // Show DB target
  const dbUrl = process.env.DATABASE_URL || "";
  const isProduction = dbUrl.includes("neon") || dbUrl.includes("supabase") || dbUrl.includes("pooler");
  console.log(`Target: ${isProduction ? "PRODUCTION" : "LOCAL"}`);
  console.log();

  // Load equipment data
  const dataPath = path.join(__dirname, "exercise-equipment-data.json");
  const data: ExerciseEquipment[] = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  console.log(`Loaded ${data.length} exercises from JSON\n`);

  // Create name -> equipment map
  const equipmentMap = new Map<string, string[]>();
  for (const ex of data) {
    equipmentMap.set(ex.name.toLowerCase(), ex.equipment);
  }

  // Get all exercises from DB
  const dbExercises = await prisma.exerciseLibrary.findMany({
    select: { id: true, name: true, equipment: true },
  });
  console.log(`Found ${dbExercises.length} exercises in database\n`);

  let updated = 0;
  let skipped = 0;
  let notFound = 0;
  const updates: { id: string; name: string; equipment: string[] }[] = [];

  for (const ex of dbExercises) {
    const targetEquipment = equipmentMap.get(ex.name.toLowerCase());

    if (!targetEquipment) {
      notFound++;
      continue;
    }

    // Check if already has same equipment
    const currentEquip = JSON.stringify(ex.equipment.sort());
    const targetEquip = JSON.stringify(targetEquipment.sort());

    if (currentEquip === targetEquip) {
      skipped++;
      continue;
    }

    updates.push({
      id: ex.id,
      name: ex.name,
      equipment: targetEquipment,
    });
    updated++;
  }

  console.log(`Summary:`);
  console.log(`  Updates needed: ${updated}`);
  console.log(`  Already correct: ${skipped}`);
  console.log(`  Not in source data: ${notFound}`);
  console.log();

  if (updates.length > 0) {
    console.log(`Updates to apply (first 20):`);
    updates.slice(0, 20).forEach((u) => {
      console.log(`  ${u.name}: ${u.equipment.join(", ")}`);
    });
    if (updates.length > 20) {
      console.log(`  ... and ${updates.length - 20} more`);
    }
    console.log();
  }

  if (!dryRun && updates.length > 0) {
    console.log("Applying updates...");
    let count = 0;
    for (const update of updates) {
      await prisma.exerciseLibrary.update({
        where: { id: update.id },
        data: { equipment: update.equipment },
      });
      count++;
      if (count % 100 === 0) {
        console.log(`  Updated ${count}/${updates.length}`);
      }
    }
    console.log(`Done! Updated ${count} exercises.`);
  }

  await prisma.$disconnect();
}

const dryRun = !process.argv.includes("--apply");
syncEquipment(dryRun);
