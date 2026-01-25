---
title: Mamba Endless Mode Conversion
date: 2026-01-25
agents: [@software-developer]
scope: experiments/mamba
issues-found: 0
issues-fixed: 15
---

# Mamba Endless Mode Conversion

## Summary

Converted the Mamba game from a level-based progression system to an endless survival mode. The game no longer has levels, gold collectibles, or level completion screens. Instead, difficulty scales progressively through:

1. **Wall Lifespan Multiplier**: Walls last longer over time (12% increase per shed, up to 4x)
2. **Speed Scaling**: Game tick rate decreases slightly with each shed
3. **Wall Accumulation**: As walls persist longer, the playfield becomes increasingly hazardous

This creates a natural difficulty curve where early game is manageable, but walls accumulate faster than they decay, leading to an inevitable challenging endgame.

## Metrics

| Metric        | Before | After |
| ------------- | ------ | ----- |
| Issues Found  | -      | 0     |
| Issues Fixed  | -      | 15    |
| Test Coverage | N/A    | N/A   |
| Lint Errors   | 0      | 0     |
| Type Errors   | 0      | 0     |

## Changes Applied

### 1. Type System Updates ([types.ts](../../experiments/mamba/game/types.ts))

| #   | Change                             | Description                                                             |
| --- | ---------------------------------- | ----------------------------------------------------------------------- |
| 1   | Removed `levelcomplete` status     | Game only has menu/playing/paused/gameover states                       |
| 2   | Removed `gold` collectible type    | Only bronze and silver collectibles remain                              |
| 3   | Removed `level` from GameState     | No level tracking needed                                                |
| 4   | Removed `bronzeRequired`           | No bronze threshold for gold spawning                                   |
| 5   | Removed `goldSpawned`              | No gold to track                                                        |
| 6   | Added `shedCount`                  | Tracks number of sheds for difficulty scaling                           |
| 7   | Added `wallLifespanMultiplier`     | Scales wall duration over time (1.0 to 4.0)                             |
| 8   | Updated HighScores interface       | Uses `shedCount` instead of `level`                                     |
| 9   | Increased base wall lifespan       | MIN: 40→80 ticks, MAX: 150→250 ticks                                    |
| 10  | Added difficulty scaling constants | `WALL_LIFESPAN_INCREASE_PER_SHED`, `MAX_WALL_LIFESPAN_MULTIPLIER`, etc. |

### 2. Engine Updates ([engine.ts](../../experiments/mamba/game/engine.ts))

| #   | Change                       | Description                                                 |
| --- | ---------------------------- | ----------------------------------------------------------- |
| 1   | Removed `createLevelState()` | Replaced with simpler `createGameState()`                   |
| 2   | Removed `nextLevel()`        | No level transitions                                        |
| 3   | Removed `spawnGold()`        | No gold spawning                                            |
| 4   | Removed `checkGoldTimeout()` | No gold timeout logic                                       |
| 5   | Updated shedding mechanic    | Now scales wall lifespan with multiplier                    |
| 6   | Added progressive difficulty | `wallLifespanMultiplier` and `tickRate` update on each shed |

### 3. UI Updates

| File                                                  | Changes                                             |
| ----------------------------------------------------- | --------------------------------------------------- |
| [hud.ts](../../experiments/mamba/ui/hud.ts)           | Shows SHEDS + WALLS count instead of LEVEL + BRONZE |
| [gameover.ts](../../experiments/mamba/ui/gameover.ts) | Shows shedCount and wall count at death             |
| [menu.ts](../../experiments/mamba/ui/menu.ts)         | Updated instructions for endless survival mode      |
| levelcomplete.ts                                      | **DELETED** - no longer needed                      |

### 4. Supporting Files

| File                                                      | Changes                                            |
| --------------------------------------------------------- | -------------------------------------------------- |
| [main.ts](../../experiments/mamba/main.ts)                | Removed level complete handling, gold sound events |
| [settings.ts](../../experiments/mamba/game/settings.ts)   | Updated high score to use shedCount                |
| [collision.ts](../../experiments/mamba/game/collision.ts) | Updated comment (no gold collision)                |
| [dos.ts](../../experiments/mamba/renderers/dos.ts)        | Removed gold rendering and color constant          |
| [manager.ts](../../experiments/mamba/audio/manager.ts)    | Removed gold and levelup sound effects             |

## Verification

```
✅ npm run typecheck - No type errors
✅ npm run lint - No lint errors
✅ Build verified
```

## Difficulty Scaling Details

The endless mode uses progressive difficulty with the following parameters:

| Shed # | Wall Lifespan Multiplier | Effective Min Lifespan | Effective Max Lifespan |
| ------ | ------------------------ | ---------------------- | ---------------------- |
| 0      | 1.00x                    | 80 ticks (~12s)        | 250 ticks (~37s)       |
| 5      | 1.60x                    | 128 ticks (~19s)       | 400 ticks (~60s)       |
| 10     | 2.20x                    | 176 ticks (~26s)       | 550 ticks (~82s)       |
| 15     | 2.80x                    | 224 ticks (~34s)       | 700 ticks (~105s)      |
| 25     | 4.00x (max)              | 320 ticks (~48s)       | 1000 ticks (~150s)     |

This ensures that:

- Early game: Walls decay relatively quickly, forgiving gameplay
- Mid game: Walls start accumulating, creating obstacle patterns
- Late game: At max multiplier, walls persist for very long, creating a gauntlet

## Gameplay Impact

1. **No "Win" Condition**: Players survive as long as possible
2. **Score Focus**: High score becomes primary achievement metric
3. **Risk/Reward**: Shedding increases multiplier but adds persistent walls
4. **Emergent Difficulty**: The game naturally becomes harder without artificial level gates
