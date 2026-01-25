---
title: Snake Experiment
feature: snake
status: complete
created: 2026-01-24
last-updated: 2026-01-25
---

# Snake Experiment - Table of Contents

A classic arcade snake game with 5 visual styles (Nokia 3310, retro, neon, modern, WebGL 3D), 2-player mode, and PWA offline support.

## Plan Documents

- [Plan: 0001-nexus-playground-foundation-and-snake](../plan/0001-nexus-playground-foundation-and-snake.md) - Foundation plan including Snake game

## Execution Documents

_(Execution was part of initial development, no separate execution log)_

## Review Documents

- [Review: 0001-landing-page-ux-improvements](../review/0001-landing-page-ux-improvements.md) - Landing page UX fixes
- [Review: 0002-snake-game-ux-improvements](../review/0002-snake-game-ux-improvements.md) - Snake game UX improvements
- [Review: 0003-webgl-renderer-premium-overhaul](../review/0003-webgl-renderer-premium-overhaul.md) - WebGL 3D renderer overhaul

## Summary Documents

_(No summaries yet)_

## Timeline

| Date       | Type   | Document                                           | Author           |
| ---------- | ------ | -------------------------------------------------- | ---------------- |
| 2026-01-24 | Plan   | plan/0001-nexus-playground-foundation-and-snake.md | @tech-lead       |
| 2026-01-24 | Review | review/0001-landing-page-ux-improvements.md        | @ux-designer     |
| 2026-01-24 | Review | review/0002-snake-game-ux-improvements.md          | @qa-engineer     |
| 2026-01-24 | Review | review/0003-webgl-renderer-premium-overhaul.md     | @visual-designer |

## Related Files

### Source Code

- `experiments/snake/` - Main snake game directory
- `experiments/snake/game/engine.ts` - Game logic
- `experiments/snake/renderers/` - All 5 visual styles
- `experiments/snake/ui/` - Menu, HUD, settings screens

### Entry Points

- `experiments/snake/index.html` - Game entry point
- `experiments/snake/main.ts` - Application bootstrap
