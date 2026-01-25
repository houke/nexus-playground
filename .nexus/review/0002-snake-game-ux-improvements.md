---
title: 'Code Review & Fix Report - Snake Game UX Improvements'
date: '2026-01-24'
agents: ['@software-developer', '@ux-designer', '@qa-engineer', '@architect']
scope: Snake game UX improvements and bug fixes
issues-found: 8
issues-fixed: 8
---

# Code Review & Fix Report - Snake Game UX Improvements

## Summary

This review addressed 8 issues in the Snake game experiment including critical bugs causing instant game over, black overlays, manifest errors, and UX improvements. All issues have been fixed and verified. The game now plays correctly with all 5 visual styles working.

## Metrics

| Metric       | Before | After |
| ------------ | ------ | ----- |
| Issues Found | -      | 8     |
| Issues Fixed | -      | 8     |
| Lint Errors  | 0      | 0     |
| Type Errors  | 0      | 0     |
| Build Status | ✅     | ✅    |

## Agent Review & Fix Reports

### @architect & @software-developer

**Focus Areas**: Code quality, bug fixes, runtime errors, architecture

#### Issues Found (Session 2)

| #   | Issue                                            | Severity | File           |
| --- | ------------------------------------------------ | -------- | -------------- |
| 6   | Game loop timing bug (instant death)             | Critical | main.ts        |
| 7   | Style selector on menu (should be settings only) | Medium   | menu.ts        |
| 8   | Manifest syntax error in dev mode                | Low      | vite.config.ts |

#### Root Cause Analysis (Session 2)

**@architect Analysis**: The "instant game over" and "black overlay" issues reported by QA were traced to a critical timing bug in the game loop:

```typescript
// BUG: First frame has deltaTime = currentTime - 0 = ~28 days of ms!
private startGameLoop(): void {
  let lastTime = 0  // ❌ Should not be 0
  const loop = (currentTime: number) => {
    const deltaTime = currentTime - lastTime  // deltaTime = 1706123456789!
```

When `lastTime = 0` and `currentTime` is the timestamp (e.g., 1706123456789 ms since epoch), the `deltaTime` is enormous. This causes `accumulator += deltaTime` to overflow the tick system, executing hundreds of game ticks instantly. The snake moves hundreds of times and hits walls immediately = instant death, which triggers the black game-over overlay.

#### Fixes Applied (Session 2)

| #   | Fix Description                                                                     | Files Changed    |
| --- | ----------------------------------------------------------------------------------- | ---------------- |
| 6   | Initialize `lastTime` to `currentTime` on first frame to avoid massive deltaTime    | main.ts          |
| 7   | Removed style selector from snake menu - style changes should only be in settings   | menu.ts, main.ts |
| 8   | Enabled `devOptions.enabled: true` in vite-plugin-pwa to serve manifest in dev mode | vite.config.ts   |

##### 6. Game Loop Timing Fix (main.ts)

**Before** (Bug):

```typescript
private startGameLoop(): void {
  let lastTime = 0

  const loop = (currentTime: number) => {
    const deltaTime = currentTime - lastTime  // MASSIVE on first frame!
    lastTime = currentTime
```

**After** (Fix):

```typescript
private startGameLoop(): void {
  let lastTime = 0
  let firstFrame = true

  const loop = (currentTime: number) => {
    // On first frame, initialize lastTime to avoid massive deltaTime
    if (firstFrame) {
      lastTime = currentTime
      firstFrame = false
    }

    const deltaTime = currentTime - lastTime  // Now safe: ~16ms
    lastTime = currentTime
```

##### 7. Remove Style Selector from Menu (menu.ts)

Per UX request, style selection should only be available in Settings, not on the main menu. Removed:

- Style selector HTML from menu template
- Style button event listeners
- `settings` prop from MenuOptions interface

##### 8. Manifest Dev Mode Fix (vite.config.ts)

Added `devOptions.enabled: true` to vite-plugin-pwa config to serve the manifest during development:

```typescript
VitePWA({
  registerType: 'autoUpdate',
  devOptions: {
    enabled: true,  // Enable PWA in dev mode to serve manifest
  },
  manifest: { ... }
})
```

---

### @software-developer (Session 1)

**Focus Areas**: Code quality, bug fixes, runtime errors

#### Issues Found (Session 1)

| #   | Issue                             | Severity | File               |
| --- | --------------------------------- | -------- | ------------------ |
| 1   | WebGL context conflict error      | Critical | renderers/index.ts |
| 2   | CSS syntax error (orphaned block) | High     | snake.css          |
| 3   | Canvas context type immutable     | Critical | main.ts            |

#### Fixes Applied (Session 1)

