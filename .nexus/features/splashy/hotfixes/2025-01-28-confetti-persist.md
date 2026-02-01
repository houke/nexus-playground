# Hotfix: Particle System Issues

**Date**: 2025-01-28
**Severity**: Medium
**Reported By**: User
**Fixed By**: @software-developer

## Issues Fixed

### Issue 1: Confetti Particles Persist on Screen

**Problem**: Confetti particles on level completion persisted instead of fading out.

**Root Cause**: `render()` methods never called `clearRect()` between frames.

**Fix** (sparkle.ts):

- Added `ctx.clearRect()` at the start of `SparkleSystem.render()` and `ConfettiSystem.render()`
- Added canvas clearing in `clear()` methods
- Added `this.canvas.remove()` in `ConfettiSystem.destroy()`

### Issue 2: Sparkles Appear at Wrong Position (Offset)

**Problem**: Correct-tap sparkles appeared at wrong position due to CSS scaling mismatch.

**Root Cause (Part A)**: `emitSparkles()` calculated position as center of canvas, not clicked cell.

**Root Cause (Part B)**: Sparkle canvas CSS (`width: 100%; height: 100%`) stretched it to fill container, while game canvas was centered with `max-width/max-height`. This caused coordinate mismatch.

**Fix** (main.ts):

- Added `lastTapPosition` property to track clicked cell
- Updated `emitSparkles()` to calculate canvas coords from tapped cell

**Fix** (splashy.css):

- Changed `.canvas-container` to use CSS Grid (`display: grid; place-items: center`)
- Both canvases now share `grid-area: 1 / 1` to stack exactly on top of each other
- Both get same scaling via `max-width: 100%; max-height: 100%`

## Files Modified

| File                                       | Change                                             |
| ------------------------------------------ | -------------------------------------------------- |
| `experiments/splashy/particles/sparkle.ts` | Canvas clearing in render/clear/destroy            |
| `experiments/splashy/main.ts`              | Track tap position for sparkle emission            |
| `experiments/splashy/styles/splashy.css`   | CSS Grid overlay for pixel-perfect canvas stacking |

## Verification

- TypeScript: ✅ Compiles
- Lint: ✅ Passes
- Tests: ✅ 62 tests passing
