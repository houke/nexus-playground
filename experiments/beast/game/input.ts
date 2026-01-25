// Beast Game - Input Controller
import type { Direction } from './types'

type InputCallback = (direction: Direction) => void
type ActionCallback = (action: 'pause' | 'resume' | 'restart' | 'help') => void

// Keyboard mappings for 8-directional movement
const KEY_MAPPINGS: Record<string, Direction> = {
  // Arrow keys
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',

  // WASD
  w: 'up',
  W: 'up',
  s: 'down',
  S: 'down',
  a: 'left',
  A: 'left',
  d: 'right',
  D: 'right',

  // Numpad for 8-directional
  Numpad8: 'up',
  Numpad2: 'down',
  Numpad4: 'left',
  Numpad6: 'right',
  Numpad7: 'up-left',
  Numpad9: 'up-right',
  Numpad1: 'down-left',
  Numpad3: 'down-right',

  // Q, E, Z, C for diagonals with WASD
  q: 'up-left',
  Q: 'up-left',
  e: 'up-right',
  E: 'up-right',
  z: 'down-left',
  Z: 'down-left',
  c: 'down-right',
  C: 'down-right',
}

export class InputController {
  private moveCallback: InputCallback | null = null
  private actionCallback: ActionCallback | null = null
  private enabled = false
  private touchStartPos: { x: number; y: number } | null = null
  private boundHandleKeyDown: (e: KeyboardEvent) => void
  private boundHandleTouchStart: (e: TouchEvent) => void
  private boundHandleTouchEnd: (e: TouchEvent) => void

  constructor() {
    this.boundHandleKeyDown = this.handleKeyDown.bind(this)
    this.boundHandleTouchStart = this.handleTouchStart.bind(this)
    this.boundHandleTouchEnd = this.handleTouchEnd.bind(this)
  }

  onMove(callback: InputCallback): void {
    this.moveCallback = callback
  }

  onAction(callback: ActionCallback): void {
    this.actionCallback = callback
  }

  enable(): void {
    if (this.enabled) return
    this.enabled = true
    window.addEventListener('keydown', this.boundHandleKeyDown)
    window.addEventListener('touchstart', this.boundHandleTouchStart, { passive: false })
    window.addEventListener('touchend', this.boundHandleTouchEnd, { passive: false })
  }

  disable(): void {
    if (!this.enabled) return
    this.enabled = false
    window.removeEventListener('keydown', this.boundHandleKeyDown)
    window.removeEventListener('touchstart', this.boundHandleTouchStart)
    window.removeEventListener('touchend', this.boundHandleTouchEnd)
  }

  private handleKeyDown(e: KeyboardEvent): void {
    // Handle help with ? or H
    if (e.key === '?' || e.key === 'h' || e.key === 'H') {
      e.preventDefault()
      this.actionCallback?.('help')
      return
    }

    // Handle pause/escape
    if (e.key === 'Escape' || e.key === 'p' || e.key === 'P' || e.key === ' ') {
      e.preventDefault()
      this.actionCallback?.('pause')
      return
    }

    // Handle restart with R
    if (e.key === 'r' || e.key === 'R') {
      e.preventDefault()
      this.actionCallback?.('restart')
      return
    }

    // Handle movement
    const direction = KEY_MAPPINGS[e.key]
    if (direction) {
      e.preventDefault()
      this.moveCallback?.(direction)
    }
  }

  private handleTouchStart(e: TouchEvent): void {
    if (e.touches.length === 1) {
      const touch = e.touches[0]
      if (touch) {
        this.touchStartPos = { x: touch.clientX, y: touch.clientY }
      }
    }
  }

  private handleTouchEnd(e: TouchEvent): void {
    if (!this.touchStartPos) return

    const touch = e.changedTouches[0]
    if (!touch) return

    const dx = touch.clientX - this.touchStartPos.x
    const dy = touch.clientY - this.touchStartPos.y
    const threshold = 30 // Minimum swipe distance

    // Calculate direction based on swipe
    if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
      let direction: Direction

      // Determine if diagonal or cardinal
      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)
      const ratio = Math.min(absDx, absDy) / Math.max(absDx, absDy)

      if (ratio > 0.4) {
        // Diagonal movement
        if (dx > 0 && dy < 0) direction = 'up-right'
        else if (dx < 0 && dy < 0) direction = 'up-left'
        else if (dx > 0 && dy > 0) direction = 'down-right'
        else direction = 'down-left'
      } else {
        // Cardinal movement
        if (absDx > absDy) {
          direction = dx > 0 ? 'right' : 'left'
        } else {
          direction = dy > 0 ? 'down' : 'up'
        }
      }

      this.moveCallback?.(direction)
    }

    this.touchStartPos = null
  }

  destroy(): void {
    this.disable()
    this.moveCallback = null
    this.actionCallback = null
  }
}
