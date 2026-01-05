# BAISICS Design System - v2a Fresh Athletic

## Brand Vibe

- **Bold** - Confident, energetic, not timid
- **Fresh** - Clean whites, crisp contrast, modern
- **Athletic** - Powerful, motivated, achievement-focused
- **Approachable** - Not intimidating, welcoming to beginners

## Color Palette

```css
/* Core Colors */
--color-white: #FFFFFF;
--color-gray-50: #F8FAFC;   /* Light backgrounds */
--color-gray-100: #F1F5F9;  /* Borders, dividers */
--color-gray-400: #94A3B8;  /* Secondary text */
--color-gray-600: #475569;  /* Body text */
--color-navy: #0F172A;      /* Headlines, primary text */
--color-navy-light: #1E293B; /* Hover states */

/* Accent */
--color-coral: #FF6B6B;      /* Primary CTA, highlights */
--color-coral-dark: #EF5350; /* Hover state */
--color-coral-light: #FFE5E5; /* Subtle backgrounds */
```

## Typography

- **Headlines**: Outfit font, bold/extrabold, tight tracking
- **Body**: Outfit, regular weight, relaxed leading
- **Mono/Labels**: Space Mono, uppercase, letter-spaced

```tsx
// Import fonts
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');

// Headlines
className="text-3xl font-bold text-[#0F172A] tracking-tight"

// Body
className="text-lg text-[#475569] leading-relaxed"

// Labels
className="font-mono text-sm text-[#94A3B8] uppercase tracking-wider"
```

## Component Patterns

### Cards
```tsx
// Standard card
<div className="bg-white rounded-2xl p-6 shadow-lg border border-[#F1F5F9]">

// Feature card with hover
<div className="p-8 rounded-2xl bg-[#F8FAFC] hover:bg-[#0F172A] transition-all duration-300 group">
  <h3 className="text-xl font-bold text-[#0F172A] group-hover:text-white">
```

### Buttons
```tsx
// Primary CTA - coral, bold
<button className="px-8 py-4 text-base font-bold text-white bg-[#FF6B6B] rounded-xl hover:bg-[#EF5350] transition-all shadow-lg shadow-[#FF6B6B]/25">

// Secondary - navy outline
<button className="px-8 py-4 font-semibold text-[#0F172A] border-2 border-[#F1F5F9] rounded-xl hover:border-[#0F172A]">

// Navy solid
<button className="px-5 py-2.5 text-sm font-semibold text-white bg-[#0F172A] rounded-lg hover:bg-[#1E293B]">
```

### Stats Display
```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  <div className="bg-white rounded-xl p-6 text-center border border-[#F1F5F9]">
    <div className="text-4xl font-bold text-[#0F172A]">{value}</div>
    <div className="text-sm text-[#94A3B8] mt-1">{label}</div>
  </div>
</div>
```

### Tags/Pills
```tsx
// Coral accent
<span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FFE5E5] text-[#EF5350] rounded-full text-sm font-semibold">

// Neutral
<span className="text-sm px-4 py-2 rounded-full bg-[#F1F5F9] text-[#475569]">
```

## Layout Principles

### Page Structure
```tsx
// Light gradient background
<div className="min-h-screen bg-gradient-to-b from-[#F8FAFC] to-white">

// Centered content
<div className="max-w-7xl mx-auto px-6 lg:px-8">
```

### Header
```tsx
<header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#F1F5F9]">
  <div className="max-w-7xl mx-auto px-6 lg:px-8">
    <div className="flex items-center justify-between h-16 lg:h-20">
```

### Desktop (lg:)
- Split layouts (2-column grids)
- Sticky sidebars
- More whitespace
- Horizontal config rows

### Mobile (default)
- Single column stacking
- Full-width cards
- Bottom-aligned CTAs

## Animation Patterns

```tsx
// Slide up on enter
@keyframes slide-up {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

// Hover lift
className="hover:scale-[1.02] transition-transform"

// Pulse ring (for status indicators)
<span className="relative w-2 h-2 bg-[#FF6B6B] rounded-full">
  <span className="absolute inset-0 rounded-full bg-[#FF6B6B] animate-ping opacity-75"></span>
</span>
```

## Reference Implementation

See `src/app/landing-v2a/page.tsx` for the canonical v2a styling.

## Checklist for New Pages

- [ ] Uses light background (gray-50 gradient or white)
- [ ] Imports Outfit + Space Mono fonts
- [ ] Headers use navy (#0F172A), not gray
- [ ] CTAs use coral (#FF6B6B)
- [ ] Cards have rounded-2xl, subtle border/shadow
- [ ] Proper responsive breakpoints (lg: for desktop)
- [ ] No dark mode gradients (reserve dark for CTAs/accents only)
