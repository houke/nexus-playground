---
title: 'Splashy - Paint by Numbers for Kids'
feature: 'splashy'
date: '2026-01-27'
type: 'new-project'
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

# Splashy - Paint by Numbers for Kids

> **⚠️ Status Tracking**: This plan's status should be updated by workflows:
>
> - `draft` → `in-progress`: When execution workflow starts
> - `in-progress` → `review`: When ready for code review
> - `review` → `complete`: When review workflow finishes

---

## 1. Executive Summary

_(Owners: @product-manager, @tech-lead)_

### Vision

**Splashy** is a kid-friendly paint-by-numbers game designed specifically for children ages 4-5. Players select from five beloved character drawings (Bluey, Oddbods, Peppa Pig, Sunny Bunnies, K-Pop character), then tap numbered squares to fill them with the correct colors. The interface uses large, easily-tappable squares and bold numbers optimized for little fingers and developing number recognition skills.

Young children love coloring, but traditional digital coloring apps often frustrate them with fiddly controls or overwhelming choices. Splashy combines the satisfaction of coloring with gentle educational reinforcement — recognizing numbers, matching colors, and completing a picture. The gradual difficulty progression (10 colors for Bluey up to 20 for K-Pop) allows children to build confidence before tackling more complex images.

The forgiving design philosophy means wrong colors are allowed but marked (numbers stay visible), teaching without punishing. Delightful feedback (sparkles, sounds, celebrations) keeps engagement high while the magical completion morph creates peak emotional moments that kids want to experience again and again.

### Success Criteria

- [ ] **Completion Rate**: >70% of started drawings finished
- [ ] **Return Sessions**: >50% return to play another drawing
- [ ] **Error Tolerance**: ≤3 frustration quits per 10 sessions
- [ ] **Time to First Success**: <60 seconds to first correct paint
- [ ] **Accessibility**: Large touch targets (min 56×56px for ages 4-5)
- [ ] **Performance**: 60fps animations, <2s initial load

### Scope

| In Scope                                                             | Out of Scope                        |
| -------------------------------------------------------------------- | ----------------------------------- |
| 5 pre-defined drawings (Bluey, Oddbods, Peppa, Sunny Bunnies, K-Pop) | User-uploaded or custom drawings    |
| Color palette with numbered swatches                                 | Color picker / custom colors        |
| Eraser tool for removing paint                                       | Multi-level undo history            |
| Error feedback: sound + shake + paint applies + number stays         | Blocking wrong colors               |
| Success feedback: sound + sparkles + number disappears               | Achievements, streaks, gamification |
| Completion: morph to actual image + "tadaaa" sound                   | Sharing to social media             |
| Back button navigation                                               | Save/resume progress                |
| Touch-optimized for mobile/tablet                                    | Keyboard shortcuts                  |
| Offline-capable (PWA pattern)                                        | Cloud sync                          |

---

## 2. Product Requirements

_(Owner: @product-manager)_

### User Stories

#### US-001: Drawing Selection

```
As a young child (or their parent)
I want to choose from a small set of familiar character drawings
So that I can color something I recognize and love
```

**Acceptance Criteria:**

- [ ] Given the drawing selection screen, when it loads, then exactly 5 drawings are displayed
- [ ] Given each drawing card, when displayed, then it shows a thumbnail preview and character name
- [ ] Given a drawing card, when tapped, then the paint-by-numbers canvas loads
- [ ] Given cards, when displayed, then they are large enough for easy tapping (min 120×120px)

#### US-002: Paint Canvas Display

```
As a young child
I want to see large numbered squares on my chosen picture
So that I can easily read the numbers and tap the squares
```

**Acceptance Criteria:**

- [ ] Given a loaded canvas, when displayed, then each region shows a clearly visible number
- [ ] Given the canvas, when rendered, then numbers are large (min 24px font) and high-contrast
- [ ] Given a region, when it has been correctly painted, then the number disappears
- [ ] Given a region, when painted with the wrong color, then the number remains visible

#### US-003: Color Palette Selection

```
As a young child
I want to pick colors from a palette showing numbers next to each color
So that I can match the number on the square to the number on my color
```

**Acceptance Criteria:**

