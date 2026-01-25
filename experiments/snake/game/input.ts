// Input Controller for Snake Game
import type { Direction, GameMode } from './types'

type DirectionCallback = (direction: Direction) => void
type ActionCallback = () => void

export class InputController {
  private directionCallbacks: Map<number, DirectionCallback> = new Map()
  private pauseCallback: ActionCallback | null = null
  private menuCallback: ActionCallback | null = null
  private startCallback: ActionCallback | null = null
  private mode: GameMode = 'single'
  private boundKeyHandler: (e: KeyboardEvent) => void

  constructor() {
    this.boundKeyHandler = this.handleKeyDown.bind(this)
  }

  init(mode: GameMode): void {
    this.mode = mode
    this.directionCallbacks.clear()

    // Add keyboard listener
    document.addEventListener('keydown', this.boundKeyHandler)
  }

  private handleKeyDown(e: KeyboardEvent): void {
    // Prevent default for arrow keys to stop page scrolling
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault()
    }

    // Player 1 controls (WASD) - only in multiplayer
    // Player 1 controls (Arrows) - in single player
    // Player 2 controls (Arrows) - only in multiplayer

    if (this.mode === 'single') {
      // Single player uses arrow keys
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          this.triggerDirection(0, 'up')
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          this.triggerDirection(0, 'down')
          break
        case 'ArrowLeft':
        case 'a':
        case 'A':
          this.triggerDirection(0, 'left')
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          this.triggerDirection(0, 'right')
          break
      }
    } else {
      // Multiplayer: P1 uses WASD, P2 uses Arrows
      switch (e.key) {
        // Player 1 - WASD
        case 'w':
        case 'W':
          this.triggerDirection(0, 'up')
          break
        case 's':
        case 'S':
          this.triggerDirection(0, 'down')
          break
        case 'a':
        case 'A':
          this.triggerDirection(0, 'left')
          break
        case 'd':
        case 'D':
          this.triggerDirection(0, 'right')
          break
        // Player 2 - Arrows
        case 'ArrowUp':
          this.triggerDirection(1, 'up')
          break
        case 'ArrowDown':
          this.triggerDirection(1, 'down')
          break
        case 'ArrowLeft':
          this.triggerDirection(1, 'left')
          break
        case 'ArrowRight':
          this.triggerDirection(1, 'right')
          break
      }
    }

    // Pause/Resume with Space
    if (e.key === ' ') {
      this.pauseCallback?.()
    }

    // Menu with Escape
    if (e.key === 'Escape') {
      this.menuCallback?.()
    }

    // Start with Enter
    if (e.key === 'Enter') {
      this.startCallback?.()
    }
  }

  triggerDirection(player: number, direction: Direction): void {
    const callback = this.directionCallbacks.get(player)
    if (callback) {
      callback(direction)
    }
  }

  onDirectionChange(player: number, callback: DirectionCallback): void {
    this.directionCallbacks.set(player, callback)
  }

  onPause(callback: ActionCallback): void {
    this.pauseCallback = callback
  }

  onMenu(callback: ActionCallback): void {
    this.menuCallback = callback
  }

  onStart(callback: ActionCallback): void {
    this.startCallback = callback
  }

  destroy(): void {
    document.removeEventListener('keydown', this.boundKeyHandler)
    this.directionCallbacks.clear()
    this.pauseCallback = null
    this.menuCallback = null
    this.startCallback = null
  }
}
