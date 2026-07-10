# Plan: Cursor-Reactive 3D Möbius Strip

Replace the current gently-rotating Möbius strip in the Hero with a richer, more three-dimensional, cursor-reactive version. Same file boundary — no changes to Hero layout, copy, or other sections.

## What changes visually

- Thicker, more sculptural Möbius band (tube-like cross-section instead of a flat ribbon) so it reads clearly as 3D from any angle.
- Continuous flowing motion along the strip (animated gradient/emissive pulse traveling around the loop) so the surface always feels alive, not just spinning.
- Cursor reactivity:
  - Strip tilts toward the cursor with smooth lerp (parallax feel, subtle — max ~15°).
  - Cursor proximity brightens emissive intensity and pushes a "glow bloom" hotspot along the surface nearest the pointer.
  - Idle auto-rotation resumes when the cursor leaves the hero.
- Depth cues: soft rim light + a second colored point light that orbits the strip, plus a faint particle field behind it for parallax.
- Entrance: scale-in from 0.6 → 1 with a slight overshoot on mount (~1.2s).

Palette stays on-brand (cyan `#22d3ee` primary, purple `#a855f7` secondary), matching existing neon accents.

## Technical approach

Stay on the existing stack — `@react-three/fiber@^8.18` + `@react-three/drei@^9.122` + `three` are already installed and working. No new deps.

Files:

- `src/components/MobiusStrip.tsx` — rewrite:
  - Replace the hand-built `BufferGeometry` with a `ParametricGeometry` (from `three/examples/jsm/geometries/ParametricGeometry`) using the classic Möbius parametrization but with a **tube offset** on the normal to give real thickness, resulting in a solid, double-sided band with proper normals.
  - Add a custom `shaderMaterial` (via drei's `shaderMaterial` helper) with uniforms: `uTime`, `uMouse` (vec2, normalized -1..1), `uMouseStrength`, `uColorA`, `uColorB`. Fragment shader mixes the two colors along the `v` coordinate + a traveling wave driven by `uTime`, and boosts emissive near the projected mouse position (Fresnel * proximity).
  - `useFrame` loop:
    - Lerp mesh rotation toward `(mouseY * 0.25, mouseX * 0.4, 0)`.
    - Add constant slow Y-rotation as baseline.
    - Advance `uTime`; lerp `uMouseStrength` toward 1 on pointer-move, decay to 0 on pointer-leave.
  - Mouse tracking via a window `pointermove` listener on the hero container (normalized against viewport), plus `pointerleave` to reset. Keep existing WebGL feature detection + `webglcontextlost` fallback intact.
  - Add a light `<Points>` starfield (drei `<Points>` or a plain buffer of ~200 points) behind the strip with additive blending for depth.
  - Keep existing `requestIdleCallback` lazy mount and null fallback.
- `src/components/Hero.tsx` — no structural change; only ensure the MobiusStrip container spans the hero so pointer events register across the section. Container stays `pointer-events-none` for the mesh itself (interaction driven by window pointer, not raycasting) so buttons remain clickable.

Performance:

- Cap DPR at `[1, 1.5]` on `<Canvas dpr={[1, 1.5]}>`.
- `frameloop="always"` while visible; use `IntersectionObserver` to pause when Hero scrolls out.
- Geometry generated once via `useMemo`; shader compiled once.

Accessibility / fallbacks:

- Respect `prefers-reduced-motion`: disable cursor tilt and traveling wave, keep only static strip with slow auto-rotate.
- Retain existing WebGL absence fallback (blank div, no crash).

## Out of scope

- No changes to Hero copy, CTA, socials, other sections, routing, or SEO tags.
- No new npm packages; no post-processing/bloom pass (keeps bundle small — the emissive + additive particles already deliver a glow feel).