- [ ] Given Bluey drawing, when palette loads, then max 10 colors are shown
- [ ] Given Oddbods drawing, when palette loads, then max 12 colors are shown
- [ ] Given Peppa drawing, when palette loads, then max 14 colors are shown
- [ ] Given Sunny Bunnies drawing, when palette loads, then max 18 colors are shown
- [ ] Given K-Pop drawing, when palette loads, then max 20 colors are shown
- [ ] Given a color swatch, when tapped, then it becomes visibly selected (highlight/border)

#### US-004: Eraser Tool

```
As a young child
I want an eraser to remove paint I've applied
So that I can fix my mistakes
```

**Acceptance Criteria:**

- [ ] Given the toolbar, when displayed, then an eraser button is visible
- [ ] Given an eraser selection and a painted region, when tapped, then paint is removed
- [ ] Given an erased region, when paint is removed, then the original number reappears

#### US-005: Error Feedback (Wrong Color)

```
As a young child
I want to know when I paint the wrong color without being scolded
So that I can learn while still having fun
```

**Acceptance Criteria:**

- [ ] Given wrong color placement, when tapped, then:
  - An error sound plays (gentle, not harsh)
  - The canvas view shakes briefly (200-400ms)
  - The paint IS applied (wrong color fills the region)
  - The number REMAINS visible

#### US-006: Success Feedback (Correct Color)

```
As a young child
I want to feel rewarded when I paint the correct color
So that I stay motivated and engaged
```

**Acceptance Criteria:**

- [ ] Given correct color placement, when tapped, then:
  - A success sound plays (satisfying "ding")
  - Sparkles/particles appear around the painted block
  - The number disappears
  - The color fills smoothly

#### US-007: Completion Celebration

```
As a young child
I want a special celebration when I finish the whole picture
So that I feel proud of my accomplishment
```

**Acceptance Criteria:**

- [ ] Given all regions painted correctly, when completed, then:
  - A "tadaaa" celebratory sound plays
  - The numbered grid slowly morphs into the actual source image
  - The transition takes 2-3 seconds
- [ ] Given completion, when celebration ends, then "Play Again" and "Choose Another" options appear

#### US-008: Navigation (Back Button)

```
As a parent or child
I want a back button to return to drawing selection or the main experiments page
So that I can choose a different drawing or exit the game
```

**Acceptance Criteria:**

- [ ] Given the canvas screen, when displayed, then a back button is visible (upper-left)
- [ ] Given the back button, when tapped, then user returns to drawing selection
- [ ] Given drawing selection, when back pressed, then user returns to main landing page

### User Personas Affected

| Persona                               | Impact | Notes                                               |
| ------------------------------------- | ------ | --------------------------------------------------- |
| Luna (Age 5) - The Confident Colorist | High   | Knows numbers 1-20, loves showing finished pictures |
| Max (Age 4) - The Curious Beginner    | High   | Learning numbers 1-10, needs forgiving design       |
| Parents                               | Medium | Want safe, educational, ad-free experience          |

### Priority & Timeline

- **Priority**: P1 - High
- **Target Date**: 2 sprints (1-2 weeks)
- **Dependencies**: Color quantization algorithm, audio assets

---

## 3. Technical Architecture

_(Owner: @architect)_

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SPLASHY - PAINT BY NUMBERS                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐    ┌──────────────────┐    ┌──────────────────────────┐  │
│  │   UI Layer   │    │   Game Engine    │    │   Image Processor        │  │
│  │              │◄──►│                  │◄───│                          │  │
│  │  - Menu      │    │  - State Machine │    │  - Color Quantization    │  │
│  │  - HUD       │    │  - Cell Tracker  │    │  - Grid Generator        │  │
│  │  - Palette   │    │  - Score Manager │    │  - Cell Numbering        │  │
│  │  - Complete  │    │                  │    │                          │  │
│  └──────┬───────┘    └────────┬─────────┘    └──────────────────────────┘  │
│         │                     │                                             │
│         │                     ▼                                             │
│         │            ┌──────────────────┐                                   │
│         │            │   Input Handler  │                                   │
│         │            │  - Touch/Click   │                                   │
│         │            │  - Palette Select│                                   │
│         │            └──────────────────┘                                   │
│         │                                                                   │
│         ▼                                                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                        RENDERING LAYER                                │  │
│  │  ┌────────────────┐   ┌────────────────┐   ┌────────────────┐        │  │
│  │  │  Grid Canvas   │   │ Palette Canvas │   │ Sparkle System │        │  │
│  │  └────────────────┘   └────────────────┘   └────────────────┘        │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌──────────────────┐                                                       │
│  │   Audio Manager  │  - correct.mp3, wrong.mp3, complete.mp3, select.mp3  │
│  └──────────────────┘                                                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Core Components

