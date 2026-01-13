import Link from 'next/link'
import { BlogPost, BlogSection, BlogQuote, BlogList, BlogCode } from '@/app/blog/components/BlogPost'
import { BlogPostFrontmatter } from '@/types/blog'

export const frontmatter: BlogPostFrontmatter = {
  title: "Progressive Overload: The Only Thing That Actually Makes You Stronger",
  date: "2024-03-14",
  excerpt: "Every successful training program works because of progressive overload. Here's how to apply it without overcomplicating things or getting hurt.",
  metaDescription: "Learn how to implement progressive overload for continuous muscle growth and strength gains. Practical methods for beginners through advanced lifters.",
  published: true,
  featured: true,
  categories: [
    "Training Principles",
    "Muscle Building",
    "Strength Training"
  ],
  tags: [
    "progressive overload",
    "muscle growth",
    "strength training",
    "workout programming",
    "training principles",
    "muscle building",
    "fitness fundamentals"
  ],
  keywords: [
    "progressive overload training",
    "how to build muscle",
    "strength training progression",
    "muscle building techniques",
    "workout progression",
    "training program design",
    "strength training methods",
    "muscle growth strategy"
  ]
}

export default function ProgressiveOverloadGuide() {
  return (
    <BlogPost frontmatter={frontmatter}>
      <p className="text-lg mb-6">
        Strip away all the fitness noise—the periodization schemes, the optimal rep ranges,
        the exercise selection debates—and you&apos;re left with one principle that matters
        more than everything else combined: progressive overload.
      </p>

      <p className="mb-6">
        Do more than you did before. That&apos;s it. Every effective training program in history
        works because it forces you to gradually do more work. If you&apos;re not progressing,
        you&apos;re not growing.
      </p>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">What Progressive Overload Actually Means</h2>

        <p className="mb-4">
          Your body doesn&apos;t build muscle because you want it to. It builds muscle
          because you force it to. When you lift something heavy, your body thinks
          &quot;that was hard, I should get stronger so it&apos;s easier next time.&quot;
        </p>

        <p className="mb-4">
          But here&apos;s the problem: your body adapts. What was hard last month is easier now.
          If you keep doing the same thing, your body has no reason to keep adapting.
          You plateau.
        </p>

        <p className="mb-4">
          Progressive overload is the solution. You systematically increase the demand
          so your body always has something to adapt to.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Ways to Progress (Ranked by Importance)</h2>

        <h3 className="text-xl font-semibold mt-4 mb-2">1. Add Weight</h3>
        <p className="mb-4">
          The most straightforward method. If you squatted 135 lbs last week, squat 140 this week.
          For beginners, this works consistently for months. Eventually it slows down, but
          &quot;add weight when you can&quot; should be your default approach.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">2. Add Reps</h3>
        <p className="mb-4">
          Can&apos;t add weight yet? Do more reps with the same weight. Went from 135×8 to 135×10?
          That&apos;s progress. Once you hit the top of your rep range, bump the weight up and
          start over at the bottom.
        </p>

        <BlogCode>
          {`Example "Double Progression":
Week 1: 100 lbs × 8, 8, 7 reps
Week 2: 100 lbs × 8, 8, 8 reps
Week 3: 100 lbs × 9, 9, 8 reps
Week 4: 100 lbs × 10, 10, 10 reps
Week 5: 105 lbs × 8, 8, 7 reps (start over)

Simple, effective, works for years.`}
        </BlogCode>

        <h3 className="text-xl font-semibold mt-4 mb-2">3. Add Sets</h3>
        <p className="mb-4">
          More volume = more stimulus. If you&apos;ve been doing 3 sets, try 4. This is particularly
          useful when weight and rep progress stalls. But don&apos;t go crazy—there&apos;s a point
          of diminishing returns around 10-20 sets per muscle per week for most people.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">4. Improve Form</h3>
        <p className="mb-4">
          Underrated. Better technique means more muscle activation with the same weight.
          If you clean up a sloppy squat, the same 185 lbs becomes a harder stimulus because
          you&apos;re actually using your muscles instead of momentum and leverages.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">How Fast Should You Progress?</h2>

        <p className="mb-4">
          This depends entirely on how long you&apos;ve been training.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">Beginners (0-1 Year)</h3>
        <p className="mb-4">
          You can add weight every session for many exercises. Seriously. Your nervous system
          is learning, your muscles are responding to novel stimulus, and gains come fast.
          This is the &quot;newbie gains&quot; phase. Don&apos;t waste it.
        </p>
        <BlogCode>
          {`Realistic beginner progression:
Upper body: +2.5-5 lbs per week
Lower body: +5-10 lbs per week

Yes, really. For the first 6-12 months.`}
        </BlogCode>

        <h3 className="text-xl font-semibold mt-4 mb-2">Intermediates (1-3 Years)</h3>
        <p className="mb-4">
          Weekly progression becomes harder. You might add weight every 2-3 weeks instead.
          Rep progression becomes more important. Sets might increase. This is where most
          people get frustrated because the easy gains are over—but progress is still possible,
          just slower.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">Advanced (3+ Years)</h3>
        <p className="mb-4">
          Progress is measured in months, not weeks. You might PR once per training cycle
          (8-12 weeks). But you also don&apos;t need to progress as fast—you&apos;re already strong.
          The game becomes about maintaining and making small, hard-won gains.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">When Progress Stalls (And It Will)</h2>

        <p className="mb-4">
          You will eventually stop progressing. This is normal. Here&apos;s the troubleshooting order:
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">First, Check the Basics</h3>
        <p className="mb-4">
          Are you sleeping 7+ hours? Eating enough protein? Actually recovering between sessions?
          Most plateaus are recovery problems, not training problems. You can&apos;t outwork
          5 hours of sleep and 80g of protein.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">Second, Take a Deload</h3>
        <p className="mb-4">
          Cut your volume and/or intensity by 40-50% for a week. Sometimes you&apos;re not stalled,
          you&apos;re just accumulated fatigue masking your fitness. A deload reveals where
          you actually are.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">Third, Change the Stimulus</h3>
        <p className="mb-4">
          Same exercises for 6+ months? Your body adapted to those specific movement patterns.
          Swap bench press for incline. Conventional deadlifts for sumo. You&apos;ll often find
          you can progress on the new variation, then return to the old one later and break
          through the plateau.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">Fourth, Accept Slower Progress</h3>
        <p className="mb-4">
          Sometimes you&apos;re just not a beginner anymore. Adding 5 lbs per month instead of
          per week is still 60 lbs per year. That&apos;s real progress. Adjust expectations
          based on your training age.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Common Mistakes</h2>

        <h3 className="text-xl font-semibold mt-4 mb-2">Progressing Too Fast</h3>
        <p className="mb-4">
          Ego lifting. Adding 20 lbs to your squat because it &quot;felt easy&quot; and then
          getting stapled under the bar. Progress should be gradual and sustainable.
          Small jumps done consistently beat big jumps that get you injured.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">Not Tracking</h3>
        <p className="mb-4">
          If you don&apos;t know what you lifted last week, how do you know if you&apos;re progressing?
          Track your workouts. Phone notes, spreadsheet, app—doesn&apos;t matter. Just write it down.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">Chasing Multiple Types of Progress at Once</h3>
        <p className="mb-4">
          &quot;I want to get stronger AND more muscular AND improve cardio AND lose fat.&quot;
          You can&apos;t optimize for everything simultaneously. Pick a primary goal,
          make progress on it, then shift focus. Trying to do everything usually means
          progressing at nothing.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">Overthinking It</h3>
        <p className="mb-4">
          Periodization schemes, conjugate methods, undulating loads—all valid approaches,
          but they matter way less than consistently showing up and trying to do more than
          last time. Simple programs executed well beat complex programs executed poorly.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">A Simple System That Works</h2>

        <p className="mb-4">
          Here&apos;s a practical approach for most lifters:
        </p>

        <BlogCode>
          {`1. Pick a rep range (e.g., 6-10 reps)
2. Start at the bottom (6 reps with a weight you could do 8 with)
3. Add reps each session until you hit 10
4. Add 5-10 lbs, drop back to 6 reps
5. Repeat

When you can't complete 6 reps with the new weight:
- Stay at that weight until you can
- Or back off 10% and build back up

When you've stalled for 3+ weeks:
- Take a deload week
- Or swap the exercise variation`}
        </BlogCode>

        <p className="mt-4 mb-4">
          This isn&apos;t revolutionary. It&apos;s what works.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">The Long Game</h2>

        <p className="mb-4">
          Progressive overload is a multi-year project. The person who adds 5 lbs to their squat
          every month for 3 years ends up squatting 180 lbs more than they started.
          The person who tries to add 5 lbs every week, gets injured, takes time off, and
          restarts is still at the same weight.
        </p>

        <p className="mb-4">
          Slow, consistent progress beats fast, unsustainable progress. Every time.
        </p>

        <BlogQuote>
          <p>
            The question isn&apos;t &quot;how fast can I progress?&quot; It&apos;s &quot;how consistently
            can I progress for years?&quot;
          </p>
        </BlogQuote>

        <p className="mt-6 mb-4">
          <Link href="/hi">Get a program</Link> that builds progressive overload in from the start,
          or just apply these principles to whatever you&apos;re already doing. Either way:
          do more than last time. That&apos;s the whole game.
        </p>
      </BlogSection>
    </BlogPost>
  )
}
