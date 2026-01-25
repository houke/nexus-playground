---
title: 'Mamba Experiment - DOS Classic Game Implementation'
date: 2026-01-24
type: new-feature
agents:
  [
    '@product-manager',
    '@architect',
    '@tech-lead',
    '@software-developer',
    '@ux-designer',
    '@visual-designer',
    '@qa-engineer',
    '@security',
    '@devops',
    '@gamer',
  ]
status: complete
---

# Mamba Experiment - DOS Classic Game Implementation

## 1. Executive Summary

> **What are we building and why?**

_(Owners: @product-manager, @tech-lead)_

### Vision

Mamba is a faithful web recreation of the classic DOS game from 1989, originally created by Bert Uffen. Unlike standard Snake clones, Mamba features a unique wall-trail mechanic where the snake leaves permanent walls that age over time and transform into collectible bonus items. This experiment brings nostalgic DOS-era gameplay to modern browsers while honoring the original's addictive simplicity.

The project leverages existing patterns from the Snake experiment while introducing novel state management challenges around wall aging, transformation timers, and multi-tier scoring systems.

### Success Criteria

- [ ] Authentic Mamba gameplay mechanics (wall trails, aging, transformation)
- [ ] DOS-era visual aesthetic with CGA/EGA color palette
- [ ] Performance maintained at 60fps with 500+ wall segments
- [ ] High score persistence across browser sessions
- [ ] Accessible via keyboard with screen reader announcements
- [ ] Zero runtime dependencies (vanilla TypeScript + Web APIs)

### Scope

| In Scope                                  | Out of Scope                   |
| ----------------------------------------- | ------------------------------ |
| Single-player Mamba gameplay              | Multiplayer mode               |
| Wall trail mechanic with aging            | Power-ups or special abilities |
| Level progression (increasing difficulty) | Custom level editor            |
| DOS-authentic visual theme                | Multiple visual themes (v1)    |
| Basic sound effects (PC speaker style)    | Background music               |
| High score leaderboard (local)            | Online leaderboards            |
| Keyboard + basic touch controls           | Gamepad support                |
| Desktop + mobile responsive               | Native mobile apps             |

---

## 2. Product Requirements

_(Owner: @product-manager)_

### User Stories

```
As a retro gamer,
I want to play a faithful recreation of Mamba,
So that I can relive the DOS gaming experience in my browser.

As a casual player,
I want simple pick-up-and-play mechanics,
So that I can enjoy quick gaming sessions without learning complex controls.

As a competitive player,
I want to see my score and high score,
So that I can track my improvement and challenge myself.
```

### Acceptance Criteria

#### Core Gameplay (Must Have)

- [ ] Mamba moves continuously in the current direction at level-appropriate speed
- [ ] Player changes direction using arrow keys (cannot reverse directly into self)
- [ ] Blue dots (eggs) spawn randomly; collecting one increases mamba length
- [ ] Movement leaves a permanent beige wall trail that persists until transformed
- [ ] Collision with walls (own trail or boundaries) ends the game
- [ ] Wall segments transform into green dots after configurable time delay (5-10 seconds)
- [ ] Green dots are collectible and award bonus points
- [ ] When all blue dots are collected, a poison-green block spawns
- [ ] Collecting the poison-green block completes the level

#### Scoring System (Must Have)

- [ ] Blue dots award `level × 1` points (capped at 10 points)
- [ ] Green dots award `level × 10` points (capped at 100 points)
- [ ] Poison-green block awards a random bonus value
- [ ] Current score displays prominently during gameplay
- [ ] High score persists across sessions (localStorage)

#### Level Progression (Must Have)

- [ ] Game starts at Level 1
- [ ] Each level increases mamba speed by ~5-10%
- [ ] Each level spawns more blue dots than previous
- [ ] Level number displays in HUD
- [ ] Brief transition screen between levels

### User Personas Affected

| Persona                  | Impact | Notes                                    |
| ------------------------ | ------ | ---------------------------------------- |
| Retro Enthusiast (35-50) | High   | Primary target - nostalgic for DOS era   |
| Casual Gamer (18-35)     | Medium | Quick pick-up-and-play appeal            |
| Completionist (25-40)    | Medium | Strategic depth in wall/dot optimization |

### Priority & Timeline

- **Priority**: P2 - Medium
- **Estimated Effort**: 4-6 days
- **Dependencies**: Existing Snake experiment patterns

---

## 3. Technical Architecture

