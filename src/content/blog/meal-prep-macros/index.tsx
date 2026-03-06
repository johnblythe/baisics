import Link from 'next/link'
import { BlogPost, BlogSection, BlogQuote, BlogList, BlogCode, BlogCTA } from '@/app/blog/components/BlogPost'
import { BlogPostFrontmatter } from '@/types/blog'

export const frontmatter: BlogPostFrontmatter = {
  title: "Meal Prep for Your Macros: A Week-by-Week System",
  date: "2026-03-06",
  excerpt: "A practical system for meal prepping that actually hits your macros. Batch cooking strategies, scaling recipes, and making prep sustainable.",
  metaDescription: "Learn how to meal prep for your macros with a practical week-by-week system. Batch cooking strategies, recipe scaling, and tips for hitting your protein targets.",
  published: true,
  featured: false,
  categories: ["Nutrition"],
  tags: ["meal prep", "macros", "nutrition", "meal planning", "batch cooking"],
  keywords: ["macro meal prep", "meal prep for macros", "meal prep macros", "batch cooking macros", "weekly meal prep plan"]
}

export default function MealPrepMacros() {
  return (
    <BlogPost frontmatter={frontmatter}>
      <p className="text-lg mb-6">
        Meal prep is the unsexy secret behind anyone who consistently hits their macros.
        It&apos;s not glamorous. Nobody posts their Sunday Tupperware assembly line on
        Instagram (okay, some people do, but they&apos;re lying about how fun it is).
        The truth is simple: if your food is already cooked and portioned, you eat what
        you planned. If it&apos;s not, you eat whatever&apos;s fastest.
      </p>

      <p className="mb-6">
        This isn&apos;t a collection of recipes. It&apos;s a system. If you already know{' '}
        <Link href="/blog/how-to-track-macros">how to track your macros</Link>, this
        is how you make hitting them automatic instead of a daily struggle.
      </p>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">The Batch Cooking Strategy</h2>

        <p className="mb-4">
          Most meal prep advice tells you to cook full recipes. That&apos;s fine for week one,
          and miserable by week three when you can&apos;t look at another chicken stir-fry.
          The better approach: cook components separately and mix-and-match throughout
          the week.
        </p>

        <p className="mb-4">
          Think of meal prep in three columns: proteins, carbs, and vegetables. Cook each
          in bulk, store them separately, and assemble meals on the fly.
        </p>

        <BlogCode>
          {`The 3-Column Prep System:

PROTEINS (pick 2-3)         CARBS (pick 2-3)         VEGGIES (pick 2-3)
- Chicken thighs            - Jasmine rice            - Roasted broccoli
- Ground turkey              - Sweet potatoes          - Sauteed peppers
- Baked salmon               - Quinoa                  - Steamed green beans
- Hard-boiled eggs           - Pasta                   - Roasted zucchini
- Seasoned ground beef       - Baked potatoes          - Raw spinach/greens

Mix any protein + any carb + any veggie = a meal.
3 proteins x 3 carbs x 3 veggies = 27 possible combinations.`}
        </BlogCode>

        <p className="mt-4 mb-4">
          This is the single biggest upgrade you can make. You never get sick of your food
          because you&apos;re never eating the exact same plate twice in a row.
        </p>

        <BlogQuote>
          Cook components, not recipes. You&apos;ll eat more variety in a week of mix-and-match
          than a month of full-recipe meal prep.
        </BlogQuote>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">How to Scale Recipes to Hit Your Macros</h2>

        <p className="mb-4">
          The math is straightforward once you see it. Every component has a per-serving
          macro profile. You weigh your portions to hit your targets.
        </p>

        <BlogCode>
          {`Per 100g (cooked) macro profiles:

Chicken breast:    31g protein  |  3.6g fat   |  0g carbs   |  165 cal
Ground turkey 93%: 27g protein  |  8g fat     |  0g carbs   |  185 cal
Salmon:            25g protein  |  8g fat     |  0g carbs   |  180 cal
Jasmine rice:      2.7g protein |  0.3g fat   |  28g carbs  |  130 cal
Sweet potato:      1.6g protein |  0.1g fat   |  20g carbs  |  86 cal
Broccoli:          2.8g protein |  0.4g fat   |  7g carbs   |  34 cal`}
        </BlogCode>

        <p className="mt-4 mb-4">
          With these numbers, building a meal is just arithmetic. Say you need 40g protein,
          50g carbs, and 12g fat for lunch:
        </p>

        <BlogCode>
          {`Target: 40P / 50C / 12F

150g chicken breast:  46.5P |  5.4F |  0C    |  247 cal
180g jasmine rice:     4.9P |  0.5F | 50.4C  |  234 cal
100g broccoli:         2.8P |  0.4F |  7C    |   34 cal
------------------------------------------------------
Total:                54.2P |  6.3F | 57.4C  |  515 cal

Close enough. Adjust portions up or down by 20-30g to dial in.`}
        </BlogCode>

        <p className="mt-4 mb-4">
          You don&apos;t need to do this math every day. Do it once, note the portion sizes,
          and repeat. A food scale costs $12 and saves you more guesswork than any app.
          For a deeper dive on the numbers, check the{' '}
          <Link href="/blog/calorie-counting-guide">calorie counting guide</Link>.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">A Sample Prep Day Walkthrough</h2>

        <p className="mb-4">
          Sunday afternoon. Two to three hours. Here&apos;s what a full prep session
          looks like from start to finish.
        </p>

        <BlogCode>
          {`PREP DAY TIMELINE (approx. 2.5 hours)

0:00  - Preheat oven to 400F
0:05  - Season chicken thighs (2 lbs) + place on sheet pan
       Season ground turkey (2 lbs) in skillet on medium-high
0:10  - Dice sweet potatoes (3 lbs), toss with oil, onto sheet pan
0:15  - Start rice cooker: 4 cups dry jasmine rice
0:20  - Chicken + sweet potatoes go in the oven (25 min)
       Stir ground turkey, break into crumbles
0:25  - Chop broccoli (2 heads), peppers (4), zucchini (3)
0:35  - Ground turkey done -> transfer to container
       Start roasting broccoli + zucchini on a sheet pan (20 min)
0:45  - Chicken + sweet potatoes out of oven, rest chicken 10 min
0:50  - Hard boil 12 eggs (boil 10 min, ice bath)
0:55  - Rice cooker finishes -> fluff and transfer
1:00  - Broccoli + zucchini out of oven
1:05  - Slice chicken thighs
1:10  - Peel eggs
1:15  - PORTION EVERYTHING

YIELD:
- 2 lbs chicken thighs   ~  8 servings (4oz each)
- 2 lbs ground turkey     ~  8 servings (4oz each)
- 12 hard-boiled eggs     ~ 12 servings
- 4 cups dry rice (cooked)~  10 servings (3/4 cup each)
- 3 lbs sweet potatoes    ~  8 servings
- Roasted veggies          ~  10+ servings

TOTAL PREP MACROS:
Protein available: ~600g across all proteins
Carbs available:   ~800g across rice + sweet potatoes
Enough for 16-20 meals depending on portion size.`}
        </BlogCode>

        <p className="mt-4 mb-4">
          That&apos;s it. Two and a half hours on Sunday, and your weekday meals are
          just &quot;open container, weigh portions, microwave.&quot; Five minutes from
          fridge to plate.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">The Weekly Rotation System</h2>

        <p className="mb-4">
          Eating the same meals seven days straight is how people quit meal prep.
          The rotation system keeps things interesting without adding complexity.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">Rotate Proteins Weekly</h3>
        <p className="mb-4">
          Don&apos;t cook the same two proteins every week. Set up a three-week rotation:
        </p>

        <BlogCode>
          {`3-Week Protein Rotation:

Week 1: Chicken thighs + Ground turkey + Eggs
Week 2: Salmon + Chicken breast + Ground beef
Week 3: Pork tenderloin + Turkey breast + Shrimp
(Then repeat)`}
        </BlogCode>

        <h3 className="text-xl font-semibold mt-6 mb-2">Rotate Sauces and Seasonings</h3>
        <p className="mb-4">
          Same protein, different sauce = completely different meal. Keep 4-5 sauces
          on hand and rotate daily.
        </p>

        <BlogList items={[
          "Monday: Chicken + teriyaki sauce + rice + broccoli",
          "Tuesday: Chicken + salsa + sweet potato + peppers",
          "Wednesday: Turkey + marinara + pasta + zucchini",
          "Thursday: Turkey + buffalo sauce + rice + celery",
          "Friday: Eggs + hot sauce + toast + spinach (quick meal, lighter prep)"
        ]} />

        <p className="mt-4 mb-4">
          The macros barely change between sauces (most add 20-50 calories per serving),
          but the eating experience is completely different. This is the trick
          that makes meal prep last months instead of weeks.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Storage and Reheating</h2>

        <p className="mb-4">
          Bad storage kills meal prep faster than boredom. Here&apos;s what actually
          works.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">Fridge Life</h3>
        <BlogCode>
          {`How long prepped food lasts in the fridge:

Cooked chicken:     3-4 days
Cooked ground meat: 3-4 days
Cooked fish:        2-3 days (eat first!)
Hard-boiled eggs:   5-7 days (peeled or unpeeled)
Cooked rice:        4-5 days
Sweet potatoes:     4-5 days
Roasted veggies:    4-5 days

Rule of thumb: Eat fish Mon-Tue. Eat everything else by Thursday.
Friday = either leftover scraps or a "free" meal out.`}
        </BlogCode>

        <h3 className="text-xl font-semibold mt-6 mb-2">What Freezes Well</h3>
        <BlogList items={[
          "Cooked ground meat (turkey, beef) - freezes great for 2-3 months",
          "Cooked chicken thighs - freeze well, reheat in oven for best texture",
          "Cooked rice - freeze in portions, microwave with a splash of water",
          "Soups and chilis - perfect freezer meals",
          "Sweet potatoes - mash before freezing for best results"
        ]} />

        <h3 className="text-xl font-semibold mt-6 mb-2">What Doesn&apos;t Freeze Well</h3>
        <BlogList items={[
          "Cooked fish - gets rubbery",
          "Hard-boiled eggs - texture goes chalky",
          "Raw vegetables meant for salads",
          "Anything with a cream-based sauce"
        ]} />

        <h3 className="text-xl font-semibold mt-6 mb-2">Containers That Actually Work</h3>
        <p className="mb-4">
          Glass containers with snap lids. They don&apos;t stain, don&apos;t warp in the microwave,
          and don&apos;t hold odors. Buy 15-20 of the same size so lids are interchangeable.
          The upfront cost is worth it. Plastic containers work fine too, but replace them
          every few months when they start to warp.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Common Meal Prep Mistakes</h2>

        <p className="mb-4">
          <strong>Prepping too much food.</strong> Start with 3-4 days of meals, not 7.
          Food quality drops after day 4 in the fridge, and you&apos;ll throw away whatever
          you don&apos;t eat. Prep twice a week (Sunday + Wednesday) if you want full
          week coverage.
        </p>

        <p className="mb-4">
          <strong>Ignoring taste.</strong> Bland food doesn&apos;t get eaten. Season
          generously. Salt, pepper, garlic powder, paprika, cumin — these add zero
          meaningful calories and make the difference between food you tolerate and food
          you actually want to eat.
        </p>

        <p className="mb-4">
          <strong>No variety.</strong> We covered this above with the rotation system,
          but it bears repeating. If you&apos;re eating the same chicken-rice-broccoli
          for every meal, you&apos;ll break by week two. Swap the sauce. Swap the carb.
          Swap the protein. Small changes keep you going.
        </p>

        <p className="mb-4">
          <strong>Skipping the food scale.</strong> Eyeballing portions is how you end up
          50g of carbs over your target. A $12 food scale pays for itself in accuracy
          on the first day. Weigh everything until you can eyeball 150g of chicken
          from across the room.
        </p>

        <p className="mb-4">
          <strong>Not tracking what you prep.</strong> You cooked 2 lbs of chicken.
          Great. What&apos;s the per-serving macro breakdown? If you don&apos;t know,
          you&apos;re guessing. Log your bulk recipes once, save the per-serving numbers,
          and reuse them every week.
        </p>

        <p className="mb-4">
          <strong>Going all-in on day one.</strong> Don&apos;t try to prep every meal
          for the whole week on your first attempt. Start by prepping lunches only.
          Once that&apos;s dialed in, add dinners. Then breakfasts. Build the habit
          before you scale it.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Putting It All Together</h2>

        <p className="mb-4">
          Meal prep isn&apos;t about perfection. It&apos;s about removing decisions.
          When your food is cooked, portioned, and ready to grab, hitting your macros
          stops being a daily battle and starts being a default behavior.
        </p>

        <BlogQuote>
          The best meal prep system is the one you actually do every week. Start
          simple, stay consistent, and adjust as you go.
        </BlogQuote>

        <p className="mb-4">
          If you&apos;re just getting started with macro tracking, read the{' '}
          <Link href="/blog/how-to-track-macros">complete guide to tracking macros</Link>{' '}
          first. If you&apos;re focused on building muscle,{' '}
          <Link href="/blog/nutrition-for-muscle-growth">nutrition for muscle growth</Link>{' '}
          covers how to set your targets. Meal prep is just the execution layer on top
          of those foundations.
        </p>
      </BlogSection>

      <BlogCTA
        title="Got a recipe? Paste it in for instant macro breakdowns."
        description="baisics parses plain-text recipes and gives you per-serving macros automatically. No manual entry. Just paste, review, and log."
        buttonText="Try It Free"
        href="/hi"
      />
    </BlogPost>
  )
}
