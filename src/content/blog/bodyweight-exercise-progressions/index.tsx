import Link from 'next/link'
import { BlogPost, BlogSection, BlogQuote, BlogList, BlogCode } from '@/app/blog/components/BlogPost'
import { BlogPostFrontmatter } from '@/types/blog'

export const frontmatter: BlogPostFrontmatter = {
  title: "Complete Guide to Bodyweight Exercise Progressions",
  date: "2024-03-14",
  excerpt: "Master bodyweight training with our comprehensive progression guide. Learn how to advance from basic movements to impressive calisthenics skills while building real strength and muscle.",
  metaDescription: "Learn how to progress from basic bodyweight exercises to advanced calisthenics movements. Master proper form and build strength with our detailed progression guide.",
  published: false,
  featured: false,
  categories: [
    "Exercise Technique",
    "Strength Training",
    "Bodyweight Training",
    "Progressive Overload"
  ],
  tags: [
    "bodyweight exercises",
    "calisthenics",
    "exercise progression",
    "strength training",
    "home workout",
    "movement patterns",
    "exercise form",
    "progressive overload"
  ],
  keywords: [
    "bodyweight progression",
    "calisthenics progression",
    "bodyweight exercise advancement",
    "progressive calisthenics",
    "bodyweight strength training",
    "exercise progression guide",
    "home workout progression",
    "strength progression"
  ]
}

