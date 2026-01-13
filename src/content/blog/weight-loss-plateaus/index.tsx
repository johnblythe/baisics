import Link from 'next/link'
import { BlogPost, BlogSection, BlogQuote, BlogList, BlogCode } from '@/app/blog/components/BlogPost'
import { BlogPostFrontmatter } from '@/types/blog'

export const frontmatter: BlogPostFrontmatter = {
  title: "Weight Loss Plateau: Why You Stopped Losing and How to Fix It",
  date: "2024-03-14",
  excerpt: "Your weight loss stalled. Here's what's actually happening in your body and the specific fixes that work—not motivational fluff.",
  metaDescription: "Stuck at the same weight for weeks? Learn the real reasons weight loss plateaus happen and the science-backed strategies to start losing again.",
  published: true,
  featured: true,
  categories: [
    "Weight Loss",
    "Nutrition",
    "Troubleshooting"
  ],
  tags: [
    "weight loss",
    "plateaus",
    "metabolism",
    "fat loss",
    "troubleshooting"
  ],
  keywords: [
    "weight loss plateau",
    "stopped losing weight",
    "plateau solutions",
    "break through plateau",
    "weight loss stall",
    "diet plateau",
    "why am I not losing weight"
  ]
}

export default function WeightLossPlateausGuide() {
  return (
    <BlogPost frontmatter={frontmatter}>
      <p className="text-lg mb-6">
        You were losing weight consistently. Then it stopped. The scale hasn&apos;t moved
        in weeks despite doing everything &quot;right.&quot; Before you slash calories further
        or add more cardio, let&apos;s figure out what&apos;s actually happening.
      </p>

      <p className="mb-6">
        Most plateaus have fixable causes. The problem is that people usually guess wrong
        about which one is hitting them, then apply the wrong fix, which makes things worse.
      </p>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">First: Is It Actually a Plateau?</h2>

        <p className="mb-4">
          Weight fluctuates 2-4 pounds <em>daily</em> based on water, sodium, carbs,
          bathroom timing, and hormones. Two weeks of flat scale weight often isn&apos;t
          a real plateau—it&apos;s normal noise.
        </p>

        <p className="mb-4">
          A true plateau: same average weight for 3+ weeks while maintaining the same
          deficit. If it&apos;s only been 10 days, wait. The scale is messing with you.
        </p>

        <BlogCode>
          {`Not a plateau:
- Scale up 2 lbs after a high-carb day (water weight)
- Weight stuck for 5-7 days (normal stall)
- Monthly hormonal fluctuations (especially for women)

Actual plateau:
- 3+ weeks at same weight
- Same diet and activity level
- Multiple weigh-ins confirming the trend`}
        </BlogCode>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">The Real Reasons You Stopped Losing</h2>

        <h3 className="text-xl font-semibold mt-6 mb-2">1. Your Deficit Disappeared</h3>
        <p className="mb-4">
          This is the most common cause and the one nobody wants to hear. You lost weight,
          which means you now burn fewer calories. The deficit that worked at 200 lbs doesn&apos;t
          work at 175 lbs.
        </p>

        <p className="mb-4">
          At the same time, you probably drifted. Portions got a little bigger.
          &quot;Just a handful&quot; of snacks here and there. Weekend meals got looser.
          None of these feel significant, but they add up to erasing your deficit.
        </p>

        <p className="mb-4">
          <strong>Fix:</strong> Track <em>everything</em> for one honest week. Use a food scale.
          Count cooking oils, sauces, drinks. Most people are shocked by what they find.
          Then recalculate your calorie needs based on your <em>current</em> weight.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">2. You&apos;re Moving Less Without Realizing It</h3>
        <p className="mb-4">
          When you eat less, your body unconsciously conserves energy. You fidget less,
          take fewer steps, sit more often, move more slowly. Researchers call this
          &quot;adaptive thermogenesis&quot;—your body fighting back against the deficit.
        </p>

        <p className="mb-4">
          This can slash your daily calorie burn by 300-500 calories without you
          noticing. That&apos;s enough to completely erase a moderate deficit.
        </p>

        <p className="mb-4">
          <strong>Fix:</strong> Track your daily steps. If they&apos;ve dropped from 10,000 to 6,000
          without you realizing, there&apos;s your problem. Set step goals and hit them.
          Walk after meals. Take the stairs. The goal is to artificially maintain activity
          that your body is trying to reduce.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">3. Stress and Sleep Are Wrecking You</h3>
        <p className="mb-4">
          Cortisol (stress hormone) causes water retention that can mask fat loss on the
          scale for weeks. It also affects where your body stores fat, how hungry you are,
          and how well you recover from training.
        </p>

        <p className="mb-4">
          Poor sleep amplifies everything. Leptin (satiety hormone) drops, ghrelin
          (hunger hormone) rises, insulin sensitivity decreases, and willpower craters.
          Trying to diet on 5 hours of sleep is playing on hard mode.
        </p>

        <p className="mb-4">
          <strong>Fix:</strong> This isn&apos;t a &quot;try to relax&quot; pep talk. Prioritize 7-8 hours
          of sleep like it&apos;s a non-negotiable. Address stress sources if possible.
          If life is genuinely chaotic right now, consider a diet break until things settle.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">4. You Need More Protein</h3>
        <p className="mb-4">
          Inadequate protein during a deficit means you&apos;re losing muscle along with fat.
          Muscle is metabolically active—losing it lowers your daily calorie burn, making
          the plateau worse. It also makes you look &quot;skinny fat&quot; instead of lean.
        </p>

        <BlogCode>
          {`Protein targets during a deficit:
Sedentary: 0.7-0.8g per lb of body weight
Active: 0.8-1.0g per lb of body weight
Lifting heavy: 1.0-1.2g per lb of body weight

Example: 180 lb person should aim for 140-180g protein daily.`}
        </BlogCode>

        <p className="mt-4 mb-4">
          <strong>Fix:</strong> Audit your protein intake. If you&apos;re below 0.7g/lb, increase it.
          Protein is also the most satiating macronutrient, so higher protein diets are
          easier to stick to anyway.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">5. You&apos;ve Been Dieting Too Long</h3>
        <p className="mb-4">
          Extended dieting causes metabolic adaptation. Your body gets really good at
          functioning on fewer calories. Hunger hormones go haywire. Energy crashes.
          Eventually, you&apos;re either eating at maintenance without realizing it, or
          you&apos;re so miserable you can&apos;t sustain it.
        </p>

        <p className="mb-4">
          <strong>Fix:</strong> Take a diet break. Eat at maintenance (roughly 14-15 calories
          per pound of body weight) for 1-2 weeks. Not a binge—structured maintenance.
          This normalizes hormones and gives you a psychological reset. Then return to
          your deficit.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">What NOT to Do</h2>

        <p className="mb-4">
          <strong>Don&apos;t slash calories further.</strong> If you&apos;re already at 1,200 calories
          and not losing, the answer isn&apos;t 1,000 calories. You&apos;re either miscounting,
          moving too little, or need a diet break. Going lower will tank your metabolism
          and make things worse.
        </p>

        <p className="mb-4">
          <strong>Don&apos;t add hours of cardio.</strong> More cardio means more hunger,
          more fatigue, and more adaptive thermogenesis. A little cardio is fine.
          An hour of daily cardio to break a plateau is a losing strategy.
        </p>

        <p className="mb-4">
          <strong>Don&apos;t panic after a few days.</strong> Real plateaus take 3+ weeks
          to confirm. If you change strategies every week because the scale didn&apos;t move,
          you&apos;ll never learn what actually works.
        </p>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">The Plateau-Breaking Protocol</h2>

        <p className="mb-4">
          Step by step, in order of likelihood:
        </p>

        <BlogCode>
          {`Week 1: Honest audit
- Track all food with a food scale
- Track all drinks and condiments
- Note daily step count
- Record sleep hours

Week 2: Make adjustments
- If calories crept up → return to original plan
- If steps dropped → set and hit daily step goal
- If protein is low → increase to 1g/lb
- If sleep is bad → prioritize 7+ hours

Week 3: Evaluate
- If weight is moving → continue
- If still stuck and you've been dieting 8+ weeks → diet break

Diet break (if needed):
- Eat at maintenance for 1-2 weeks
- Keep protein high
- Keep training
- Return to deficit after

If nothing works after 6+ weeks:
- Consider medical checkup (thyroid, hormones)
- Work with a professional`}
        </BlogCode>
      </BlogSection>

      <BlogSection>
        <h2 className="text-3xl font-bold mb-4">The Mindset Shift</h2>

        <p className="mb-4">
          Plateaus are information, not failure. They tell you something about what your
          body is doing and what adjustments are needed. The people who successfully lose
          weight and keep it off aren&apos;t the ones who never plateau—they&apos;re the ones who
          learn to work through them.
        </p>

        <p className="mb-4">
          Fat loss isn&apos;t linear. You&apos;ll have weeks of rapid loss, weeks of stalls, and
          weeks where the scale goes up before dropping again. Track the trend over months,
          not the day-to-day noise.
        </p>

        <p className="mt-6">
          <Link href="/hi">Get a program that adapts to your progress</Link>—including built-in
          strategies for when weight loss stalls. Or just start with the protocol above.
          Either way, the plateau is temporary if you respond correctly.
        </p>
      </BlogSection>
    </BlogPost>
  )
}
