import Link from 'next/link'
import { BlogPost, BlogSection, BlogQuote, BlogList, BlogCode } from '@/app/blog/components/BlogPost'
import { BlogPostFrontmatter } from '@/types/blog'

export const frontmatter: BlogPostFrontmatter = {
  title: "Bodyweight Exercise Progressions: From Zero to Impressive",
  date: "2024-03-14",
  excerpt: "Can't do a pull-up? No problem. Here's how to progress from wherever you are to bodyweight movements that'll actually impress people.",
  metaDescription: "Step-by-step bodyweight exercise progressions for push-ups, pull-ups, squats, and core. Start from beginner and build toward advanced calisthenics skills.",
  published: true,
  featured: false,
  categories: [
    "Exercise Technique",
    "Strength Training",
    "Bodyweight Training"
  ],
  tags: [
    "bodyweight exercises",
    "calisthenics",
    "exercise progression",
    "strength training",
    "home workout",
    "progressive overload"
  ],
  keywords: [
    "bodyweight progression",
    "calisthenics progression",
    "how to do a pull-up",
    "push-up progression",
    "bodyweight strength",
    "no equipment workout",
    "home workout progression"
  ]
}

export default function BodyweightProgressions() {
  return (
    <BlogPost frontmatter={frontmatter}>
      <p className="text-lg mb-6">
        Most people think bodyweight training is either too easy (&quot;just do push-ups&quot;)
        or impossible (&quot;I can&apos;t do a single pull-up&quot;). Both are wrong. Bodyweight
        training has a progression for every level—the trick is knowing which rung
        of the ladder you&apos;re on.
      </p>

      <p className="mb-6">
        This guide shows you how to progress from &quot;can&apos;t do one&quot; to &quot;can do many&quot;
        for every major bodyweight movement. No equipment required for most of it.
      </p>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">How Progression Works</h2>

        <p className="mb-4">
          In the weight room, you add more weight. With bodyweight, you change the
          <em> leverage</em>. A wall push-up is the same movement as a regular push-up,
          just with physics making it easier.
        </p>

        <p className="mb-4">
          The progression principle: master one level, then move to the next. Don&apos;t
          skip ahead because you&apos;re bored. Each level builds the strength and technique
          you need for the next one.
        </p>

        <BlogCode>
          {`When to progress to the next level:
• You can do 3 sets of the target reps
• Form stays clean throughout all sets
• You're not grinding/struggling at the end
• You've been at this level for 1-2 weeks minimum`}
        </BlogCode>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Push-Up Progression</h2>

        <p className="mb-4">
          If you can&apos;t do a push-up, start at Level 1. If you can do 5+ perfect
          push-ups, start at Level 4. Find your level and work up from there.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">Level 1: Wall Push-Ups</h3>
        <p className="mb-4">
          Stand arm&apos;s length from a wall, hands at shoulder height. Push yourself away
          from the wall, then lower back. The closer your feet are to the wall, the easier
          it is. Goal: 3×20 clean reps.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">Level 2: Incline Push-Ups</h3>
        <p className="mb-4">
          Hands on a table, countertop, or sturdy chair. The lower the surface, the harder
          it is. Keep your body in a straight line—no sagging hips or piked butts. Goal: 3×15.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">Level 3: Knee Push-Ups</h3>
        <p className="mb-4">
          The bridge to full push-ups. Knees on ground, straight line from knees to head.
          Full range of motion—chest touches floor. Goal: 3×12.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">Level 4: Full Push-Ups</h3>
        <p className="mb-4">
          You made it. Straight body, chest to floor, elbows at roughly 45 degrees (not flared
          out to 90). Control the descent—don&apos;t just drop. Goal: 3×10.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">Level 5+: Advanced</h3>
        <p className="mb-4">
          Once you own full push-ups, the world opens up: diamond push-ups (triceps emphasis),
          archer push-ups (toward one-arm), decline push-ups (more chest), pseudo-planche
          push-ups (shoulder strength). Pick a direction that interests you.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Pull-Up Progression</h2>

        <p className="mb-4">
          Pull-ups are hard. Most people can&apos;t do one when they start. That&apos;s fine.
          This progression works—it just takes patience.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">Level 1: Dead Hangs</h3>
        <p className="mb-4">
          Just hang from the bar. Sounds easy, but most people can&apos;t hold for 30 seconds
          at first. Build grip strength and get your shoulders used to supporting your weight.
          Goal: 3×30 seconds.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">Level 2: Active Hangs</h3>
        <p className="mb-4">
          Hang from the bar, then pull your shoulders down (away from your ears) without
          bending your arms. This engages your lats—the muscles that actually do pull-ups.
          Goal: 3×15 seconds with shoulders depressed.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">Level 3: Negative Pull-Ups</h3>
        <p className="mb-4">
          Jump or step up to the top position (chin over bar), then lower yourself as slowly
          as possible. Fight gravity all the way down. A good negative takes 5+ seconds.
          Goal: 3×5 slow negatives.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">Level 4: Band-Assisted Pull-Ups</h3>
        <p className="mb-4">
          Loop a resistance band over the bar and put your foot or knee in it. The band
          helps most at the bottom (where you&apos;re weakest). Use progressively thinner bands
          until you don&apos;t need one. Goal: 3×8 with light band.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">Level 5: Full Pull-Ups</h3>
        <p className="mb-4">
          Dead hang start, pull until your chin clears the bar, lower with control. No kipping,
          no swinging. One clean rep is a milestone—celebrate it. Goal: 3×5.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">Level 6+: Advanced</h3>
        <p className="mb-4">
          Wide-grip, L-sit pull-ups, weighted pull-ups, archer pull-ups, one-arm progressions,
          muscle-ups. Each is a journey of its own.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Squat Progression</h2>

        <p className="mb-4">
          Bodyweight squats seem simple until you try to do them well. Deep, controlled,
          no knee cave, no forward lean. That takes practice.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">Level 1: Assisted Squats</h3>
        <p className="mb-4">
          Hold onto something for balance—a doorframe, a chair, a TRX strap. Use as little
          help as possible; it&apos;s there for balance, not to pull yourself up. Go as deep
          as you can with good form. Goal: 3×15.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">Level 2: Box Squats</h3>
        <p className="mb-4">
          Squat down to a chair or box, touch it lightly, stand back up. Don&apos;t plop down
          and rest—maintain tension. This teaches depth and builds confidence. Goal: 3×12.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">Level 3: Bodyweight Squats</h3>
        <p className="mb-4">
          Full depth (hip crease below knee), controlled down and up, knees tracking over
          toes. If your heels come up, you need ankle mobility work. Goal: 3×20.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">Level 4: Split Squats / Lunges</h3>
        <p className="mb-4">
          Single-leg work. Split squats are stationary; lunges involve stepping. Both build
          the strength and balance needed for pistol squats. Goal: 3×12 each leg.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">Level 5: Bulgarian Split Squats</h3>
        <p className="mb-4">
          Rear foot elevated on a bench or chair. This absolutely humbles people. Keep
          your torso upright, front knee stable. Goal: 3×10 each leg.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">Level 6: Pistol Squat Progression</h3>
        <p className="mb-4">
          The holy grail of bodyweight leg strength. Start with assisted pistols (holding
          something), then box pistols (sitting to a surface), then full pistols. Takes months.
          Worth it.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Core Progression</h2>

        <p className="mb-4">
          Forget sit-ups and crunches. These progressions build the kind of core strength
          that actually transfers to other movements.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">Level 1: Dead Bugs</h3>
        <p className="mb-4">
          On your back, arms up, knees bent 90°. Extend opposite arm and leg while keeping
          your lower back pressed to the floor. If your back arches, you&apos;ve gone too far.
          Goal: 3×10 each side.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">Level 2: Plank</h3>
        <p className="mb-4">
          On forearms, straight line from head to heels. Squeeze everything—glutes, core,
          quads. If you&apos;re shaking after 20 seconds, you&apos;re doing it right. Goal: 3×45 seconds.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">Level 3: Hollow Body Hold</h3>
        <p className="mb-4">
          On your back, lower back pressed down, legs straight and off the ground, arms
          overhead. The lower your legs, the harder it is. This is the core position for
          almost all gymnastics movements. Goal: 3×30 seconds.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">Level 4: Hanging Knee Raises</h3>
        <p className="mb-4">
          Hang from a bar and raise your knees to your chest without swinging. Control
          the way down. Harder than it looks. Goal: 3×12.
        </p>

        <h3 className="text-xl font-semibold mt-4 mb-2">Level 5+: Advanced</h3>
        <p className="mb-4">
          L-sit (on floor or bars), hanging leg raises (straight legs), toes-to-bar,
          dragon flags, front lever progressions. These take years to master.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Putting It Together</h2>

        <p className="mb-4">
          A simple weekly structure that works:
        </p>

        <BlogCode>
          {`Day 1: Push focus
- Push-up progression: 3 sets
- Dip progression: 3 sets
- Pike push-up progression: 3 sets

Day 2: Pull focus
- Pull-up progression: 3 sets
- Row progression (inverted rows): 3 sets
- Curl alternative (if you care about biceps)

Day 3: Legs + Core
- Squat progression: 3 sets
- Single-leg progression: 3 sets
- Core progression: 3 sets

Rest a day between sessions. 3-4 days per week total.`}
        </BlogCode>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">The Timeline Reality</h2>

        <p className="mb-4">
          <strong>First pull-up from zero:</strong> 4-12 weeks for most people. Some faster,
          some slower. Depends on starting point and consistency.
        </p>

        <p className="mb-4">
          <strong>First pistol squat:</strong> 3-6 months if you&apos;re starting from regular squats.
          Mobility is usually the bottleneck.
        </p>

        <p className="mb-4">
          <strong>First muscle-up:</strong> 6-12+ months after you can do 10+ pull-ups.
          It&apos;s a skill, not just strength.
        </p>

        <p className="mb-4">
          These are long timelines. That&apos;s the nature of advanced bodyweight skills.
          The good news: the journey is the training. You get strong along the way.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Start Where You Are</h2>

        <p className="mb-4">
          Don&apos;t be embarrassed to start at Level 1. Wall push-ups and assisted squats
          are where everyone begins. The person doing one-arm pull-ups started with
          dead hangs.
        </p>

        <p className="mb-4">
          Find your level in each category—push, pull, squat, core—and work from there.
          Progress isn&apos;t linear; some days will feel weak. Keep showing up.
        </p>

        <p className="mt-6">
          <Link href="/hi">Get a personalized program</Link> that meets you at your current
          level and progresses you intelligently, or just pick your level and start.
          Either way, the bar (or floor) is waiting.
        </p>
      </BlogSection>
    </BlogPost>
  )
}
