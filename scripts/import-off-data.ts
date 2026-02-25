/**
 * Import Open Food Facts JSONL data into foods_off table
 *
 * Streams a JSONL file, filters for English-market products with macros,
 * and batch-inserts into Postgres via Prisma.
 *
 * Usage:
 *   npx tsx scripts/import-off-data.ts --file ./data.jsonl                   # Dry run (local)
 *   npx tsx scripts/import-off-data.ts --file ./data.jsonl.gz --apply        # .gz supported
 *   npx tsx scripts/import-off-data.ts --file ./data.jsonl --apply --prod    # Apply (prod)
 *
 * Prerequisite for prod: vercel env pull .env.production --environment=production
 */
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import * as zlib from "zlib";

// Load env from appropriate file (must happen before PrismaClient import)
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

const BATCH_SIZE = 1000;
const PROGRESS_INTERVAL = 10_000;

const ENGLISH_COUNTRIES = new Set([
  "en:united-states",
  "en:united-kingdom",
  "en:canada",
  "en:australia",
]);

interface OFFProduct {
  code?: string;
  product_name?: string;
  product_name_en?: string;
  brands?: string;
  serving_size?: string;
  countries_tags?: string[];
  nutriments?: {
    "energy-kcal_100g"?: number;
    energy_kcal_100g?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
  };
}

interface AcceptedRow {
  code: string;
  product_name: string;
  brands: string | null;
  calories_per_100g: number | null;
  protein_per_100g: number | null;
  carbs_per_100g: number | null;
  fat_per_100g: number | null;
  serving_size: string | null;
}

function getBestName(product: OFFProduct): string | null {
  const name = product.product_name?.trim();
  if (name) return name;
  const nameEn = product.product_name_en?.trim();
  if (nameEn) return nameEn;
  return null;
}

function isEnglishMarket(product: OFFProduct): boolean {
  // Has English name
  if (product.product_name_en?.trim()) return true;
  // Sold in English-speaking country
  const countries = product.countries_tags;
  if (Array.isArray(countries)) {
    for (const c of countries) {
      if (ENGLISH_COUNTRIES.has(c)) return true;
    }
  }
  return false;
}

function getMacros(product: OFFProduct) {
  const n = product.nutriments || {};
  const calories = n["energy-kcal_100g"] ?? n.energy_kcal_100g ?? null;
  const protein = n.proteins_100g ?? null;
  const carbs = n.carbohydrates_100g ?? null;
  const fat = n.fat_100g ?? null;
  return { calories, protein, carbs, fat };
}

function hasValidMacros(macros: {
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
}): boolean {
  const values = [macros.calories, macros.protein, macros.carbs, macros.fat];
  // At least 1 non-zero macro
  let hasNonZero = false;
  for (const v of values) {
    if (v !== null && v < 0) return false; // negative → reject
    if (v !== null && v > 0) hasNonZero = true;
  }
  return hasNonZero;
}

/**
 * Sanitize string for Postgres — strip null bytes and control chars
 */
function sanitize(v: string): string {
  return v.replace(/\0/g, "").replace(/[\x01-\x08\x0B\x0C\x0E-\x1F]/g, "");
}

async function flushBatch(batch: AcceptedRow[], dryRun: boolean): Promise<number> {
  if (batch.length === 0 || dryRun) return 0;

  // Dedupe within batch — OFF JSONL can have duplicate barcodes
  const seen = new Set<string>();
  const deduped = batch.filter((r) => {
    if (seen.has(r.code)) return false;
    seen.add(r.code);
    return true;
  });

  const COLS_PER_ROW = 8;
  const params: (string | number | null)[] = [];
  const valueRows: string[] = [];

  for (let i = 0; i < deduped.length; i++) {
    const r = deduped[i];
    const p = i * COLS_PER_ROW;
    valueRows.push(
      `(gen_random_uuid(), $${p+1}, $${p+2}, $${p+3}, $${p+4}, $${p+5}, $${p+6}, $${p+7}, $${p+8}, NOW())`
    );
    params.push(
      sanitize(r.code),
      sanitize(r.product_name),
      r.brands ? sanitize(r.brands) : null,
      r.calories_per_100g,
      r.protein_per_100g,
      r.carbs_per_100g,
      r.fat_per_100g,
      r.serving_size ? sanitize(r.serving_size) : null,
    );
  }

  const sql = `
    INSERT INTO foods_off (id, code, product_name, brands, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, serving_size, imported_at)
    VALUES ${valueRows.join(",\n")}
    ON CONFLICT (code) DO UPDATE SET
      product_name = EXCLUDED.product_name,
      brands = EXCLUDED.brands,
      calories_per_100g = EXCLUDED.calories_per_100g,
      protein_per_100g = EXCLUDED.protein_per_100g,
      carbs_per_100g = EXCLUDED.carbs_per_100g,
      fat_per_100g = EXCLUDED.fat_per_100g,
      serving_size = EXCLUDED.serving_size,
      imported_at = EXCLUDED.imported_at
  `;

  const result = await prisma.$executeRawUnsafe(sql, ...params);
  return result;
}

