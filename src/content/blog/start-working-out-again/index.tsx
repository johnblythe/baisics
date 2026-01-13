import Link from 'next/link'
import { BlogPost, BlogSection, BlogQuote, BlogList, BlogCode } from '@/app/blog/components/BlogPost'
import { BlogPostFrontmatter } from '@/types/blog'

export const frontmatter: BlogPostFrontmatter = {
  title: "How to Start Working Out Again After Years Off",
  date: "2026-01-12",
  excerpt: "Coming back to fitness after a long break is intimidating. Here's how to restart without injuring yourself, burning out, or quitting after two weeks.",
  metaDescription: "A practical guide to returning to exercise after months or years away. Learn how to rebuild fitness safely, manage expectations, and create a sustainable routine.",
  published: true,
  featured: true,
  categories: [
    "Beginner",
    "Motivation",
    "Getting Started"
  ],
  tags: [
    "comeback",
    "returning to fitness",
    "starting over",
    "beginner workout",
    "fitness restart",
    "getting back in shape"
  ],
  keywords: [
    "how to start working out again",
    "getting back into fitness",
    "return to exercise after years",
    "start exercising again",
    "workout after long break",
    "restart fitness journey",
    "getting back in shape",
    "out of shape where to start"
  ]
}

export default function StartWorkingOutAgain() {
  return (
    <BlogPost frontmatter={frontmatter}>
      <p className="text-lg mb-6">
        Maybe it&apos;s been two years. Maybe ten. Maybe you used to be in great shape and life
        happened—kids, career, injury, whatever. Now you&apos;re staring at the gym
        (or your running shoes, or that yoga mat collecting dust) and the gap between where
        you are and where you were feels enormous.
      </p>

      <p className="mb-6">
        Here&apos;s the good news: your body remembers. Here&apos;s the reality: you can&apos;t pick up
        where you left off. This guide is about bridging that gap without hurting yourself or
        burning out in the first month.
      </p>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">First, Let Go of Your Old Self</h2>

        <p className="mb-4">
          This is the hardest part. If you used to bench 225 or run a 7-minute mile, that person
          is gone for now. Trying to be them immediately is how people get injured or discouraged.
        </p>

        <p className="mb-4">
          You&apos;re not starting over—you have muscle memory, you know how to move, you understand
          the basics. But your tendons, ligaments, and cardiovascular system need time to catch up.
          They didn&apos;t maintain fitness while you were away.
        </p>

        <BlogQuote>
          <p>
            Your brain remembers being strong. Your body needs to rebuild. The disconnect
            between these two is where injuries happen.
          </p>
        </BlogQuote>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">The Comeback Timeline</h2>

        <p className="mb-4">
          Here&apos;s roughly what to expect, assuming you&apos;ve been sedentary for 1+ years:
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">Weeks 1-4: The Humbling Phase</h3>
        <p className="mb-4">
          Everything is harder than you remember. You&apos;ll get winded faster. Weights that used
          to be warm-ups will feel heavy. You&apos;ll be sore in places you forgot existed.
        </p>
        <p className="mb-4">
          This is normal. Don&apos;t panic. Don&apos;t try to push through it by doing more.
          Your job right now is showing up and moving, not setting PRs.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">Weeks 4-8: The Adaptation Phase</h3>
        <p className="mb-4">
          Your body starts remembering. Soreness decreases dramatically. You&apos;ll feel energy
          coming back. Sleep often improves. The movements start feeling natural again.
        </p>
        <p className="mb-4">
          This is where it gets fun. Progress comes faster than it will ever come again—
          enjoy this phase.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">Weeks 8-16: The Rebuilding Phase</h3>
        <p className="mb-4">
          Now you can start pushing. Your connective tissues have caught up enough to handle
          real training. You can add weight more aggressively, increase volume, and start
          chasing some of that old strength back.
        </p>
        <p className="mb-6">
          Most people regain 70-80% of their previous fitness within 3-4 months of consistent
          training. That&apos;s the muscle memory kicking in.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Your Starter Program</h2>

        <p className="mb-4">
          Don&apos;t follow your old program. Start here instead:
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">Week 1-2: Movement Only</h3>
        <BlogCode>
          {`3 days per week, 20-30 minutes each:

Day 1:
- 10 minute walk/light cardio
- Bodyweight squats: 2 sets × 10
- Push-ups (modified if needed): 2 sets × 8
- Plank: 2 × 20 seconds

Day 2:
- 10 minute walk/light cardio
- Glute bridges: 2 sets × 12
- Dumbbell rows (light): 2 sets × 10
- Dead bug: 2 sets × 8 each side

Day 3:
- 10 minute walk/light cardio
- Lunges: 2 sets × 8 each leg
- Shoulder press (light): 2 sets × 10
- Bird dogs: 2 sets × 8 each side

Focus: Learn the movements again. Don't chase fatigue.`}
        </BlogCode>

        <h3 className="text-xl font-semibold mt-6 mb-2">Week 3-4: Add Light Resistance</h3>
        <BlogCode>
          {`Same exercises, but:
- Add a third set to everything
- Increase weights slightly (you should have 3-4 reps "in the tank")
- Extend cardio to 15 minutes
- Add one exercise per day if feeling good

Still not going to failure. Still prioritizing form.`}
        </BlogCode>

        <h3 className="text-xl font-semibold mt-6 mb-2">Week 5+: Transition to Real Training</h3>
        <p className="mb-4">
          Now you can move to a proper program like our{' '}
          <Link href="/blog/3-day-workout-plan-beginners">3-day beginner routine</Link>.
          Your body is ready to handle progressive overload again.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Warning Signs to Watch For</h2>

        <p className="mb-4">
          Stop and reassess if you experience:
        </p>

        <BlogList items={[
          "Joint pain (not muscle soreness—actual joint discomfort)",
          "Pain that gets worse during exercise rather than better",
          "Extreme fatigue that doesn't improve with rest days",
          "Persistent soreness lasting more than 4-5 days",
          "Feeling worse overall rather than better after 2+ weeks"
        ]} />

        <p className="mt-4 mb-4">
          These usually mean you&apos;re progressing too fast. The solution is almost always:
          back off, do less, and let your body catch up.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">The Mental Game</h2>

        <p className="mb-4">
          Coming back is as much psychological as physical. A few mindset shifts that help:
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">Compare Forward, Not Backward</h3>
        <p className="mb-4">
          Instead of &quot;I used to squat 200 lbs,&quot; think &quot;last week I squatted 95, this week 100.&quot;
          Progress from your current baseline is the only metric that matters.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">Redefine Success (For Now)</h3>
        <p className="mb-4">
          For the first month, success = showing up. That&apos;s it. Not how much you lifted,
          not how far you ran, not how you looked in the mirror. Just: did you do the workout?
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">Expect Bad Days</h3>
        <p className="mb-4">
          Some days you&apos;ll feel great. Some days everything will feel heavy and slow.
          This is normal, especially in the first few months. Bad workouts count too.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">One More Thing</h2>

        <p className="mb-4">
          You&apos;re not &quot;getting back in shape.&quot; You&apos;re building a new version of yourself.
          Maybe this time with different goals, different priorities, different knowledge about
          what works for your body and your life.
        </p>

        <p className="mb-4">
          That&apos;s not a setback. That&apos;s an opportunity.
        </p>

        <p className="mb-6">
          <Link href="/hi">Get a program built for where you are now</Link>—not where you were.
          Or just start moving. Either way, future you will thank present you for beginning.
        </p>

        <BlogQuote>
          <p>
            <strong>The best time to start was years ago. The second best time is today.</strong>
          </p>
        </BlogQuote>
      </BlogSection>
    </BlogPost>
  )
}
