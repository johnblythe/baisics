import Link from 'next/link'
import { BlogPost, BlogSection, BlogQuote, BlogList, BlogCode } from '@/app/blog/components/BlogPost'
import { BlogPostFrontmatter } from '@/types/blog'

export const frontmatter: BlogPostFrontmatter = {
  title: "Small Space Home Gym: Essential Equipment Under $500",
  date: "2024-03-14",
  excerpt: "Build a complete, space-efficient home gym on a budget. Learn which equipment gives you the most bang for your buck and how to maximize a small workout area.",
  metaDescription: "Learn how to build a complete home gym in a small space for under $500. Get expert tips on essential equipment, space optimization, and budget breakdown.",
  published: false,
  featured: false,
  categories: [
    "Equipment",
    "Home Training",
    "Budget Friendly",
    "Training Space"
  ],
  tags: [
    "home gym",
    "small space gym",
    "budget equipment",
    "workout space",
    "home training",
    "apartment gym",
    "minimal equipment",
    "space saving"
  ],
  keywords: [
    "small space home gym",
    "home gym under 500",
    "apartment workout equipment",
    "minimal home gym setup",
    "budget home gym essentials",
    "compact workout space",
    "home gym equipment list",
    "space saving home gym"
  ]
}

export default function SmallSpaceHomeGymGuide() {
  return (
    <BlogPost frontmatter={frontmatter}>
      <p className="italic">
        Build a complete, space-efficient home gym on a budget. Learn which equipment gives you the most 
        bang for your buck and how to maximize a small workout area.
      </p>

      <p className="mb-6">
        Creating a functional home gym doesn&apos;t require a huge space or budget. This guide shows you 
        exactly how to build an effective workout space in any area, from a corner of your bedroom to 
        a small apartment balcony.
      </p>

      <BlogQuote>
        <p><strong>Let Baisics Guide Your Setup</strong></p>
        <p>
          Need help planning your home gym? <Link href="/hi">Let our AI analyze your space and goals</Link> to 
          create a personalized equipment plan.
        </p>
      </BlogQuote>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Space Planning Essentials</h2>

        <h3 className="text-2xl font-semibold mb-4">Minimum Space Requirements</h3>
        <BlogCode>
          {`Workout Area: 6' x 6' minimum
Ceiling Height: 7'+ ideal
Storage Space: 2' x 4' minimum
Floor Type: Any flat surface`}
        </BlogCode>

        <h3 className="text-2xl font-semibold mt-6 mb-4">Space Optimization Tips</h3>
        <BlogList items={[
          "Wall-mounted storage",
          "Vertical organization",
          "Multi-use equipment",
          "Collapsible options",
          "Door-mounted solutions"
        ]} />
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Essential Equipment List</h2>

        <h3 className="text-2xl font-semibold mb-4">The Core Setup ($200-250)</h3>
        
        <div className="mb-6">
          <h4 className="text-xl font-semibold mb-2">1. Adjustable Dumbbells ($150-180)</h4>
          <BlogList items={[
            "Replaces multiple pairs",
            "Space-efficient design",
            "Progressive overload capable"
          ]} />
        </div>

        <div className="mb-6">
          <h4 className="text-xl font-semibold mb-2">2. Resistance Bands Set ($30-40)</h4>
          <BlogList items={[
            "Full body workouts",
            "Portable options",
            "Adds variable resistance"
          ]} />
        </div>

        <div className="mb-6">
          <h4 className="text-xl font-semibold mb-2">3. Exercise Mat ($20-30)</h4>
          <BlogList items={[
            "Floor protection",
            "Comfort during exercises",
            "Easy storage"
          ]} />
        </div>

        <h3 className="text-2xl font-semibold mt-8 mb-4">Advanced Additions ($250-300)</h3>
        
        <div className="mb-6">
          <h4 className="text-xl font-semibold mb-2">1. Pull-up Bar ($25-35)</h4>
          <BlogList items={[
            "Door-mounted option",
            "Multiple grip positions",
            "Removable design"
          ]} />
        </div>

        <div className="mb-6">
          <h4 className="text-xl font-semibold mb-2">2. Adjustable Bench ($100-130)</h4>
          <BlogList items={[
            "Foldable for storage",
            "Multiple positions",
            "Weight capacity 600+ lbs"
          ]} />
        </div>

        <div className="mb-6">
          <h4 className="text-xl font-semibold mb-2">3. Kettlebell ($40-50)</h4>
          <BlogList items={[
            "Full body movements",
            "Compact size",
            "Versatile training"
          ]} />
        </div>

        <div className="mb-6">
          <h4 className="text-xl font-semibold mb-2">4. Recovery Tools ($50-70)</h4>
          <BlogList items={[
            "Foam roller",
            "Massage balls",
            "Resistance bands"
          ]} />
        </div>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Equipment Breakdown by Priority</h2>

        <h3 className="text-2xl font-semibold mb-4">Must-Have Items</h3>
        <BlogCode>
          {`Priority   Item                Cost    Space Needed
1st        Adj. Dumbbells     $150    2'x1'
2nd        Resistance Bands   $35     1'x1' drawer
3rd        Exercise Mat       $25     6'x2' (rolled: 6"x6")
Total:                        $210`}
        </BlogCode>

        <h3 className="text-2xl font-semibold mt-6 mb-4">Recommended Additions</h3>
        <BlogCode>
          {`Priority   Item                Cost    Space Needed
4th        Pull-up Bar        $30     Door frame
5th        Adj. Bench         $120    4'x2' (folded: 2'x2')
6th        Kettlebell         $45     1'x1'
7th        Recovery Tools     $60     2'x2' drawer
Total:                        $255`}
        </BlogCode>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Space-Saving Solutions</h2>

        <h3 className="text-2xl font-semibold mb-4">Storage Ideas</h3>
        <BlogList items={[
          "Over-door organizers",
          "Wall-mounted racks",
          "Under-bed storage",
          "Vertical stacking",
          "Multi-use furniture"
        ]} />

        <h3 className="text-2xl font-semibold mt-6 mb-4">Equipment Selection Tips</h3>
        <BlogList items={[
          "Foldable designs",
          "Modular systems",
          "Compact footprints",
          "Vertical storage",
          "Multi-function tools"
        ]} />
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Complete Workout Possibilities</h2>

        <h3 className="text-2xl font-semibold mb-4">Sample Full-Body Workout</h3>
        <BlogCode>
          {`Equipment Needed:
- Adjustable Dumbbells
- Exercise Mat
- Resistance Bands

Workout:
1. DB Squats: 3x12
2. Push-ups: 3x15
3. DB Rows: 3x12
4. Band Pull-aparts: 3x15
5. DB Romanian Deadlifts: 3x12
6. Band Face Pulls: 3x15`}
        </BlogCode>

        <h3 className="text-2xl font-semibold mt-6 mb-4">Advanced Workout</h3>
        <BlogCode>
          {`Added Equipment:
- Pull-up Bar
- Adjustable Bench
- Kettlebell

Workout:
1. Pull-ups: 3x8
2. DB Bench Press: 3x12
3. KB Swings: 3x15
4. Incline DB Press: 3x12
5. Band-Assisted Dips: 3x10
6. KB Turkish Get-ups: 2x5/side`}
        </BlogCode>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Budget Breakdown Options</h2>

        <h3 className="text-2xl font-semibold mb-4">Bare Minimum Setup ($150)</h3>
        <BlogCode>
          {`Resistance Bands: $40
Single Kettlebell: $45
Exercise Mat: $25
Door Pull-up Bar: $30
Total: $140`}
        </BlogCode>

        <h3 className="text-2xl font-semibold mt-6 mb-4">Basic Progressive Setup ($300)</h3>
        <BlogCode>
          {`Adj. Dumbbells: $160
Resistance Bands: $35
Exercise Mat: $25
Pull-up Bar: $30
Foam Roller: $20
Total: $270`}
        </BlogCode>

        <h3 className="text-2xl font-semibold mt-6 mb-4">Complete Setup ($500)</h3>
        <BlogCode>
          {`Adj. Dumbbells: $160
Resistance Bands: $35
Exercise Mat: $25
Pull-up Bar: $30
Adj. Bench: $120
Kettlebell: $45
Recovery Tools: $60
Total: $475`}
        </BlogCode>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Where to Buy</h2>

        <h3 className="text-2xl font-semibold mb-4">Best Value Sources</h3>
        <BlogList items={[
          "Amazon Basics line",
          "Dick's Sporting Goods sales",
          "Facebook Marketplace",
          "Local fitness stores",
          "Holiday sales events"
        ]} />

        <h3 className="text-2xl font-semibold mt-6 mb-4">What to Avoid</h3>
        <BlogList items={[
          "Ultra-cheap brands",
          "Used adjustable equipment",
          "Non-returnable items",
          "Unknown warranties",
          "Shipping damage risks"
        ]} />
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Setting Up Your Space</h2>

        <h3 className="text-2xl font-semibold mb-4">Floor Protection</h3>
        <p className="mb-4">
          Building on our <Link href="/blog/no-equipment-upper-body-workout">home workout guide</Link>:
        </p>
        <BlogList items={[
          "Rubber mats",
          "Interlocking tiles",
          "Carpet squares",
          "Moving blankets",
          "Anti-vibration pads"
        ]} />

        <h3 className="text-2xl font-semibold mt-6 mb-4">Wall Protection</h3>
        <BlogList items={[
          "Mirror mounting",
          "Wall anchors",
          "Door frame reinforcement",
          "Corner guards",
          "Paint protection"
        ]} />
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">Maintenance Tips</h2>

        <h3 className="text-2xl font-semibold mb-4">Equipment Care</h3>
        <BlogList items={[
          "Regular cleaning",
          "Proper storage",
          "Rust prevention",
          "Parts inspection",
          "Lubrication schedule"
        ]} />

        <h3 className="text-2xl font-semibold mt-6 mb-4">Safety Checks</h3>
        <p className="mb-4">
          Following our <Link href="/blog/injury-prevention-prehab-guide">injury prevention guide</Link>:
        </p>
        <BlogList items={[
          "Weight limits",
          "Anchor points",
          "Floor stability",
          "Equipment wear",
          "Connection points"
        ]} />
      </BlogSection>
    </BlogPost>
  )
} 