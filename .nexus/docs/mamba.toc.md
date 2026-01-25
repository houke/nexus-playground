---
title: Mamba Experiment
feature: mamba
status: complete
created: 2026-01-24
last-updated: 2026-01-25
---

# Mamba Experiment - Table of Contents

An endless survival web recreation inspired by the classic 1989 DOS game Mamba by Bert Uffen. Features the unique wall-trail mechanic where the snake leaves permanent walls that age over time and transform into collectible gems. Difficulty scales progressively as walls accumulate faster than they decay.

## Plan Documents

- [Plan: 0002-mamba-experiment](../plan/0002-mamba-experiment.md) - Mamba game implementation plan

## Execution Documents

- [Execution: 0001-mamba-implementation](../execution/0001-mamba-implementation.md) - Implementation tracking

## Review Documents

- [Review: 0001-mamba-review](../review/0001-mamba-review.md) - Mamba code review
- [Review: 0005-mamba-endless-mode](../review/0005-mamba-endless-mode.md) - Endless mode conversion - Created 2026-01-25

## Summary Documents

_(No summaries yet)_

## Timeline

| Date       | Type      | Document                               | Author              |
| ---------- | --------- | -------------------------------------- | ------------------- |
| 2026-01-24 | Plan      | plan/0002-mamba-experiment.md          | @tech-lead          |
| 2026-01-24 | Execution | execution/0001-mamba-implementation.md | @software-developer |
| 2026-01-24 | Review    | review/0001-mamba-review.md            | @qa-engineer        |
| 2026-01-25 | Review    | review/0005-mamba-endless-mode.md      | @software-developer |

## Related Files

### Source Code

- `experiments/mamba/` - Main mamba game directory
- `experiments/mamba/game/engine.ts` - Game loop and state machine
- `experiments/mamba/game/types.ts` - Type definitions and constants
- `experiments/mamba/game/collision.ts` - Collision detection
- `experiments/mamba/renderers/dos.ts` - DOS-style CGA renderer
- `experiments/mamba/ui/` - Menu, HUD, game over screens

### Entry Points

- `experiments/mamba/index.html` - Game entry point
- `experiments/mamba/main.ts` - Application bootstrap
