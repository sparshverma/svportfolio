
## Goal
Add a theme toggle (light/dark/system) to the portfolio, with both modes fully polished. Dark stays the default and preserves the current neon-glass aesthetic; light gets a purpose-built palette (not just inverted) that keeps the brand feel — clean, minimal, with softened cyan/purple accents.

## 1. Theme infrastructure

- Add a lightweight `ThemeProvider` in `src/components/theme-provider.tsx`:
  - Modes: `light | dark | system`.
  - Persist to `localStorage` under `sv-theme`.
  - Toggle by adding/removing the `dark` class on `<html>` (Tailwind is already configured with `darkMode: ["class"]`).
  - Listen to `prefers-color-scheme` when set to `system`.
- Wrap the app in `src/App.tsx` with `<ThemeProvider defaultTheme="dark">`.
- Add an inline pre-hydration script in `index.html` that sets the `dark` class before React mounts, to prevent a light flash on load for dark-mode users.

## 2. Design tokens for both modes

Rework `src/index.css` so `:root` = light theme and `.dark` = current dark theme (moved out of `:root`).

Light palette (proposal — refined, not generic white):
- `--background`: soft off-white `210 40% 98%`
- `--foreground`: deep navy `222 47% 11%`
- `--card`: `0 0% 100%` with subtle border
- `--muted`: `210 30% 94%`, `--muted-foreground`: `215 20% 40%`
- `--primary`: deeper cyan `190 90% 40%` (WCAG-safe on white)
- `--secondary` / `--accent`: purple `262 70% 55%`
- `--border`: `214 25% 88%`
- Gradients: same hues, lower alpha; glow shadows toned way down (`0 8px 24px hsl(190 90% 40% / 0.12)`).
- `--gradient-glow`: subtle radial that reads on light bg.

Dark palette: current values, unchanged, moved under `.dark { … }`.

## 3. Component-level audit (remove theme-breaking hardcodes)

Scan and replace any hardcoded colors so both modes work. Known/likely spots to check and fix:
- `Hero.tsx` — gradient backgrounds using `background`/`muted` (should already be token-based; verify).
- `MobiusStrip.tsx` — Three.js material colors are hex-based; expose them via CSS vars or pass theme-aware colors so the strip stays visible on light bg (likely swap to slightly darker cyan/purple in light mode).
- `Navigation.tsx` scrolled state `bg-background/80` — fine, but verify shadow in light mode.
- `Footer.tsx`, `Research.tsx`, `About/Skills/Projects/Experience/Education/Certifications/Contact` — grep for `bg-white`, `bg-black`, `text-white`, `text-black`, `bg-[#…]`, `text-[#…]` and replace with semantic tokens.
- `glass-card` utility — tune `bg-card/40` + border for light mode (probably `bg-card/70` + stronger border via a `.dark` override).
- Selection color, scrollbar, focus rings — verify.

## 4. Toggle UI

- New `src/components/ThemeToggle.tsx`: icon button using lucide `Sun` / `Moon` (with system option via dropdown, or simple 2-state toggle — see question below).
- Placement: right side of `Navigation.tsx`, before the mobile menu button; also include in the mobile menu panel.
- Smooth transition: add `transition-colors duration-300` on `body` (or a root wrapper) so mode switches feel intentional, not jarring.

## 5. QA pass

- Verify contrast (WCAG AA) on primary text, muted text, buttons, and links in light mode.
- Check the Möbius strip, glow blobs, and glass cards in light mode — adjust opacities so nothing washes out or overpowers.
- Confirm OG image / meta unaffected.
- Test on mobile viewport.

## Technical notes
- No new deps required (not pulling in `next-themes` — 30-line provider is enough).
- Tailwind `darkMode: "class"` is already set, so `dark:` variants work out of the box for any spot needing mode-specific tweaks.
- Möbius strip colors will be read from computed CSS vars at mount and on theme change (via a MutationObserver on `<html>` class, or by re-mounting when theme changes).

## One clarification before I build
Do you want a **simple 2-state toggle** (light ↔ dark, no system option) or a **3-state dropdown** (light / dark / system)? Simple is cleaner for a portfolio; 3-state is more "correct." I'd default to simple 2-state unless you say otherwise.