_(Owner: @architect)_

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              MAMBA GAME SYSTEM                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                   │
│  │    Input     │───▶│    Game      │───▶│   Renderer   │                   │
│  │   Handler    │    │   Engine     │    │   Factory    │                   │
│  └──────────────┘    └──────┬───────┘    └──────────────┘                   │
│                             │                                               │
│         ┌───────────────────┼───────────────────┐                           │
│         ▼                   ▼                   ▼                           │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                   │
│  │    Mamba     │    │    Wall      │    │ Collectible  │                   │
│  │  Controller  │    │   Manager    │    │   Manager    │                   │
│  └──────────────┘    └──────┬───────┘    └──────────────┘                   │
│                             │                                               │
│                      ┌──────┴───────┐                                       │
│                      ▼              ▼                                       │
│               ┌──────────────┐  ┌──────────────┐                            │
│               │  Collision   │  │    Timer     │                            │
│               │   System     │  │   System     │                            │
│               └──────────────┘  └──────────────┘                            │
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                   │
│  │    Audio     │    │   Settings   │    │    Level     │                   │
│  │   Manager    │    │   Manager    │    │   Manager    │                   │
│  └──────────────┘    └──────────────┘    └──────────────┘                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Core Components

| Component            | Responsibility                               | New/Modified |
| -------------------- | -------------------------------------------- | ------------ |
| `MambaEngine`        | Game loop, state machine, tick management    | New          |
| `WallManager`        | Wall segment storage, aging, transformation  | New          |
| `CollectibleManager` | Egg/gem/poison spawning and tracking         | New          |
| `SpatialIndex`       | O(1) collision lookups for large wall counts | New          |
| `AudioManager`       | Sound effects (reuse pattern from Snake)     | Modified     |
| `InputHandler`       | Keyboard/touch input (reuse from Snake)      | Modified     |
| `DOSRenderer`        | CGA-authentic visual rendering               | New          |

### Data Model

```typescript
// Core Types
interface Position {
  readonly x: number
  readonly y: number
}

type Direction = 'up' | 'down' | 'left' | 'right'
type WallState = 'solid' | 'aging' | 'dot'
type CollectibleType = 'egg' | 'gem' | 'poison'
type GameStatus = 'menu' | 'playing' | 'paused' | 'levelcomplete' | 'gameover'

// Wall Segment
interface WallSegment {
  readonly position: Position
  state: WallState
  createdAt: number // Game tick when created
  transformsAt: number // Game tick when becomes collectible
}

// Game State
interface MambaState {
  readonly status: GameStatus
  readonly mamba: { head: Position; direction: Direction; length: number }
  readonly walls: Map<string, WallSegment> // Position key for O(1) lookup
  readonly collectibles: Collectible[]
  readonly score: number
  readonly level: number
  readonly currentTick: number
}
```

### State Machine: Wall Segment Lifecycle

```
[Mamba moves] ──▶ SPAWN (solid wall at vacated position)
                      │
                      │ transformsAt = currentTick + wallAgingTicks
                      ▼
               ┌──────────────┐
               │    SOLID     │ (blocks movement, collision = death)
               └──────┬───────┘
                      │
                      │ [currentTick >= transformsAt]
                      ▼
               ┌──────────────┐
               │ COLLECTIBLE  │ (passable, worth bonus points)
               └──────┬───────┘
                      │
                      │ [Mamba head overlaps]
                      ▼
                   REMOVED (score added)
```

### Key Design Decisions

| Decision        | Choice                     | Rationale                                  |
| --------------- | -------------------------- | ------------------------------------------ |
| Wall Storage    | `Map<string, WallSegment>` | O(1) collision lookup by position key      |
| Wall Aging      | Tick-based checking        | Avoids timer management complexity         |
| Rendering       | Full canvas redraw         | Simple, performant for this scale          |
| Collision Scope | Mamba head only            | Mamba leaves walls, doesn't self-intersect |

### Performance Constraints

- [ ] 60fps with up to 1000 wall segments
- [ ] Input latency < 50ms
- [ ] Memory usage < 50MB for extended sessions
- [ ] Page load < 2s on 3G

---

## 4. Implementation Specifications

_(Owner: @tech-lead)_

### Code Structure

```
experiments/mamba/
├── index.html              # Entry point HTML
├── main.ts                 # Bootstrap, canvas setup, game loop
├── game/
│   ├── types.ts            # Core interfaces, constants, enums
│   ├── engine.ts           # MambaEngine class, game loop, state machine
│   ├── wall-system.ts      # Wall aging, transformation, collection
│   ├── collision.ts        # Mamba-specific collision detection
│   ├── level.ts            # Level definitions, progression logic
│   └── settings.ts         # User preferences, defaults
├── renderers/
│   ├── index.ts            # Renderer factory
│   └── dos.ts              # DOS-authentic renderer (primary)
├── audio/
│   └── manager.ts          # Sound effects (PC speaker style)
├── ui/
│   ├── menu.ts             # Main menu
│   ├── hud.ts              # Score, level, lives display
│   └── gameover.ts         # Game over screen, high scores
└── styles/
    └── mamba.css           # Layout and styling
```

