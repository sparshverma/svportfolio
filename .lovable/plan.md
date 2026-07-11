# Redesign the Experience Section

Modernize `src/components/Experience.tsx` into an interactive, glassmorphic timeline where each role expands in place to reveal structured details. Direction is synthesized from 10 top developer portfolios (Brittany Chiang, Rauno, Paco, Lee Robinson, Delba, Olaolu, Emil Kowalski, Linus Rogge, Brian Lovin, Joseph Uchendu).

## Design direction

- **Neon-trace timeline**: keep the vertical line, but make it "draw in" as the user scrolls (scroll-linked gradient fill). Timeline dots pulse when their card enters the viewport.
- **Glassmorphic accordion cards**: each role starts collapsed showing role, org, period, and a one-line summary. Click / tap to expand — spring animation reveals structured bullet points (Impact, Stack, Highlights) instead of one long paragraph.
- **Focus dimming (Brittany Chiang pattern)**: hovering or expanding a card dims siblings to ~40% opacity so the active role dominates.
- **Glow sweep on reveal**: staggered fade-in-up entrance with a one-shot neon light sweep across the glass surface.
- **Sticky year gutter**: on md+ screens, the year "snaps" into the left gutter as you scroll through that role (Linus Rogge pattern).
- **Type / Stack chips**: replace single "type" pill with small tag chips (role type + top 3–5 tools) for scannability.

## Interaction spec

- First card expanded by default so the section reads well without interaction.
- Click header (or keyboard Enter/Space) toggles expand. Only one open at a time (like an accordion) — smoother visual rhythm.
- Chevron rotates 180° on expand.
- Respect `prefers-reduced-motion`: disable scroll-linked draw, sweep, and spring; fall back to instant expand + simple fade.
- Fully mobile-friendly: gutter collapses, cards go full width, tap target ≥ 44px.

## Content restructure

Split each `experiences[]` entry's long paragraph into structured fields so the expand actually reveals value:

```ts
{
  title, organization, period, type,
  summary: string,          // one-line teaser shown collapsed
  highlights: string[],     // 3–6 bullet impact points shown expanded
  stack?: string[],         // chips shown expanded
}
```

Rewrite existing paragraphs into this shape without changing meaning (ZitBoard, Fullers, QMUL, Meraki, DeepStory).

## Technical details

- Add `framer-motion` (already common in Lovable stack; install if missing) for `motion.div` height/opacity springs, `AnimatePresence`, and `useScroll` + `useTransform` for the timeline draw.
- Use `useInView` (framer-motion) to trigger entrance and dot pulse.
- Timeline draw: overlay a second SVG path with `pathLength` bound to scroll progress of the section, colored with the existing `--gradient-primary`, blur-drop-shadow for the neon glow.
- Focus dimming: track `hoveredId | expandedId` in local state; apply `opacity-40` to non-active cards via conditional class.
- Keep all colors as semantic tokens (`--primary`, `--secondary`, `--card`, `--border`) — no hard-coded hex. Reuse `.glass-card` and `.glow-hover` from `index.css`.
- Add small keyframe `sweep` in `tailwind.config.ts` for the one-shot glass light sweep (translateX -100% → 100% on a gradient overlay, 1.2s, once, on enter).
- Extract the row into `ExperienceItem.tsx` to keep `Experience.tsx` readable.

## Files

- `src/components/Experience.tsx` — restructured data + timeline shell with scroll progress.
- `src/components/ExperienceItem.tsx` — new; accordion card with framer-motion.
- `tailwind.config.ts` — add `sweep` keyframe/animation.
- `package.json` — ensure `framer-motion` present.

## Out of scope

- No changes to other sections, routing, or backend.
- No content rewrites beyond splitting existing descriptions into `summary` + `highlights` + `stack`.

Approve and I'll implement.
