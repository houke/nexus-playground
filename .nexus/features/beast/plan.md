---
title: 'Beast Experiment - 1984 DOS Classic'
date: '2026-01-25'
type: 'new-feature'
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
status: 'complete'
---

# Beast Experiment - 1984 DOS Classic 🐻

> **⚠️ Status Tracking**: This plan's status should be updated by workflows:
>
> - `draft` → `in-progress`: When execution workflow starts
> - `in-progress` → `complete`: When review workflow finishes
> - If work happens outside formal workflows, run `nexus-sync` prompt to reconcile

## 1. Executive Summary

_(Owners: @product-manager, @tech-lead)_

### Vision

Bring the classic 1984 MS-DOS game **Beast** to the Nexus Playground as a new experiment. Beast is a text-based action game where players crush "beasts" (H-shaped enemies) by pushing movable blocks. The game features real-time gameplay, strategic block-pushing mechanics, and progressive difficulty with super-beasts and hatching eggs. This implementation will honor the original ASCII aesthetic while providing modern web optimizations and a polished "retro" experience.

**Emoji**: 🐻 (Bear/Beast represents the game's namesake)

### Success Criteria

- [ ] Fully playable Beast game matching original mechanics
- [ ] Authentic DOS/ASCII visual style using terminal-like rendering
- [ ] Smooth 60fps gameplay with responsive controls
- [ ] Progressive difficulty with multiple enemy types (Beast, Super-Beast, Hatched Beast)
- [ ] High score persistence with local storage
- [ ] Mobile-optimized controls and responsive layout
- [ ] Offline-capable as a PWA

### Scope

| In Scope                                          | Out of Scope                                    |
| ------------------------------------------------- | ----------------------------------------------- |
| Single-player mode                                | Two-player mode (future enhancement)            |
| Block-pushing mechanics (movable & static blocks) | Level editor                                    |
| Beast, Super-Beast, and Hatched Beast enemies     | Online leaderboards                             |
| Egg hatching mechanics                            | Cloud save sync                                 |
| Explosive static blocks (advanced levels)         | Custom themes beyond authentic DOS look         |
| Level progression system                          | Achievement system (can be added in future)     |
| High score tracking                               | Sound effects (optional stretch goal)           |
| Authentic DOS ASCII renderer                      | Multiple visual styles (single authentic style) |

---

## 2. Product Requirements

_(Owner: @product-manager)_

### User Stories

```
As a retro gaming enthusiast,
I want to play Beast in my browser,
So that I can experience this classic 1984 game without DOS emulation.
```

```
As a casual player,
I want simple keyboard controls,
So that I can quickly learn and enjoy the game.
```

```
As a mobile user,
I want touch-friendly controls,
So that I can play Beast on my phone or tablet.
```

```
As a competitive player,
I want my high scores saved,
So that I can track my progress and beat my records.
```

### Acceptance Criteria

- [ ] Given the game starts, when I press arrow keys, then my player (◄►) moves in that direction
- [ ] Given I push a movable block into a beast, when the beast is crushed against a wall/block, then the beast dies
- [ ] Given I encounter a super-beast (╟╢), when I try to crush it, then it only dies when crushed against a static block
- [ ] Given eggs are on the screen, when enough time passes, then they hatch into hatched beasts (╬╬)
- [ ] Given a hatched beast exists, when it moves, then it can push blocks to try to crush the player
- [ ] Given I touch an explosive static block, when I move into it, then I lose a life
- [ ] Given all beasts are eliminated, when the level clears, then I advance to the next level

### User Personas Affected

| Persona                  | Impact | Notes                                  |
| ------------------------ | ------ | -------------------------------------- |
| Retro Gaming Enthusiast  | High   | Primary audience, values authenticity  |
| Casual Browser Gamer     | Medium | Quick pick-up-and-play sessions        |
| Mobile User              | Medium | Needs touch controls, shorter sessions |
| Nexus Playground Visitor | High   | Showcases agent collaboration on games |

### Priority & Timeline

- **Priority**: P1 (High) - Expands experiment variety with a unique puzzle-action game
- **Target Date**: Sprint 4
- **Dependencies**: None - standalone experiment

---

## 3. Technical Architecture

_(Owner: @architect)_

### System Overview

Beast follows the same architectural pattern as existing experiments (Snake, Mamba), with a clear separation between game logic, rendering, and UI components.

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Input Layer   │────▶│   Game Engine   │────▶│    Renderer     │
│ (Keyboard/Touch)│     │  (State Machine)│     │   (DOS/ASCII)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │   UI Components │
                        │ (Menu/HUD/Game  │
                        │     Over)       │
                        └─────────────────┘
```

### Core Components

| Component         | Responsibility                                          | New/Modified |
| ----------------- | ------------------------------------------------------- | ------------ |
| `GameEngine`      | Core game loop, state management, collision detection   | New          |
| `InputController` | Keyboard and touch input handling                       | New          |
| `DOSRenderer`     | ASCII-style canvas rendering                            | New          |
| `CollisionSystem` | Block-beast collision, crushing mechanics               | New          |
| `EnemyAI`         | Beast movement AI (attraction to player)                | New          |
| `LevelGenerator`  | Procedural level generation with progressive difficulty | New          |
| `SettingsManager` | Sound, volume, game preferences                         | New          |
| `AudioManager`    | Sound effects (optional)                                | New          |

### Data Model

```typescript
// Core game types
type Direction =
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'up-left'
  | 'up-right'
  | 'down-left'
  | 'down-right'

type EntityType = 'player' | 'beast' | 'super-beast' | 'hatched-beast' | 'egg'

type BlockType = 'movable' | 'static' | 'explosive'

interface Position {
  readonly x: number
  readonly y: number
}

interface Entity {
  readonly id: string
  position: Position
  type: EntityType
}

interface Block {
  position: Position
  type: BlockType
}

interface Egg {
  position: Position
  hatchTimer: number // Ticks until hatching
}

interface GameState {
  status: 'menu' | 'playing' | 'paused' | 'gameover' | 'levelcomplete'
  player: Position
  entities: Entity[]
  blocks: Block[]
  eggs: Egg[]
  level: number
  lives: number
  score: number
  gridWidth: number
  gridHeight: number
}

interface GameSettings {
  soundEnabled: boolean
  volume: number
}
```

### External Dependencies

| Dependency | Version | Purpose                           | License |
| ---------- | ------- | --------------------------------- | ------- |
| VT323 Font | -       | Authentic DOS terminal typography | OFL     |

### Performance Constraints

- [ ] Game tick rate: 100-200ms (adjustable per level for difficulty)
- [ ] Rendering: 60fps canvas updates
- [ ] Memory: < 50MB total footprint
- [ ] Input latency: < 16ms response time

---

## 4. Implementation Specifications

_(Owner: @tech-lead)_

### Code Structure

```
experiments/
└── beast/
    ├── index.html          # Entry HTML
    ├── main.ts             # Main entry point, game initialization
    ├── audio/
    │   └── manager.ts      # Sound effects management
    ├── game/
    │   ├── types.ts        # TypeScript interfaces and constants
    │   ├── engine.ts       # Core game loop and state machine
    │   ├── collision.ts    # Block pushing and crushing logic
    │   ├── enemy-ai.ts     # Beast movement AI
    │   ├── level.ts        # Level generation and progression
    │   ├── input.ts        # Keyboard and touch controls
    │   └── settings.ts     # Settings persistence
    ├── renderers/
    │   ├── index.ts        # Renderer factory
    │   └── dos.ts          # DOS/ASCII style canvas renderer
    ├── styles/
    │   └── beast.css       # Game-specific styles
    └── ui/
        ├── menu.ts         # Main menu component
        ├── hud.ts          # In-game HUD (lives, score, level)
        ├── gameover.ts     # Game over screen
        └── levelcomplete.ts # Level complete screen
```

### Key Interfaces & Types

```typescript
// Game constants matching original DOS Beast
export const GRID_WIDTH = 39 // Original DOS width
export const GRID_HEIGHT = 22 // Original DOS height

// Character representations (DOS Code Page 437)
export const CHARS = {
  player: '◄►', // Diamond-like player
  beast: '├┤', // H-shaped beast
  superBeast: '╟╢', // Double-line super beast
  hatchedBeast: '╬╬', // Cross-hatch hatched beast
  egg: '○', // Egg before hatching
  movableBlock: '█', // Solid movable block
  staticBlock: '▓', // Static immovable block
  explosiveBlock: '▒', // Explosive static (advanced levels)
  empty: ' ',
} as const

// Movement patterns - 8-directional for player, 4 for beasts
export const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  'up-left': { x: -1, y: -1 },
  'up-right': { x: 1, y: -1 },
  'down-left': { x: -1, y: 1 },
  'down-right': { x: 1, y: 1 },
} as const
```

### Algorithm / Logic Overview

**Beast AI Movement:**

```
1. Each tick, each beast calculates direction toward player
2. Beast moves one cell in the direction that minimizes distance
3. Beasts cannot push blocks (except hatched beasts)
4. Beasts are blocked by blocks and other entities
```

**Block Crushing Mechanics:**

```
1. Player pushes movable block in direction of movement
2. If block hits beast AND another block/wall behind beast:
   - Regular beast: Dies
   - Super-beast: Dies only if crushed against STATIC block
