# Blog Templates

Templates for creating consistent, SEO-optimized blog content.

## Competitor Comparison Template

**File:** `competitor-comparison-template.tsx`

Use this template when writing "Baisics vs X" comparison posts.

### Quick Start

1. Copy template to `src/content/blog/baisics-vs-[competitor]/index.tsx`
2. Replace all `[PLACEHOLDER]` text
3. Research competitor pricing/features before writing
4. Set `published: true` when ready
5. Test at `/blog/baisics-vs-[competitor]`

### Required Sections

| Section | Purpose |
|---------|---------|
| Quick Comparison Table | At-a-glance overview for skimmers |
| What is [Competitor]? | Fair overview, acknowledge strengths |
| What is Baisics? | Our value proposition |
| Pricing Comparison | Detailed cost breakdown |
| Feature Comparison | Deep dive on capabilities |
| Decision Framework | "Choose X if..." guidance |
| CTA | Soft sell with free trial emphasis |
| FAQ (optional) | SEO long-tail keywords |

### Tone Guidelines

- **Factual, not promotional** - Let features speak for themselves
- **Fair to competitors** - Acknowledge their strengths
- **Non-disparaging** - No negative language about competitors
- **User-focused** - Help reader make best decision for *them*
- **Specific** - Use real numbers, not vague claims

### SEO Checklist

- [ ] Title: "Baisics vs [Competitor]: [Value Prop Question]"
- [ ] Meta description: 150-160 chars, includes both product names
- [ ] Keywords: Include "[competitor] alternative", "[competitor] vs baisics"
- [ ] H1: Match title
- [ ] H2s: Major sections (Pricing, Features, etc.)
- [ ] H3s: Subsections within each H2
- [ ] Internal links: Link to /hi and relevant blog posts
- [ ] Comparison table: Early in content for featured snippets

### Writing Tips

1. **Research first** - Get accurate pricing and feature info
2. **Update dates** - Pricing and features change; note "as of [date]"
3. **Be specific** - "$9.99/month" not "affordable pricing"
4. **Show, don't tell** - Describe features, don't just claim "better"
5. **Include the close** - Clear CTA but not pushy