| #   | Fix Description                                                                                              | Files Changed      |
| --- | ------------------------------------------------------------------------------------------------------------ | ------------------ |
| 1   | Changed WebGL support test to use temporary canvas instead of game canvas to avoid context type conflict     | renderers/index.ts |
| 2   | Removed orphaned CSS properties that were causing PostCSS parse error                                        | snake.css          |
| 3   | Modified `updateRenderer()` to create fresh canvas when switching visual styles, replacing old canvas in DOM | main.ts            |

#### Detailed Changes (Session 1)

##### 1. WebGL Context Test Fix (renderers/index.ts)

**Problem**: Testing WebGL support on the game canvas created a WebGL context, but other renderers already used a 2D context. Once a canvas has a context type, it cannot be changed.

**Solution**: Create a temporary canvas just for testing WebGL support:

```typescript
case 5: {
  // Check WebGL support with a temporary canvas (not the game canvas)
  const testCanvas = document.createElement('canvas')
  const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl')
  if (gl) {
    return new WebGLRenderer()
  }
  console.warn('WebGL not supported, falling back to Neon style')
  return new NeonRenderer()
}
```

##### 2. CSS Syntax Error Fix (snake.css)

**Problem**: Orphaned CSS properties without a selector caused PostCSS parse error:

```css
/* ❌ Orphaned block */
  max-width: 400px;
  padding: 0.75rem 1rem;
  background: var(--snake-surface);
  border-radius: 8px;
}
```

**Solution**: Removed the orphaned block.

##### 3. Canvas Replacement on Style Switch (main.ts)

**Problem**: When switching from a 2D renderer (Nokia, Retro, Modern, Neon) to WebGL, the canvas already had a 2D context and couldn't be reused.

**Solution**: Replace the canvas entirely when switching renderers:

```typescript
private updateRenderer(settings: GameSettings): void {
  if (this.currentRenderer) {
    this.currentRenderer.destroy()
  }

  // Canvas context type is immutable - must replace canvas
  const parent = this.canvas.parentElement
  const width = this.canvas.width
  const height = this.canvas.height

  const newCanvas = document.createElement('canvas')
  newCanvas.id = 'game-canvas'
  newCanvas.width = width
  newCanvas.height = height

  if (parent) {
    parent.replaceChild(newCanvas, this.canvas)
  }
  this.canvas = newCanvas

  this.currentRenderer = createRenderer(settings.visualStyle, this.canvas)
  this.currentRenderer.init(this.canvas)
}
```

---

### @ux-designer

**Focus Areas**: User experience, discoverability, navigation

#### Issues Found

| #   | Issue                            | Severity | File                 |
| --- | -------------------------------- | -------- | -------------------- |
| 4   | No visible keyboard controls     | High     | hud.ts, snake.css    |
| 5   | No back/settings during gameplay | Medium   | hud.ts, main.ts, css |
| 6   | Non-functional pause button      | Low      | hud.ts, snake.css    |
| 7   | Style numbers not green          | Low      | snake.css            |

#### Fixes Applied

| #   | Fix Description                                                                                         | Files Changed              |
| --- | ------------------------------------------------------------------------------------------------------- | -------------------------- |
| 4   | Added controls hint bar showing WASD, arrows, Space (Pause), Esc (Menu) with keyboard (`<kbd>`) styling | hud.ts, snake.css          |
| 5   | Added game header with back button (←) and settings button (⚙️) that cleanly stop game and navigate     | hud.ts, main.ts, snake.css |
| 6   | Removed non-functional pause button from HUD - Space/Esc keys handle pause already                      | hud.ts, snake.css          |
| 7   | Added `color: var(--snake-primary)` to `.style-number` for green visual style numbers                   | snake.css                  |

#### Detailed Changes

##### 4. Keyboard Controls Hint Bar (hud.ts + snake.css)

Added a controls hint bar that shows:

- **Single Player**: Arrow keys or WASD + Space (Pause) + Esc (Menu)
- **Multiplayer**: P1 WASD + P2 Arrows + Space/Esc

```typescript
<div class="controls-hint-bar">
  ${mode === 'multiplayer' ? `
    <div class="controls-group">
      <span class="controls-player">P1</span>
      <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>
    </div>
    <div class="controls-group">
      <span class="controls-player controls-player-p2">P2</span>
      <kbd>↑</kbd><kbd>←</kbd><kbd>↓</kbd><kbd>→</kbd>
    </div>
  ` : `
    <div class="controls-group">
      <kbd>↑</kbd><kbd>←</kbd><kbd>↓</kbd><kbd>→</kbd>
      <span class="controls-sep">or</span>
      <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>
    </div>
  `}
  <div class="controls-group">
    <kbd>Space</kbd><span class="controls-label">Pause</span>
    <kbd>Esc</kbd><span class="controls-label">Menu</span>
  </div>
</div>
```

**CSS** for keyboard keys:

```css
kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  height: 1.25rem;
  padding: 0 0.375rem;
  background: var(--snake-surface);
  border: 1px solid var(--snake-border);
  border-radius: 4px;
  font-size: 0.625rem;
  font-family: inherit;
  color: var(--snake-text);
}
```