3. If block hits player from hatched beast push: Player loses life
```

**Level Progression:**

```
Level 1-3: Only regular beasts, no explosive blocks
Level 4-6: Super-beasts appear
Level 7+: Eggs that hatch into hatched beasts, explosive blocks
```

### Migration Strategy

N/A - New standalone experiment

---

## 5. User Experience Design

_(Owner: @ux-designer)_

### User Flow

```
[Landing Page] → (Click Beast Card) → [Beast Menu]
                                           │
                                           ├─ (New Game) → [Level 1] → [Playing]
                                           │                              │
                                           │                              ├─ (All beasts dead) → [Level Complete] → [Next Level]
                                           │                              │
                                           │                              ├─ (Player dies) → [Lives > 0] → [Respawn]
                                           │                              │                      │
                                           │                              │                      └─ [Lives = 0] → [Game Over]
                                           │                              │
                                           │                              └─ (ESC/Pause) → [Paused] → (Resume) → [Playing]
                                           │
                                           ├─ (Settings) → [Settings Screen]
                                           │
                                           └─ (Back) → [Landing Page]
```

### Wireframes

**Main Menu:**

```
┌─────────────────────────────────────────┐
│                                         │
│           🐻 B E A S T 🐻              │
│           ───────────────               │
│                                         │
│         [ ▶ NEW GAME ]                  │
│         [   SETTINGS ]                  │
│         [   ← BACK   ]                  │
│                                         │
│         HIGH SCORE: 12,450              │
│                                         │
└─────────────────────────────────────────┘
```

**Gameplay Screen:**

```
┌─────────────────────────────────────────┐
│ LEVEL: 03    SCORE: 1,250    LIVES: ♥♥♥ │
├─────────────────────────────────────────┤
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ▓                                     ▓ │
│ ▓   ████   ├┤            ████   ├┤   ▓ │
│ ▓   ████         ██████          ▓   ▓ │
│ ▓          ◄►                        ▓ │
│ ▓      ████      ╟╢      ██████      ▓ │
│ ▓                                    ▓ │
│ ▓   ├┤       ████████         ├┤    ▓ │
│ ▓                                    ▓ │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
└─────────────────────────────────────────┘
```

### Interaction Patterns

- **Primary Action**: Arrow keys / WASD / Numpad to move player and push blocks
- **Pause**: ESC key or tap pause button
- **Feedback**: Visual flash when beast is crushed, screen shake on death
- **Error States**: "Game Over" screen with final score and retry option
- **Empty States**: N/A (game always has content)

### Accessibility Requirements

- [ ] Keyboard-only navigation for all menus
- [ ] High contrast mode support (DOS green-on-black is inherently high contrast)
- [ ] Screen reader announcements for game state changes
- [ ] Configurable game speed for players who need more time
- [ ] Touch targets minimum 44x44px on mobile

---

## 6. Visual Design & Polish

_(Owner: @visual-designer)_

### Design Direction

**Authentic DOS Terminal Aesthetic** - The visual design should evoke the feeling of playing on an MS-DOS system in 1984. Monospace fonts, limited color palette, CRT-style glow effects, and ASCII character rendering are essential. The experience should feel nostalgic yet crisp on modern displays.

### Typography

| Use Case    | Font Family | Size/Weight       | Notes                       |
| ----------- | ----------- | ----------------- | --------------------------- |
| Game Grid   | VT323       | 16-20px / Regular | Authentic DOS terminal look |
| Menu Titles | VT323       | 32px / Regular    | Large, impactful            |
| HUD Text    | VT323       | 14px / Regular    | Readable at a glance        |
| Score/Lives | VT323       | 18px / Regular    | Clear visibility            |

### Color Palette

| Token Name          | Value       | Usage                     |
| ------------------- | ----------- | ------------------------- |
| `--beast-bg`        | `#000000`   | Background (pure black)   |
| `--beast-text`      | `#00FF00`   | Primary text (DOS green)  |
| `--beast-player`    | `#FFFFFF`   | Player character          |
| `--beast-enemy`     | `#FF0000`   | Beasts (red menacing)     |
| `--beast-super`     | `#FF00FF`   | Super-beasts (magenta)    |
| `--beast-hatched`   | `#FFFF00`   | Hatched beasts (yellow)   |
| `--beast-block`     | `#00AA00`   | Movable blocks            |
| `--beast-static`    | `#AAAAAA`   | Static blocks             |
| `--beast-explosive` | `#FF6600`   | Explosive blocks (orange) |
| `--beast-glow`      | `#00FF0033` | CRT glow effect           |

