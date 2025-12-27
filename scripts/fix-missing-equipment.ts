/**
 * Fix missing equipment in ExerciseLibrary
 * Auto-populates based on exercise name keywords
 */
import * as fs from "fs";
import * as path from "path";

const envPath = path.join(__dirname, "../.env.local");
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
}

import { prisma } from "../src/lib/prisma";

// Equipment detection rules (order matters - more specific first)
const EQUIPMENT_RULES: { pattern: RegExp; equipment: string[] }[] = [
  // Specific bar types
  { pattern: /ez[- ]?bar/i, equipment: ["EZ Bar"] },
  { pattern: /\bt[- ]?bar\b/i, equipment: ["T-Bar"] },
  { pattern: /v[- ]?bar/i, equipment: ["V-Bar", "Cable"] },
  { pattern: /trap bar/i, equipment: ["Trap Bar"] },
  { pattern: /axle/i, equipment: ["Axle", "Barbell"] },

  // Main equipment types
  { pattern: /barbell/i, equipment: ["Barbell"] },
  { pattern: /dumbbell/i, equipment: ["Dumbbell"] },
  { pattern: /kettlebell/i, equipment: ["Kettlebell"] },
  { pattern: /cable/i, equipment: ["Cable"] },
  {
    pattern: /\b(resistance )?band(?! and glute)/i,
    equipment: ["Resistance Band"],
  },

  // Bench variations
  { pattern: /bench press/i, equipment: ["Barbell", "Bench"] },
  { pattern: /bench dip/i, equipment: ["Bench"] },
  { pattern: /bench jump/i, equipment: ["Bench"] },
  { pattern: /bench sprint/i, equipment: ["Bench"] },
  { pattern: /incline.*press/i, equipment: ["Barbell", "Bench"] },
  { pattern: /decline.*press/i, equipment: ["Barbell", "Bench"] },
  { pattern: /flat bench/i, equipment: ["Bench"] },
  { pattern: /chest.?supported/i, equipment: ["Bench"] },

  // Bar exercises (without "barbell" in name)
  { pattern: /parallel bar/i, equipment: ["Parallel Bars"] },
  { pattern: /pull[- ]?up/i, equipment: ["Pull-Up Bar"] },
  { pattern: /chin[- ]?up/i, equipment: ["Pull-Up Bar"] },
  { pattern: /lat pulldown/i, equipment: ["Cable"] },

  // Exercises that imply barbell (no "bodyweight" prefix)
  { pattern: /^back squat$/i, equipment: ["Barbell", "Squat Rack"] },
  { pattern: /^front squat$/i, equipment: ["Barbell", "Squat Rack"] },
  { pattern: /^deadlift$/i, equipment: ["Barbell"] },
  { pattern: /^(conventional|sumo) deadlift$/i, equipment: ["Barbell"] },
  { pattern: /^bent[- ]?over row$/i, equipment: ["Barbell"] },
  { pattern: /^overhead press$/i, equipment: ["Barbell"] },
  { pattern: /^(hip|barbell) thrust/i, equipment: ["Barbell", "Bench"] },
  { pattern: /^good morning/i, equipment: ["Barbell"] },
  { pattern: /^(power|hang|muscle) clean/i, equipment: ["Barbell"] },
  { pattern: /^(power|hang) snatch/i, equipment: ["Barbell"] },
  { pattern: /^pendlay row/i, equipment: ["Barbell"] },
  { pattern: /^rack pull/i, equipment: ["Barbell", "Squat Rack"] },

  // Strongman equipment
  { pattern: /car deadlift/i, equipment: ["Strongman"] },
  { pattern: /atlas stone/i, equipment: ["Strongman"] },
  { pattern: /log (press|lift)/i, equipment: ["Strongman"] },
  { pattern: /yoke/i, equipment: ["Strongman"] },
  { pattern: /tire flip/i, equipment: ["Strongman"] },
  { pattern: /keg (load|carry)/i, equipment: ["Strongman"] },
  { pattern: /sandbag/i, equipment: ["Strongman"] },
  { pattern: /prowler/i, equipment: ["Strongman"] },
  { pattern: /rickshaw/i, equipment: ["Strongman"] },
  { pattern: /power stairs/i, equipment: ["Strongman"] },

  // Sled exercises
  { pattern: /sled/i, equipment: ["Sled"] },

  // Machine exercises
  { pattern: /leg press/i, equipment: ["Machine"] },
  { pattern: /leg curl/i, equipment: ["Machine"] },
  { pattern: /leg extension/i, equipment: ["Machine"] },
  { pattern: /hack squat/i, equipment: ["Machine"] },
  { pattern: /smith machine/i, equipment: ["Smith Machine"] },
  { pattern: /seated row/i, equipment: ["Cable"] },

  // Cable exercises
  { pattern: /pushdown/i, equipment: ["Cable"] },
  { pattern: /tricep rope/i, equipment: ["Cable"] },
  { pattern: /face pull/i, equipment: ["Cable"] },

  // Suspension/TRX/Rings
  { pattern: /suspended/i, equipment: ["TRX"] },
  { pattern: /\btrx\b/i, equipment: ["TRX"] },
  { pattern: /with straps/i, equipment: ["TRX"] },
  { pattern: /ring dip/i, equipment: ["Rings"] },
  { pattern: /muscle up/i, equipment: ["Pull-Up Bar"] },
  { pattern: /kipping/i, equipment: ["Pull-Up Bar"] },

  // Landmine exercises
  { pattern: /landmine/i, equipment: ["Barbell", "Landmine"] },
  { pattern: /meadows row/i, equipment: ["Barbell", "Landmine"] },

  // Rope exercises
  { pattern: /rope climb/i, equipment: ["Rope"] },
  { pattern: /rope jump/i, equipment: ["Jump Rope"] },

  // Plate exercises (weight plates)
  {
    pattern: /plate (pinch|twist|curl|neck|squeeze)/i,
    equipment: ["Weight Plate"],
  },
  { pattern: /svend press/i, equipment: ["Weight Plate"] },

  // Box/Platform exercises
  { pattern: /box (jump|squat|shuffle|step)/i, equipment: ["Box"] },
  { pattern: /depth jump/i, equipment: ["Box"] },
  { pattern: /platform/i, equipment: ["Box"] },
  { pattern: /step-?up/i, equipment: ["Box"] },

  // Cone drills
  { pattern: /cone/i, equipment: ["Cones"] },

  // Weighted exercises (free weight loading)
  { pattern: /^weighted/i, equipment: ["Dumbbell"] },
  { pattern: /zottman curl/i, equipment: ["Dumbbell"] },
  { pattern: /wrist roller/i, equipment: ["Wrist Roller"] },

  // Head harness
  { pattern: /head harness|neck resistance/i, equipment: ["Head Harness"] },

  // Sledgehammer
  { pattern: /sledgehammer/i, equipment: ["Sledgehammer"] },

  // Wood chops (usually cable or dumbbell)
  { pattern: /wood chop/i, equipment: ["Cable"] },

  // Goblet implies dumbbell/kettlebell
  { pattern: /goblet/i, equipment: ["Dumbbell"] },

  // Farmer's walk
  { pattern: /farmer/i, equipment: ["Dumbbell"] },

  // Romanian Deadlift variations
  { pattern: /^romanian deadlift/i, equipment: ["Barbell"] },
  { pattern: /single[- ]?leg (romanian|rdl)/i, equipment: ["Dumbbell"] },

  // Pin squat
  { pattern: /pin squat/i, equipment: ["Barbell", "Squat Rack"] },

  // Standing calf raise (usually machine or barbell)
  { pattern: /standing calf raise/i, equipment: ["Machine"] },

  // Lying tricep extension
  { pattern: /lying tricep/i, equipment: ["Barbell"] },

  // Overhead tricep extension
  { pattern: /overhead.*(tricep|extension)/i, equipment: ["Dumbbell"] },

  // Seated overhead press (without other qualifiers)
  { pattern: /^seated overhead press$/i, equipment: ["Dumbbell"] },

  // Inverted rows (elevated feet = harder bodyweight)
  { pattern: /inverted row/i, equipment: ["Barbell", "Squat Rack"] },

  // ============================================
  // BODYWEIGHT EXERCISES (must be last - catch-all)
  // ============================================

  // Explicit bodyweight patterns
  { pattern: /push-?up/i, equipment: ["Bodyweight"] },
  { pattern: /sit-?up/i, equipment: ["Bodyweight"] },
  { pattern: /crunch/i, equipment: ["Bodyweight"] },
  { pattern: /plank/i, equipment: ["Bodyweight"] },
  { pattern: /burpee/i, equipment: ["Bodyweight"] },
  { pattern: /mountain climber/i, equipment: ["Bodyweight"] },
  { pattern: /high knee/i, equipment: ["Bodyweight"] },
  { pattern: /leg (lift|raise|pull|tuck)/i, equipment: ["Bodyweight"] },
  { pattern: /squat jump/i, equipment: ["Bodyweight"] },
  { pattern: /split jump/i, equipment: ["Bodyweight"] },
  { pattern: /scissors (jump|kick)/i, equipment: ["Bodyweight"] },
  { pattern: /lunge/i, equipment: ["Bodyweight"] },
  { pattern: /glute.*(raise|bridge|ham)/i, equipment: ["Bodyweight"] },
  { pattern: /hip (circle|thrust)/i, equipment: ["Bodyweight"] },
  { pattern: /butt kick/i, equipment: ["Bodyweight"] },
  { pattern: /bound/i, equipment: ["Bodyweight"] },
  { pattern: /hop(?!per)/i, equipment: ["Bodyweight"] },
  { pattern: /leap/i, equipment: ["Bodyweight"] },
  { pattern: /sprint/i, equipment: ["Bodyweight"] },
  { pattern: /run/i, equipment: ["Bodyweight"] },
  { pattern: /walk/i, equipment: ["Bodyweight"] },
  { pattern: /crawl/i, equipment: ["Bodyweight"] },
  { pattern: /skating/i, equipment: ["Bodyweight"] },
  { pattern: /jumping jack/i, equipment: ["Bodyweight"] },
  { pattern: /toe touch/i, equipment: ["Bodyweight"] },
  { pattern: /back curl|lower back curl/i, equipment: ["Bodyweight"] },
  { pattern: /pelvic tilt/i, equipment: ["Bodyweight"] },
  { pattern: /bridge/i, equipment: ["Bodyweight"] },
  { pattern: /locust/i, equipment: ["Bodyweight"] },
  { pattern: /straddle/i, equipment: ["Bodyweight"] },
  { pattern: /london bridge/i, equipment: ["Bodyweight"] },
  { pattern: /iron cross/i, equipment: ["Bodyweight"] },
  { pattern: /isometric/i, equipment: ["Bodyweight"] },
  { pattern: /jackknife/i, equipment: ["Bodyweight"] },
  { pattern: /janda/i, equipment: ["Bodyweight"] },
  { pattern: /otis-?up/i, equipment: ["Bodyweight"] },
  { pattern: /reverse crunch/i, equipment: ["Bodyweight"] },
  { pattern: /oblique/i, equipment: ["Bodyweight"] },
  { pattern: /knee (across|circle|to chest)/i, equipment: ["Bodyweight"] },
  { pattern: /crossover/i, equipment: ["Bodyweight"] },
  { pattern: /shoulder (circle|raise)/i, equipment: ["Bodyweight"] },
  { pattern: /arm drill/i, equipment: ["Bodyweight"] },
  { pattern: /rocket jump/i, equipment: ["Bodyweight"] },
  { pattern: /turkish get/i, equipment: ["Kettlebell"] },

  // Stretches and mobility (bodyweight)
  { pattern: /stretch/i, equipment: ["Bodyweight"] },
  { pattern: /mobility/i, equipment: ["Bodyweight"] },
  { pattern: /smr|foam roll/i, equipment: ["Foam Roller"] },
  { pattern: /looking at ceiling/i, equipment: ["Bodyweight"] },
  { pattern: /wrist pull/i, equipment: ["Bodyweight"] },
  { pattern: /one arm against wall/i, equipment: ["Bodyweight"] },
  { pattern: /wall drill/i, equipment: ["Bodyweight"] },
  { pattern: /start technique/i, equipment: ["Bodyweight"] },
  { pattern: /moving claw/i, equipment: ["Bodyweight"] },

  // Lying bodyweight exercises
  { pattern: /^lying\b/i, equipment: ["Bodyweight"] },

  // Chin/Pull-up bar exercises
  { pattern: /chin$/i, equipment: ["Pull-Up Bar"] },
  { pattern: /chins$/i, equipment: ["Pull-Up Bar"] },
  { pattern: /\bhang\b/i, equipment: ["Pull-Up Bar"] },

  // Seated bodyweight stretches/exercises (without equipment qualifier)
  {
    pattern: /^seated (biceps|front deltoid|glute|hamstring)$/i,
    equipment: ["Bodyweight"],
  },

  // Overhead lat (stretch)
  { pattern: /overhead lat/i, equipment: ["Bodyweight"] },

  // Scissor kick
  { pattern: /scissor kick/i, equipment: ["Bodyweight"] },

  // Jump variations
  { pattern: /long jump/i, equipment: ["Bodyweight"] },
  { pattern: /push-?off/i, equipment: ["Bodyweight"] },
  { pattern: /stride jump/i, equipment: ["Bodyweight"] },

  // Olympic plate hand squeeze
  { pattern: /plate.*squeeze/i, equipment: ["Weight Plate"] },

  // Towel exercises
  { pattern: /towel/i, equipment: ["Towel"] },

  // Supersets (usually bodyweight or dumbbell based on contents)
  { pattern: /superset.*split squat/i, equipment: ["Bodyweight"] },
  { pattern: /superset.*hanging/i, equipment: ["Pull-Up Bar"] },
  { pattern: /superset.*shoulder press/i, equipment: ["Dumbbell"] },
];