export default function BodyweightProgressions() {
  return (
    <BlogPost frontmatter={frontmatter}>
      <p className="italic">
        Master bodyweight training with our comprehensive progression guide. Learn how to advance from basic 
        movements to impressive calisthenics skills while building real strength and muscle.
      </p>

      <p className="mb-6">
        Building strength through bodyweight training is all about smart progression. This guide shows you 
        exactly how to advance from fundamental movements to advanced skills, with clear benchmarks and 
        form cues at each stage.
      </p>

      <BlogQuote>
        <p><strong>Let Baisics Guide Your Training</strong></p>
        <p>
          Ready to master bodyweight training? <Link href="/hi">Let our AI analyze your current level</Link> and 
          create a personalized progression plan.
        </p>
      </BlogQuote>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Understanding Progression Principles</h2>

        <h3 className="text-2xl font-semibold mb-4">Key Concepts</h3>
        <BlogList items={[
          "Master basics before advancing",
          "Progress gradually",
          "Form before reps",
          "Strength before endurance",
          "Patience with plateaus"
        ]} />

        <h3 className="text-2xl font-semibold mt-6 mb-4">Progress Markers</h3>
        <BlogCode>
          {`When to Advance:
- Perfect form maintained
- Target reps achieved
- Movement feels controlled
- Recovery is adequate
- No compensation patterns`}
        </BlogCode>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Push-Up Progression Path</h2>

        <h3 className="text-2xl font-semibold mb-4">Level 1: Wall Push-Ups</h3>
        <BlogCode>
          {`Form Cues:
- Hands shoulder-width
- Body straight line
- Core engaged
- Full range of motion
Target: 3x20 perfect reps`}
        </BlogCode>

        <h3 className="text-2xl font-semibold mt-6 mb-4">Level 2: Incline Push-Ups</h3>
        <BlogCode>
          {`Form Cues:
- Higher surface (table/chair)
- Shoulders packed
- Elbows 45° angle
- Controlled descent
Target: 3x15 perfect reps`}
        </BlogCode>

        <h3 className="text-2xl font-semibold mt-6 mb-4">Level 3: Knee Push-Ups</h3>
        <BlogCode>
          {`Form Cues:
- Knees as pivot point
- Maintain plank from knees
- Full chest range
- Even tempo
Target: 3x12 perfect reps`}
        </BlogCode>

        <h3 className="text-2xl font-semibold mt-6 mb-4">Level 4: Full Push-Ups</h3>
        <BlogCode>
          {`Form Cues:
- Body straight line
- Elbows tucked
- Full depth
- Controlled pace
Target: 3x10 perfect reps`}
        </BlogCode>

        <h3 className="text-2xl font-semibold mt-6 mb-4">Level 5: Advanced Variations</h3>
        <BlogList items={[
          "Diamond Push-Ups",
          "Archer Push-Ups",
          "Decline Push-Ups",
          "One-Arm Progression",
          "Planche Progression"
        ]} />
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Pull-Up Progression Path</h2>

        <h3 className="text-2xl font-semibold mb-4">Level 1: Dead Hangs</h3>
        <BlogCode>
          {`Form Cues:
- Full grip engagement
- Shoulders packed
- Core engaged
- Controlled breathing
Target: 3x30 seconds`}
        </BlogCode>

        <h3 className="text-2xl font-semibold mt-6 mb-4">Level 2: Negative Pull-Ups</h3>
        <BlogCode>
          {`Form Cues:
- Slow descent (5s)
- Control throughout
- Full range
- Proper grip
Target: 3x5 controlled negatives`}
        </BlogCode>

        <h3 className="text-2xl font-semibold mt-6 mb-4">Level 3: Band-Assisted Pull-Ups</h3>
        <BlogCode>
          {`Form Cues:
- Minimal band assistance
- Full range of motion
- Chest to bar
- Controlled descent
Target: 3x8 clean reps`}
        </BlogCode>

        <h3 className="text-2xl font-semibold mt-6 mb-4">Level 4: Full Pull-Ups</h3>
        <BlogCode>
          {`Form Cues:
- Dead hang start
- Chest to bar
- Controlled descent
- No swing
Target: 3x5 perfect reps`}
        </BlogCode>

        <h3 className="text-2xl font-semibold mt-6 mb-4">Level 5: Advanced Variations</h3>
        <BlogList items={[
          "Wide-Grip Pull-Ups",
          "L-Sit Pull-Ups",
          "Archer Pull-Ups",
          "One-Arm Progression",
          "Muscle-Up Progression"
        ]} />
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Squat Progression Path</h2>

        <h3 className="text-2xl font-semibold mb-4">Level 1: Assisted Squats</h3>
        <BlogCode>
          {`Form Cues:
- Hold support
- Feet shoulder-width
- Knees track toes
- Control descent
Target: 3x15 perfect reps`}
        </BlogCode>

        <h3 className="text-2xl font-semibold mt-6 mb-4">Level 2: Box Squats</h3>
        <BlogCode>
          {`Form Cues:
- Light touch to box
- Keep tension
- Chest up
- Hip hinge
Target: 3x12 perfect reps`}
        </BlogCode>

        <h3 className="text-2xl font-semibold mt-6 mb-4">Level 3: Bodyweight Squats</h3>
        <BlogCode>
          {`Form Cues:
- Full depth
- Knees stable
- Back straight
- Even weight
Target: 3x20 perfect reps`}
        </BlogCode>

        <h3 className="text-2xl font-semibold mt-6 mb-4">Level 4: Bulgarian Split Squats</h3>
        <BlogCode>
          {`Form Cues:
- Rear foot elevated
- Front knee stable
- Torso upright
- Even tempo
Target: 3x12 each leg`}
        </BlogCode>

        <h3 className="text-2xl font-semibold mt-6 mb-4">Level 5: Advanced Variations</h3>
        <BlogList items={[
          "Jump Squats",
          "Pistol Squat Progression",
          "Shrimp Squats",
          "Sissy Squats",
          "Natural Leg Extensions"
        ]} />
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Core Progression Path</h2>

        <h3 className="text-2xl font-semibold mb-4">Level 1: Dead Bug</h3>
        <BlogCode>
          {`Form Cues:
- Back pressed down
- Slow movement
- Opposite limbs
- Breathing control
Target: 3x30 seconds`}
        </BlogCode>

        <h3 className="text-2xl font-semibold mt-6 mb-4">Level 2: Plank Progression</h3>
        <BlogCode>
          {`Form Cues:
- Straight line
- Core engaged
- Shoulders packed
- Glutes active
Target: 3x45 seconds`}
        </BlogCode>

        <h3 className="text-2xl font-semibold mt-6 mb-4">Level 3: Hollow Body Hold</h3>
        <BlogCode>
          {`Form Cues:
- Lower back pressed
- Legs straight
- Arms overhead
- Controlled breathing
Target: 3x30 seconds`}
        </BlogCode>

        <h3 className="text-2xl font-semibold mt-6 mb-4">Level 4: L-Sit Progression</h3>
        <BlogCode>
          {`Form Cues:
- Shoulders depressed
- Legs straight
- Back straight
- Core tight
Target: 3x15 seconds`}
        </BlogCode>

        <h3 className="text-2xl font-semibold mt-6 mb-4">Level 5: Advanced Variations</h3>
        <BlogList items={[
          "Dragon Flag Progression",
          "Front Lever Progression",
          "Back Lever Progression",
          "V-Sit Progression",
          "Planche Progression"
        ]} />
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Programming Guidelines</h2>

        <h3 className="text-2xl font-semibold mb-4">Weekly Structure</h3>
        <BlogCode>
          {`Beginner Schedule:
Monday: Push Focus
Tuesday: Rest/Mobility
Wednesday: Pull Focus
Thursday: Rest/Mobility
Friday: Legs/Core
Weekend: Rest/Practice`}
        </BlogCode>

        <h3 className="text-2xl font-semibold mt-6 mb-4">Progress Tracking</h3>
        <BlogList items={[
          "Record all workouts",
          "Video form checks",
          "Track hold times",
          "Note energy levels",
          "Monitor recovery"
        ]} />
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Common Mistakes</h2>

        <h3 className="text-2xl font-semibold mb-4">Form Issues</h3>
        <BlogList items={[
          "Rushing progressions",
          "Sacrificing form for reps",
          "Inconsistent practice",
          "Skipping steps",
          "Inadequate rest"
        ]} />

        <h3 className="text-2xl font-semibold mt-6 mb-4">Recovery Mistakes</h3>
        <BlogList items={[
          "Overtraining",
          "Poor sleep habits",
          "Insufficient protein",
          "Ignoring mobility",
          "Skipping deloads"
        ]} />
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Expert Tips</h2>
        
        <BlogQuote author="Al Kavadlo">
          Master the basics before moving on. The fundamentals are your foundation for all advanced skills.
        </BlogQuote>

        <BlogQuote author="Steven Low">
          Consistency and patience are key. Focus on quality movement patterns before increasing volume.
        </BlogQuote>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Conclusion</h2>
        
        <p className="mb-4">
          Bodyweight training is a journey of progressive mastery. By following these structured progressions 
          and focusing on perfect form, you can build impressive strength and skills without ever touching 
          a weight.
        </p>

        <p className="mb-4">Remember these key points:</p>
        <BlogList items={[
          "Quality over quantity",
          "Patience with progression",
          "Consistent practice",
          "Listen to your body",
          "Trust the process"
        ]} />

        <p className="mt-6 italic">
          Want a personalized bodyweight training program? <Link href="/hi">Let our AI create your perfect progression plan</Link> based on your current level and goals.
        </p>
      </BlogSection>
    </BlogPost>
  )
} 