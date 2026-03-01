/**
 * Food Source Benchmark
 *
 * Tests USDA, OFF Legacy, and Search-a-licious across diverse dietary personas.
 * Measures: speed, completeness (serving data, macros), result quality.
 *
 * Run: npx tsx scripts/food-source-benchmark.ts
 */

const USDA_KEY = process.env.USDA_API_KEY || '';

// ── Personas & their typical foods ──────────────────────────────────────────

interface Persona {
  name: string;
  description: string;
  foods: string[];
}

const PERSONAS: Persona[] = [
  {
    name: 'College Student',
    description: 'Budget-friendly, quick meals, lots of packaged food',
    foods: ['ramen noodles', 'frozen pizza', 'energy drink monster', 'peanut butter', 'instant oatmeal', 'hot pocket'],
  },
  {
    name: 'Busy Professional',
    description: 'Grab-and-go, salads, coffee, meal prep staples',
    foods: ['chipotle chicken bowl', 'starbucks latte', 'mixed greens salad', 'rotisserie chicken', 'protein bar clif', 'sparkling water'],
  },
  {
    name: 'Bodybuilder',
    description: 'High protein, precise tracking, supplements',
    foods: ['chicken breast raw', 'white rice cooked', 'broccoli steamed', 'whey protein powder', 'sweet potato', 'egg whites'],
  },
  {
    name: 'Vegan',
    description: 'Plant-based, meat alternatives, whole foods',
    foods: ['tofu firm', 'black beans canned', 'quinoa cooked', 'beyond meat burger', 'almond milk unsweetened', 'avocado'],
  },
  {
    name: 'Keto',
    description: 'High fat, very low carb, specific products',
    foods: ['bacon', 'cream cheese philadelphia', 'almonds raw', 'cheddar cheese', 'olive oil', 'cauliflower rice'],
  },
  {
    name: 'Parent (Family Meals)',
    description: 'Kid-friendly, common grocery items, mixed meals',
    foods: ['kraft mac and cheese', 'whole milk gallon', 'ground beef 80/20', 'banana', 'cheerios cereal', 'apple juice'],
  },
];

// ── Source fetchers ─────────────────────────────────────────────────────────

interface FoodResult {
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize?: string;
  servingQuantity?: number;
  hasServingData: boolean;
  hasMacros: boolean;
}

interface SearchResult {
  source: string;
  query: string;
  results: FoodResult[];
  totalCount: number;
  latencyMs: number;
  error?: string;
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeout);
    return resp;
  } catch (e) {
    clearTimeout(timeout);
    throw e;
  }
}

// USDA
async function searchUSDA(query: string): Promise<SearchResult> {
  const start = Date.now();
  if (!USDA_KEY) {
    return { source: 'USDA', query, results: [], totalCount: 0, latencyMs: 0, error: 'NO API KEY' };
  }
  try {
    const resp = await fetchWithTimeout('https://api.nal.usda.gov/fdc/v1/foods/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': USDA_KEY },
      body: JSON.stringify({ query, pageSize: 10, dataType: ['Branded', 'Foundation', 'SR Legacy'] }),
    });
    const data = await resp.json();
    const latencyMs = Date.now() - start;

    const results: FoodResult[] = (data.foods || []).slice(0, 5).map((f: any) => {
      const getNutrient = (id: number) => f.foodNutrients?.find((n: any) => n.nutrientId === id)?.value ?? 0;
      return {
        name: f.description,
        brand: f.brandOwner || f.brandName,
        calories: getNutrient(1008),
        protein: getNutrient(1003),
        carbs: getNutrient(1005),
        fat: getNutrient(1004),
        servingSize: f.servingSize ? `${f.servingSize}${f.servingSizeUnit || 'g'}` : undefined,
        servingQuantity: f.servingSize,
        hasServingData: !!f.servingSize,
        hasMacros: getNutrient(1008) > 0 || getNutrient(1003) > 0,
      };
    });

    return { source: 'USDA', query, results, totalCount: data.totalHits || 0, latencyMs };
  } catch (e: any) {
    return { source: 'USDA', query, results: [], totalCount: 0, latencyMs: Date.now() - start, error: e.message };
  }
}

