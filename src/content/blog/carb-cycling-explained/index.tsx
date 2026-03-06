import Link from 'next/link'
import { BlogPost, BlogSection, BlogQuote, BlogList, BlogCode, BlogCTA } from '@/app/blog/components/BlogPost'
import { BlogPostFrontmatter } from '@/types/blog'

export const frontmatter: BlogPostFrontmatter = {
  title: "Carb Cycling Explained: When It Works and When It Doesn't",
  date: "2026-03-06",
  excerpt: "What carb cycling actually is, who it's for, and how to set it up. No bro-science — just the practical version.",
  metaDescription: "Learn what carb cycling is, how to set up training and rest day macros, and whether carb cycling is right for your fitness goals.",
  published: true,
  featured: false,
  categories: [
    "Nutrition"
  ],
  tags: [
    "carb cycling",
    "nutrition",
    "macros",
    "fat loss",
    "muscle building"
  ],
  keywords: [
    "carb cycling",
    "carb cycling for fat loss",
    "carb cycling meal plan",
    "training day macros",
    "rest day macros",
    "carb cycling explained"
  ]
}

export default function CarbCyclingExplained() {
  return (
    <BlogPost frontmatter={frontmatter}>
      <p className="text-lg mb-6">
        Carb cycling is one of those nutrition strategies that sounds more complicated than it
        actually is. The core idea: eat more carbs on the days you train hard, fewer carbs on
        the days you don&apos;t. That&apos;s it. The rest is details.
      </p>

      <p className="mb-6">
        But &quot;simple concept&quot; doesn&apos;t mean &quot;right for everyone.&quot; This is
        an advanced strategy, and if you&apos;re not already comfortable
        with <Link href="/blog/how-to-track-macros">tracking your macros</Link> consistently,
        carb cycling will just add complexity without adding results. Get the basics down first.
      </p>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Who Is Carb Cycling Actually For?</h2>

        <p className="mb-4">
          Carb cycling works best for people who already have a foundation. If you&apos;re still
          figuring out how to hit your protein target or
          how <Link href="/blog/calorie-counting-guide">calorie counting</Link> works, this
          isn&apos;t the next step. The next step is consistency with the basics.
        </p>

        <p className="font-semibold mb-2">Good candidates for carb cycling:</p>
        <BlogList items={[
          "Intermediate to advanced lifters who already track macros consistently",
          "People in a cutting phase who want to preserve training performance",
          "Athletes with clearly defined training and rest days",
          "Anyone who has plateaued on a standard macro split and wants a new lever to pull"
        ]} />

        <p className="font-semibold mt-6 mb-2">Not the right fit if you:</p>
        <BlogList items={[
          "Are new to tracking food or counting calories",
          "Don't train with a structured program (random workouts don't count)",
          "Struggle with consistency on a simple nutrition plan",
          "Have a history of disordered eating around food rules"
        ]} />

        <BlogQuote>
          If a flat macro target still feels hard to hit most days, adding variability will
          make it harder, not easier. Master the fundamentals before layering on complexity.
        </BlogQuote>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">How Carb Cycling Works (The Physiology)</h2>

        <p className="mb-4">
          The logic behind carb cycling is straightforward. Carbohydrates are your body&apos;s
          preferred fuel source for high-intensity work. On days you train hard, you need more
          of that fuel. On days you rest, you don&apos;t.
        </p>

        <p className="mb-4">
          By shifting carbs toward training days, you get three potential benefits:
        </p>

        <BlogList items={[
          <>
            <strong>Better training performance.</strong> More glycogen available means more
            energy for heavy lifts and intense sessions.
          </>,
          <>
            <strong>Improved calorie partitioning.</strong> Carbs eaten around training are
            more likely to fuel muscle recovery than be stored as fat.
          </>,
          <>
            <strong>Greater insulin sensitivity.</strong> Exercise increases your muscles&apos;
            ability to absorb glucose. Timing carbs around that window takes advantage of it.
          </>,
          <>
            <strong>Easier adherence on rest days.</strong> Some people find higher-fat,
            lower-carb meals more satiating when they&apos;re not training.
          </>
        ]} />

        <p className="mt-4 mb-4">
          None of this is magic. The total calories across the week still matter most. Carb
          cycling is a way to distribute those calories more intelligently, not a way to
          cheat thermodynamics.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">How to Set Up Carb Cycling</h2>

        <p className="mb-4">
          The setup is simpler than most guides make it. Here&apos;s the framework:
        </p>

        <h3 className="text-2xl font-semibold mb-4">Step 1: Set Your Weekly Calorie Target</h3>
        <p className="mb-4">
          Your total weekly calories stay the same whether you carb cycle or not. If your
          daily target is 2,400 calories, that&apos;s 16,800 per week. You&apos;re just
          distributing them differently across days.
        </p>

        <h3 className="text-2xl font-semibold mt-6 mb-4">Step 2: Keep Protein Constant</h3>
        <p className="mb-4">
          Protein does not change between training and rest days. Your muscles need amino
          acids for recovery regardless of whether you trained today. Hit your protein
          target every single day.
        </p>

        <BlogCode>
          {`Protein target (both days):
0.8 - 1.0g per lb of bodyweight

Example (180 lb person):
Protein = 160g/day = 640 calories from protein
This stays the same on training AND rest days.`}
        </BlogCode>

        <h3 className="text-2xl font-semibold mt-6 mb-4">Step 3: Shift Carbs Up on Training Days, Down on Rest Days</h3>
        <p className="mb-4">
          Take your average daily carb intake and redistribute it. A common split is to
          add 50-75g of carbs on training days and subtract the same amount on rest days.
        </p>

        <h3 className="text-2xl font-semibold mt-6 mb-4">Step 4: Inversely Adjust Fat</h3>
        <p className="mb-4">
          When carbs go up, fat comes down to keep calories roughly on target. When carbs
          go down on rest days, fat goes up. This keeps your total calories balanced across
          the week.
        </p>

        <BlogCode>
          {`The inverse relationship:
Training days = Higher carb, Lower fat
Rest days     = Lower carb, Higher fat
Protein       = Same every day
Weekly calories = Same total either way`}
        </BlogCode>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Sample Training vs. Rest Day Macros</h2>

        <p className="mb-4">
          Here&apos;s a concrete example for a 180 lb person eating 2,400 calories per day
          on average, training 4 days per week:
        </p>

        <h3 className="text-2xl font-semibold mb-4">Training Day (4 days/week)</h3>
        <BlogCode>
          {`Calories: ~2,600
Protein:  160g  (640 cal)
Carbs:    300g  (1,200 cal)
Fat:      84g   (760 cal)

Where the extra carbs go:
- Pre-workout meal: +30g carbs (oats, rice, fruit)
- Post-workout meal: +40g carbs (rice, potatoes, pasta)`}
        </BlogCode>

        <h3 className="text-2xl font-semibold mt-6 mb-4">Rest Day (3 days/week)</h3>
        <BlogCode>
          {`Calories: ~2,130
Protein:  160g  (640 cal)
Carbs:    165g  (660 cal)
Fat:      92g   (830 cal)

Where the extra fat goes:
- Breakfast: eggs cooked in butter, avocado
- Lunch: fattier protein (salmon, thigh meat)
- Snacks: nuts, cheese, nut butter`}
        </BlogCode>

        <h3 className="text-2xl font-semibold mt-6 mb-4">Weekly Check</h3>
        <BlogCode>
          {`Training days: 2,600 x 4 = 10,400
Rest days:     2,130 x 3 =  6,390
Weekly total:              16,790

Compare to flat approach:
2,400 x 7 = 16,800

Difference: 10 calories. Close enough.`}
        </BlogCode>

        <p className="mt-4 mb-4">
          The numbers don&apos;t need to be perfect. The point is directional: more fuel on
          hard days, slightly less on easy days. Don&apos;t lose sleep over 10 calories.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Common Mistakes</h2>

        <p className="mb-4">
          <strong>1. Overcomplicating the split.</strong> Some programs have high, medium,
          and low carb days, with different macros for upper body vs. lower body days, plus
          a refeed day. That&apos;s a spreadsheet, not a diet. Two tiers — training and rest —
          is enough for most people.
        </p>

        <p className="mb-4">
          <strong>2. Cutting carbs too low on rest days.</strong> Rest days are not zero-carb
          days. Your muscles are still recovering and need glycogen replenishment. Going under
          100g of carbs on rest days is usually unnecessary and will leave you feeling flat.
        </p>

        <p className="mb-4">
          <strong>3. Not tracking.</strong> Carb cycling without tracking is just eating
          differently on random days. The whole point is intentional distribution. If you&apos;re
          not <Link href="/blog/how-to-track-macros">measuring what you eat</Link>, you&apos;re
          guessing, and guessing defeats the purpose.
        </p>

        <p className="mb-4">
          <strong>4. Ignoring total weekly calories.</strong> Some people add carbs on training
          days without removing them from rest days. That&apos;s not cycling — that&apos;s just
          eating more. The weekly total has to balance out.
        </p>

        <p className="mb-4">
          <strong>5. Changing too many variables at once.</strong> If you&apos;re also changing
          your training program, sleep schedule, and supplement stack, you&apos;ll have no idea
          whether carb cycling is actually doing anything. Change one thing at a time.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">When Carb Cycling Doesn&apos;t Make Sense</h2>

        <p className="mb-4">
          This is just as important as knowing when it works. Carb cycling is not a good
          fit in several common scenarios:
        </p>

        <BlogList items={[
          <>
            <strong>You&apos;re a beginner.</strong> Beginners make fast progress on a flat
            macro split. Adding cycling complexity slows you down without speeding up results.
            Focus on <Link href="/blog/nutrition-for-muscle-growth">the fundamentals of
            eating for your goals</Link> first.
          </>,
          <>
            <strong>You struggle with consistency.</strong> If hitting the same macros every
            day is already a challenge, having two different sets of macros will make adherence
            harder, not easier.
          </>,
          <>
            <strong>You hate tracking food.</strong> Carb cycling only works if you actually
            track it. Eyeballing portions with two different macro targets is a recipe for
            confusion and frustration.
          </>,
          <>
            <strong>Your training schedule is unpredictable.</strong> If you don&apos;t know
            which days you&apos;ll train until the morning of, planning training-day vs.
            rest-day meals becomes impractical.
          </>,
          <>
            <strong>You&apos;re in a large surplus.</strong> If you&apos;re bulking
            aggressively, you already have plenty of fuel. Cycling carbs when you&apos;re
            eating 500+ calories above maintenance adds complexity with negligible benefit.
          </>
        ]} />

        <BlogQuote>
          The best nutrition strategy is the one you&apos;ll actually follow. If carb cycling
          feels like a chore, a flat macro target that you hit consistently will always beat
          a perfect cycling plan that you abandon after two weeks.
        </BlogQuote>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">The Bottom Line</h2>

        <p className="mb-4">
          Carb cycling is a legitimate tool for intermediate and advanced lifters who want
          to optimize how they distribute calories across the week. It can improve training
          performance, support body composition goals, and give you a structured way to
          think about rest-day nutrition.
        </p>

        <p className="mb-4">
          But it&apos;s not a shortcut and it&apos;s not necessary. Plenty of strong, lean
          people eat the same macros every day and do great. Carb cycling is an optimization,
          not a requirement.
        </p>

        <p className="mb-6">
          If you decide to try it: keep it simple (two tiers, not five), track your food,
          keep protein constant, and give it at least 4-6 weeks before deciding whether
          it&apos;s working.
        </p>

        <BlogCTA
          title="Skip the spreadsheet"
          description="The baisics Jacked tier auto-calculates your training day and rest day macros based on your schedule, goals, and body stats. No manual math required."
          buttonText="Get Started"
          href="/hi"
        />
      </BlogSection>
    </BlogPost>
  )
}