### Animation & Motion

| Element        | Animation              | Duration/Easing   | Trigger             |
| -------------- | ---------------------- | ----------------- | ------------------- |
| Beast death    | Flash white → fade out | 200ms ease-out    | Beast crushed       |
| Player death   | Screen flash red       | 150ms ease-in-out | Player hit          |
| Level complete | Text pulse + fade      | 500ms ease-in-out | All beasts cleared  |
| Block push     | Smooth slide           | 50ms linear       | Player pushes block |
| CRT scanlines  | Subtle vertical lines  | Static overlay    | Always on           |
| CRT glow       | Subtle text shadow     | Static            | Always on           |

### Responsive Breakpoints

| Breakpoint        | Layout Changes                             |
| ----------------- | ------------------------------------------ |
| Mobile (<768px)   | Touch controls overlay, smaller grid cells |
| Tablet (768-1024) | Larger touch targets, optimized grid size  |
| Desktop (>1024)   | Full grid, keyboard-focused, CRT effects   |

---

## 7. Gamification & Engagement

_(Owner: @gamer)_

### Engagement Hooks

| Trigger           | Reward/Feedback                        | Purpose                 |
| ----------------- | -------------------------------------- | ----------------------- |
| Crush beast       | Score +100, satisfying crunch sound    | Immediate gratification |
| Crush super-beast | Score +250, special effect             | Higher risk/reward      |
| Clear level       | Bonus points, "LEVEL COMPLETE" fanfare | Progression milestone   |
| Chain crush (2+)  | Multiplier bonus                       | Skill expression        |
| New high score    | Celebration animation, saved locally   | Long-term achievement   |

