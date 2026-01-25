---
title: 'Beast Experiment - Review & Fix Report'
date: '2026-01-25'
agents: ['@ux-designer', '@software-developer', '@qa-engineer']
scope: 'experiments/beast/'
issues-found: 2
issues-fixed: 2
---

# Beast Experiment - Review & Fix Report

## Summary

This review focused on two user-reported issues with the Beast game experiment: viewport overflow causing scrollbars, and the lack of a help overlay to explain game controls. Both issues were identified, fixed, and verified.

The viewport issue was caused by missing global CSS resets and insufficient flex container constraints. The help overlay was entirely missing from the initial implementation.

All fixes pass typecheck, lint, and build verification.

## Metrics

| Metric       | Before | After |
| ------------ | ------ | ----- |
| Issues Found | —      | 2     |
| Issues Fixed | —      | 2     |
| Lint Errors  | 0      | 0     |
| Type Errors  | 0      | 0     |
| Build Status | ✅     | ✅    |

---

## Agent Review & Fix Reports

### @ux-designer

**Focus Areas**: User experience, accessibility, controls discoverability

#### Issues Found

| #   | Issue                          | Severity | File               |
| --- | ------------------------------ | -------- | ------------------ |
| 1   | No help/tutorial for new users | High     | experiments/beast/ |
| 2   | Game controls not discoverable | Medium   | ui/hud.ts          |

#### Fixes Applied

| #   | Fix Description                                             | Files Changed                |
| --- | ----------------------------------------------------------- | ---------------------------- |
| 1   | Created comprehensive help overlay explaining all mechanics | ui/help.ts, styles/beast.css |
| 2   | Added ? button to HUD for quick help access                 | ui/hud.ts, styles/beast.css  |

**Help Overlay Features:**

- Explains objective (crush beasts by pushing blocks)
- Shows all character types with ASCII glyphs and descriptions
- Shows all block types with functions
- Lists all keyboard controls (WASD, arrows, diagonals)
- Provides gameplay tips
- Accessible via ? or H key, or HUD button
- Closes with Escape, ?, H, or clicking outside

#### Verification

- Tests: N/A (no tests for this experiment)
- Lint: ✅ Clean
- Types: ✅ Clean

---

### @software-developer

**Focus Areas**: Implementation, code quality, TypeScript correctness

#### Issues Found

| #   | Issue                                | Severity | File          |
| --- | ------------------------------------ | -------- | ------------- |
| 1   | Input controller missing help action | Medium   | game/input.ts |
| 2   | Main.ts missing help integration     | Medium   | main.ts       |

#### Fixes Applied

| #   | Fix Description                                     | Files Changed      |
| --- | --------------------------------------------------- | ------------------ |
| 1   | Added 'help' action type and key handlers (?, H)    | game/input.ts      |
| 2   | Imported help component, added showHelpOverlay()    | main.ts            |
| 3   | Updated setupHUDListeners to accept onHelp callback | ui/hud.ts, main.ts |

**Implementation Details:**

- Extended `ActionCallback` type to include `'help'` action
- Added keydown handlers for `?`, `h`, `H` keys
- Space bar now also pauses (was missing)
- Help overlay pauses game automatically when opened
- Help overlay resumes game when closed (if was playing)

#### Verification

- Tests: N/A
- Lint: ✅ Clean
- Types: ✅ Clean

---

### @qa-engineer

**Focus Areas**: Viewport, layout, cross-browser compatibility

#### Issues Found

| #   | Issue                       | Severity | File             |
| --- | --------------------------- | -------- | ---------------- |
| 1   | Page has vertical scrollbar | High     | styles/beast.css |
| 2   | Content overflows viewport  | High     | styles/beast.css |

#### Fixes Applied

| #   | Fix Description                                      | Files Changed    |
| --- | ---------------------------------------------------- | ---------------- |
| 1   | Added global CSS reset with box-sizing: border-box   | styles/beast.css |
| 2   | Added overflow: hidden to html/body                  | styles/beast.css |
| 3   | Added max-height: 100dvh to #game-root               | styles/beast.css |
| 4   | Added min-height: 0 to flex containers for shrinking | styles/beast.css |
| 5   | Added max-width/max-height: 100% to canvas           | styles/beast.css |
| 6   | Reduced canvas padding from 1rem to 0.5rem           | styles/beast.css |

**CSS Changes Summary:**

```css
/* Added global reset */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* Added to flex containers */
.beast-game,
.beast-canvas-container {
  min-height: 0; /* Allow flex shrinking */
  overflow: hidden;
}

/* Canvas containment */
#game-canvas {
  max-width: 100%;
  max-height: 100%;
}
```

#### Verification

- Layout: ✅ No scrollbars
- Lint: ✅ Clean
- Types: ✅ Clean
- Build: ✅ Passes

---

## Files Changed

| File                               | Action   | Description                             |
| ---------------------------------- | -------- | --------------------------------------- |
| experiments/beast/styles/beast.css | Modified | Viewport fixes, help overlay styles     |
| experiments/beast/ui/help.ts       | Created  | New help overlay component              |
| experiments/beast/ui/hud.ts        | Modified | Added help button, updated listeners    |
| experiments/beast/game/input.ts    | Modified | Added help action type and key handlers |
| experiments/beast/main.ts          | Modified | Integrated help overlay                 |

---

## Common Themes

1. **Missing User Onboarding**: The game launched straight into gameplay without explaining controls or mechanics
2. **CSS Viewport Handling**: Flex layouts need explicit `min-height: 0` and `overflow: hidden` to prevent content overflow

---

## Remaining Action Items

None. All identified issues have been fixed.

---

## Verification Summary

```
✅ npm run typecheck - No errors
✅ npm run lint - No warnings
✅ npm run build - Successful (70 modules, 910ms)
```

## Plan Completion

Plan [0003-beast-experiment](../plan/0003-beast-experiment.md) remains complete - this review addressed post-implementation polish issues.
