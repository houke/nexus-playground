---
title: 'Mamba - Consolidated Code Review & Fix Reports'
date: '2026-01-25'
agents:
  [
    '@tech-lead',
    '@qa-engineer',
    '@security',
    '@ux-designer',
    '@visual-designer',
    '@software-developer',
  ]
scope: Mamba experiment review & endless mode conversion
issues-found: 8
issues-fixed: 23
status: complete
---

# Mamba - Consolidated Code Review & Fix Reports

This document consolidates multiple review sessions for the Mamba game experiment.

---

## Review 1: Mamba Experiment Code Review

### Summary

Covered the complete Mamba game implementation across 15 new files in `experiments/mamba/` plus integration with the landing page. Review conducted from multiple agent perspectives: tech-lead (code quality), qa-engineer (testing/accessibility), security (vulnerabilities), ux-designer (interactions), and visual-designer (polish).

**Key outcomes:**

- 8 issues identified and fixed
- Accessibility significantly improved with ARIA attributes across all UI components
- Pre-existing lint errors in unrelated files cleaned up
- Mamba successfully added to landing page experiments section

### Metrics

| Metric          | Before | After |
| --------------- | ------ | ----- |
| Issues Found    | -      | 8     |
| Issues Fixed    | -      | 8     |
| Lint Errors     | 8      | 0     |
| A11y Attributes | 2      | 18+   |

### Issues Fixed

#### @tech-lead

1. Fixed pre-existing lint error: IntersectionObserver undefined (LandingPage.ts)
2. Removed development artifact files (webgl-new.ts, webgl.ts.backup)

#### @qa-engineer - Accessibility

3. Game over dialog: Added `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `role="alert"` for high score
4. Level complete dialog: Added `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `autofocus` on continue
5. HUD: Added `role="status"`, `aria-live="polite"`, `aria-label` for score/level/eggs
6. Menu buttons: Added `type="button"`, `autofocus`, `aria-hidden` for decorative elements

#### @security

7. Verified all dynamic values are numbers from internal state, not user input - SAFE

#### @ux-designer

8. Added `autofocus` attribute to START GAME button

### Files Modified

- src/components/landing/LandingPage.ts
- experiments/mamba/ui/gameover.ts
- experiments/mamba/ui/levelcomplete.ts
- experiments/mamba/ui/hud.ts
- experiments/mamba/ui/menu.ts
- snake/renderers/webgl-new.ts (deleted)
- snake/renderers/webgl.ts.backup (deleted)

---

## Review 2: Mamba Endless Mode Conversion

### Summary

Converted the Mamba game from a level-based progression system to an endless survival mode. The game no longer has levels, gold collectibles, or level completion screens. Instead, difficulty scales progressively through wall lifespan, speed, and accumulation.

### Metrics

| Metric       | Before | After |
| ------------ | ------ | ----- |
| Issues Found | -      | 0     |
| Issues Fixed | -      | 15    |
| Lint Errors  | 0      | 0     |
| Type Errors  | 0      | 0     |

### Changes Applied

#### Type System Updates (types.ts)

- Removed `levelcomplete` status
- Removed `gold` collectible type
- Removed `level` from GameState
- Added `shedCount` for difficulty scaling
- Added `wallLifespanMultiplier` (1.0 to 4.0)
- Increased base wall lifespan: MIN: 40→80 ticks, MAX: 150→250 ticks

#### Engine Updates (engine.ts)

- Removed `createLevelState()`, replaced with `createGameState()`
- Removed `nextLevel()`, `spawnGold()`, `checkGoldTimeout()`
- Updated shedding mechanic to scale wall lifespan with multiplier
- Added progressive difficulty through `wallLifespanMultiplier` and `tickRate`

#### UI Updates

- HUD: Shows SHEDS + WALLS count instead of LEVEL + BRONZE
- Game Over: Shows shedCount and wall count at death
- Menu: Updated instructions for endless survival mode
- Deleted levelcomplete.ts (no longer needed)

### Difficulty Scaling

| Shed # | Wall Lifespan Multiplier | Effective Min Lifespan | Effective Max Lifespan |
| ------ | ------------------------ | ---------------------- | ---------------------- |
| 0      | 1.00x                    | 80 ticks (~12s)        | 250 ticks (~37s)       |
| 5      | 1.60x                    | 128 ticks (~19s)       | 400 ticks (~60s)       |
| 10     | 2.20x                    | 176 ticks (~26s)       | 550 ticks (~82s)       |
| 15     | 2.80x                    | 224 ticks (~34s)       | 700 ticks (~105s)      |
| 25     | 4.00x (max)              | 320 ticks (~48s)       | 1000 ticks (~150s)     |

### Gameplay Impact

1. **No "Win" Condition**: Players survive as long as possible
2. **Score Focus**: High score becomes primary achievement metric
3. **Risk/Reward**: Shedding increases multiplier but adds persistent walls
4. **Emergent Difficulty**: Game naturally becomes harder without artificial level gates

### Files Modified

- experiments/mamba/game/types.ts
- experiments/mamba/game/engine.ts
- experiments/mamba/ui/hud.ts
- experiments/mamba/ui/gameover.ts
- experiments/mamba/ui/menu.ts
- experiments/mamba/ui/levelcomplete.ts (DELETED)
- experiments/mamba/main.ts
- experiments/mamba/game/settings.ts
- experiments/mamba/game/collision.ts
- experiments/mamba/renderers/dos.ts
- experiments/mamba/audio/manager.ts

---

## Common Themes

1. **Accessibility was underdeveloped** - All UI components needed ARIA attributes
2. **Button semantics** - Missing `type="button"` is a common oversight
3. **Development artifacts** - Backup and WIP files should be gitignored
4. **Progressive difficulty** - Natural scaling creates better player experience

---

## Verification

```bash
npm run lint       # ✅ Passed
npm run typecheck  # ✅ Passed
npm run build      # ✅ Passed
```
