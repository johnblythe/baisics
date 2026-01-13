import Link from 'next/link'
import { BlogPost, BlogSection, BlogQuote, BlogList, BlogCode } from '@/app/blog/components/BlogPost'
import { BlogPostFrontmatter } from '@/types/blog'

export const frontmatter: BlogPostFrontmatter = {
  title: "3-Day Workout Plan for Beginners: The Only Program You Need to Start",
  date: "2026-01-12",
  excerpt: "A simple, effective 3-day workout routine designed for complete beginners. No gym intimidation, no complicated exercises—just a straightforward plan that actually works.",
  metaDescription: "Free 3-day beginner workout plan with full-body routines. Simple exercises, clear instructions, and realistic expectations for people just starting their fitness journey.",
  published: true,
  featured: true,
  categories: [
    "Beginner",
    "Workout Plans",
    "Strength Training"
  ],
  tags: [
    "beginner workout",
    "3 day workout",
    "workout plan",
    "gym routine",
    "full body workout",
    "strength training",
    "starter program"
  ],
  keywords: [
    "3 day workout plan for beginners",
    "beginner workout routine",
    "simple gym routine",
    "3 day gym routine",
    "workout plan for beginners",
    "beginner strength training",
    "full body workout plan",
    "how to start lifting"
  ]
}

export default function ThreeDayBeginnerWorkout() {
  return (
    <BlogPost frontmatter={frontmatter}>
      <p className="text-lg mb-6">
        You don&apos;t need a complicated program. You don&apos;t need to be in the gym six days a week.
        You need something simple that you&apos;ll actually stick to. This is that program.
      </p>

      <p className="mb-6">
        Three days a week. Full body each session. Basic movements that work. That&apos;s it.
        No fancy equipment, no confusing periodization schemes, no exercises that require a
        YouTube tutorial to understand.
      </p>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Why 3 Days Works</h2>

        <p className="mb-4">
          Here&apos;s the thing nobody tells you: more gym time doesn&apos;t mean better results,
          especially when you&apos;re starting out.
        </p>

        <p className="mb-4">
          Three days gives you enough stimulus to build muscle and get stronger. It also gives you
          four days to recover, which is when your body actually adapts. Most beginners who fail
          do so because they try to do too much too fast, burn out, and quit.
        </p>

        <p className="mb-6">
          A program you do consistently for six months beats a &quot;perfect&quot; program you abandon
          after three weeks.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">The Program</h2>

        <p className="mb-4">
          Do these workouts on non-consecutive days. Monday/Wednesday/Friday works well,
          or Tuesday/Thursday/Saturday. Whatever fits your life.
        </p>

        <h3 className="text-2xl font-semibold mt-6 mb-4">Day 1: Push Focus</h3>
        <BlogCode>
          {`Goblet Squat: 3 sets × 10 reps
Push-ups (or Incline Push-ups): 3 sets × 8-12 reps
Dumbbell Row: 3 sets × 10 reps each arm
Plank: 3 sets × 30 seconds

Rest 60-90 seconds between sets.`}
        </BlogCode>

        <h3 className="text-2xl font-semibold mt-6 mb-4">Day 2: Pull Focus</h3>
        <BlogCode>
          {`Romanian Deadlift (dumbbells): 3 sets × 10 reps
Lat Pulldown (or Assisted Pull-ups): 3 sets × 10 reps
Dumbbell Bench Press: 3 sets × 10 reps
Dead Bug: 3 sets × 10 reps each side

Rest 60-90 seconds between sets.`}
        </BlogCode>

        <h3 className="text-2xl font-semibold mt-6 mb-4">Day 3: Full Body</h3>
        <BlogCode>
          {`Leg Press (or Lunges): 3 sets × 10 reps
Overhead Press: 3 sets × 8-10 reps
Cable Row (or Dumbbell Row): 3 sets × 10 reps
Farmer Carries: 3 sets × 40 steps

Rest 60-90 seconds between sets.`}
        </BlogCode>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">How to Progress</h2>

        <p className="mb-4">
          The goal is simple: do a little more over time. This is called{' '}
          <Link href="/blog/ultimate-guide-progressive-overload">progressive overload</Link>,
          and it&apos;s the only thing that actually matters for results.
        </p>

        <p className="mb-4">Here&apos;s how to apply it:</p>

        <BlogList items={[
          "If you hit all your reps with good form, add 2.5-5 lbs next time",
          "If you can't complete all reps, stay at that weight until you can",
          "If you stall for 2+ weeks, drop the weight 10% and build back up"
        ]} />

        <p className="mt-4 mb-4">
          Don&apos;t overthink this. If you&apos;re squatting 50 lbs today and 55 lbs next month,
          you&apos;re making progress. That&apos;s all that matters.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">What to Expect</h2>

        <p className="mb-4">Let&apos;s be honest about timelines:</p>

        <h3 className="text-xl font-semibold mt-4 mb-2">Weeks 1-2</h3>
        <p className="mb-4">
          You&apos;ll feel awkward. Exercises won&apos;t feel natural. You might be sore. This is normal.
          Focus on learning the movements, not on how much weight you&apos;re lifting.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">Weeks 3-6</h3>
        <p className="mb-4">
          Things start clicking. You&apos;ll add weight consistently. The soreness decreases.
          You might notice you feel better overall—more energy, sleeping better.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">Weeks 6-12</h3>
        <p className="mb-4">
          Visible changes start appearing. Clothes fit differently. You&apos;re noticeably stronger.
          The gym feels less intimidating. This is where most people who stuck with it are glad they did.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Common Questions</h2>

        <h3 className="text-xl font-semibold mt-4 mb-2">&quot;Should I do cardio too?&quot;</h3>
        <p className="mb-4">
          If you want to. A 20-minute walk on off days is great for recovery and general health.
          Don&apos;t make it complicated—just move more.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">&quot;What if I miss a day?&quot;</h3>
        <p className="mb-4">
          Do the next workout when you can. Don&apos;t try to &quot;make up&quot; missed sessions by
          doubling up. Life happens. Consistency over perfection.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">&quot;How long should workouts take?&quot;</h3>
        <p className="mb-4">
          30-45 minutes, including warm-up. If you&apos;re spending 90 minutes, you&apos;re probably
          resting too long or doing too much.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">&quot;What about nutrition?&quot;</h3>
        <p className="mb-4">
          Eat enough protein (roughly 0.7g per pound of body weight) and don&apos;t starve yourself.
          You can optimize nutrition later. For now, just train consistently.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Get Started</h2>

        <p className="mb-4">
          You can print this out and bring it to the gym. Or you can{' '}
          <Link href="/hi">generate a personalized version</Link> that adapts to your specific
          goals, available equipment, and schedule.
        </p>

        <p className="mb-4">
          Either way, the best workout is the one you actually do. Start this week.
          Not Monday. Not &quot;when things calm down.&quot; This week.
        </p>

        <BlogQuote>
          <p>
            <strong>The hardest part is showing up the first time.</strong> After that,
            it gets easier. Three months from now, you&apos;ll be glad you started today.
          </p>
        </BlogQuote>
      </BlogSection>
    </BlogPost>
  )
}
