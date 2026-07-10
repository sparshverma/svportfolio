
# Plan: Tiled Möbius Strip + Performance Profiling

Recreate Igor Backstrom's Dribbble Möbius (dark scene, ring made of many small rectangular metallic tiles arranged along a twisted loop, warm copper on one face, cool teal/steel on the other, slow rotation with glinting highlights). Keep cursor reactivity from the current version but restyle geometry and materials to match. Add a real performance-profiling / adaptive-quality pass so it stays smooth on mobile and low-end GPUs.

## Visual target (from reference)

- Ring made of ~180-260 small flat rectangular tiles ("shingles") placed along a Möbius parametric path, each tile oriented to the local surface frame.
- Slight per-tile random offset in radius, rotation (±5°) and scale — gives the broken/scattered look at the edges.
- Two-tone material: warm copper (`#905429`/`#F3D46C`) on one side, cool teal/steel (`#325755`/`#576253`) on the other — single MeshStandardMaterial with vertex-color per tile face, or per-tile material index.
- Deep black background (`#010101`), single warm key light + cool rim light so tiles catch specular glints as ring rotates.
- Motion: slow continuous Y-rotation (~1 rev / 20s). Cursor gently tilts the whole ring (±10°) and boosts key-light intensity.

## Files

- `src/components/MobiusStrip.tsx` — rewrite geometry & materials:
  - Replace `ParametricGeometry` mesh with an `InstancedMesh` of a single `PlaneGeometry(tileW, tileH)`.
  - Compute N instance matrices along the Möbius parametrization: for each `u ∈ [0, 2π)` and one of a few `v` bands, build a TBN frame (tangent along `du`, normal via cross with `dv`) → `Matrix4.compose(position, quaternionFromBasis, scale)` with jitter.
  - Assign instance colors via `InstancedBufferAttribute` — front face copper, back face teal, sampled from a small palette per tile.
  - Material: `MeshStandardMaterial({ metalness: 0.85, roughness: 0.35, vertexColors: true, side: DoubleSide })`. Drop custom shader (heavier + doesn't match the physical/metal look).
  - Keep starfield but dim it (opacity 0.25) and switch color to warm off-white so it doesn't fight the palette. Optional on low-tier.
  - Keep cursor tilt + `prefers-reduced-motion` + `IntersectionObserver` pause + WebGL detection + `webglcontextlost` fallback.

- `src/components/Hero.tsx` — no structural change; only swap background gradient blobs' colors to warmer amber + teal to blend with new ring (single-line tweak, optional).

- `src/lib/perf/useAdaptiveQuality.ts` — new hook (performance profiling pass):
  - Detects device tier at mount:
    - `navigator.hardwareConcurrency`, `navigator.deviceMemory`, `matchMedia('(pointer: coarse)')`, `matchMedia('(max-width: 768px)')`, `prefers-reduced-motion`.
    - Reads `WEBGL_debug_renderer_info` unmasked renderer string; flags Adreno 3xx/4xx/5xx, Mali-4xx/T7xx, PowerVR SGX, Intel HD as `low`.
  - Runtime FPS monitor: rolling 60-frame average via `useFrame`; if avg < 45 fps for 2s, step tier down (`high → mid → low`); if stable > 55 fps for 5s at `mid`, step back up (one-way to `low`).
  - Exposes `{ tier, dpr, tileCount, enableStarfield, enableOrbitLight, shadows }`:
    - high: dpr `[1, 2]`, 260 tiles, starfield on, orbit light on
    - mid:  dpr `[1, 1.5]`, 180 tiles, starfield on, orbit light off
    - low:  dpr `[1, 1]`, 110 tiles, starfield off, orbit light off, cursor tilt disabled
  - `MobiusStrip.tsx` consumes hook to size instance count, DPR, and toggle extras. Instance count changes rebuild the `InstancedMesh` via a `useMemo` keyed on `tileCount`.

- `src/lib/perf/fpsMeter.ts` — tiny helper: `class FpsMeter { push(dt); avg(): number }` used by the hook.

## Verification loop

After implementation, drive Playwright headless against `http://localhost:8080/`:

1. Screenshot hero at 1280×1800 and at 390×844 (mobile). Save to `/tmp/browser/mobius/`.
2. Compare against `tool-results://fetched-websites/dribbble.com_shots_4600977-M-bius-strip.png` visually (structural: ring silhouette, tiled edge, warm+cool split, black background). Target ≥90% qualitative match on: (a) segmented tile ring shape, (b) two-tone metallic palette, (c) black background, (d) single ring dominant in frame.
3. Instrument: log `fpsMeter.avg()` at 3s and 8s via a `window.__mobiusFps` hook; assert ≥55 fps desktop, ≥30 fps in a throttled CPU 4× profile (Playwright CDP `Emulation.setCPUThrottlingRate`).
4. If visual match < 90% (missing tile look, wrong palette, no rim highlights), iterate on: tile count, tile aspect ratio, jitter amplitude, light angles, material metalness/roughness. Re-screenshot and recompare. Stop when both visual and FPS gates pass.

## Out of scope

- No new npm packages (three, r3f, drei already present).
- No changes to Hero copy, CTA, socials, nav, other sections, routing, SEO tags.
- No post-processing/bloom pass (metallic material + point lights handle glints; bloom cost hurts low tier).

## Technical notes

- `InstancedMesh` with 260 plane instances = 1 draw call, ~1040 tris — cheaper than current `ParametricGeometry(220×40)` ≈ 17.6k tris and custom shader.
- Möbius parametrization used per tile:
  ```
  x = (R + v·cos(u/2))·cos(u)
  y = (R + v·cos(u/2))·sin(u)
  z = v·sin(u/2)
  ```
  Tangent = ∂P/∂u, bitangent = ∂P/∂v, normal = tangent × bitangent → quaternion via `Matrix4.lookAt`.
- Instance colors: pack RGB in `InstancedBufferAttribute('color', 3)`, sample per tile from `[copperA, copperB, tealA, tealB]` weighted by `sign(cos(u/2))` (front/back face of the twisted band).
- FPS meter uses `performance.now()` deltas inside `useFrame`; avoids allocations (ring buffer of 60 floats).
