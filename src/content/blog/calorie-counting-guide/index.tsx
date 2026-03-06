import Link from 'next/link'
import { BlogPost, BlogSection, BlogQuote, BlogList, BlogCode, BlogCTA } from '@/app/blog/components/BlogPost'
import { BlogPostFrontmatter } from '@/types/blog'

export const frontmatter: BlogPostFrontmatter = {
  title: "Calorie Counting Made Simple: The No-BS Guide",
  date: "2026-03-06",
  excerpt: "Everything you need to know about counting calories without losing your mind. TDEE basics, practical tips, and when to count vs when to stop.",
  metaDescription: "A practical guide to calorie counting. Learn how to calculate your TDEE, track calories effectively, and when calorie counting actually makes sense.",
  published: true,
  featured: false,
  categories: ["Nutrition"],
  tags: ["calories", "nutrition", "weight loss", "calorie counting", "TDEE"],
  keywords: [
    "how to count calories",
    "calorie counting guide",
    "TDEE calculator",
    "calorie tracking",
    "calorie counting app"
  ]
}

export default function CalorieCountingGuide() {
  return (
    <BlogPost frontmatter={frontmatter}>
      <p className="italic">
        Calorie counting gets a bad rap. Some people treat it like a religion, others act like it&apos;s
        the devil. The truth? It&apos;s just a tool. And like any tool, it works great when you use it
        right and becomes useless when you don&apos;t.
      </p>

      <p className="mb-6">
        This guide will teach you how to actually count calories without turning every meal into a
        math exam. We&apos;ll cover the basics, show you how to estimate your needs, and &mdash; most
        importantly &mdash; explain when to stop counting and just live your life. If you&apos;re also
        interested in breaking things down further,
        check out our <Link href="/blog/how-to-track-macros">guide to tracking macros</Link>.
      </p>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">TDEE: The Number That Actually Matters</h2>

        <p className="mb-4">
          Before you count a single calorie, you need to know one number: your Total Daily Energy
          Expenditure (TDEE). This is how many calories your body burns in a day, including everything
          from breathing to your workout to fidgeting at your desk.
        </p>

        <p className="mb-4">TDEE is made up of four components:</p>

        <BlogList items={[
          "BMR (Basal Metabolic Rate) - what your body burns just existing (~60-70% of TDEE)",
          "TEF (Thermic Effect of Food) - energy used to digest food (~10%)",
          "EAT (Exercise Activity Thermogenesis) - your intentional workouts (~5-10%)",
          "NEAT (Non-Exercise Activity Thermogenesis) - walking, fidgeting, standing (~15-30%)"
        ]} />

        <h3 className="text-2xl font-semibold mt-6 mb-4">How to Estimate Your TDEE</h3>

        <p className="mb-4">
          The most common approach is the Mifflin-St Jeor equation multiplied by an activity factor.
          Here&apos;s how it works:
        </p>

        <BlogCode>
          {`Step 1: Calculate BMR
Men:    (10 x weight in kg) + (6.25 x height in cm) - (5 x age) + 5
Women:  (10 x weight in kg) + (6.25 x height in cm) - (5 x age) - 161

Step 2: Multiply by activity level
Sedentary (desk job, no exercise):        BMR x 1.2
Lightly active (1-3 days/week):           BMR x 1.375
Moderately active (3-5 days/week):        BMR x 1.55
Very active (6-7 days/week):              BMR x 1.725
Extremely active (athlete/physical job):  BMR x 1.9`}
        </BlogCode>

        <p className="mb-4">
          Example: A 30-year-old man, 180 lbs (82 kg), 5&apos;10&quot; (178 cm), who lifts 4 days a week:
        </p>

        <BlogCode>
          {`BMR = (10 x 82) + (6.25 x 178) - (5 x 30) + 5
BMR = 820 + 1112.5 - 150 + 5
BMR = 1,788 calories

TDEE = 1,788 x 1.55 (moderately active)
TDEE = ~2,771 calories/day`}
        </BlogCode>

        <p className="mb-4">
          Don&apos;t want to do math? Use our <Link href="/tools/tdee">TDEE calculator</Link> and
          get your number in seconds.
        </p>

        <BlogQuote>
          Your TDEE is an estimate, not gospel. Use it as a starting point, then adjust based on
          what actually happens over 2-3 weeks. The scale, the mirror, and your energy levels will
          tell you more than any equation.
        </BlogQuote>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">How to Actually Count Calories</h2>

        <p className="mb-4">
          OK, you&apos;ve got your TDEE. Now what? Here&apos;s how to turn that number into action
          without losing your mind.
        </p>

        <h3 className="text-2xl font-semibold mt-6 mb-4">1. Read Nutrition Labels</h3>
        <p className="mb-4">
          This is the easiest win. Packaged food tells you exactly what&apos;s in it. Pay attention to:
        </p>
        <BlogList items={[
          "Serving size (this trips up everyone - that bag of chips is 3 servings, not 1)",
          "Calories per serving",
          "Protein, carbs, and fat grams if you're tracking macros too"
        ]} />

        <h3 className="text-2xl font-semibold mt-6 mb-4">2. Use a Food Scale (At Least at First)</h3>
        <p className="mb-4">
          This sounds obsessive but hear me out. Most people are terrible at eyeballing portions.
          Studies consistently show we underestimate calories by 30-50%. A $15 food scale fixes that
          overnight.
        </p>
        <p className="mb-4">
          You don&apos;t need to weigh food forever. Do it for 2-4 weeks and you&apos;ll develop a
          solid mental model for what &quot;4 oz of chicken&quot; or &quot;1 cup of rice&quot; actually
          looks like.
        </p>

        <h3 className="text-2xl font-semibold mt-6 mb-4">3. Log Consistently (Not Perfectly)</h3>
        <p className="mb-4">
          Pick a tracking method and stick with it. The best tracker is the one you&apos;ll actually use.
          Log before or right after you eat &mdash; not at the end of the day when you&apos;ve forgotten
          half of what you ate.
        </p>

        <BlogCode>
          {`Quick portion estimates when you can't weigh:
Palm of your hand    = ~4 oz protein (~120-150 cal)
Fist                 = ~1 cup carbs (~200 cal)
Thumb                = ~1 tbsp fat (~100 cal)
Cupped hand          = ~1 oz snack (~150 cal)

These aren't perfect, but they're WAY better than guessing.`}
        </BlogCode>

        <h3 className="text-2xl font-semibold mt-6 mb-4">4. Handle Eating Out</h3>
        <p className="mb-4">
          Restaurant meals are the hardest to track. Here&apos;s the realistic approach:
        </p>
        <BlogList items={[
          "Check the restaurant's website for nutrition info before you go",
          "If no info is available, find a similar dish in your tracking app and add 20%",
          "Don't skip logging just because you can't be exact - a rough estimate beats no estimate",
          "Focus on protein-forward dishes and you'll naturally stay closer to target"
        ]} />
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">The 80/20 Rule: Accurate Enough Without Going Crazy</h2>

        <p className="mb-4">
          Here&apos;s the part most calorie counting guides skip: you don&apos;t need to be perfect.
          You need to be consistent and roughly accurate. That&apos;s it.
        </p>

        <BlogList items={[
          "Track your main meals carefully - this covers ~80% of your intake",
          "Don't stress about the exact calorie count of a splash of cream in your coffee",
          "Round to the nearest 50 calories - the math is easier and the difference is negligible",
          "Track on weekdays, estimate on weekends if strict tracking kills your social life",
          "A consistent 90% effort beats a perfect 3 days followed by giving up"
        ]} />

        <BlogQuote>
          The goal of calorie counting isn&apos;t to hit your number to the exact calorie every
          single day. It&apos;s to build awareness of what you&apos;re eating so you can make better
          decisions &mdash; even when you stop tracking.
        </BlogQuote>

        <h3 className="text-2xl font-semibold mt-6 mb-4">When to Stop Counting</h3>
        <p className="mb-4">
          Calorie counting is a learning tool, not a life sentence. You should plan to stop (or at
          least pull back) once you can:
        </p>
        <BlogList items={[
          "Eyeball portions with reasonable accuracy",
          "Intuitively choose meals that fit your goals",
          "Maintain your weight (or progress) without logging every bite",
          "Recognize when you're overeating vs eating appropriately"
        ]} />
        <p className="mb-4">
          For most people, 2-3 months of consistent tracking builds enough awareness to transition
          to intuitive eating. You can always come back to tracking if things start drifting.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">When Calorie Counting Works (and When It Doesn&apos;t)</h2>

        <h3 className="text-2xl font-semibold mt-6 mb-4">Calorie Counting Is Great For:</h3>
        <BlogList items={[
          "Building nutritional awareness when you're starting out",
          "Dialing in a specific fat loss or muscle gain phase",
          "Breaking through a plateau when \"eating healthy\" isn't producing results",
          "Understanding why your weight isn't changing despite \"eating well\"",
          "Athletes and competitors who need precise control"
        ]} />

        <h3 className="text-2xl font-semibold mt-6 mb-4">Calorie Counting Might Not Be Right If:</h3>
        <BlogList items={[
          "You have a history of disordered eating or an unhealthy relationship with food",
          "It causes anxiety, guilt, or obsessive behavior around meals",
          "You find yourself avoiding social situations because you can't track accurately",
          "You're under 18 and still growing (focus on food quality instead)",
          "It's been 6+ months and tracking feels like a chore rather than a tool"
        ]} />

        <BlogQuote>
          If calorie counting starts controlling you instead of the other way around, it&apos;s time
          to step back. No fitness goal is worth sacrificing your mental health. Talk to a
          professional if tracking is causing distress.
        </BlogQuote>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Setting Your Calorie Target</h2>

        <p className="mb-4">
          Once you know your TDEE, setting a target is straightforward:
        </p>

        <BlogCode>
          {`Goal: Lose fat
Target: TDEE minus 300-500 calories
Example: TDEE 2,500 → eat 2,000-2,200/day
Rate: ~0.5-1 lb per week

Goal: Maintain weight
Target: TDEE (adjust based on results)
Example: TDEE 2,500 → eat ~2,500/day

Goal: Build muscle
Target: TDEE plus 200-300 calories
Example: TDEE 2,500 → eat 2,700-2,800/day
Rate: ~0.5 lb per week (with proper training)`}
        </BlogCode>

        <p className="mb-4">
          Want to break your calories down into protein, carbs, and fat? Our{' '}
          <Link href="/tools/macros">macro calculator</Link> does that for you. And if you want
          the full breakdown on macros, read
          our <Link href="/blog/how-to-track-macros">macro tracking guide</Link>.
        </p>

        <h3 className="text-2xl font-semibold mt-6 mb-4">Adjusting Over Time</h3>
        <p className="mb-4">
          Your TDEE isn&apos;t static. It changes as your weight changes, as your activity
          changes, and as your body adapts. Here&apos;s when to adjust:
        </p>
        <BlogList items={[
          "Weight hasn't moved in 2+ weeks → re-evaluate intake and activity",
          "Losing more than 1.5 lbs/week → you're probably cutting too hard, add 100-200 cal",
          "Energy is tanking, sleep is suffering → deficit may be too aggressive",
          "You've lost 10+ lbs → recalculate TDEE with your new weight"
        ]} />
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Tools That Make Calorie Counting Easier</h2>

        <p className="mb-4">
          The right tools turn calorie counting from a chore into a 5-minute daily habit.
          Here&apos;s what you need:
        </p>

        <h3 className="text-2xl font-semibold mt-6 mb-4">Must-Haves</h3>
        <BlogList items={[
          "A food tracking app with a verified database (garbage data = garbage results)",
          "A food scale ($10-15, lasts years, biggest bang-for-buck purchase you'll make)",
          "A TDEE estimate to set your baseline"
        ]} />

        <h3 className="text-2xl font-semibold mt-6 mb-4">Nice-to-Haves</h3>
        <BlogList items={[
          "Barcode scanner in your tracking app (saves tons of time)",
          "Meal prep containers with known volumes",
          "A weekly meal plan so you're not making decisions from scratch every day"
        ]} />

        <h3 className="text-2xl font-semibold mt-6 mb-4">The Food Database Problem</h3>
        <p className="mb-4">
          Here&apos;s the dirty secret of most calorie tracking apps: their food databases are full
          of user-submitted garbage. You search for &quot;chicken breast&quot; and get 47 different
          entries with wildly different calorie counts. Some are clearly wrong. Some are outdated.
          Some are for raw vs cooked and don&apos;t specify which.
        </p>
        <p className="mb-4">
          This is a bigger problem than most people realize. If your data is wrong, your tracking
          is wrong, and your results will be unpredictable. We wrote
          a <Link href="/blog/calorie-tracking-app-food-data">deep dive on food database accuracy</Link> if
          you want the full picture.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Quick-Start Checklist</h2>

        <p className="mb-4">
          Ready to start? Here&apos;s the no-fluff action plan:
        </p>

        <BlogCode>
          {`Week 1: Setup
- Calculate your TDEE (use baisics.app/tools/tdee)
- Set your calorie target based on your goal
- Get a food scale
- Pick a tracking app

Week 2-3: Learn
- Weigh and log everything you eat
- Read every nutrition label
- Look up calories for your go-to meals
- Note where your biggest calories come from

Week 4+: Optimize
- Adjust your target based on real-world results
- Start relying more on portion estimation
- Identify your "easy wins" for cutting/adding calories
- Build a rotation of meals you know the numbers for`}
        </BlogCode>

        <BlogQuote>
          The best time to start counting calories was yesterday. The second best time is today.
          Don&apos;t overthink it &mdash; just start logging and adjust as you go.
        </BlogQuote>
      </BlogSection>

      <BlogCTA
        title="Track calories with data you can trust"
        description="baisics uses a verified food database so you get accurate calorie counts without sifting through user-submitted garbage. Start tracking with confidence."
        buttonText="Get Started Free"
        href="/hi"
      />
    </BlogPost>
  )
}
