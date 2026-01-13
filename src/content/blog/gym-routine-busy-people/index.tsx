import Link from 'next/link'
import { BlogPost, BlogSection, BlogQuote, BlogList, BlogCode } from '@/app/blog/components/BlogPost'
import { BlogPostFrontmatter } from '@/types/blog'

export const frontmatter: BlogPostFrontmatter = {
  title: "The Only Gym Routine Busy People Need: 30 Minutes, 3x Per Week",
  date: "2026-01-12",
  excerpt: "You don't have two hours. You don't have six days a week. Here's a time-efficient routine that actually works for people with demanding lives.",
  metaDescription: "A minimalist workout routine for busy professionals. Get results in 30 minutes, 3 days per week with this efficient, no-fluff gym program.",
  published: true,
  featured: true,
  categories: [
    "Workout Plans",
    "Time-Efficient",
    "Strength Training"
  ],
  tags: [
    "busy schedule",
    "quick workout",
    "efficient workout",
    "30 minute workout",
    "time efficient",
    "minimalist fitness"
  ],
  keywords: [
    "workout for busy people",
    "30 minute workout routine",
    "gym routine for busy schedule",
    "quick workout plan",
    "efficient workout routine",
    "workout for busy professionals",
    "short gym routine",
    "minimal time workout"
  ]
}

export default function BusyPeopleWorkout() {
  return (
    <BlogPost frontmatter={frontmatter}>
      <p className="text-lg mb-6">
        You have 90 minutes a week. Total. That&apos;s what we&apos;re working with.
      </p>

      <p className="mb-6">
        No &quot;optimal&quot; 6-day PPL split. No two-hour gym sessions. No fitness influencer
        routines designed by people whose job is working out. This is a program for people
        who have careers, families, commutes, and about a thousand things competing for their time.
      </p>

      <p className="mb-6">
        The good news: 90 minutes a week, done right, is enough to build muscle, get stronger,
        and look noticeably better. The research backs this up. You just can&apos;t waste any of it.
      </p>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">The Principles</h2>

        <p className="mb-4">
          When time is limited, every exercise needs to earn its place. These rules filter out
          the fluff:
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">1. Compound Movements Only</h3>
        <p className="mb-4">
          No bicep curls. No calf raises. No cable crossovers. Every exercise should hit
          multiple muscle groups simultaneously. Squats, deadlifts, presses, rows, pull-ups—
          these are your vocabulary.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">2. Minimal Rest</h3>
        <p className="mb-4">
          60-90 seconds between sets, max. You&apos;re not powerlifting. You&apos;re trying to get
          in and out. Shorter rest also keeps your heart rate up, so you get some cardio benefit
          built in.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">3. No Warm-Up Fluff</h3>
        <p className="mb-4">
          Skip the 15-minute treadmill walk. Your warm-up is your first set with lighter weight.
          Do the movement you&apos;re about to do, just easier.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">The Program</h2>

        <p className="mb-4">
          Three days. Never on consecutive days. Each workout hits everything.
        </p>

        <h3 className="text-2xl font-semibold mt-6 mb-4">Workout A</h3>
        <BlogCode>
          {`Barbell Squat: 3 × 6-8
Bench Press: 3 × 6-8
Barbell Row: 3 × 8-10
Plank: 2 × 45 seconds

Time: ~25 minutes`}
        </BlogCode>

        <h3 className="text-2xl font-semibold mt-6 mb-4">Workout B</h3>
        <BlogCode>
          {`Romanian Deadlift: 3 × 8-10
Overhead Press: 3 × 6-8
Pull-ups (or Lat Pulldown): 3 × 8-10
Farmer Carries: 2 × 40 steps

Time: ~25 minutes`}
        </BlogCode>

        <h3 className="text-2xl font-semibold mt-6 mb-4">Workout C</h3>
        <BlogCode>
          {`Leg Press: 3 × 10-12
Dumbbell Incline Press: 3 × 8-10
Cable Row: 3 × 10-12
Dead Bug: 2 × 12 each side

Time: ~25 minutes`}
        </BlogCode>

        <p className="mt-4 mb-4">
          Alternate A-B-C-A-B-C week to week. That&apos;s it.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Making It Work</h2>

        <h3 className="text-xl font-semibold mt-4 mb-2">Prep Your Gym Bag the Night Before</h3>
        <p className="mb-4">
          The number one killer of gym consistency isn&apos;t motivation—it&apos;s friction.
          Remove every barrier. Bag packed, clothes ready, gym route planned.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">Go at Off-Peak Times</h3>
        <p className="mb-4">
          Waiting for equipment destroys efficiency. Early morning (5-6am) or mid-afternoon
          (2-4pm) are usually dead. If you can only go at 6pm, accept that some flexibility
          with exercise substitutions will be needed.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">Have Backup Exercises</h3>
        <p className="mb-4">
          Squat rack taken? Do leg press. Bench occupied? Do dumbbell press. Don&apos;t wait around.
          Any pushing exercise can substitute for another pushing exercise in a pinch.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">Track Your Workouts</h3>
        <p className="mb-4">
          You can&apos;t afford to waste time figuring out what weight you used last time.
          Log everything. Phone notes work. A proper{' '}
          <Link href="/hi">workout tracking app</Link> works better.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Realistic Expectations</h2>

        <p className="mb-4">
          With 90 minutes a week, you can:
        </p>

        <BlogList items={[
          "Build noticeable muscle (slower than gym rats, but it happens)",
          "Get significantly stronger",
          "Improve energy levels and sleep",
          "Look better in clothes",
          "Maintain results long-term because the routine is sustainable"
        ]} />

        <p className="mt-4 mb-4">
          You probably won&apos;t:
        </p>

        <BlogList items={[
          "Win bodybuilding competitions",
          "Hit elite strength numbers",
          "Transform in 30 days (ignore anyone who promises this)"
        ]} />

        <p className="mt-4 mb-4">
          But here&apos;s the thing: a sustainable routine you do for years beats an
          &quot;optimal&quot; routine you abandon after six weeks. Consistency compounds.
          Two years of 90 minutes a week adds up to real, visible change.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">If You Can Find 15 More Minutes</h2>

        <p className="mb-4">
          Add one thing:
        </p>

        <BlogList items={[
          "A 10-minute walk after each workout (recovery, mental clarity)",
          "One isolation exercise for a lagging body part",
          "Stretching/mobility work if you're stiff"
        ]} />

        <p className="mt-4 mb-4">
          But these are bonuses, not requirements. The core program works without them.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Start This Week</h2>

        <p className="mb-4">
          Not when things calm down. Not in January. Not when you have more time.
          You will never have more time.
        </p>

        <p className="mb-4">
          Find three 30-minute slots this week. Put them in your calendar like meetings.
          Show up. Do the workout. Leave.
        </p>

        <p className="mb-6">
          <Link href="/hi">Build a personalized version</Link> that fits your specific
          equipment and schedule, or just use this one. Either way, 90 minutes from now,
          you&apos;ll have started.
        </p>

        <BlogQuote>
          <p>
            <strong>You don&apos;t have time for a two-hour workout. You do have time for this.</strong>
          </p>
        </BlogQuote>
      </BlogSection>
    </BlogPost>
  )
}