### Key Interfaces

```typescript
// Wall aging algorithm (pseudocode)
function processWallAging(walls: Map<string, WallSegment>, tick: number): void {
  for (const [key, wall] of walls) {
    if (wall.state === 'solid' && tick >= wall.transformsAt) {
      wall.state = 'collectible'
      // Trigger visual transformation
    }
  }
}

// Collision detection (O(1) with spatial index)
function checkCollision(head: Position, walls: Map<string, WallSegment>): boolean {
  const key = `${head.x},${head.y}`
  const wall = walls.get(key)
  return wall !== undefined && wall.state === 'solid'
}
```

### Coding Standards

| Pattern                 | Requirement                                 |
| ----------------------- | ------------------------------------------- |
| Immutable state updates | Use spread operators, never mutate directly |
| Tick-based timing       | All timing uses tick counts for determinism |
| TypeScript strict       | No `any` unless absolutely necessary        |
| Pure functions          | Game logic in testable pure functions       |
| Early returns           | Guard clauses to reduce nesting             |

### Reusable from Snake

| Module                   | Reuse Strategy            |
| ------------------------ | ------------------------- |
| `Position` interface     | Copy or extract to shared |
| `Direction` type         | Copy or extract to shared |
| Input handling pattern   | Adapt for single-player   |
| Audio manager base       | Extend with Mamba sounds  |
| Renderer interface shape | Different implementation  |

---

## 5. User Experience Design

_(Owner: @ux-designer)_

### User Flow

```
[Landing] → [Mamba Card] → [Main Menu] → [Start Game] → [Gameplay Loop]
                              │                              │
                              ├─ Settings                    ├─ Paused
                              └─ High Scores                 ├─ Level Complete
                                                             └─ Game Over → [High Score Entry]
```

### Wireframe: Gameplay Screen

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  SCORE: 2,340                LEVEL 03                      EGGS: 04/12      ║
╠══════════════════════════════════════════════════════════════════════════════╣
║    ████████████████████████████████████████████████████████████████████      ║
║    █                                                                  █      ║
║    █   ●                ██████                   ○                    █      ║
║    █  (egg)             █    █                (green)                 █      ║
║    █                    ██████                                        █      ║
║    █                       █                                          █      ║
║    █        ████████████████                                          █      ║
║    █        █         ■■■■■■■►                                        █      ║
║    █                  (mamba)            ●                            █      ║
║    █                                    (egg)                         █      ║
║    █   ○                                              ████████        █      ║
║    █ (green)                                                          █      ║
║    ████████████████████████████████████████████████████████████████████      ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  [←][↑][↓][→] or [WASD] Move        [SPACE] Pause        [ESC] Menu         ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

### Interaction Patterns

| Action       | Primary   | Alternative |
| ------------ | --------- | ----------- |
| Move Up      | `↑` Arrow | `W`         |
| Move Down    | `↓` Arrow | `S`         |
| Move Left    | `←` Arrow | `A`         |
| Move Right   | `→` Arrow | `D`         |
| Pause/Resume | `Space`   | `P`         |
| Quit to Menu | `Esc`     | —           |

### Accessibility Requirements

- [ ] Keyboard navigation for all menus
- [ ] Screen reader announcements for game events (ARIA live regions)
- [ ] `prefers-reduced-motion` support (disable screen shake, particle effects)
- [ ] High contrast mode support
- [ ] Touch targets ≥ 44×44px for mobile

---

## 6. Visual Design & Polish

_(Owner: @visual-designer)_

### Design Direction

**Mood:** Nostalgic authenticity meets refined craftsmanship. DOS game running on a well-maintained CRT monitor—crisp, glowing, warm.

**Guiding Principle:** _"If it couldn't render on a 286, it doesn't belong."_

### Typography

```
font-family: "IBM VGA 8x16", "Perfect DOS VGA 437", monospace;
```

All text uses `image-rendering: pixelated` to prevent anti-aliasing blur.

### Color Palette (CGA-Inspired)

| Name           | Hex       | Usage                      |
| -------------- | --------- | -------------------------- |
| Deep Black     | `#0C0C0C` | Background                 |
| Phosphor Amber | `#FFB000` | Primary UI text            |
| Terminal Green | `#33FF33` | Green dots, secondary text |
| CGA Cyan       | `#00AAAA` | Blue eggs, highlights      |
| Mamba Gold     | `#AA5500` | Mamba body                 |
| Wall Beige     | `#AAAAAA` | Fresh walls                |
| Poison Exit    | `#00AA00` | Level exit block           |

