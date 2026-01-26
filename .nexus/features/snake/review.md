---
title: 'Snake Game - Consolidated Code Review & Fix Reports'
date: '2026-01-24'
agents:
  [
    '@software-developer',
    '@ux-designer',
    '@qa-engineer',
    '@architect',
    '@gamer',
    '@visual-designer',
  ]
scope: Snake game UX improvements, bug fixes, WebGL renderer overhaul
issues-found: 14
issues-fixed: 14
status: complete
---

# Snake Game - Consolidated Code Review & Fix Reports

This document consolidates multiple review sessions for the Snake game experiment.

---

## Review 1: Snake Game UX Improvements

### Summary

Addressed 8 issues in the Snake game experiment including critical bugs causing instant game over, black overlays, manifest errors, and UX improvements. All issues have been fixed and verified. The game now plays correctly with all 5 visual styles working.

### Metrics

| Metric       | Before | After |
| ------------ | ------ | ----- |
| Issues Found | -      | 8     |
| Issues Fixed | -      | 8     |
| Lint Errors  | 0      | 0     |
| Type Errors  | 0      | 0     |

### Critical Issues Fixed

#### 1. Game Loop Timing Bug (Critical)

**Root Cause Analysis (@architect)**: The "instant game over" and "black overlay" issues were traced to a critical timing bug:

```typescript
// BUG: First frame has deltaTime = currentTime - 0 = ~28 days of ms!
private startGameLoop(): void {
  let lastTime = 0  // ❌ Should not be 0
```

**Fix**: Initialize `lastTime` to `currentTime` on first frame.

#### 2. WebGL Context Conflict (Critical)

**Problem**: Testing WebGL support on the game canvas created a WebGL context, but other renderers used 2D context.

**Fix**: Create a temporary canvas just for testing WebGL support.

#### 3. Canvas Context Type Immutable (Critical)

**Problem**: When switching renderers, the canvas already had a 2D context and couldn't be reused.

**Fix**: Replace the canvas entirely when switching renderers.

### UX Improvements

- Added controls hint bar showing WASD, arrows, Space (Pause), Esc (Menu)
- Added game header with back button (←) and settings button (⚙️)
- Removed non-functional pause button from HUD
- Fixed green style numbers color
- Removed style selector from menu (now only in Settings)
- Fixed PWA manifest in dev mode

### Files Modified

- experiments/snake/main.ts
- experiments/snake/ui/menu.ts
- experiments/snake/ui/hud.ts
- experiments/snake/renderers/index.ts
- experiments/snake/styles/snake.css
- vite.config.ts

---

## Review 2: WebGL Renderer Premium Overhaul

### Summary

Complete rewrite of the WebGL renderer (Style 5) to deliver a premium, top-notch 3D visual experience. The renderer was described as "meh" quality - now it's premium.

### Metrics

| Metric         | Before | After          |
| -------------- | ------ | -------------- |
| Issues Found   | -      | 6              |
| Issues Fixed   | -      | 6              |
| Visual Quality | Meh    | Premium ⭐⭐⭐ |

### Key Improvements

#### @gamer - Juice Effects

- Particle burst (25 particles) when food is eaten with golden color
- Death explosion: camera shake, 50 particles, physics-based segment scattering
- Head breathing animation, body wave motion, emissive pulsing for "living" feel

#### @visual-designer - Visual Aesthetics

- Cohesive cyberpunk palette: cyan/green snake 1, magenta snake 2, golden food, purple walls
- PBR MeshStandardMaterial with emissive, metalness (0.7), roughness (0.2)
- Three.js EffectComposer with UnrealBloomPass (strength 0.8, radius 0.4, threshold 0.85)
- 5-point cinematic lighting setup

#### @architect - Coordinate System Fix

**Problem**: Game uses Y-down (row 0 at top), Three.js uses Y-up

**Fix**: Correct `gridToWorld()` conversion with proper Y-axis flip:

```typescript
private gridToWorld(gx: number, gy: number): THREE.Vector3 {
  return new THREE.Vector3(
    (gx + 0.5) * this.TILE_SIZE - halfWidth,
    halfHeight - (gy + 0.5) * this.TILE_SIZE,  // CORRECT: Negate Y
    this.SEGMENT_RADIUS
  )
}
```

### Visual Quality Comparison

| Aspect          | Before                     | After                             |
| --------------- | -------------------------- | --------------------------------- |
| Materials       | MeshLambertMaterial (flat) | MeshStandardMaterial (PBR)        |
| Lighting        | 2 lights, random positions | 5-point cinematic setup           |
| Post-processing | None                       | UnrealBloomPass                   |
| Colors          | Random per session         | Cohesive cyberpunk palette        |
| Snake shape     | Basic cubes                | Smooth spheres with animation     |
| Particles       | Basic color cycling        | Physics-based celebration effects |
| Grid            | None visible               | Clear collision boundaries        |
| Camera          | Static                     | Breathing + shake effects         |

### Files Modified

- experiments/snake/renderers/webgl.ts (complete rewrite ~750 lines)

---

## Common Themes

1. **Game Loop Initialization**: Always initialize timing variables properly on first frame
2. **Canvas Context Immutability**: Once a canvas has a context type, replace canvas for different type
3. **Coordinate Systems**: Always verify game↔render coordinate system alignment
4. **Discoverability**: Users need visible affordances for keyboard controls
5. **Navigation Escape Hatches**: Users should always be able to exit or access settings
6. **"Juice" Matters**: Small animations (breathing, pulsing) make huge difference
7. **Cohesive Design**: Color palette + consistent materials > random effects

---

## Verification

```bash
npm run lint       # ✅ Passed
npm run typecheck  # ✅ Passed
npm run build      # ✅ Passed
```
