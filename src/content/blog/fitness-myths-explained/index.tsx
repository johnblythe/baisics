import Link from 'next/link'
import { BlogPost, BlogSection, BlogQuote, BlogList, BlogCode } from '@/app/blog/components/BlogPost'
import { BlogPostFrontmatter } from '@/types/blog'

export const frontmatter: BlogPostFrontmatter = {
  title: "10 Things About Fitness That Sound Wrong But Are Actually True",
  date: "2024-03-14",
  excerpt: "The most effective fitness advice often sounds backwards. Here's why resting more, eating more, and doing less cardio might be exactly what you need.",
  metaDescription: "Counter-intuitive fitness truths backed by science: why rest builds muscle, eating more helps fat loss, and walking beats HIIT for most people.",
  published: true,
  featured: true,
  categories: [
    "Fundamentals",
    "Nutrition",
    "Fat Loss",
    "Training Principles"
  ],
  tags: [
    "fitness myths",
    "nutrition basics",
    "fat loss science",
    "muscle building",
    "recovery",
    "cardio myths",
    "beginner tips",
    "exercise science"
  ],
  keywords: [
    "counter intuitive fitness",
    "surprising fitness facts",
    "fitness myths debunked",
    "fat loss truth",
    "muscle building facts",
    "exercise science basics",
    "beginner fitness tips",
    "nutrition facts"
  ]
}

