import Link from 'next/link'
import { BlogPost, BlogSection, BlogQuote, BlogList, BlogCode, BlogCTA } from '@/app/blog/components/BlogPost'
import { BlogPostFrontmatter } from '@/types/blog'

export const frontmatter: BlogPostFrontmatter = {
  title: "How to Track Macros: A Beginner's Guide",
  date: "2026-03-06",
  excerpt: "Learn how to track macros step by step. What macros are, why tracking them matters, and how to get started without overthinking it.",
  metaDescription: "A practical guide to tracking macros for beginners. Learn what macros are, how to calculate them, and how to track them daily for your fitness goals.",
  published: true,
  featured: false,
  categories: ["Nutrition"],
  tags: ["macros", "nutrition", "macro tracking", "protein", "diet"],
  keywords: [
    "how to track macros",
    "macro tracking for beginners",
    "what are macros",
    "macro calculator",
    "tracking macros app"
  ]
}

export default function HowToTrackMacros() {
  return (
    <BlogPost frontmatter={frontmatter}>
      <p className="text-lg mb-6">
        Tracking macros sounds complicated. It&apos;s not. If you can read a nutrition
        label and use a phone, you already have the skills. The hard part is just
        building the habit.
      </p>

      <p className="mb-6">
        Macros&mdash;short for macronutrients&mdash;are the three types of nutrients that
        make up every calorie you eat: <strong>protein</strong>, <strong>carbohydrates</strong>,
        and <strong>fat</strong>. That&apos;s it. Every food is some combination of these three.
        Tracking macros means paying attention to how much of each you&apos;re eating, not
        just total calories.
      </p>

      <p className="mb-6">
        Why bother? Because two people eating 2,000 calories can get wildly different
        results depending on <em>where</em> those calories come from. Someone eating
        mostly protein and carbs will build more muscle than someone eating mostly fat
        and sugar&mdash;even at the same calorie count. If you&apos;re serious about{' '}
        <Link href="/blog/nutrition-for-muscle-growth">nutrition for muscle growth</Link> or
        fat loss, macros give you the lever that calories alone can&apos;t.
      </p>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">The Three Macros (Quick Breakdown)</h2>

        <p className="mb-4">
          Every macro has a calorie value. This is the math behind everything:
        </p>

        <BlogCode>
          {`Protein:  4 calories per gram  — builds/repairs muscle
Carbs:    4 calories per gram  — primary energy source
Fat:      9 calories per gram  — hormones, cell health, satiety

Example: A meal with 30g protein, 50g carbs, 15g fat
= (30 x 4) + (50 x 4) + (15 x 9)
= 120 + 200 + 135
= 455 calories`}
        </BlogCode>

        <p className="mt-4 mb-4">
          Notice fat has more than double the calories per gram. That&apos;s why a
          tablespoon of olive oil (14g fat, 120 calories) packs the same punch as
          a whole chicken breast (31g protein, 128 calories). This matters when
          you&apos;re tracking&mdash;fat-heavy foods add up fast.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">How to Calculate Your Macros</h2>

        <p className="mb-4">
          Before you can track macros, you need targets. Here&apos;s how to set them
          in three steps.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">Step 1: Find Your TDEE</h3>

        <p className="mb-4">
          TDEE = Total Daily Energy Expenditure. It&apos;s how many calories you burn
          in a day, including exercise and daily movement. This is your starting point.
        </p>

        <BlogCode>
          {`Quick TDEE estimate:
Sedentary (desk job, no exercise):     bodyweight (lbs) x 12-13
Lightly active (1-3 workouts/week):    bodyweight (lbs) x 13-15
Moderately active (3-5 workouts/week): bodyweight (lbs) x 15-17
Very active (6+ workouts/week):        bodyweight (lbs) x 17-19

Example: 170 lb person, works out 4x/week
170 x 15 = 2,550 calories (estimated TDEE)`}
        </BlogCode>

        <p className="mt-4 mb-4">
          Want a more precise number? Use our{' '}
          <Link href="/tools/macros">macro calculator</Link> to get personalized
          targets based on your stats and goals.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">Step 2: Adjust for Your Goal</h3>

        <BlogCode>
          {`Fat loss:    TDEE - 300 to 500 calories
Maintenance: TDEE (no change)
Muscle gain: TDEE + 200 to 400 calories

Example: 170 lb person, fat loss goal
2,550 - 400 = 2,150 calories/day target`}
        </BlogCode>

        <p className="mt-4 mb-4">
          Don&apos;t go more aggressive than a 500-calorie deficit. Bigger deficits mean
          more muscle loss, worse energy, and a higher chance you&apos;ll quit. For more
          detail on setting calorie targets, check out our{' '}
          <Link href="/blog/calorie-counting-guide">calorie counting guide</Link>.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">Step 3: Set Your Macro Split</h3>

        <p className="mb-4">
          Start with protein, then fat, then fill the rest with carbs.
        </p>

        <BlogCode>
          {`1. Protein: 0.8 - 1.0g per lb bodyweight
2. Fat: 0.3 - 0.4g per lb bodyweight
3. Carbs: remaining calories / 4

Example: 170 lb person, 2,150 calorie target

Protein: 170g  (170 x 1.0)  = 680 calories
Fat:     60g   (170 x 0.35) = 540 calories
Carbs:   232g  ((2150 - 680 - 540) / 4) = 930 calories

Daily targets: 170g protein / 232g carbs / 60g fat`}
        </BlogCode>

        <BlogQuote>
          Don&apos;t overthink the split. Hitting your protein target matters most.
          After that, the exact carb-to-fat ratio is flexible. Some people do better
          with more carbs, some with more fat. Experiment and see what keeps you
          full and energized.
        </BlogQuote>

        <p className="mb-4">
          If you&apos;re interested in more advanced approaches like adjusting carbs
          on training vs. rest days, read our guide on{' '}
          <Link href="/blog/carb-cycling-explained">carb cycling</Link>.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">How to Actually Track (Step by Step)</h2>

        <p className="mb-4">
          You&apos;ve got your targets. Now here&apos;s the daily process.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">1. Weigh Your Food</h3>

        <p className="mb-4">
          Get a kitchen scale. They&apos;re $10-15 and the single most important
          tool for accurate tracking. Measuring cups and spoons work for liquids
          but are unreliable for solids. A &quot;cup of rice&quot; can vary by 50%
          depending on how tightly you pack it.
        </p>

        <BlogList items={[
          "Weigh raw meat, not cooked (cooking removes water, changes weight)",
          "Weigh dry rice/pasta before cooking",
          "Use grams, not ounces (more precise, matches most databases)",
          "Tare (zero out) the scale with your plate on it first"
        ]} />

        <h3 className="text-xl font-semibold mt-6 mb-2">2. Read Nutrition Labels</h3>

        <p className="mb-4">
          Every packaged food has a nutrition label. The key numbers you need:
        </p>

        <BlogCode>
          {`What to look for on a label:
- Serving size (this is the trap — everything is PER SERVING)
- Calories
- Protein (g)
- Total Carbohydrates (g)
- Total Fat (g)

Example: A bag of trail mix
Serving size: 1/4 cup (40g)
Servings per container: 8

If you eat half the bag, that's 4 servings.
Multiply everything on the label by 4.`}
        </BlogCode>

        <h3 className="text-xl font-semibold mt-6 mb-2">3. Log Every Meal</h3>

        <p className="mb-4">
          Use an app or a simple notebook. The tool doesn&apos;t matter as much as
          the consistency. Log <em>before</em> or <em>during</em> meals, not at
          the end of the day from memory. Memory is terrible at this.
        </p>

        <BlogList items={[
          "Log as you cook — weigh each ingredient and enter it",
          "For restaurants, search for the dish and pick the closest match",
          "For homemade recipes, log the individual ingredients",
          "Don't forget cooking oils, sauces, dressings, and drinks"
        ]} />

        <h3 className="text-xl font-semibold mt-6 mb-2">4. Review and Adjust Weekly</h3>

        <p className="mb-4">
          Check your weekly averages, not daily totals. One day over on carbs
          doesn&apos;t matter if your weekly average is on target. Weigh yourself
          under the same conditions (morning, after bathroom, before food) and
          look at the trend over 7-14 days.
        </p>

        <BlogCode>
          {`Weekly check-in questions:
- Is my average daily protein within 10g of target?
- Is my weight trending the right direction?
- Am I overly hungry or lethargic? (deficit might be too aggressive)
- Am I gaining weight too fast? (surplus might be too large)

Adjust by 100-200 calories at a time. Small changes, then reassess.`}
        </BlogCode>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Common Mistakes (and How to Avoid Them)</h2>

        <p className="mb-4">
          Almost everyone makes these when they start. Being aware of them puts
          you ahead of most people.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">Not Tracking Oils and Sauces</h3>
        <p className="mb-4">
          A tablespoon of olive oil is 120 calories. Two tablespoons of ranch
          dressing is 130 calories. A &quot;healthy&quot; stir-fry cooked in 3
          tablespoons of oil just added 360 invisible calories. These are the
          ghost calories that derail people who swear they&apos;re eating 1,800 but
          aren&apos;t losing weight.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">Eyeballing Portions</h3>
        <p className="mb-4">
          Studies consistently show that people underestimate portions by 30-50%.
          What you think is 4oz of chicken is probably 2.5oz. What you think is
          a tablespoon of peanut butter is probably two. Use the scale&mdash;at
          least for the first few weeks until you calibrate your eyes.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">Obsessing Over Perfection</h3>
        <p className="mb-4">
          Hitting your macros within 5-10g is fine. You don&apos;t need to land on
          exactly 170g protein. If you&apos;re between 160-180g, you&apos;re golden.
          The people who stress about being off by 3g of fat are the same people
          who burn out and quit tracking entirely two weeks later.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">Forgetting Drinks</h3>
        <p className="mb-4">
          A latte with whole milk: ~190 calories. A large juice: ~200 calories.
          Two beers: ~300 calories. Drinks don&apos;t feel like food, but your
          body counts them all the same. Track them.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">Logging the Wrong Entry</h3>
        <p className="mb-4">
          Food databases are full of user-submitted entries, many of which are
          wrong. A &quot;chicken breast&quot; entry that says 10 calories per serving
          is obviously garbage. Always sanity-check: does this number make sense
          for this amount of food?
        </p>

        <BlogQuote>
          Consistency beats accuracy, and accuracy beats precision. Tracking
          roughly every day beats tracking perfectly three days a week.
        </BlogQuote>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">When to Track (and When to Stop)</h2>

        <p className="mb-4">
          Macro tracking is a skill-building tool, not a life sentence. Think of it
          like training wheels on a bike. Here&apos;s a realistic timeline:
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">Track Closely: First 2-4 Weeks</h3>
        <p className="mb-4">
          This is the learning phase. You&apos;re building awareness of what&apos;s in
          your food. Most people are shocked. That &quot;healthy&quot; acai bowl is
          600 calories with 80g of sugar. That handful of almonds is 200 calories.
          This phase rewires your intuition about food.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">Track Loosely: Weeks 4-12</h3>
        <p className="mb-4">
          By now you know what 30g of protein looks like. You know your go-to meals
          and their rough macros. You can estimate portions pretty well. Track when
          it&apos;s easy, estimate when it&apos;s not. Focus on hitting protein and
          staying near your calorie target.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">Intuitive With Check-ins: After That</h3>
        <p className="mb-4">
          Once you&apos;ve internalized what balanced eating looks like for your goals,
          you can often maintain results without logging every bite. Check back in
          with a week of tracking if your weight stalls or you feel off.
        </p>

        <BlogList items={[
          "Track closely when you have a specific goal with a deadline",
          "Track closely when learning about a new food culture or diet style",
          "Stop tracking if it causes anxiety or obsessive behavior around food",
          "Return to tracking any time you plateau or need a reset"
        ]} />

        <p className="mb-4">
          The goal isn&apos;t to track forever. The goal is to understand food well
          enough that you can make good decisions on autopilot. Tracking is how
          you get there.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">A Day of Tracking (Example)</h2>

        <p className="mb-4">
          Here&apos;s what a full day looks like for our 170 lb person targeting
          2,150 calories (170P / 232C / 60F):
        </p>

        <BlogCode>
          {`Breakfast: Greek yogurt bowl
- 200g nonfat Greek yogurt:  20g P / 8g C / 0g F
- 40g granola:                3g P / 28g C / 6g F
- 100g blueberries:           1g P / 14g C / 0g F
Meal total:                  24g P / 50g C / 6g F  (354 cal)

Lunch: Chicken + rice
- 200g chicken breast:       46g P / 0g C / 4g F
- 200g cooked white rice:     5g P / 56g C / 0g F
- 1 tbsp olive oil:           0g P / 0g C / 14g F
- Mixed vegetables:            3g P / 10g C / 0g F
Meal total:                  54g P / 66g C / 18g F (646 cal)

Snack: Protein shake
- 1 scoop whey protein:      25g P / 3g C / 2g F
- 1 banana:                    1g P / 27g C / 0g F
Meal total:                  26g P / 30g C / 2g F  (242 cal)

Dinner: Salmon + sweet potato
- 170g salmon fillet:        34g P / 0g C / 12g F
- 250g sweet potato:           4g P / 52g C / 0g F
- Side salad + 1 tbsp dressing: 1g P / 4g C / 8g F
Meal total:                  39g P / 56g C / 20g F (564 cal)

Evening snack: Cottage cheese
- 200g cottage cheese:       24g P / 7g C / 5g F
- 30g dark chocolate:          2g P / 17g C / 9g F
Meal total:                  26g P / 24g C / 14g F (322 cal)

DAILY TOTAL:                169g P / 226g C / 60g F (2,128 cal)
Target:                     170g P / 232g C / 60g F (2,150 cal)

Close enough. That's a successful day.`}
        </BlogCode>

        <p className="mt-4 mb-4">
          Notice it&apos;s not perfect. 169g protein instead of 170g. 226g carbs
          instead of 232g. Doesn&apos;t matter. Within range is all you need.
        </p>
      </BlogSection>

      <BlogCTA
        title="Track macros without the headache"
        description="baisics gives you smart food search with verified nutrition data. Search plain English, get accurate macros. No more guessing if that database entry is legit."
        buttonText="Start Tracking Free"
        href="/hi"
      />
    </BlogPost>
  )
}