| Component         | File                      | Responsibility                                     |
| ----------------- | ------------------------- | -------------------------------------------------- |
| `ImageProcessor`  | `game/image-processor.ts` | Load images, quantize colors, generate cell grid   |
| `GameEngine`      | `game/engine.ts`          | State machine, validate placements, track progress |
| `CellTracker`     | `game/cell-tracker.ts`    | Manage cell states (empty → painted)               |
| `InputController` | `game/input.ts`           | Touch/click on grid cells, palette selection       |
| `AudioManager`    | `audio/manager.ts`        | Sound effects for feedback                         |
| `GridRenderer`    | `renderers/grid.ts`       | Draw numbered cells, show painted state            |
| `SparkleSystem`   | `particles/sparkle.ts`    | Particle effects for success feedback              |
| `MenuUI`          | `ui/menu.ts`              | Image selection screen with previews               |
| `HudUI`           | `ui/hud.ts`               | Progress indicator, back button                    |

### Data Model

```typescript
// === Core Types ===
export interface RGB {
  r: number // 0-255
  g: number // 0-255
  b: number // 0-255
}

export interface PaletteColor extends RGB {
  index: number // 1-based color number shown to user
  hex: string // "#RRGGBB" for CSS
  cellCount: number // How many cells use this color
}

export interface Cell {
  x: number // Grid column (0-based)
  y: number // Grid row (0-based)
  targetColorIndex: number // Which color this cell should be (1-based)
  paintedColorIndex: number | null // What user painted (null = empty)
  isCorrect: boolean // Does painted match target?
}

export interface PuzzleData {
  id: string // Unique puzzle identifier
  name: string // Display name
  sourceImageUrl: string // Original image path
  gridWidth: number // Number of columns
  gridHeight: number // Number of rows
  palette: PaletteColor[] // Reduced color palette
  cells: Cell[][] // 2D array [row][col] of cells
  totalCells: number // Total paintable cells
}

export type GameStatus = 'menu' | 'loading' | 'playing' | 'complete'

export interface GameState {
  status: GameStatus
  currentPuzzle: PuzzleData | null
  selectedColorIndex: number | null
  progress: { correctCells: number; totalCells: number; percentComplete: number }
  startTime: number | null
  lastEvent: 'correct' | 'incorrect' | 'complete' | 'colorSelect' | null
}

// === Image Config ===
export interface ImageConfig {
  id: string
  name: string
  file: string // Filename in /public/drawings/
  maxColors: number // Color limit for quantization
  gridSize: number // Target grid dimension
}

export const IMAGE_CONFIGS: ImageConfig[] = [
  { id: 'bluey', name: 'Bluey', file: 'bluey.png', maxColors: 10, gridSize: 24 },
  { id: 'oddbods', name: 'Oddbods', file: 'oddbods.jpg', maxColors: 12, gridSize: 28 },
  { id: 'peppa', name: 'Peppa Pig', file: 'peppa.jpg', maxColors: 14, gridSize: 28 },
  { id: 'sunnybunny', name: 'Sunny Bunny', file: 'sunnybunny.jpg', maxColors: 18, gridSize: 32 },
  { id: 'kpop', name: 'K-Pop', file: 'kpop.png', maxColors: 20, gridSize: 36 },
]
```

### Image Processing Pipeline

1. **Load Image** → Load into offscreen canvas
2. **Resize to Grid** → Nearest-neighbor sampling to target grid size
3. **Quantize Colors** → Median Cut algorithm to reduce to N colors
4. **Generate Cells** → Map each grid pixel to nearest palette color
5. **Cache** → Store processed PuzzleData in localStorage

### State Machine