### Animation Principles

| Animation       | Timing     | Easing                |
| --------------- | ---------- | --------------------- |
| Mamba movement  | 150ms base | `steps(1)` (discrete) |
| Egg collection  | 100ms      | `steps(2)`            |
| Wall decay      | 500ms      | `steps(3)`            |
| Death animation | 400ms      | `steps(4)`            |

**Prohibited:** Smooth tweening, bounce easing, particle effects, motion blur, rotation.

### "The Juice"

- Subtle CRT scanlines (5% opacity)
- Screen shake on death (5px amplitude)
- Score pop-ups on collection
- Cursor blink: 530ms on/off (authentic DOS timing)

---

## 7. Gamification & Engagement

_(Owner: @gamer)_

### Core Loop Analysis

| Loop  | Duration      | Core Action     | Reward                      |
| ----- | ------------- | --------------- | --------------------------- |
| Micro | 1-3 seconds   | Navigate to egg | Immediate score + audio cue |
| Meso  | 30-90 seconds | Clear level     | Level complete fanfare      |
| Macro | 5-15 minutes  | Complete run    | High score, progression     |

### Engagement Hooks

| Trigger                        | Psychological Lever      |
| ------------------------------ | ------------------------ |
| Visible egg spawn              | Goal proximity           |
| Narrowly avoiding wall         | Relief + arousal         |
| Green dots appearing           | Variable reward schedule |
| Poison block as "final chance" | Loss aversion            |

### "One More Game" Trigger

After game over, immediately show:

1. Score just achieved
2. Gap to next milestone ("42 points to beat your best!")
3. Instant restart option (single key press)

### Achievement Ideas (Future)

| Achievement   | Requirement                           |
| ------------- | ------------------------------------- |
| First Steps   | Complete Level 1                      |
| Mamba Master  | Reach Level 10                        |
| Perfectionist | Clear any level with all collectibles |
| Green Machine | Collect 500 total green dots          |

---

## 8. Security Considerations

_(Owner: @security)_

### Threat Model

**Risk Level: LOW** — Client-side only game with no sensitive data.

| Threat                 | Mitigation                         |
| ---------------------- | ---------------------------------- |
| XSS via player name    | Use `textContent`, not `innerHTML` |
| Malicious npm deps     | Zero runtime dependencies          |
| localStorage tampering | Acceptable—single-player game      |

### Data Security

- Validate data shape when reading from localStorage
- Use `JSON.parse()` in try-catch with fallback defaults
- Limit high score entries to top 10

### Content Security Policy

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  connect-src 'none';
  object-src 'none';
```

### Privacy

**Mamba does NOT:**

- Transmit data to external servers
- Use cookies or tracking
- Collect device information

---

## 9. Quality Assurance Strategy

_(Owner: @qa-engineer)_

### Test Scenarios

#### Happy Path

1. Start game → Move snake → Collect eggs → Complete level → Progress

#### Edge Cases

| Case                                  | Risk                    |
| ------------------------------------- | ----------------------- |
| Wall ages exactly as snake approaches | Race condition          |
| 180° reversal into own wall           | Instant death handling  |
| 1000+ walls on screen                 | Performance degradation |
| Level transition during wall aging    | Timer cleanup           |

### Test Types Required

- [ ] Unit tests (≥80% coverage) — Wall aging, scoring, collision
- [ ] Integration tests — Game state machine, input→state flow
- [ ] E2E tests (Playwright) — Full game session, high score persistence
- [ ] Performance tests — 500+ walls at 60fps
- [ ] Accessibility tests — axe-core, keyboard navigation

### Critical Test Cases

```
✅ TC-001: Snake cannot pass through solid (non-aged) wall
✅ TC-002: Snake CAN pass through aged wall (dot), collecting it
✅ TC-003: Wall aging timer is accurate within ±1 frame
✅ TC-004: Score increments correctly with level multiplier
✅ TC-005: High score persists across browser sessions
✅ TC-006: Game pauses when tab loses focus
✅ TC-007: No memory leaks after 10 consecutive sessions
```

---

## 10. Infrastructure & Deployment

_(Owner: @devops)_

### Build Configuration

**Single change required:** Add Mamba entry point to Vite config:

```typescript
rollupOptions: {
  input: {
    main: 'index.html',
    snake: 'experiments/snake/index.html',
    mamba: 'experiments/mamba/index.html'  // ← Add this
  }
}
```

### Deployment Strategy

- **No changes required** — Existing GitHub Pages workflow handles multi-entry builds
- **Access URL:** `https://<user>.github.io/nexus-playground/experiments/mamba/`