### Progression Elements

- **Points/Score**: Earn points for crushing beasts (100), super-beasts (250), chain bonuses
- **Levels**: Infinite level progression with increasing difficulty
- **Lives**: Start with 3 lives, lose one per death, game over at 0
- **Difficulty Curve**: More beasts, super-beasts, eggs, and explosive blocks as levels increase

### Feedback Loops

- **Immediate**: Crunch sound + visual effect when beast is crushed
- **Short-term**: Level complete celebration, score display
- **Long-term**: High score persistence, "beat your record" motivation

### "Juice" Checklist

- [ ] Screen shake on player death
- [ ] Block push has satisfying visual slide
- [ ] Beast death has crunch effect
- [ ] Score numbers "pop" when earned
- [ ] Level complete has retro fanfare
- [ ] CRT scanline effect for authenticity

---

## 8. Security Considerations

_(Owner: @security)_

### Threat Model

| Threat                  | Risk Level | Mitigation                                   |
| ----------------------- | ---------- | -------------------------------------------- |
| High score manipulation | Low        | Scores are local-only, no competitive aspect |
| XSS via game state      | Low        | No user input rendered as HTML               |
| Local storage tampering | Low        | Game is single-player, no impact on others   |

### Data Security

- [ ] No sensitive data collected or stored
- [ ] High scores stored in localStorage (non-sensitive)
- [ ] No network requests (fully offline game)