```
           ┌────────────────────────────────────────────────┐
           │                                                │
           ▼                                                │
    ┌──────────────┐    select    ┌──────────────┐         │
    │     MENU     │─────────────►│   LOADING    │         │
    └──────────────┘              └──────┬───────┘         │
           ▲                             │ ready            │
           │                             ▼                  │
           │                      ┌──────────────┐         │
           │         back         │   PLAYING    │         │
           ├──────────────────────│              │         │
           │                      └──────┬───────┘         │
           │                             │ 100% correct    │
           │                             ▼                  │
           │                      ┌──────────────┐         │
           └──────────────────────│   COMPLETE   │─────────┘
                    continue      └──────────────┘
```

### External Dependencies

**None Required** - All core functionality achievable with vanilla Canvas API.

### Performance Constraints

| Metric           | Target          |
| ---------------- | --------------- |
| Initial Load     | < 2s            |
| Image Processing | < 500ms         |
| Frame Rate       | 60 fps          |
| Touch Response   | < 50ms          |
| Memory Usage     | < 50 MB         |
| JS Bundle Size   | < 50 KB gzipped |

---

## 4. Implementation Specifications

_(Owner: @tech-lead)_

### Code Structure

```
experiments/splashy/
├── index.html
├── main.ts
├── styles/
│   └── splashy.css
├── game/
│   ├── types.ts
│   ├── engine.ts
│   ├── image-processor.ts
│   ├── settings.ts
│   └── input.ts
├── renderers/
│   ├── index.ts
│   └── grid.ts
├── particles/
│   └── sparkle.ts
├── audio/
│   └── manager.ts
└── ui/
    ├── menu.ts
    ├── palette.ts
    ├── hud.ts
    ├── settings.ts
    └── complete.ts
```

### Key Type Definitions

- All interfaces defined upfront in `types.ts`
- Use discriminated unions for state machine
- No `any` types - explicit interfaces for all data structures
- Readonly arrays/objects where mutation isn't needed

### Algorithm: Median Cut Color Quantization

1. Extract all unique RGB values from resized ImageData
2. Place all pixels in initial bucket
3. Find color channel (R, G, or B) with greatest range
4. Sort pixels by that channel, split at median
5. Repeat until bucket count = target palette size
6. Average colors in each bucket for final palette

### Performance Guidelines

- 60fps animation budget: 16.67ms per frame
- Use dirty region tracking for canvas updates
- Cache offscreen canvas for static elements
- Debounce rapid touch events (100ms per cell)

---

## 5. User Experience Design

_(Owner: @ux-designer)_

### User Flow

```
┌─────────────┐
│   LAUNCH    │
└──────┬──────┘
       ▼
┌─────────────────────────────────────────────────┐
│              DRAWING SELECTION MENU             │
│  (5 character thumbnails in a row/grid)         │
└──────────────────────┬──────────────────────────┘
                       │ (Tap character)
                       ▼
┌─────────────────────────────────────────────────┐
│              MAIN PAINTING SCREEN               │
│  [Grid] [Palette] [Eraser] [Back Button]        │
└──────────────────────┬──────────────────────────┘
                       │ (All cells complete)
                       ▼
┌─────────────────────────────────────────────────┐
│           COMPLETION CELEBRATION                │
│  (Grid morphs to real image + fireworks)        │
└──────────────────────┬──────────────────────────┘
           ┌───────────┴───────────┐
           ▼                       ▼
    ┌────────────┐          ┌────────────┐
    │  🔄 AGAIN  │          │  🏠 MENU   │
    └────────────┘          └────────────┘
```

### Wireframes

#### Drawing Selection Menu

```
┌─────────────────────────────────────────────────────────┐
│   ┌─────────┐   ┌─────────┐   ┌─────────┐              │
│   │  BLUEY  │   │ ODDBODS │   │  PEPPA  │              │
│   └─────────┘   └─────────┘   └─────────┘              │
│     ┌─────────────────┐   ┌─────────────────┐          │
│     │  SUNNY BUNNIES  │   │      K-POP      │          │
│     └─────────────────┘   └─────────────────┘          │
└─────────────────────────────────────────────────────────┘
Touch Target: 120×120px minimum per card
```

#### Main Painting Screen

