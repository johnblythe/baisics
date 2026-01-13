import Link from 'next/link'
import { BlogPost, BlogSection, BlogQuote, BlogCode } from '@/app/blog/components/BlogPost'
import { BlogPostFrontmatter } from '@/types/blog'

export const frontmatter: BlogPostFrontmatter = {
  title: "How to Squat: A No-BS Guide to Proper Form",
  date: "2025-02-04",
  excerpt: "The squat looks simple until you try to do it right. Here's everything you need to know about form, common mistakes, and how to fix them.",
  metaDescription: "Learn how to squat with proper form. Clear cues for setup, descent, and common fixes for knee cave, butt wink, and other issues.",
  published: true,
  featured: false,
  categories: [
    "Exercise Technique",
    "Strength Training",
    "Form Guide"
  ],
  tags: [
    "squat",
    "compound exercises",
    "strength training",
    "form guide",
    "leg training"
  ],
  keywords: [
    "how to squat",
    "squat form",
    "squat technique",
    "squat for beginners",
    "proper squat form",
    "squat depth",
    "squat mistakes"
  ]
}

export default function SquatFormGuide() {
  return (
    <BlogPost frontmatter={frontmatter}>
      <p className="text-lg mb-6">
        The squat is straightforward in concept: bend your knees, lower your body, stand
        back up. In practice, it&apos;s one of the most technical lifts you&apos;ll do. Small
        setup mistakes turn into big problems under heavy weight.
      </p>

      <p className="mb-6">
        This guide covers the back squat—the barbell-on-back version that builds the most
        strength. Master this, and every other squat variation becomes easier.
      </p>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Step 1: The Setup</h2>

        <h3 className="text-xl font-semibold mt-4 mb-2">Bar Position</h3>
        <p className="mb-4">
          You have two options: high bar or low bar. High bar sits on your traps
          (the muscle shelf at the base of your neck). Low bar sits lower, across your
          rear delts (a few inches down from high bar).
        </p>

        <p className="mb-4">
          High bar is more quad-dominant and more upright. Low bar lets you lift more
          weight and is more hip/posterior chain dominant. Most beginners should start
          with high bar—it&apos;s more intuitive. Try low bar later if you want.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">Hand Position</h3>
        <p className="mb-4">
          Grip the bar as narrow as your shoulder mobility allows. Narrower = tighter
          upper back = more stable shelf for the bar. But don&apos;t force a narrow grip
          if it hurts your shoulders—widen until comfortable.
        </p>

        <p className="mb-4">
          Pull the bar into your back rather than just resting it there. Your upper back
          should be actively tight before you even unrack.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">Foot Position</h3>
        <p className="mb-4">
          Stand with feet somewhere between hip width and shoulder width. Toes pointed
          out 15-30 degrees. There&apos;s no single &quot;correct&quot; stance—it depends on your
          hip anatomy.
        </p>

        <BlogCode>
          {`How to find your stance:
1. Stand with feet in various widths
2. Drop into a deep squat (bodyweight)
3. The position where you feel most stable
   and can hit depth = your squat stance`}
        </BlogCode>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Step 2: The Brace</h2>

        <p className="mb-4">
          Before you descend, you need to brace your core. This isn&apos;t sucking in your
          stomach—it&apos;s the opposite. Take a big breath into your belly (not your chest),
          then push your abs out against your belt line as if bracing for a punch.
        </p>

        <p className="mb-4">
          This creates intra-abdominal pressure that stabilizes your spine. Hold this
          brace through the entire rep. Breathe out at the top, re-brace, do the next rep.
        </p>

        <BlogCode>
          {`The bracing cue sequence:
1. Big belly breath (diaphragm, not chest)
2. Push abs OUT, not in
3. Create 360-degree tension around your midsection
4. Hold through the entire rep
5. Breathe out at the top, repeat`}
        </BlogCode>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Step 3: The Descent</h2>

        <p className="mb-4">
          Think about sitting back AND down, not just down. Your hips should break first,
          moving back slightly, then your knees bend to lower you.
        </p>

        <p className="mb-4">
          Control the descent. Don&apos;t just drop. A 2-3 second lowering phase is fine.
          The controlled eccentric builds strength and keeps you in the right positions.
        </p>

        <p className="mb-4">
          Your knees should track over your toes throughout. If your knees cave in,
          that&apos;s a problem we&apos;ll address below.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Step 4: The Bottom</h2>

        <p className="mb-4">
          How deep should you go? The standard answer is &quot;hip crease below knee&quot;
          (parallel or slightly below). This is where you get the most muscle activation
          and the best carryover to other movements.
        </p>

        <p className="mb-4">
          Can you go lower? Yes, but it depends on mobility. If going deeper causes
          your lower back to round (butt wink), stop at the point where your back stays flat.
          Work on mobility separately.
        </p>

        <p className="mb-4">
          Don&apos;t bounce at the bottom. Control the transition from down to up—this
          is the most injury-prone moment if you&apos;re loose.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Step 5: The Drive Up</h2>

        <p className="mb-4">
          Push through your entire foot—not just your heels, not just your toes. Many
          people overcorrect into their heels and lose balance. Think &quot;spread the floor
          apart&quot; with your feet as you drive up.
        </p>

        <p className="mb-4">
          Your chest and hips should rise at the same rate. If your hips shoot up first
          while your chest stays down, you&apos;re turning it into a good morning. Keep
          your chest up and drive your back into the bar.
        </p>

        <p className="mb-4">
          Lock out at the top by squeezing your glutes. Don&apos;t hyperextend your lower
          back—just stand tall.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Common Problems and Fixes</h2>

        <h3 className="text-xl font-semibold mt-4 mb-2">Knee Cave</h3>
        <p className="mb-4">
          Knees collapsing inward, especially on the way up. This is usually weakness
          in the glutes/hip abductors, not a form problem per se.
        </p>
        <p className="mb-4">
          <strong>Fix:</strong> Consciously push your knees out during the lift. Think
          &quot;spread the floor.&quot; Add banded squats or hip abductor work. With lighter
          weights, exaggerate pushing knees out until the pattern is automatic.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">Butt Wink</h3>
        <p className="mb-4">
          Lower back rounding at the bottom of the squat. Usually means you went deeper
          than your mobility allows.
        </p>
        <p className="mb-4">
          <strong>Fix:</strong> Only squat as deep as you can with a flat back. Work
          on hip and ankle mobility separately. Elevating your heels slightly (squat
          shoes or small plates under heels) can also help.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">Heels Rising</h3>
        <p className="mb-4">
          Coming up onto your toes during the squat. This shifts stress forward and
          makes you less stable. Usually an ankle mobility issue.
        </p>
        <p className="mb-4">
          <strong>Fix:</strong> Squat shoes with an elevated heel, or put small plates
          under your heels temporarily. Work on calf stretching and ankle dorsiflexion.
          Widen your stance slightly.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">Forward Lean (Good Morning Squat)</h3>
        <p className="mb-4">
          Torso pitching too far forward, turning the squat into a hip hinge. Often
          happens when the weight gets heavy and you&apos;re not used to it.
        </p>
        <p className="mb-4">
          <strong>Fix:</strong> Drop the weight and focus on keeping your chest up.
          Front squats as an accessory will help—they force you to stay upright. Also
          strengthen your upper back so it can support the load.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Programming Tips</h2>

        <p className="mb-4">
          <strong>Frequency:</strong> 2-3 times per week is the sweet spot for most people.
          Enough practice to improve technique, enough recovery to actually get stronger.
        </p>

        <p className="mb-4">
          <strong>Reps:</strong> 3-5 reps for strength, 6-12 for muscle building. Beginners
          benefit from higher reps (8-10) initially because you get more practice with
          the movement per set.
        </p>

        <p className="mb-4">
          <strong>Warm-up:</strong> Empty bar for 10-15 reps, then progressively heavier
          sets until you reach your working weight. Don&apos;t skip warm-ups—they prep your
          joints and groove the movement pattern.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">The Simple Summary</h2>

        <BlogCode>
          {`Setup:
- Bar on upper back, tight grip, feet shoulder width, toes out

Before each rep:
- Big belly breath, brace hard

Descent:
- Hips back and down, control the speed
- Knees track over toes
- Stop at parallel or slightly below

Ascent:
- Drive through whole foot
- Chest and hips rise together
- Squeeze glutes at top

Common fixes:
- Knee cave → "spread the floor"
- Butt wink → don't squat so deep (yet)
- Heels rising → elevate heels, stretch ankles
- Forward lean → keep chest up, lighten weight`}
        </BlogCode>

        <p className="mt-6">
          The squat takes time to master. Film yourself, compare to good technique,
          and adjust. Small form improvements make big differences over time.
        </p>

        <p className="mt-4">
          <Link href="/hi">Get a program</Link> with squats programmed properly for your
          level, or check out our <Link href="/blog/perfect-deadlift-form-guide">deadlift
          form guide</Link> for the other essential compound movement.
        </p>
      </BlogSection>
    </BlogPost>
  )
}