### Input Validation

- [ ] All keyboard inputs validated against allowed keys
- [ ] Touch coordinates bounded to canvas area
- [ ] Settings values validated before persistence

### Compliance

- [ ] No personal data collection - GDPR compliant by design
- [ ] No cookies used
- [ ] Fully offline-capable

---

## 9. Quality Assurance Strategy

_(Owner: @qa-engineer)_

### Test Scenarios

#### Happy Path

1. Start game → Player appears in level 1 → Move with arrow keys → Crush beast → Score increases
2. Clear all beasts → Level complete screen → Advance to level 2
3. Die 3 times → Game over screen → High score saved if new record

#### Edge Cases

| Scenario                        | Input                       | Expected Output                     |
| ------------------------------- | --------------------------- | ----------------------------------- |
| Push block into wall            | Move toward wall with block | Block doesn't move, player stops    |
| Push block into another block   | Move toward stacked blocks  | First block pushes second           |
| Beast trapped in corner         | All paths blocked           | Beast waits until path opens        |
| Multiple beasts crushed at once | Push block into beast line  | All crushed beasts die, bonus score |
| Rapid direction changes         | Mash multiple arrow keys    | Last pressed direction wins         |
| Tab away during gameplay        | Visibility change           | Game auto-pauses                    |

#### Error Scenarios

| Error Condition    | User Experience     | Recovery Path               |
| ------------------ | ------------------- | --------------------------- |
| Local storage full | Settings won't save | Game continues, warns user  |
| Canvas not support | Game doesn't render | Show fallback error message |

### Test Types Required

- [ ] Unit tests (coverage target: 80%)
  - Game state transitions
  - Collision detection logic
  - Score calculations
  - Level generation
- [ ] Integration tests
  - Input → State → Render pipeline
  - Settings persistence
- [ ] E2E tests (Playwright)
  - Full game flow from menu to game over
  - Mobile touch controls
- [ ] Accessibility tests (axe-core)
  - Keyboard navigation
  - Focus management
- [ ] Performance tests
  - 60fps rendering benchmark
  - Memory usage under prolonged play

### Mock Data Requirements

- Predetermined level layouts for deterministic testing
- Mock enemy positions for collision testing

---

## 10. Infrastructure & Deployment

_(Owner: @devops)_

### Build Configuration

- [ ] Add `experiments/beast/` to Vite config
- [ ] Ensure VT323 font is bundled or CDN-loaded
- [ ] Update PWA manifest with Beast entry

### Deployment Strategy

- **Rollout**: Ship with next release, available immediately
- **Rollback Plan**: Revert experiments/beast/ directory if critical issues

### Monitoring & Observability

- [ ] Console error logging (non-blocking)
- [ ] No external analytics required

### Offline/PWA Considerations

- [ ] Game fully functional offline
- [ ] Assets cached by service worker
- [ ] No network dependencies

---

## 11. Action Items

_(Collaborative: All agents)_

### Phase 1: Foundation

- [ ] **SETUP-001**: Create `experiments/beast/` directory structure — @software-developer
- [ ] **SETUP-002**: Create `beast/index.html` entry point — @software-developer
- [ ] **SETUP-003**: Define TypeScript types in `game/types.ts` — @tech-lead
- [ ] **SETUP-004**: Implement `SettingsManager` — @software-developer

### Phase 2: Core Implementation