```
┌─────────────────────────────────────────────────────────┐
│ ┌──────┐                                       ┌──────┐ │
│ │  ←   │                                       │ 3/12 │ │
│ │ BACK │                                       │      │ │
│ └──────┘                                       └──────┘ │
├─────────────────────────────────────────────────────────┤
│         ┌───┬───┬───┬───┬───┬───┬───┬───┐             │
│         │ 1 │ 2 │ 1 │ 3 │ 3 │ 2 │ 1 │ 2 │  ← GRID    │
│         ├───┼───┼───┼───┼───┼───┼───┼───┤   (cells)  │
│         │ 2 │ 1 │ 3 │ 3 │ 3 │ 3 │ 1 │ 1 │             │
│         └───┴───┴───┴───┴───┴───┴───┴───┘             │
├─────────────────────────────────────────────────────────┤
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐          │
│  │  🔴    │ │  🔵    │ │  🟡    │ │  🟤    │  PALETTE │
│  │   1    │ │   2    │ │   3    │ │   4    │          │
│  └────────┘ └────────┘ └────────┘ └────────┘          │
│  ┌────────────────────────────────────────────┐        │
│  │              🧹 ERASER                     │        │
│  └────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────┘
Grid Cells: 48×48px | Palette: 80×80px | Numbers: 24px
```

### Interaction Patterns

| Interaction      | Visual Feedback        | Audio Feedback       |
| ---------------- | ---------------------- | -------------------- |
| Tap color        | Border thickens, pulse | Soft "pop"           |
| Tap correct cell | Sparkles burst ✨      | Happy chime          |
| Tap wrong cell   | Cell shakes 3×         | Gentle "boop"        |
| Tap eraser       | Highlight eraser       | Soft click           |
| Complete drawing | Big celebration!       | Triumphant "TADAAA!" |

### Accessibility Requirements (Ages 4-5)

| Element               | Minimum Size     | Recommended      |
| --------------------- | ---------------- | ---------------- |
| Grid cells            | 44×44px          | 48×48px          |
| Color palette buttons | 70×70px          | 80×80px          |
| Eraser button         | Full width, 60px | Full width, 64px |
| Back button           | 60×60px          | 64×64px          |
| Menu characters       | 100×100px        | 120×120px        |

**Key Principles:**

- Icons over text (pre-readers)
- No reading required
- Instant feedback (<100ms)
- No penalties - mistakes are learning
- Big celebrations for success

---

## 6. Visual Design & Polish

_(Owner: @visual-designer)_

### Design Direction: "Crayon Magic"

**Mood**: Joyful, encouraging, wonder-filled — like stepping into a magical coloring book that comes alive.

**Feeling**: Every tap should feel rewarding. The interface should feel like a friendly assistant guiding little hands, not a test to pass.

### Typography

| Use Case         | Font               | Size |
| ---------------- | ------------------ | ---- |
| Cell numbers     | Baloo 2 (SemiBold) | 32px |
| Palette numbers  | Baloo 2            | 24px |
| UI buttons       | Nunito             | 20px |
| Celebration text | Baloo 2            | 48px |

### Color Palette

```css
:root {
  /* Backgrounds */
  --pbn-bg-canvas: #fff8e7; /* Warm cream */
  --pbn-bg-surface: #ffffff; /* Pure white */

  /* Interactive Elements */
  --pbn-btn-primary: #ff6b9d; /* Bubblegum pink */
  --pbn-btn-secondary: #7dd3fc; /* Sky blue */

  /* Feedback */
  --pbn-success: #10b981; /* Emerald */
  --pbn-error: #f87171; /* Soft red */

  /* Celebration */
  --pbn-sparkle-gold: #ffd700;
  --pbn-sparkle-pink: #ff69b4;
  --pbn-sparkle-cyan: #00ced1;
}
```

### Animation & Motion

| Animation        | Duration | Easing      | Trigger       |
| ---------------- | -------- | ----------- | ------------- |
| Sparkle burst    | 500ms    | ease-out    | Correct paint |
| Shake effect     | 400ms    | ease-out    | Wrong paint   |
| Morph transition | 2000ms   | ease-in-out | Completion    |
| Button press     | 150ms    | ease        | Touch         |
| Confetti         | 2500ms   | linear      | Celebration   |

