---
title: Mamba Experiment Implementation
date: 2026-01-24
agents: ['@software-developer', '@visual-designer']
plan-ref: .nexus/plan/0002-mamba-experiment.md
status: completed
---

# Mamba Experiment Implementation

## Summary

Implemented the core Mamba game experiment - a faithful recreation of the classic 1989 DOS game. The implementation follows the established patterns from the Snake experiment while introducing the unique wall-trail mechanic where the mamba leaves permanent walls that age over time and transform into collectible bonus items.

The game features DOS-authentic CGA-style visuals with a phosphor amber color scheme, PC speaker-style sound effects using Web Audio API, and responsive controls for both keyboard and touch devices.

## Work Items Completed

### Phase 1: Foundation

- [x] Created `experiments/mamba/` directory structure
- [x] Added Mamba entry point to Vite config
- [x] Defined core types in `game/types.ts`
- [x] Set up HTML entry point with DOS-style fonts

### Phase 2: Core Implementation

- [x] Implemented `MambaEngine` with game loop and state machine
- [x] Implemented wall aging system (solid → collectible transformation)
- [x] Implemented O(1) collision detection with Map-based spatial index
- [x] Implemented scoring system with level multipliers
- [x] Implemented level progression

### Phase 3: Rendering & UI

- [x] Implemented `DOSRenderer` with CGA color palette
- [x] Added scanline CRT effect
- [x] Created Menu UI with how-to-play instructions
- [x] Created HUD with score, level, and egg counter
- [x] Created Game Over screen with high score tracking
- [x] Created Level Complete screen
- [x] Created Settings screen (sound toggle, volume)

### Phase 4: Polish

- [x] Implemented PC speaker-style sound effects
- [x] Added touch controls for mobile
- [x] Added keyboard shortcuts (WASD, arrows, space, escape)
- [x] Implemented local storage for settings and high scores

## Agent Contributions

### @software-developer

- Core game engine with tick-based timing
- Input controller with keyboard and touch support
- Settings manager with localStorage persistence
- Audio manager with Web Audio API synthesis

### @visual-designer

- DOS-authentic CGA color palette
- VT323 monospace font for authentic look
- Scanline CRT effect
- Mamba head with directional eyes

## Verification Results

```
✓ npm run typecheck - No type errors
✓ npm run build - Successfully builds with all 3 entry points (main, snake, mamba)
```

Note: Pre-existing lint error in `src/components/landing/LandingPage.ts` (IntersectionObserver) is unrelated to Mamba implementation.

## Files Created

```
experiments/mamba/
├── index.html              # Entry point HTML
├── main.ts                 # Bootstrap, canvas setup, game loop
├── game/
│   ├── types.ts            # Core interfaces, constants
│   ├── engine.ts           # MambaEngine class, game loop
│   ├── collision.ts        # Collision detection
│   ├── input.ts            # Keyboard/touch input
│   └── settings.ts         # User preferences, high scores
├── renderers/
│   ├── index.ts            # Renderer factory
│   └── dos.ts              # DOS-authentic renderer
├── audio/
│   └── manager.ts          # PC speaker style sounds
├── ui/
│   ├── menu.ts             # Main menu
│   ├── hud.ts              # Score, level display
│   ├── gameover.ts         # Game over screen
│   ├── levelcomplete.ts    # Level complete screen
│   └── settings.ts         # Settings screen
└── styles/
    └── mamba.css           # DOS-style CSS

vite.config.ts              # Updated with mamba entry point
```

## Outstanding Items

The following items from the plan require additional work:

- [ ] Unit tests for wall system (TEST-001)
- [ ] E2E tests for gameplay (TEST-002)
- [ ] Accessibility audit (TEST-003)
- [ ] Performance testing with 500+ walls (TEST-004)
- [ ] Code review (REVIEW-001)
- [ ] Security checklist verification (SECURITY-001)

## Issues & Resolutions

1. **TypeScript strict null checks** - Fixed `scores.scores[0]` access by adding proper null checks
2. **Wall aging loop** - Changed from `for...of` entries to `values()` to avoid unused key variable
3. **Performance timing** - Used `Date.now()` instead of `performance.now()` for broader compatibility

## Access URL

After deployment: `https://<user>.github.io/nexus-playground/experiments/mamba/`

For local development: `http://localhost:3000/nexus-playground/experiments/mamba/`