- [ ] **IMPL-001**: Implement `GameEngine` with state machine — @software-developer
- [ ] **IMPL-002**: Implement `DOSRenderer` for ASCII display — @software-developer
- [ ] **IMPL-003**: Implement `InputController` (keyboard + touch) — @software-developer
- [ ] **IMPL-004**: Implement `CollisionSystem` with block pushing — @software-developer
- [ ] **IMPL-005**: Implement `EnemyAI` with player attraction — @software-developer
- [ ] **IMPL-006**: Implement `LevelGenerator` with difficulty progression — @software-developer

### Phase 3: UI & Polish

- [ ] **UI-001**: Create menu screen — @visual-designer, @software-developer
- [ ] **UI-002**: Create HUD component — @visual-designer, @software-developer
- [ ] **UI-003**: Create game over screen — @visual-designer, @software-developer
- [ ] **UI-004**: Create level complete screen — @visual-designer, @software-developer
- [ ] **POLISH-001**: Add CRT visual effects — @visual-designer
- [ ] **POLISH-002**: Add screen shake and death effects — @gamer

### Phase 4: Integration & Testing

- [ ] **INT-001**: Add Beast to landing page experiments list — @software-developer
- [ ] **TEST-001**: Write unit tests for game logic — @qa-engineer
- [ ] **TEST-002**: Write E2E tests for full game flow — @qa-engineer
- [ ] **TEST-003**: Accessibility audit — @qa-engineer
- [ ] **REVIEW-001**: Code review — @tech-lead
- [ ] **SECURITY-001**: Security review — @security

---

## 12. Risk Register

_(Collaborative: All agents)_

| Risk                            | Probability | Impact | Mitigation                                    | Owner               |
| ------------------------------- | ----------- | ------ | --------------------------------------------- | ------------------- |
| Original game mechanics unclear | Medium      | Medium | Reference multiple sources, gameplay videos   | @product-manager    |
| Performance issues on mobile    | Low         | Medium | Optimize rendering, reduce cell count         | @tech-lead          |
| Touch controls feel awkward     | Medium      | Medium | Extensive mobile testing, iterate on controls | @ux-designer        |
| VT323 font loading fails        | Low         | Low    | Fallback to system monospace                  | @software-developer |

---

## 13. Open Questions

_(Track decisions needed before/during implementation)_

- [x] **Q1**: What emoji best represents Beast? — **Answer: 🐻** (Bear/Beast)
- [ ] **Q2**: Should we support 8-directional movement like original or simplify to 4? — Assigned to: @product-manager
- [ ] **Q3**: Include sound effects in MVP or defer? — Assigned to: @product-manager
- [ ] **Q4**: Should explosive blocks be visually distinct from static? — Assigned to: @visual-designer

---

## 14. Glossary

_(Define project-specific terms)_

| Term            | Definition                                                                |
| --------------- | ------------------------------------------------------------------------- |
| Beast           | Basic enemy (├┤) that chases player, can be crushed against any obstacle  |
| Super-Beast     | Advanced enemy (╟╢) that can only be crushed against static blocks        |
| Hatched Beast   | Enemy (╬╬) born from eggs, can push blocks to crush player                |
| Egg             | Spawns in advanced levels, hatches into Hatched Beast after time          |
| Movable Block   | Block (█) that player can push to crush beasts                            |
| Static Block    | Immovable block (▓) that acts as wall/obstacle                            |
| Explosive Block | Static block (▒) that kills player on contact (advanced levels)           |
| Crushing        | Killing a beast by pushing a block that traps it against another obstacle |

---

## 📌 Status Tracking Notes

**Plan Lifecycle:**

- `draft` → Created by planning workflow
- `in-progress` → Updated by execution workflow when work starts
- `complete` → Updated by review workflow when done

**If work happens outside formal workflows** (e.g., direct agent chats):

1. Run the `nexus-sync` prompt to reconcile this plan
2. See [keeping-plans-in-sync.md](../docs/keeping-plans-in-sync.md) for details

---

## Revision History

| Date       | Author           | Changes       |
| ---------- | ---------------- | ------------- |
| 2026-01-25 | @product-manager | Initial draft |