async function importOFF(filePath: string, dryRun: boolean) {
  console.log(dryRun ? "\n=== DRY RUN ===" : "\n=== APPLYING TO DATABASE ===");

  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || "";
  const isProduction =
    dbUrl.includes("neon") ||
    dbUrl.includes("supabase") ||
    dbUrl.includes("pooler");
  console.log(`Target: ${isProduction ? "PRODUCTION" : "LOCAL"}`);
  console.log(`File: ${filePath}\n`);

  if (!fs.existsSync(filePath)) {
    console.error(`Error: file not found: ${filePath}`);
    process.exit(1);
  }

  const isGz = filePath.endsWith(".gz");
  let inputStream: NodeJS.ReadableStream = fs.createReadStream(filePath);
  if (isGz) {
    console.log("Detected .gz file — streaming through gunzip (no disk extraction needed)");
    inputStream = inputStream.pipe(zlib.createGunzip());
  }

  const rl = readline.createInterface({
    input: inputStream,
    crlfDelay: Infinity,
  });

  let processed = 0;
  let accepted = 0;
  let skipped = 0;
  let inserted = 0;
  let malformed = 0;
  let batch: AcceptedRow[] = [];

  for await (const line of rl) {
    processed++;

    // Parse JSON
    let product: OFFProduct;
    try {
      product = JSON.parse(line);
    } catch {
      malformed++;
      if (malformed <= 5) {
        console.log(`  [malformed] line ${processed}: ${line.slice(0, 80)}...`);
      }
      skipped++;
      if (processed % PROGRESS_INTERVAL === 0) {
        console.log(
          `  processed=${processed} accepted=${accepted} skipped=${skipped} inserted=${inserted}`
        );
      }
      continue;
    }

    // Must have a code
    const code = product.code?.trim();
    if (!code) {
      skipped++;
      if (processed % PROGRESS_INTERVAL === 0) {
        console.log(
          `  processed=${processed} accepted=${accepted} skipped=${skipped} inserted=${inserted}`
        );
      }
      continue;
    }

    // Best name
    const bestName = getBestName(product);
    if (!bestName) {
      skipped++;
      if (processed % PROGRESS_INTERVAL === 0) {
        console.log(
          `  processed=${processed} accepted=${accepted} skipped=${skipped} inserted=${inserted}`
        );
      }
      continue;
    }

    // English market check
    if (!isEnglishMarket(product)) {
      skipped++;
      if (processed % PROGRESS_INTERVAL === 0) {
        console.log(
          `  processed=${processed} accepted=${accepted} skipped=${skipped} inserted=${inserted}`
        );
      }
      continue;
    }

    // Macros
    const macros = getMacros(product);
    if (!hasValidMacros(macros)) {
      skipped++;
      if (processed % PROGRESS_INTERVAL === 0) {
        console.log(
          `  processed=${processed} accepted=${accepted} skipped=${skipped} inserted=${inserted}`
        );
      }
      continue;
    }

    // Accept
    accepted++;
    batch.push({
      code,
      product_name: bestName,
      brands: product.brands?.trim() || null,
      calories_per_100g: macros.calories,
      protein_per_100g: macros.protein,
      carbs_per_100g: macros.carbs,
      fat_per_100g: macros.fat,
      serving_size: product.serving_size?.trim() || null,
    });

    // Flush batch
    if (batch.length >= BATCH_SIZE) {
      const count = await flushBatch(batch, dryRun);
      inserted += count;
      batch = [];
    }

    // Progress
    if (processed % PROGRESS_INTERVAL === 0) {
      console.log(
        `  processed=${processed} accepted=${accepted} skipped=${skipped} inserted=${inserted}`
      );
    }
  }

  // Flush remaining
  if (batch.length > 0) {
    const count = await flushBatch(batch, dryRun);
    inserted += count;
  }

  // Summary
  console.log(`\n=== SUMMARY ===`);
  console.log(`  Total processed: ${processed}`);
  console.log(`  Accepted:        ${accepted}`);
  console.log(`  Skipped:         ${skipped}`);
  console.log(`  Malformed JSON:  ${malformed}`);
  console.log(`  Inserted/Updated:${dryRun ? " (dry run, none applied)" : ` ${inserted}`}`);

  // Sample rows
  if (!dryRun && inserted > 0) {
    console.log(`\n=== SAMPLE ROWS ===`);
    const samples = await prisma.$queryRawUnsafe<
      Array<{
        code: string;
        product_name: string;
        brands: string | null;
        calories_per_100g: number | null;
        protein_per_100g: number | null;
      }>
    >(
      `SELECT code, product_name, brands, calories_per_100g, protein_per_100g
       FROM foods_off ORDER BY RANDOM() LIMIT 5`
    );
    for (const row of samples) {
      console.log(
        `  ${row.code} | ${row.product_name} | ${row.brands ?? "(no brand)"} | ${row.calories_per_100g ?? "?"}kcal | ${row.protein_per_100g ?? "?"}g protein`
      );
    }
  }

  await prisma.$disconnect();
}

// --- CLI ---
const fileIdx = process.argv.indexOf("--file");
if (fileIdx === -1 || !process.argv[fileIdx + 1]) {
  console.error("Usage: npx tsx scripts/import-off-data.ts --file <path-to-jsonl> [--apply] [--prod]");
  process.exit(1);
}
const filePath = path.resolve(process.argv[fileIdx + 1]);
const dryRun = !process.argv.includes("--apply");

importOFF(filePath, dryRun).catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