### PWA/Offline

Update asset patterns in `vite.config.ts` if new formats are used:

```typescript
includeAssets: ['favicon.ico', 'icons/*.svg', 'sounds/*.mp3']
```

### Asset Management

| Asset Type    | Location               | Strategy                  |
| ------------- | ---------------------- | ------------------------- |
| Small (<10KB) | Inline                 | Vite asset handling       |
| Audio files   | `public/sounds/mamba/` | Direct serving with cache |
| Fonts         | `public/fonts/`        | DOS-style bitmap fonts    |

---

## 11. Action Items

_(Collaborative: All agents)_

### Phase 1: Foundation (Day 1)

- [ ] **SETUP-001**: Create `experiments/mamba/` directory structure — @software-developer
- [ ] **SETUP-002**: Add Mamba entry to Vite config — @devops
- [ ] **SETUP-003**: Define core types in `game/types.ts` — @tech-lead
- [ ] **SETUP-004**: Set up basic HTML/CSS with DOS styling — @visual-designer

### Phase 2: Core Implementation (Days 2-3)

- [ ] **IMPL-001**: Implement `MambaEngine` game loop — @software-developer
- [ ] **IMPL-002**: Implement `WallManager` with aging system — @software-developer
- [ ] **IMPL-003**: Implement collision detection with spatial index — @software-developer
- [ ] **IMPL-004**: Implement scoring and level progression — @software-developer
- [ ] **IMPL-005**: Implement `DOSRenderer` with CGA palette — @visual-designer

### Phase 3: Polish & UI (Day 4)

- [ ] **POLISH-001**: Add UI screens (menu, HUD, game over) — @ux-designer
- [ ] **POLISH-002**: Implement audio effects — @software-developer
- [ ] **POLISH-003**: Add visual "juice" (screen shake, popups) — @visual-designer
- [ ] **POLISH-004**: Implement high score persistence — @software-developer

### Phase 4: Testing & Review (Days 5-6)

- [ ] **TEST-001**: Write unit tests for wall system — @qa-engineer
- [ ] **TEST-002**: Write E2E tests for gameplay — @qa-engineer
- [ ] **TEST-003**: Accessibility audit — @qa-engineer
- [ ] **TEST-004**: Performance testing with 500+ walls — @qa-engineer
- [ ] **REVIEW-001**: Code review — @tech-lead
- [ ] **SECURITY-001**: Security checklist verification — @security

---

## 12. Risk Register

_(Collaborative: All agents)_

| Risk                                 | Probability | Impact | Mitigation                                     | Owner            |
| ------------------------------------ | ----------- | ------ | ---------------------------------------------- | ---------------- |
| Wall count causes performance issues | Low         | High   | Spatial indexing, object pooling               | @architect       |
| Wall aging race conditions           | Medium      | High   | Extensive timing tests, frame-locked updates   | @qa-engineer     |
| Complex state makes debugging hard   | Medium      | Medium | Immutable state, state logging                 | @tech-lead       |
| Touch controls feel awkward          | Medium      | Medium | Reference Snake implementation, device testing | @ux-designer     |
| Scope creep into "improvements"      | High        | Medium | Strict adherence to original mechanics for v1  | @product-manager |

---

## 13. Open Questions

_(Track decisions needed before/during implementation)_

- [ ] **Q1**: Should walls persist across levels? (Original clears board) — @architect
- [ ] **Q2**: Exact wall aging duration per level? — @gamer
- [ ] **Q3**: Should we include a "How to Play" tutorial? — @ux-designer
- [ ] **Q4**: Audio format preference (MP3 vs OGG)? — @devops

---

## 14. Glossary

| Term         | Definition                                               |
| ------------ | -------------------------------------------------------- |
| Mamba        | The player-controlled snake-like creature                |
| Egg          | Blue collectible dot that progresses the level           |
| Wall Trail   | Permanent obstacle left behind by mamba movement         |
| Green Dot    | Bonus collectible created when walls age                 |
| Poison Block | Level exit that appears after all eggs collected         |
| Wall Aging   | Time-based transformation of walls into collectible dots |

---

## Revision History

| Date       | Author                 | Changes                    |
| ---------- | ---------------------- | -------------------------- |
| 2026-01-24 | @planning-orchestrator | Initial comprehensive plan |

---

_This plan consolidates contributions from all specialized agents. Implementation should follow the phased approach in Section 11, with regular syncs to address open questions and manage risks._