export default function FitnessMyths() {
  return (
    <BlogPost frontmatter={frontmatter}>
      <p className="text-lg mb-6">
        When I started lifting, I did everything wrong. Six days a week in the gym.
        Eating 1,200 calories. Running every morning. I was exhausted, hungry,
        and somehow getting weaker. Then someone told me to train less and eat more.
        It sounded insane. It also worked.
      </p>

      <p className="mb-6">
        Fitness is full of advice that sounds backwards until you understand the why.
        Here are ten truths that most beginners don&apos;t believe until they experience them.
      </p>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">1. Training Less Often Can Give You Better Results</h2>

        <p className="mb-4">
          Your muscles don&apos;t grow in the gym. They grow after, while you&apos;re resting.
          The workout is just the signal telling your body &quot;hey, we need to get stronger.&quot;
          The actual building happens during recovery—specifically during sleep and
          the 24-48 hours after training.
        </p>

        <p className="mb-4">
          If you train the same muscle again before it&apos;s recovered, you&apos;re just
          accumulating damage without the benefit. This is why many people see better
          results going from 6 days to 4, or from 5 to 3.
        </p>

        <BlogCode>
          {`The sweet spot for most people:
3-4 training days per week
48-72 hours between hitting the same muscles
7-9 hours of sleep`}
        </BlogCode>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">2. Eating More Can Help You Lose Fat</h2>

        <p className="mb-4">
          This one really messes with people&apos;s heads. You&apos;ve been taught that
          weight loss = calories in minus calories out. True. But here&apos;s what
          happens when you cut calories too aggressively:
        </p>

        <p className="mb-4">
          Your metabolism slows down. Your body starts burning muscle for fuel
          (it&apos;s metabolically expensive to maintain). Your hormones get wonky.
          You feel exhausted, so you move less throughout the day. Your actual
          calorie deficit shrinks even though you&apos;re eating less.
        </p>

        <p className="mb-4">
          The fix? A smaller deficit with adequate protein. You lose fat more slowly,
          but you actually keep losing it instead of plateauing after 3 weeks.
          And you keep your muscle, which is what makes you look &quot;toned&quot; rather
          than just smaller.
        </p>

        <BlogQuote>
          <p>
            A 300-500 calorie deficit you can maintain for months beats a 1,000 calorie
            deficit you abandon after two weeks.
          </p>
        </BlogQuote>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">3. Walking Is Better Than HIIT for Most People</h2>

        <p className="mb-4">
          HIIT gets all the hype because it&apos;s dramatic. 20 minutes of suffering!
          Afterburn effect! Metabolic fire! And yes, HIIT is effective—if you can
          recover from it, which most people can&apos;t when they&apos;re also lifting.
        </p>

        <p className="mb-4">
          Walking doesn&apos;t spike cortisol. It doesn&apos;t interfere with recovery.
          You can do it every day without your joints complaining. And over time,
          the calories add up:
        </p>

        <BlogCode>
          {`3 HIIT sessions/week: ~1,200-1,500 calories burned
Daily 45-minute walk: ~2,000+ calories burned

Walking also:
- Reduces stress
- Improves recovery
- Doesn't make you ravenously hungry after`}
        </BlogCode>

        <p className="mt-4 mb-4">
          For pure fat loss, boring and sustainable beats intense and unsustainable
          every time.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">4. Lifting Weights Won&apos;t Make You Bulky</h2>

        <p className="mb-4">
          This one&apos;s mostly directed at women, but some men worry about it too.
          Here&apos;s the reality: building muscle is incredibly slow and difficult.
          Those bodybuilders you&apos;re thinking of? They&apos;ve spent years—sometimes
          decades—eating massive amounts of food and training specifically for size.
          Many are also using... assistance.
        </p>

        <p className="mb-4">
          Natural muscle gain for most people:
        </p>

        <BlogCode>
          {`Beginners: 1-2 lbs of muscle per month (if everything is perfect)
After year 1: 0.5-1 lb per month
After year 2+: A few lbs per year

Women build muscle at about half this rate due to hormones.`}
        </BlogCode>

        <p className="mt-4 mb-4">
          You&apos;re not going to accidentally wake up huge. What actually happens:
          you get &quot;toned,&quot; your posture improves, your clothes fit better, and you
          feel stronger. That&apos;s it.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">5. Meal Timing Barely Matters</h2>

        <p className="mb-4">
          The fitness industry has spent decades convincing people that when you eat
          is almost as important as what you eat. Eat every 3 hours to &quot;stoke your
          metabolism.&quot; Don&apos;t eat after 8pm. Get protein within 30 minutes of training
          or lose your gains.
        </p>

        <p className="mb-4">
          Research says: meh.
        </p>

        <p className="mb-4">
          Your total daily intake matters way more than timing. Some people thrive on
          intermittent fasting with 2 big meals. Others prefer 5-6 small ones. Both
          approaches work if the calories and protein are right.
        </p>

        <p className="mb-4">
          The &quot;anabolic window&quot; isn&apos;t 30 minutes—it&apos;s more like several hours.
          And eating at night doesn&apos;t make you fat; eating too much makes you fat.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">6. Soreness Doesn&apos;t Mean It Was a Good Workout</h2>

        <p className="mb-4">
          Beginners often chase soreness as validation. &quot;I can barely walk—must have
          been a great leg day!&quot; But soreness (DOMS) mostly just means you did
          something new or unfamiliar. It&apos;s not a measure of effectiveness.
        </p>

        <p className="mb-4">
          As you get more trained, you&apos;ll get less sore from the same workouts even
          though you&apos;re lifting heavier weights. This doesn&apos;t mean the workouts
          stopped working—it means your body adapted.
        </p>

        <p className="mb-4">
          Better progress indicators:
        </p>

        <BlogList items={[
          "You're lifting more weight over time",
          "You're doing more reps with the same weight",
          "Your measurements are changing",
          "You feel stronger during daily activities"
        ]} />
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">7. Simple Programs Beat Complex Ones</h2>

        <p className="mb-4">
          There&apos;s a strong temptation to seek out the &quot;optimal&quot; routine with
          drop sets, supersets, rest-pause training, and periodized volume blocks.
          These have their place—for advanced lifters who&apos;ve already maximized
          the basics.
        </p>

        <p className="mb-4">
          For everyone else? A boring program with 5-6 exercises done consistently
          for months will beat a complicated program you&apos;re always tweaking.
          Squats, hinges, pushes, pulls, and some core work. Add weight when you can.
          That&apos;s 90% of what matters.
        </p>

        <p className="mb-4">
          Complexity is often a procrastination mechanism disguised as optimization.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">8. Fat Loss Isn&apos;t Linear</h2>

        <p className="mb-4">
          You&apos;ll lose 4 lbs in week one. Then gain 1 back in week two. Then lose
          nothing for 10 days. Then suddenly drop 2 lbs overnight. This is normal
          and not a sign that anything is wrong.
        </p>

        <p className="mb-4">
          Your weight fluctuates based on water retention, what you ate last night,
          when you last went to the bathroom, stress hormones, sleep quality, and
          a dozen other factors. Fat loss is happening underneath all this noise,
          but you can&apos;t see it day to day.
        </p>

        <BlogCode>
          {`What the scale shows: Wild fluctuations
What's actually happening: Slow, steady fat loss

Solution: Track weekly averages, not daily weights.
A downward trend over 4+ weeks is what matters.`}
        </BlogCode>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">9. Rest Between Sets Actually Matters</h2>

        <p className="mb-4">
          The &quot;keep your heart rate up&quot; mentality leads people to rush through
          workouts with 30-second rest periods. For strength and muscle building,
          this is counterproductive.
        </p>

        <p className="mb-4">
          Inadequate rest means you can&apos;t lift as heavy or do as many quality reps.
          Your total work done decreases. Yes, you feel more tired, but &quot;feeling
          tired&quot; and &quot;effective training stimulus&quot; aren&apos;t the same thing.
        </p>

        <BlogCode>
          {`Rest recommendations:
Strength work (heavy, 1-5 reps): 3-5 minutes
Muscle building (6-12 reps): 1.5-3 minutes
Metabolic/pump work (12+ reps): 60-90 seconds`}
        </BlogCode>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">10. What You Eat Matters More Than Exercise</h2>

        <p className="mb-4">
          You cannot out-train a bad diet. A single restaurant meal can easily be
          1,500-2,000 calories. Burning that through exercise would take 2-3 hours
          of hard work.
        </p>

        <p className="mb-4">
          Exercise is crucial for health, strength, and body composition. But for
          pure weight management, nutrition is the primary lever. This is why people
          who &quot;exercise all the time&quot; but don&apos;t watch their diet often stay the
          same weight, and people who fix their nutrition lose fat even with minimal
          exercise.
        </p>

        <p className="mb-4">
          The ideal approach: fix your nutrition first, then add exercise for all
          the other benefits it provides.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">The Common Thread</h2>

        <p className="mb-4">
          Notice the pattern here? Most of these come down to: do less, but do it
          consistently. Train smart, eat reasonably, sleep well, and give it time.
        </p>

        <p className="mb-4">
          The fitness industry makes money by selling complexity and urgency.
          &quot;Revolutionary new program! Transform in 30 days!&quot; But the stuff that
          actually works is boring, slow, and sustainable.
        </p>

        <p className="mb-6">
          <Link href="/hi">Build a simple program</Link> you can stick with, and you&apos;ll
          outperform 90% of people chasing the &quot;optimal&quot; approach.
        </p>
      </BlogSection>
    </BlogPost>
  )
}