### Responsive Breakpoints

| Breakpoint                  | Layout                                   |
| --------------------------- | ---------------------------------------- |
| Phone (<480px)              | Vertical: canvas above, palette below    |
| Tablet Portrait (481-767px) | Similar, more spacing                    |
| Tablet Landscape (768px+)   | Side-by-side: canvas left, palette right |

---

## 7. Gamification & Engagement

_(Owner: @gamer)_

### Engagement Hooks

| Trigger       | Reward                 | Purpose                |
| ------------- | ---------------------- | ---------------------- |
| First tap     | Welcome chime + splash | Reduce hesitation      |
| Correct color | Sparkle + ding         | Positive reinforcement |
| Wrong color   | Soft bonk + wobble     | Gentle correction      |
| 5 in a row    | Mini celebration       | Streak recognition     |
| 25% complete  | ⭐ Star appears        | Milestone              |
| 50% complete  | ⭐⭐ Second star       | Halfway celebration    |
| 75% complete  | ⭐⭐⭐ "Almost there!" | Final push             |
| 100% complete | MEGA CELEBRATION       | Peak reward            |

### Sound Effects Inventory

| Sound ID          | Trigger          | Character           |
| ----------------- | ---------------- | ------------------- |
| `sfx_tap_correct` | Correct paint    | Bright "ding!"      |
| `sfx_tap_wrong`   | Wrong paint      | Soft "bonk"         |
| `sfx_sparkle`     | With sparkles    | Twinkling shimmer   |
| `sfx_milestone`   | 25/50/75%        | Achievement fanfare |
| `sfx_morph`       | Completion morph | Magical swoosh      |
| `sfx_tadaaa`      | Celebration      | "TA-DAAA!"          |

### Core Principles

| Principle               | Implementation            |
| ----------------------- | ------------------------- |
| Every action matters    | Even wrong colors paint   |
| Immediate feedback      | <200ms response           |
| Progressive celebration | Stars at 25/50/75%        |
| Gentle errors           | Shake + hint, never block |
| Peak ending             | Morph + TADAAA            |

---

## 8. Security Considerations

_(Owner: @security)_

### Threat Model

| Threat                         | Risk     | Mitigation                          |
| ------------------------------ | -------- | ----------------------------------- |
| XSS via images                 | Very Low | Validate image dimensions/format    |
| localStorage tampering         | Low      | Validate on read, fail gracefully   |
| Accidental external navigation | Medium   | No external links, CSP restrictions |

### Child Safety Considerations

| Principle           | Implementation                 |
| ------------------- | ------------------------------ |
| No Data Collection  | ✅ Zero PII collected          |
| No External Links   | ✅ No navigation away from app |
| No Advertisements   | ✅ Ad-free experience          |
| No In-App Purchases | ✅ Fully free                  |
| No Account Creation | ✅ No registration             |

### Security Checklist

- [ ] Run `npm audit` - zero high/critical vulnerabilities
- [ ] CSP header configured
- [ ] No external scripts
- [ ] All resources from same origin
- [ ] Image paths whitelisted

---

## 9. Quality Assurance Strategy

_(Owner: @qa-engineer)_

### Test Scenarios

#### Happy Path

| ID     | Scenario           | Expected                   |
| ------ | ------------------ | -------------------------- |
| HP-001 | Select drawing     | Loads numbered canvas      |
| HP-002 | Paint correct cell | Sparkle, number disappears |
| HP-003 | Complete all cells | Morph + celebration        |

#### Edge Cases

| ID     | Scenario                      | Expected                    |
| ------ | ----------------------------- | --------------------------- |
| EC-001 | Tap without color selected    | Hint to select color        |
| EC-002 | All wrong colors              | Numbers stay visible        |
| EC-003 | Rapid tapping                 | Debounce, no dropped inputs |
| EC-007 | Paint over wrong with correct | Sparkle, correction works   |

#### Error Scenarios

| ID     | Scenario         | Expected                          |
| ------ | ---------------- | --------------------------------- |
| ER-001 | Image load fails | Friendly error, retry option      |
| ER-003 | Audio blocked    | Silent mode, visual feedback only |

### Test Types Required