// OFF Legacy (cgi/search.pl)
async function searchOFFLegacy(query: string): Promise<SearchResult> {
  const start = Date.now();
  try {
    const params = new URLSearchParams({
      search_terms: query, json: '1', page_size: '10',
      fields: 'code,product_name,brands,nutriments,serving_size,serving_quantity,nutrition_data_per',
    });
    const resp = await fetchWithTimeout(`https://world.openfoodfacts.org/cgi/search.pl?${params}`, {
      headers: { 'User-Agent': 'Baisics-Benchmark/1.0' },
    });
    const data = await resp.json();
    const latencyMs = Date.now() - start;

    const results: FoodResult[] = (data.products || []).slice(0, 5).map((p: any) => {
      const n = p.nutriments || {};
      return {
        name: p.product_name || '(no name)',
        brand: p.brands,
        calories: n['energy-kcal_100g'] ?? 0,
        protein: n.proteins_100g ?? 0,
        carbs: n.carbohydrates_100g ?? 0,
        fat: n.fat_100g ?? 0,
        servingSize: p.serving_size,
        servingQuantity: p.serving_quantity,
        hasServingData: !!p.serving_size,
        hasMacros: (n['energy-kcal_100g'] ?? 0) > 0 || (n.proteins_100g ?? 0) > 0,
      };
    });

    return { source: 'OFF Legacy', query, results, totalCount: data.count || 0, latencyMs };
  } catch (e: any) {
    return { source: 'OFF Legacy', query, results: [], totalCount: 0, latencyMs: Date.now() - start, error: e.message };
  }
}

// Search-a-licious
async function searchSAL(query: string): Promise<SearchResult> {
  const start = Date.now();
  try {
    const params = new URLSearchParams({
      q: query, page_size: '10',
      fields: 'code,product_name,brands,nutriments,serving_size,serving_quantity',
    });
    const resp = await fetchWithTimeout(`https://search.openfoodfacts.org/search?${params}`, {
      headers: { 'User-Agent': 'Baisics-Benchmark/1.0' },
    });
    const data = await resp.json();
    const latencyMs = Date.now() - start;

    const results: FoodResult[] = (data.hits || []).slice(0, 5).map((p: any) => {
      const n = p.nutriments || {};
      return {
        name: p.product_name || '(no name)',
        brand: Array.isArray(p.brands) ? p.brands[0] : p.brands,
        calories: n['energy-kcal_100g'] ?? 0,
        protein: n.proteins_100g ?? 0,
        carbs: n.carbohydrates_100g ?? 0,
        fat: n.fat_100g ?? 0,
        servingSize: p.serving_size,
        servingQuantity: p.serving_quantity,
        hasServingData: !!p.serving_size,
        hasMacros: (n['energy-kcal_100g'] ?? 0) > 0 || (n.proteins_100g ?? 0) > 0,
      };
    });

    return { source: 'Search-a-licious', query, results, totalCount: data.count || 0, latencyMs };
  } catch (e: any) {
    return { source: 'Search-a-licious', query, results: [], totalCount: 0, latencyMs: Date.now() - start, error: e.message };
  }
}

// ── Scoring ─────────────────────────────────────────────────────────────────

interface SourceScore {
  source: string;
  totalSearches: number;
  avgLatencyMs: number;
  medianLatencyMs: number;
  p95LatencyMs: number;
  errorRate: number;
  avgResultCount: number;
  servingDataRate: number;   // % of top results with serving info
  macroCompleteRate: number; // % of top results with macros
  relevanceScore: number;    // how often top result name matches query
}

function percentile(arr: number[], p: number): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

