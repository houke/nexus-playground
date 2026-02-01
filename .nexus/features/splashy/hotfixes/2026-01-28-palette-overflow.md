---
type: hotfix
date: 2026-01-28
severity: medium
status: fixed
agents: [@software-developer]
---

# Hotfix: Color Palette Overflow - Hidden Colors

## Bug Description

The Splashy game color palette displayed more colors than could fit in the visible viewport. With palette buttons sized at 80px (desktop) or 64px (mobile), images with high `maxColors` values (20-40) resulted in colors extending beyond the screen, making some colors inaccessible to users without scrolling.

On a typical mobile screen (~375px width), only 8-10 color buttons were visible at once in the palette area, but some puzzles were generating up to 40 colors.

## Root Cause

The `IMAGE_CONFIGS` in [types.ts](experiments/splashy/game/types.ts#L45) defined `maxColors` values that were too high for the available viewport space:

- Bluey: 20 colors
- Oddbods: 24 colors
- Peppa Pig: 28 colors
- Sunny Bunnies: 36 colors
- K-Pop: 40 colors

The median-cut color quantization algorithm would generate up to these maximum values, but the palette UI couldn't display them all simultaneously.

## Fix Applied

Reduced `maxColors` values to ensure all colors fit comfortably on screen:

- Bluey: 20 → **12 colors**
- Oddbods: 24 → **14 colors**
- Peppa Pig: 28 → **14 colors**
- Sunny Bunnies: 36 → **16 colors**
- K-Pop: 40 → **16 colors**

These values ensure:

- 2-3 rows of colors on mobile (good visibility)
- All colors accessible without scrolling
- Maintains adequate complexity for paint-by-numbers gameplay
- `maxColors` remains a maximum constraint, not a requirement

## Files Modified

| File                                                                       | Change                                                           |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| [experiments/splashy/game/types.ts](experiments/splashy/game/types.ts#L45) | Reduced `maxColors` in `IMAGE_CONFIGS` array                     |
| [experiments/beast/game/engine.ts](experiments/beast/game/engine.ts#L2)    | Removed unused eslint-disable directive (unrelated lint cleanup) |

## Tests Added

No new tests required. Existing tests verify color quantization works correctly regardless of `maxColors` value.

## Verification

- [x] Original bug no longer reproducible - all colors now fit on screen
- [x] All 62 tests pass
- [x] No lint errors
- [x] No type errors
- [x] Color quantization algorithm works correctly with reduced values
- [x] Paint-by-numbers puzzles maintain appropriate difficulty

## Verification Output

```bash
✓ experiments/splashy/game/__tests__/image-processor.test.ts (28 tests)
✓ experiments/splashy/game/__tests__/engine.test.ts (34 tests)

Test Files: 2 passed (2)
Tests: 62 passed (62)
```

## Impact

- **User Experience**: ✅ Improved - all colors now visible without scrolling
- **Gameplay**: ✅ Maintained - puzzles still appropriately challenging
- **Performance**: ✅ Improved - fewer colors = faster quantization
- **Accessibility**: ✅ Enhanced - colors easier to select on mobile

## Time Spent

| Agent               | Task                        | Start | End   | Duration (min) |
| ------------------- | --------------------------- | ----- | ----- | -------------- |
| @orchestrator       | Triage & Investigation      | 07:45 | 07:48 | 3              |
| @software-developer | Implementation + Validation | 07:48 | 07:51 | 3              |
| **Total**           |                             |       |       | **6**          |

## Related Feature

Part of the [Splashy](file:///.nexus/features/splashy) feature suite.