- [ ] Unit tests (Vitest): >80% coverage
- [ ] Integration tests: Painting flow, completion
- [ ] E2E tests (Playwright): All 5 drawings
- [ ] Accessibility tests (axe-core): WCAG 2.1 AA
- [ ] Performance tests: 60fps animations

### Device Testing Matrix

| Device         | Browser              | Priority |
| -------------- | -------------------- | -------- |
| iPad           | Safari               | P0       |
| Android Tablet | Chrome               | P0       |
| iPhone         | Safari               | P0       |
| Android Phone  | Chrome               | P0       |
| Desktop        | Chrome, Safari, Edge | P1       |

---

## 10. Infrastructure & Deployment

_(Owner: @devops)_

### Build Configuration

Update `vite.config.ts`:

```typescript
rollupOptions: {
  input: {
    // ... existing entries
    splashy: resolve(__dirname, 'experiments/splashy/index.html'),
  }
}
```

### Asset Management

| Asset Type      | Location                     | Caching  |
| --------------- | ---------------------------- | -------- |
| Template images | `/public/drawings/`          | Precache |
| Sound effects   | `experiments/splashy/audio/` | Precache |

### Deployment Checklist

- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run test` passes
- [ ] `npm run build` completes
- [ ] Lighthouse Performance ≥90
- [ ] Service worker updated

### PWA Considerations

- Add splashy assets to workbox precache
- Offline: Show cached drawings
- Service worker update for new assets

---

## 11. Action Items

_(Collaborative: All agents)_

### Setup

- [ ] **SETUP-001**: Create `experiments/splashy/` folder structure — @software-developer
- [ ] **SETUP-002**: Add Splashy entry to vite.config.ts — @devops

### Core Implementation

- [ ] **IMPL-001**: Define types in `game/types.ts` — @software-developer
- [ ] **IMPL-002**: Implement `ImageProcessor` with Median Cut — @software-developer
- [ ] **IMPL-003**: Implement `GameEngine` state machine — @software-developer
- [ ] **IMPL-004**: Implement `GridRenderer` for numbered cells — @software-developer
- [ ] **IMPL-005**: Implement `InputController` with pointer events — @software-developer
- [ ] **IMPL-006**: Copy and adapt `AudioManager` from snake — @software-developer
- [ ] **IMPL-007**: Implement `ColorPalette` UI component — @software-developer
- [ ] **IMPL-008**: Implement `Menu` with image picker — @software-developer
- [ ] **IMPL-009**: Implement `SparkleSystem` particles — @software-developer
- [ ] **IMPL-010**: Implement `ShakeEffect` for wrong answers — @software-developer
- [ ] **IMPL-011**: Implement `MorphTransition` reveal — @software-developer
- [ ] **IMPL-012**: Implement `CompletionScreen` celebration — @software-developer
- [ ] **IMPL-013**: Wire all components in `main.ts` — @software-developer
- [ ] **IMPL-014**: Create `splashy.css` with responsive styles — @visual-designer
- [ ] **IMPL-015**: Implement `HUD` with progress, back button — @software-developer
- [ ] **IMPL-016**: Add Splashy card to landing page — @software-developer
- [ ] **IMPL-017**: Ensure viewport fitting — @software-developer

### Polish & Testing

- [ ] **TEST-001**: Set up Vitest with unit tests — @qa-engineer
- [ ] **TEST-002**: Set up Playwright E2E tests — @qa-engineer
- [ ] **TEST-003**: Write unit tests for engine — @qa-engineer
- [ ] **TEST-004**: Write E2E happy path test — @qa-engineer
- [ ] **TEST-005**: Run accessibility audit — @qa-engineer
- [ ] **TEST-006**: Performance test on iPad Safari — @qa-engineer
- [ ] **TEST-007**: Cross-browser testing — @qa-engineer

### Review & Deploy

- [ ] **REVIEW-001**: Security audit — @security
- [ ] **REVIEW-002**: Code quality review — @tech-lead
- [ ] **DEPLOY-001**: Production deployment — @devops

---

## 12. Risk Register

_(Collaborative: All agents)_

| Risk                                      | Probability | Impact | Mitigation                     | Owner               |
| ----------------------------------------- | ----------- | ------ | ------------------------------ | ------------------- |
| Touch targets too small for 4-5 year olds | Medium      | High   | Enforce 56px+ minimum          | @ux-designer        |
| Performance issues on budget tablets      | Medium      | Medium | Profile early, optimize canvas | @tech-lead          |
| Colorblind users can't distinguish cells  | Low         | High   | Numbers always visible         | @qa-engineer        |
| Audio autoplay blocked                    | High        | Low    | Silent fallback planned        | @software-developer |
| Color quantization produces poor results  | Medium      | Medium | Test with all 5 images early   | @architect          |

---

## 13. Open Questions & Answers

_(Track questions raised and their resolutions)_

### Resolved During Planning ✅

| ID  | Question                            | Answer                                    | Answered By      | Date       |
| --- | ----------------------------------- | ----------------------------------------- | ---------------- | ---------- |
| Q1  | What should the experiment name be? | "Splashy" - playful, easy for kids to say | @product-manager | 2026-01-27 |
| Q2  | What icon/emoji for landing page?   | 🎨 (artist palette)                       | @product-manager | 2026-01-27 |
| Q3  | Should wrong colors be blocked?     | No - paint allowed, number stays visible  | @gamer           | 2026-01-27 |
| Q4  | What fonts for kid readability?     | Baloo 2 for numbers, Nunito for UI        | @visual-designer | 2026-01-27 |
| Q5  | External dependencies needed?       | None - vanilla Canvas API sufficient      | @architect       | 2026-01-27 |

### Deferred to Execution 📋

| ID  | Question                   | Reason Deferred                 | Assigned To         |
| --- | -------------------------- | ------------------------------- | ------------------- |
| Q6  | Exact grid sizes per image | Need to test with actual images | @software-developer |
| Q7  | Audio file formats/sizes   | Depends on synthesis vs. assets | @software-developer |

---

## 14. Glossary

| Term       | Definition                                                       |
| ---------- | ---------------------------------------------------------------- |
| Median Cut | Color quantization algorithm that recursively splits color space |
| Cell       | A single paintable square in the grid                            |
| Palette    | The set of colors available for a specific drawing               |
| Morph      | Animation transition from pixel grid to original image           |
| Sparkle    | Particle effect celebrating correct paint placement              |

---

## 📌 Document Location

This document lives at: `.nexus/features/splashy/plan.md`

Related documents in this feature folder:

- `execution.md` - Implementation tracking (to be created)
- `review.md` - Code review results (to be created)

---

## Time Tracking

| Agent               | Task                        | Start               | End                 | Duration (s) |
| ------------------- | --------------------------- | ------------------- | ------------------- | -----------: |
| @product-manager    | Requirements & user stories | 2026-01-27T10:00:00 | 2026-01-27T10:08:00 |          480 |
| @architect          | System design & data model  | 2026-01-27T10:00:00 | 2026-01-27T10:10:00 |          600 |
| @ux-designer        | User flows & wireframes     | 2026-01-27T10:00:00 | 2026-01-27T10:12:00 |          720 |
| @visual-designer    | Visual design specs         | 2026-01-27T10:00:00 | 2026-01-27T10:09:00 |          540 |
| @gamer              | Gamification design         | 2026-01-27T10:00:00 | 2026-01-27T10:07:00 |          420 |
| @software-developer | Implementation specs        | 2026-01-27T10:12:00 | 2026-01-27T10:18:00 |          360 |
| @tech-lead          | Code quality standards      | 2026-01-27T10:12:00 | 2026-01-27T10:17:00 |          300 |
| @qa-engineer        | Test strategy               | 2026-01-27T10:12:00 | 2026-01-27T10:20:00 |          480 |
| @security           | Security assessment         | 2026-01-27T10:12:00 | 2026-01-27T10:16:00 |          240 |
| @devops             | Build & deployment          | 2026-01-27T10:12:00 | 2026-01-27T10:15:00 |          180 |

**Total Planning Time**: ~75 minutes (4500 seconds)

---

## Revision History

| Date & Time         | Agent                | Changes                                       |
| ------------------- | -------------------- | --------------------------------------------- |
| 2026-01-27 10:30:00 | @orchestrator        | Initial plan created                          |
| 2026-01-28 07:25:00 | @review-orchestrator | Feature marked complete after targeted review |