function scoreResults(allResults: SearchResult[]): SourceScore {
  const latencies = allResults.filter(r => !r.error).map(r => r.latencyMs);
  const errors = allResults.filter(r => !!r.error).length;

  let totalServing = 0, totalServingChecked = 0;
  let totalMacro = 0, totalMacroChecked = 0;
  let totalRelevance = 0, totalRelevanceChecked = 0;

  for (const r of allResults) {
    if (r.error) continue;
    for (const food of r.results.slice(0, 3)) { // score top 3 results
      totalServingChecked++;
      if (food.hasServingData) totalServing++;
      totalMacroChecked++;
      if (food.hasMacros) totalMacro++;
    }
    // Relevance: does top result name contain any query word?
    if (r.results.length > 0) {
      totalRelevanceChecked++;
      const queryWords = r.query.toLowerCase().split(/\s+/);
      const topName = r.results[0].name.toLowerCase();
      if (queryWords.some(w => topName.includes(w))) totalRelevance++;
    }
  }

  return {
    source: allResults[0]?.source || 'unknown',
    totalSearches: allResults.length,
    avgLatencyMs: latencies.length ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0,
    medianLatencyMs: latencies.length ? percentile(latencies, 50) : 0,
    p95LatencyMs: latencies.length ? percentile(latencies, 95) : 0,
    errorRate: allResults.length ? Math.round((errors / allResults.length) * 100) : 0,
    avgResultCount: allResults.length ? +(allResults.reduce((a, r) => a + r.results.length, 0) / allResults.length).toFixed(1) : 0,
    servingDataRate: totalServingChecked ? Math.round((totalServing / totalServingChecked) * 100) : 0,
    macroCompleteRate: totalMacroChecked ? Math.round((totalMacro / totalMacroChecked) * 100) : 0,
    relevanceScore: totalRelevanceChecked ? Math.round((totalRelevance / totalRelevanceChecked) * 100) : 0,
  };
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🔬 Food Source Benchmark');
  console.log('========================\n');

  if (!USDA_KEY) console.log('⚠️  USDA_API_KEY not set — USDA results will be skipped\n');

  const allUSDA: SearchResult[] = [];
  const allOFFLegacy: SearchResult[] = [];
  const allSAL: SearchResult[] = [];

  for (const persona of PERSONAS) {
    console.log(`\n👤 ${persona.name} — ${persona.description}`);
    console.log('─'.repeat(60));

    for (const food of persona.foods) {
      // Run all 3 sources in parallel
      const [usda, offLegacy, sal] = await Promise.all([
        searchUSDA(food),
        searchOFFLegacy(food),
        searchSAL(food),
      ]);

      allUSDA.push(usda);
      allOFFLegacy.push(offLegacy);
      allSAL.push(sal);

      // Print compact result for this food
      const fmt = (r: SearchResult) => {
        if (r.error) return `ERR(${r.error.slice(0, 20)})`;
        const top = r.results[0];
        const serving = top?.hasServingData ? '✅srv' : '❌srv';
        const macros = top?.hasMacros ? '✅mac' : '❌mac';
        return `${r.latencyMs}ms | ${r.results.length}res | ${serving} | ${macros} | ${top?.name?.slice(0, 35) || '(none)'}`;
      };

      console.log(`\n  🔍 "${food}"`);
      console.log(`     USDA:    ${fmt(usda)}`);
      console.log(`     OFF:     ${fmt(offLegacy)}`);
      console.log(`     SAL:     ${fmt(sal)}`);

      // Rate limit courtesy — small delay between batches
      await new Promise(r => setTimeout(r, 300));
    }
  }

  // ── Summary scores ──────────────────────────────────────────────────────

  console.log('\n\n' + '═'.repeat(60));
  console.log('📊 AGGREGATE SCORES');
  console.log('═'.repeat(60));

  const scores = [
    scoreResults(allUSDA),
    scoreResults(allOFFLegacy),
    scoreResults(allSAL),
  ];

  // Table header
  console.log('\n' + ''.padEnd(22) + scores.map(s => s.source.padEnd(18)).join(''));
  console.log('─'.repeat(22 + 18 * scores.length));

  const rows: [string, (s: SourceScore) => string][] = [
    ['Avg Latency', s => `${s.avgLatencyMs}ms`],
    ['Median Latency', s => `${s.medianLatencyMs}ms`],
    ['P95 Latency', s => `${s.p95LatencyMs}ms`],
    ['Error Rate', s => `${s.errorRate}%`],
    ['Avg Results', s => `${s.avgResultCount}`],
    ['Serving Data %', s => `${s.servingDataRate}%`],
    ['Macro Complete %', s => `${s.macroCompleteRate}%`],
    ['Relevance %', s => `${s.relevanceScore}%`],
  ];

  for (const [label, fn] of rows) {
    console.log(label.padEnd(22) + scores.map(s => fn(s).padEnd(18)).join(''));
  }

  // ── Recommendation ──────────────────────────────────────────────────────

  console.log('\n' + '═'.repeat(60));
  console.log('💡 RECOMMENDATION');
  console.log('═'.repeat(60));

  const salServing = scores.find(s => s.source === 'Search-a-licious')?.servingDataRate ?? 0;
  const offServing = scores.find(s => s.source === 'OFF Legacy')?.servingDataRate ?? 0;
  const usdaServing = scores.find(s => s.source === 'USDA')?.servingDataRate ?? 0;

  if (salServing === 0 && offServing > 30) {
    console.log('\n⚠️  Search-a-licious has NO serving data. OFF Legacy does.');
    console.log('   → Self-hosting OFF data (#390) is the path to fast + complete.');
    console.log('   → USDA serving data should be wired through NOW (already available).');
  }

  if (usdaServing > 50) {
    console.log(`\n✅ USDA has serving data on ${usdaServing}% of top results — wire it through.`);
  }

  console.log('\nDone.\n');
}

main().catch(console.error);
