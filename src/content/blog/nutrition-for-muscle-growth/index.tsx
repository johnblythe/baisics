import Link from 'next/link'
import { BlogPost, BlogSection, BlogQuote, BlogCode } from '@/app/blog/components/BlogPost'
import { BlogPostFrontmatter } from '@/types/blog'

export const frontmatter: BlogPostFrontmatter = {
  title: "Eating for Muscle: What Actually Matters (And What Doesn't)",
  date: "2024-03-14",
  excerpt: "The nutrition advice for building muscle is often overcomplicated. Here's what you actually need to focus on, ranked by importance.",
  metaDescription: "Simple, practical nutrition advice for building muscle. Learn exactly how much protein you need, when to eat, and what actually matters for muscle growth.",
  published: true,
  featured: false,
  categories: [
    "Nutrition",
    "Muscle Building"
  ],
  tags: [
    "nutrition",
    "muscle growth",
    "protein",
    "bulking",
    "diet"
  ],
  keywords: [
    "muscle growth nutrition",
    "how much protein to build muscle",
    "muscle building diet",
    "bulking nutrition",
    "eating to gain muscle",
    "protein for muscle growth"
  ]
}

export default function NutritionForMuscleGrowth() {
  return (
    <BlogPost frontmatter={frontmatter}>
      <p className="text-lg mb-6">
        The fitness industry has made muscle-building nutrition seem impossibly complex.
        Meal timing windows. Anabolic eating protocols. Carb cycling. Nutrient periodization.
        Most of it doesn&apos;t matter.
      </p>

      <p className="mb-6">
        Here&apos;s what actually drives muscle growth, ranked by importance. Nail the top
        two and you&apos;ve handled 90% of what matters. Everything else is optimization
        at the margins.
      </p>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">#1: Eat Enough Calories (Non-Negotiable)</h2>

        <p className="mb-4">
          You cannot build significant muscle in a calorie deficit. Your body needs surplus
          energy to construct new tissue. This is basic physics, and no supplement or
          training program changes it.
        </p>

        <p className="mb-4">
          How much surplus? Less than you think. The &quot;dirty bulk&quot; approach of eating
          everything in sight just makes you fat. Your body can only build so much muscle
          per day—excess calories beyond that become body fat.
        </p>

        <BlogCode>
          {`Calorie targets for muscle gain:
Beginners: Maintenance + 300-500 calories
Intermediate: Maintenance + 200-300 calories
Advanced: Maintenance + 100-200 calories

To find maintenance:
Start at bodyweight (lbs) × 14-16
Track weight for 2 weeks
Adjust based on scale trend`}
        </BlogCode>

        <p className="mt-4 mb-4">
          Beginners can afford a larger surplus because they build muscle faster.
          The more advanced you get, the tighter your surplus should be to minimize
          fat gain.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">#2: Get Enough Protein (Also Non-Negotiable)</h2>

        <p className="mb-4">
          Protein provides the raw materials for muscle. Without adequate protein,
          you&apos;re building a house without bricks.
        </p>

        <BlogCode>
          {`Protein targets:
Minimum for muscle gain: 0.7g per lb of bodyweight
Optimal range: 0.8-1.0g per lb of bodyweight
Ceiling: 1.2g per lb (more doesn't help)

Example: 180 lb person
Minimum: 126g protein/day
Optimal: 144-180g protein/day`}
        </BlogCode>

        <p className="mt-4 mb-4">
          Note: These numbers are per pound of <em>total</em> bodyweight, not lean mass.
          The calculations are simpler and the results are the same for most people.
        </p>

        <p className="mb-4">
          Getting enough protein is harder than it sounds. Most people overestimate
          their intake until they actually track it. A chicken breast has about 30g.
          An egg has 6g. Do the math on your typical day.
        </p>

        <p className="mb-4">
          <strong>Good protein sources:</strong> Chicken, beef, fish, eggs, Greek yogurt,
          cottage cheese, whey protein. For plant-based: tofu, tempeh, legumes + grains
          (combined for complete amino acids), plant protein powders.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">#3: Train Hard (Equally Non-Negotiable)</h2>

        <p className="mb-4">
          Nutrition without training stimulus is just... eating. Your body builds muscle
          in response to the demand placed on it. No demand, no muscle, regardless of
          how much protein you eat.
        </p>

        <p className="mb-4">
          This means <Link href="/blog/ultimate-guide-progressive-overload">progressive
          overload</Link>: doing more over time. Adding weight, adding reps, adding sets.
          If your training isn&apos;t progressing, your muscles have no reason to grow.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">After That, It&apos;s Diminishing Returns</h2>

        <p className="mb-4">
          The following things matter, but much less than the big three above:
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">Meal Timing</h3>
        <p className="mb-4">
          Eating protein every 3-5 hours probably optimizes muscle protein synthesis
          slightly. Eating immediately after training probably helps a bit. But the
          effect sizes are small compared to total daily intake.
        </p>

        <p className="mb-4">
          Practical takeaway: Spread your protein across 3-5 meals rather than eating
          it all at once. Have some protein around your workout (before or after, doesn&apos;t
          matter much). Don&apos;t stress about the &quot;30-minute anabolic window&quot;—it&apos;s
          more like a several-hour window.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">Carbs and Fats</h3>
        <p className="mb-4">
          Once protein and calories are set, how you fill the remaining calories
          matters less than people think. Carbs fuel training and may help slightly
          with recovery. Fats support hormone production. Both are fine.
        </p>

        <BlogCode>
          {`Rough macro split for muscle gain:
Protein: 0.8-1g per lb bodyweight
Fat: 0.3-0.5g per lb bodyweight
Carbs: Fill remaining calories

Example for 180 lb person eating 3000 calories:
Protein: 160g (640 calories)
Fat: 70g (630 calories)
Carbs: ~430g (1,730 calories)

This is a guideline, not a prescription.
Total protein and calories matter more than exact ratios.`}
        </BlogCode>

        <h3 className="text-xl font-semibold mt-6 mb-2">Food Quality</h3>
        <p className="mb-4">
          Whole foods are better than processed foods for health, satiety, and
          micronutrients. But for pure muscle building, a gram of protein is a gram
          of protein. Don&apos;t stress about whether your chicken is organic—stress about
          whether you&apos;re eating enough of it.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">Supplements</h3>
        <p className="mb-4">
          <strong>Worth considering:</strong> Creatine monohydrate (5g/day, cheapest
          form is fine), protein powder (for convenience, not magic).
        </p>

        <p className="mb-4">
          <strong>Everything else:</strong> Either doesn&apos;t work, has tiny effects,
          or is only relevant for advanced athletes. BCAAs are redundant if you eat
          enough protein. Pre-workouts are mostly caffeine. &quot;Mass gainers&quot; are
          expensive carbs.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">A Week of Muscle-Building Eating</h2>

        <p className="mb-4">
          This is what simple, effective nutrition looks like. Nothing fancy:
        </p>

        <BlogCode>
          {`Breakfast:
- 3-4 eggs scrambled
- 2 slices toast with butter
- Fruit
(~35g protein)

Lunch:
- 6-8oz chicken or beef
- Rice or potatoes
- Vegetables
(~45g protein)

Pre-workout snack (optional):
- Greek yogurt with berries
- Or protein shake
(~25g protein)

Dinner:
- 6-8oz fish or meat
- Pasta, rice, or potatoes
- Vegetables
(~45g protein)

Evening snack:
- Cottage cheese
- Or casein protein
(~25g protein)

Total: ~175g protein, plenty of carbs, moderate fat.`}
        </BlogCode>

        <p className="mt-4 mb-4">
          Adjust portions to hit your calorie target. Add more carbs (rice, bread,
          potatoes) if you need more calories. This isn&apos;t a strict meal plan—it&apos;s
          a template showing that muscle-building nutrition doesn&apos;t have to be complicated.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Common Mistakes</h2>

        <p className="mb-4">
          <strong>Not eating enough.</strong> Fear of fat gain leads people to under-eat.
          You can&apos;t build muscle optimally in a deficit. Accept some fat gain as part
          of the process—you can diet it off later.
        </p>

        <p className="mb-4">
          <strong>Eating way too much.</strong> The opposite problem. A 1,000+ calorie
          surplus doesn&apos;t build muscle faster—it builds fat faster. Moderate surplus,
          not all-you-can-eat.
        </p>

        <p className="mb-4">
          <strong>Majoring in the minors.</strong> Worrying about nutrient timing,
          supplement stacks, and meal frequency while not hitting basic protein and
          calorie targets. Fix the fundamentals first.
        </p>

        <p className="mb-4">
          <strong>Inconsistency.</strong> Eating well 4 days a week and poorly 3 days
          averages out to mediocre results. Consistency beats perfection.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">The Summary</h2>

        <p className="mb-4">
          Building muscle through nutrition is simpler than the industry wants you
          to believe:
        </p>

        <BlogCode>
          {`1. Eat a slight calorie surplus (200-500 above maintenance)
2. Get 0.8-1g protein per lb bodyweight daily
3. Train with progressive overload
4. Be consistent for months and years

That's it. Everything else is noise.`}
        </BlogCode>

        <p className="mt-6">
          <Link href="/hi">Get a program</Link> that builds muscle systematically,
          then eat to support it. Or just start with the basics above. Either way,
          the formula is simpler than it seems.
        </p>
      </BlogSection>
    </BlogPost>
  )
}