##### 5. Game Header with Navigation (hud.ts + main.ts + snake.css)

Added a header bar during gameplay with:

- **Back button** (←) - Returns to main menu
- **Settings button** (⚙️) - Opens settings screen

```typescript
<div class="game-header">
  <button class="hud-nav-btn hud-back-btn" aria-label="Back to menu">←</button>
  <button class="hud-nav-btn hud-settings-btn" aria-label="Settings">⚙️</button>
</div>
```

Added `stopGame()` method to cleanly stop the game loop:

```typescript
private stopGame(): void {
  if (this.animationId) {
    cancelAnimationFrame(this.animationId)
    this.animationId = null
  }
  if (this.currentRenderer) {
    this.currentRenderer.destroy()
    this.currentRenderer = null
  }
  this.input.destroy()
}
```

##### 6. Removed Non-Functional Pause Button

The pause button between score and level didn't work and was confusing. Removed it since Space/Esc keys already handle pause and menu.

##### 7. Green Style Numbers (snake.css)

```css
.style-number {
  color: var(--snake-primary); /* Green color */
  font-family: 'Orbitron', sans-serif;
  /* ... */
}
```

---

### @qa-engineer

**Focus Areas**: Testing, visual styles verification, edge cases

#### Session 2 - Game Functionality Testing

After fixes applied by @software-developer based on @architect analysis:

| Test Case                   | Status | Notes                                |
| --------------------------- | ------ | ------------------------------------ |
| Start single player game    | ✅     | No longer instant game over          |
| Start multiplayer game      | ✅     | Both snakes spawn and move correctly |
| Play game normally          | ✅     | Snake moves at correct speed         |
| Black overlay on game start | ✅     | Fixed - no longer appears            |
| Style selector in menu      | ✅     | Removed - now only in settings       |
| Manifest error in dev mode  | ✅     | Fixed with devOptions.enabled        |

#### Visual Style Testing Results

| Style | Name   | Status | Notes                                    |
| ----- | ------ | ------ | ---------------------------------------- |
| 1     | Nokia  | ✅     | Classic green monochrome, pixelated      |
| 2     | Retro  | ✅     | 8-bit arcade style with bright colors    |
| 3     | Modern | ✅     | Clean, rounded corners, subtle gradients |
| 4     | Neon   | ✅     | Cyberpunk glow effects, dark background  |
| 5     | WebGL  | ✅     | 3D perspective with Three.js, lighting   |

**Key Verification**:

- ✅ Switching from Style 1-4 to Style 5 (WebGL) works correctly
- ✅ Switching from Style 5 (WebGL) back to Style 1-4 works correctly
- ✅ No "Canvas has existing context" errors in console
- ✅ Canvas is properly replaced when switching styles
- ✅ Game plays correctly on all visual styles

#### Keyboard Controls Testing

| Control       | Single Player | Multiplayer P1 | Multiplayer P2 |
| ------------- | ------------- | -------------- | -------------- |
| Arrow keys    | ✅            | -              | ✅             |
| WASD          | ✅            | ✅             | -              |
| Space (pause) | ✅            | ✅             | ✅             |
| Esc (menu)    | ✅            | ✅             | ✅             |

#### Navigation Testing

| Button        | Action                   | Result   |
| ------------- | ------------------------ | -------- |
| ← (Back)      | Stop game, show menu     | ✅ Works |
| ⚙️ (Settings) | Stop game, show settings | ✅ Works |

## Files Modified (All Sessions)

| File                                 | Changes                                            |
| ------------------------------------ | -------------------------------------------------- |
| experiments/snake/main.ts            | Game loop timing fix, canvas replacement, stopGame |
| experiments/snake/ui/menu.ts         | Removed style selector                             |
| experiments/snake/ui/hud.ts          | New HUD structure with nav buttons, controls hint  |
| experiments/snake/renderers/index.ts | Temp canvas for WebGL support test                 |
| experiments/snake/styles/snake.css   | +97 lines (header, controls, kbd styles)           |
| vite.config.ts                       | PWA devOptions.enabled for manifest                |

## Verification Commands Run

```bash
npm run lint       # ✅ Passed
npm run typecheck  # ✅ Passed
npm run build      # ✅ Passed
```

## Remaining Action Items

None - all identified issues have been resolved.

## Common Themes

1. **Game Loop Initialization**: Always initialize timing variables properly on first frame to avoid massive delta times.
2. **Canvas Context Immutability**: Once a canvas has a context type (2D/WebGL), it cannot be changed. Solution: Replace the canvas element entirely.
3. **Discoverability**: Users need visible affordances for keyboard controls, especially in games.
4. **Navigation Escape Hatches**: Users should always be able to exit or access settings during gameplay.
5. **PWA Dev Mode**: vite-plugin-pwa requires explicit `devOptions.enabled: true` to serve manifest during development.