async function fix(dryRun = true) {
  console.log(dryRun ? "=== DRY RUN ===" : "=== APPLYING FIXES ===");
  console.log();

  const exercises = await prisma.exerciseLibrary.findMany({
    where: { equipment: { equals: [] } },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  console.log(`Found ${exercises.length} exercises with empty equipment\n`);

  let fixed = 0;
  const updates: { id: string; name: string; equipment: string[] }[] = [];

  for (const ex of exercises) {
    const detectedEquipment: Set<string> = new Set();

    for (const rule of EQUIPMENT_RULES) {
      if (rule.pattern.test(ex.name)) {
        rule.equipment.forEach((e) => detectedEquipment.add(e));
      }
    }

    if (detectedEquipment.size > 0) {
      const equipment = Array.from(detectedEquipment);
      updates.push({ id: ex.id, name: ex.name, equipment });
      console.log(`  ${ex.name}`);
      console.log(`    → ${equipment.join(", ")}`);
      fixed++;
    }
  }

  console.log(`\nWould fix: ${fixed} exercises`);

  if (!dryRun && updates.length > 0) {
    console.log("\nApplying updates...");
    for (const update of updates) {
      await prisma.exerciseLibrary.update({
        where: { id: update.id },
        data: { equipment: update.equipment },
      });
    }
    console.log("Done!");
  }

  await prisma.$disconnect();
}

// Check for --apply flag
const dryRun = !process.argv.includes("--apply");
fix(dryRun);
