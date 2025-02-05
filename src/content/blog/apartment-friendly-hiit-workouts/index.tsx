import Link from 'next/link'
import { BlogPost, BlogSection, BlogQuote, BlogTable, BlogList, BlogCode } from '@/app/blog/components/BlogPost'
import { BlogPostFrontmatter } from '@/types/blog'

export const frontmatter: BlogPostFrontmatter = {
  title: "Apartment-Friendly HIIT Workouts: No Jumping Required",
  date: "2025-02-04",
  excerpt: "Get an intense, effective workout without making noise or disturbing your neighbors. These apartment-friendly HIIT routines deliver results while keeping the peace.",
  metaDescription: "Discover effective, neighbor-friendly HIIT workouts perfect for apartments. No jumping required! Get intense results without noise or impact.",
  published: false,
  featured: false,
  categories: [
    "Workouts",
    "HIIT Training",
    "Home Training",
    "Apartment Friendly"
  ],
  tags: [
    "apartment workout",
    "quiet workout",
    "HIIT training",
    "low impact",
    "home exercise",
    "no equipment",
    "cardio workout",
    "neighbor friendly"
  ],
  keywords: [
    "apartment HIIT workout",
    "quiet workout routine",
    "no jump HIIT workout",
    "low impact cardio",
    "apartment exercise routine",
    "quiet home workout",
    "neighbor friendly HIIT",
    "no noise exercise"
  ]
}

export default function ApartmentFriendlyHIIT() {
  return (
    <BlogPost frontmatter={frontmatter}>
      <p className="italic">
        Get an intense, effective workout without making noise or disturbing your neighbors. 
        These apartment-friendly HIIT routines deliver results while keeping the peace.
      </p>

      <p>
        Living in an apartment shouldn&apos;t limit your workout intensity. These carefully designed 
        high-intensity interval training (HIIT) workouts provide an effective cardio and strength 
        stimulus without jumps, runs, or other high-impact movements that could disturb your neighbors.
      </p>

      <BlogQuote>
        <p><strong>Let Baisics Design Your Workout</strong></p>
        <p>Need a customized apartment-friendly routine? <Link href="/hi">Let our AI create your perfect program</Link> based on your space and noise constraints.</p>
      </BlogQuote>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Why Low-Impact HIIT Works</h2>
        <p>Research shows that low-impact HIIT can be just as effective as traditional HIIT for:</p>
        <BlogList items={[
          "Fat burning",
          "Cardiovascular fitness",
          "Muscle endurance",
          "Metabolic health",
          "Overall conditioning"
        ]} />
        <p>
          Building on our <Link href="/blog/bodyweight-exercise-progressions">bodyweight progression guide</Link>, 
          these workouts focus on controlled intensity rather than impact.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">The Science Behind These Workouts</h2>
        
        <h3 className="text-2xl font-semibold mb-4">Heart Rate Zones</h3>
        <BlogTable>
          <thead>
            <tr>
              <th className="px-4 py-2">Zone</th>
              <th className="px-4 py-2">%Max HR</th>
              <th className="px-4 py-2">Focus</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4 py-2">Zone 1</td>
              <td className="px-4 py-2">60-70%</td>
              <td className="px-4 py-2">Warm-up</td>
            </tr>
            <tr>
              <td className="px-4 py-2">Zone 2</td>
              <td className="px-4 py-2">70-80%</td>
              <td className="px-4 py-2">Working</td>
            </tr>
            <tr>
              <td className="px-4 py-2">Zone 3</td>
              <td className="px-4 py-2">80-90%</td>
              <td className="px-4 py-2">HIIT intervals</td>
            </tr>
            <tr>
              <td className="px-4 py-2">Recovery</td>
              <td className="px-4 py-2">60-70%</td>
              <td className="px-4 py-2">Between sets</td>
            </tr>
          </tbody>
        </BlogTable>

        <h3 className="text-2xl font-semibold mt-6 mb-4">Energy Systems</h3>
        <BlogList items={[
          "ATP-PC System",
          "Glycolytic System",
          "Oxidative System"
        ]} />
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Complete Workout Programs</h2>

        <h3 className="text-2xl font-semibold mb-4">Beginner Workout A</h3>
        <BlogCode>
          {`Circuit Style (30s work/30s rest)
1. Wall Push-ups
2. Squats
3. Standing Row with Band
4. Plank Hold
5. Standing Bicycle Crunch
6. Wall Sits

Rounds: 3
Total Time: 18 minutes
Rest between rounds: 1 minute`}
        </BlogCode>

        <h3 className="text-2xl font-semibold mt-6 mb-4">Intermediate Workout B</h3>
        <BlogCode>
          {`Tabata Style (20s work/10s rest)
1. Push-ups
2. Bear Crawls
3. Band Pull-aparts
4. Plank to Downward Dog
5. Standing Mountain Climbers
6. Turkish Get-up

Rounds: 4
Total Time: 24 minutes
Rest between rounds: 1 minute`}
        </BlogCode>

        <h3 className="text-2xl font-semibold mt-6 mb-4">Advanced Workout C</h3>
        <BlogCode>
          {`EMOM Style (Every Minute on the Minute)
1. Push-up to Plank Row
2. Reverse Lunge with Band Press
3. Renegade Rows
4. Side Plank with Thread
5. Band Deadlifts
6. Floor Flow Sequence

Rounds: 5
Total Time: 30 minutes
Rest every 3 exercises: 1 minute`}
        </BlogCode>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Expert Tips</h2>
        <BlogQuote author="Dr. Andy Galpin">
          Focus on controlled tension rather than explosive movement. You can create intensity without impact.
        </BlogQuote>
        <BlogQuote author="Hannah Davis">
          Quality movement patterns and proper progression are key for low-impact HIIT success.
        </BlogQuote>
      </BlogSection>
    </BlogPost>
  )
} 