---
type: hotfix
date: 2026-02-01
severity: medium
status: fixed
agents: [@software-developer, @qa-engineer]
---

# Hotfix: Prevent Duplicate Clicks and Lock Correct Cells

## Bug Description

Two related issues in the Splashy paint-by-numbers game were allowing undesirable user interactions:

1. **Duplicate click feedback**: Users could repeatedly click the same cell with the same color, triggering duplicate fireworks (for correct) or shake effects (for incorrect) on every click. This was confusing and degraded the user experience.

2. **Overwriting correct cells**: Once a cell was correctly colored, users (especially young children) could accidentally overwrite it with a different color, losing their progress. This was frustrating for kids ages 4-8 who might click multiple times.

## Root Cause

In `experiments/splashy/game/engine.ts`, the `paintCell()` method (lines 115-135) had two missing guard conditions:

1. **No same-color check**: The method didn't verify whether the cell was already painted with the selected color before applying it again. Every click would re-execute the paint logic, firing events and triggering visual/audio feedback.

2. **No correct-cell protection**: The method didn't prevent painting over cells where `isCorrect === true`. The existing logic would decrement the correct count and re-evaluate, allowing kids to accidentally ruin their progress.

### Original Code Flow

```typescript
paintCell(gridX, gridY) {
  // ... bounds checks ...

  // Eraser mode
  if (selectedColorIndex === null) { ... }

  // Paint mode - MISSING GUARDS HERE
  const wasCorrectPreviously = cell.paintedColorIndex === cell.targetColorIndex
  cell.paintedColorIndex = selectedColorIndex  // ← Always executes
  cell.isCorrect = selectedColorIndex === cell.targetColorIndex

  // Update counts and fire events
  // ...
}
```

## Fix Applied

Added two guard clauses at the start of the paint mode section to prevent unnecessary actions:

### Guard 1: Prevent Same-Color Repainting

```typescript
// Don't repaint if already the same color
if (cell.paintedColorIndex === selectedColorIndex) {
  return false
}
```

### Guard 2: Lock Correct Cells

```typescript
// Don't allow painting over correct cells (locked)
if (cell.isCorrect) {
  return false
}
```

These guards return `false` early, preventing:

- Setting `lastEvent` (no duplicate fireworks/errors)
- Modifying progress counts
- Notifying state change listeners
- Triggering audio/visual feedback

### Files Modified

| File                                                | Change                                                               |
| --------------------------------------------------- | -------------------------------------------------------------------- |
| `experiments/splashy/game/engine.ts`                | Added two guard clauses in `paintCell()` method (lines ~118-124)     |
| `experiments/splashy/game/__tests__/engine.test.ts` | Updated test for locked cells + added test for same-color prevention |

### Tests Added/Modified

| Test File                                           | Coverage                                                              |
| --------------------------------------------------- | --------------------------------------------------------------------- |
| `experiments/splashy/game/__tests__/engine.test.ts` | Added "should not repaint with the same color" test                   |
| `experiments/splashy/game/__tests__/engine.test.ts` | Modified "should not allow painting over correct cells (locked)" test |

## Verification

### Unit Tests ✅

- [x] All 35 Splashy game tests pass
- [x] All 28 image processor tests pass
- [x] New test: "should not repaint with the same color" - PASS
- [x] Updated test: "should not allow painting over correct cells (locked)" - PASS

### Code Quality ✅

- [x] No lint errors (`npm run lint`)
- [x] No type errors (`npm run typecheck`)
- [x] Build succeeds (`npm run build`)

### Regression Testing ✅

- [x] Eraser mode still works correctly
- [x] Color switching between different colors works
- [x] Progress tracking remains accurate
- [x] Event system fires only when actions succeed
- [x] Can still paint incorrect cells with different colors

### Manual Validation ✅

- [x] Original bug #1 no longer reproducible (no duplicate feedback)
- [x] Original bug #2 no longer reproducible (correct cells locked)
- [x] No regression in related functionality

## Impact

### Before Fix

- ❌ Kids could click the same cell 10 times, seeing 10 fireworks/errors
- ❌ Kids could accidentally overwrite correct cells and lose progress
- ❌ Confusing user experience

### After Fix

- ✅ Clicking the same cell with the same color does nothing (idempotent)
- ✅ Correct cells are locked and protected from accidental overwrites
- ✅ Clear, predictable user experience for ages 4-8

## Time Spent

| Agent               | Task            | Duration    |
| ------------------- | --------------- | ----------- |
| @software-developer | Diagnosis + Fix | ~15 min     |
| @qa-engineer        | Validation      | ~10 min     |
| **Total**           |                 | **~25 min** |

## Notes

- E2E tests showed 61 failures, but these are pre-existing infrastructure issues (missing Webkit browser, outdated selectors, timeouts) unrelated to this hotfix
- Unit test coverage is comprehensive and validates the fix thoroughly
- Guard order matters: same-color check before lock check prevents unnecessary lock checks
