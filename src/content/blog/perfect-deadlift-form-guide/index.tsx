import Link from 'next/link'
import { BlogPost, BlogSection, BlogQuote, BlogCode } from '@/app/blog/components/BlogPost'
import { BlogPostFrontmatter } from '@/types/blog'

export const frontmatter: BlogPostFrontmatter = {
  title: "How to Deadlift: A No-BS Guide to Proper Form",
  date: "2025-02-04",
  excerpt: "The deadlift is simple—pick up a heavy thing. But 'simple' doesn't mean 'easy to do right.' Here's everything you need to nail your form.",
  metaDescription: "Learn how to deadlift with proper form. Clear cues for setup, the pull, and fixes for rounded back, bar drift, and other common problems.",
  published: true,
  featured: false,
  categories: [
    "Exercise Technique",
    "Strength Training",
    "Form Guide"
  ],
  tags: [
    "deadlift",
    "compound exercises",
    "strength training",
    "form guide",
    "back training"
  ],
  keywords: [
    "how to deadlift",
    "deadlift form",
    "deadlift technique",
    "deadlift for beginners",
    "proper deadlift form",
    "deadlift setup",
    "deadlift mistakes"
  ]
}

export default function PerfectDeadliftFormGuide() {
  return (
    <BlogPost frontmatter={frontmatter}>
      <p className="text-lg mb-6">
        The deadlift is the most honest lift in the gym. There&apos;s no momentum, no
        bounce, no help. The bar is on the floor, and you pick it up. Simple concept,
        but the execution matters more than most people realize.
      </p>

      <p className="mb-6">
        This guide covers the conventional deadlift—the standard, feet-under-hips version.
        It&apos;s where everyone should start. Master this, and sumo, trap bar, and other
        variations become much easier to learn.
      </p>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Step 1: The Setup</h2>

        <p className="mb-4">
          Most deadlift problems start with a bad setup. Get this right and the pull
          almost takes care of itself.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">Foot Position</h3>
        <p className="mb-4">
          Stand with feet about hip-width apart. Narrower than you think—this isn&apos;t
          a squat. The bar should be over your mid-foot (about an inch from your shins).
          Toes can point straight or slightly out, whatever feels natural.
        </p>

        <p className="mb-4">
          Here&apos;s the test: when you look straight down, the bar should cut your foot
          roughly in half. If it&apos;s over your toes, you&apos;re too close. If you can
          see your whole foot, step closer.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">The Grip</h3>
        <p className="mb-4">
          Bend over and grab the bar with straight arms, hands just outside your legs.
          Your shins will touch the bar when you&apos;re in position. If they don&apos;t,
          either the bar wasn&apos;t over mid-foot, or you&apos;re sitting too deep.
        </p>

        <p className="mb-4">
          Grip options: double overhand works until it doesn&apos;t (grip becomes the limiting
          factor around 225-315 for most people). Then you switch to mixed grip (one palm
          facing you) or hook grip (thumb under fingers—hurts but works).
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">Setting the Back</h3>
        <p className="mb-4">
          This is where people mess up. With your grip set, push your chest up while
          keeping your hips where they are. You&apos;re not squatting down—you&apos;re
          pushing your chest forward and up.
        </p>

        <p className="mb-4">
          Think about showing the logo on your shirt to someone in front of you. Your
          back should be flat, not rounded. Some slight upper back rounding is okay with
          heavy weight, but your lower back should never round.
        </p>

        <BlogCode>
          {`The setup sequence:
1. Walk to bar, mid-foot underneath
2. Bend and grip (don't move the bar)
3. Shins touch bar
4. Chest up, back flat
5. Arms straight, shoulders slightly ahead of bar`}
        </BlogCode>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Step 2: The Brace</h2>

        <p className="mb-4">
          Same bracing principle as the <Link href="/blog/squat-form-guide">squat</Link>:
          big breath into your belly, push your abs out, create 360-degree pressure around
          your midsection. This protects your spine and gives you a solid core to push against.
        </p>

        <p className="mb-4">
          Take the slack out of the bar before you pull. This means pulling up on the bar
          just enough that you feel tension but the plates don&apos;t leave the ground. You
          should hear the bar click against the plates. Now you&apos;re connected to the weight,
          not about to yank on it.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Step 3: The Pull</h2>

        <p className="mb-4">
          The cue that changed everything for me: push the floor away, don&apos;t pull the
          bar up. Think about driving your feet through the floor while your chest rises.
          This keeps your back angle constant off the floor.
        </p>

        <p className="mb-4">
          The bar should travel in a straight vertical line. This means it stays close to
          your body—dragging up your shins, brushing past your knees, sliding up your thighs.
          If it drifts forward, you&apos;re working harder for no reason.
        </p>

        <p className="mb-4">
          Once the bar passes your knees, drive your hips forward to lock out. Squeeze
          your glutes at the top. Stand tall—don&apos;t lean back. Over-arching at the
          top is just as bad as rounding at the bottom.
        </p>

        <BlogCode>
          {`The pull cues:
• "Push the floor away" (not "pull the bar up")
• "Chest and hips rise together"
• "Drag the bar up your legs"
• "Squeeze glutes to lock out"
• "Stand tall, don't lean back"`}
        </BlogCode>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Step 4: The Descent</h2>

        <p className="mb-4">
          Lower the bar by pushing your hips back first—like you&apos;re closing a car door
          with your butt. Once the bar passes your knees, bend them to set it down. Control
          the descent; don&apos;t just drop it (unless you&apos;re in a gym where that&apos;s okay
          and you&apos;re going heavy).
        </p>

        <p className="mb-4">
          For multiple reps, touch-and-go is fine—just don&apos;t bounce the bar. Reset your
          brace at the bottom of each rep if needed. Some people prefer dead-stop reps
          (fully resetting between each rep), which is harder but builds more strength.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Common Problems and Fixes</h2>

        <h3 className="text-xl font-semibold mt-4 mb-2">Rounded Lower Back</h3>
        <p className="mb-4">
          This is the big one—the injury risk that scares people away from deadlifts.
          Your lower back rounding usually means: the weight is too heavy, your setup
          is wrong, or you&apos;re not bracing properly.
        </p>
        <p className="mb-4">
          <strong>Fix:</strong> Drop the weight and nail your setup. Think &quot;chest up&quot;
          before every rep. Film yourself from the side—you might not feel your back rounding.
          If it&apos;s a flexibility issue, work on hip mobility separately.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">Bar Drifting Forward</h3>
        <p className="mb-4">
          The bar swings away from your body during the pull, usually because you&apos;re
          thinking &quot;up&quot; instead of &quot;back.&quot; This puts more stress on your
          lower back and makes the lift harder.
        </p>
        <p className="mb-4">
          <strong>Fix:</strong> Engage your lats before you pull. Think about bending the
          bar around your legs or &quot;protecting your armpits.&quot; The bar should feel
          like it&apos;s scraping up your shins (long socks or deadlift socks help).
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">Hips Shooting Up First</h3>
        <p className="mb-4">
          Your butt rises before your chest, turning the deadlift into a stiff-leg pull
          with a rounded back. Usually means your starting position has your hips too low
          (you&apos;re trying to squat the deadlift).
        </p>
        <p className="mb-4">
          <strong>Fix:</strong> Start with your hips higher. In a proper deadlift setup,
          your hips are above your knees but below your shoulders. Think about your chest
          and hips rising at the same rate.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">Jerking the Weight</h3>
        <p className="mb-4">
          Yanking on the bar instead of building tension. This snaps you out of position
          and usually means a rounded back and a failed lift.
        </p>
        <p className="mb-4">
          <strong>Fix:</strong> Take the slack out of the bar before you pull. Build
          tension gradually—it should feel like the bar is about to leave the ground for
          a full second before it actually does.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">Hyperextending at Lockout</h3>
        <p className="mb-4">
          Leaning way back at the top, usually with the bar in front of you. This crunches
          your lower back and doesn&apos;t prove anything.
        </p>
        <p className="mb-4">
          <strong>Fix:</strong> The lockout is just standing tall with your glutes squeezed.
          If you need to lean back to finish the lift, the bar drifted forward—fix that instead.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Conventional vs. Sumo</h2>

        <p className="mb-4">
          Sumo deadlift (wide stance, hands inside knees) isn&apos;t cheating—it&apos;s just
          a different lift. Which one is better depends entirely on your body structure:
          torso length, leg length, hip anatomy.
        </p>

        <p className="mb-4">
          Start with conventional. It teaches the hip hinge pattern that carries over to
          everything else. After 6-12 months, try sumo if you&apos;re curious. Some people
          find it clicks immediately; others hate it. Neither is wrong.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Programming Tips</h2>

        <p className="mb-4">
          <strong>Frequency:</strong> Once or twice a week is plenty. Deadlifts are taxing
          on your nervous system. More isn&apos;t always better.
        </p>

        <p className="mb-4">
          <strong>Reps:</strong> 1-5 reps for strength, 6-8 for building muscle. High-rep
          deadlifts (10+) aren&apos;t dangerous, but form tends to break down when you&apos;re
          tired—lower reps are usually smarter.
        </p>

        <p className="mb-4">
          <strong>Warm-up:</strong> Don&apos;t skip it. Empty bar, then 40%, 60%, 80% of your
          working weight. Each set should feel crisp before adding more weight.
        </p>

        <p className="mb-4">
          <strong>When to stop:</strong> When your form breaks down. A rep with a rounded
          back isn&apos;t worth it. Leave one or two reps in the tank most sessions.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">The Simple Summary</h2>

        <BlogCode>
          {`Setup:
- Bar over mid-foot, grip just outside legs
- Shins touch bar, chest up, back flat
- Take slack out, brace hard

The Pull:
- Push floor away (don't yank)
- Keep bar close to body
- Chest and hips rise together
- Squeeze glutes to lock out, stand tall

Common fixes:
- Rounded back → lighter weight, chest up
- Bar drifting → engage lats, "protect armpits"
- Hips shooting up → start with hips higher
- Jerking → take slack out first`}
        </BlogCode>

        <p className="mt-6">
          The deadlift rewards patience. Don&apos;t rush the setup. Don&apos;t chase weight
          at the expense of form. Film yourself regularly—what feels right doesn&apos;t always
          look right.
        </p>

        <p className="mt-4">
          <Link href="/hi">Get a program</Link> with deadlifts programmed intelligently for
          your level, or check out our <Link href="/blog/squat-form-guide">squat form guide</Link>{' '}
          for the other essential compound movement.
        </p>
      </BlogSection>
    </BlogPost>
  )
}
