// Input Controller for Mamba Game
import type { Direction } from './types'

type DirectionCallback = (direction: Direction) => void
type ActionCallback = () => void

export class InputController {
  private directionCallback: DirectionCallback | null = null
  private pauseCallback: ActionCallback | null = null
  private menuCallback: ActionCallback | null = null
  private startCallback: ActionCallback | null = null
  private boundKeyHandler: (e: KeyboardEvent) => void

  constructor() {
    this.boundKeyHandler = this.handleKeyDown.bind(this)
  }

  init(): void {
    document.addEventListener('keydown', this.boundKeyHandler)
  }

  private handleKeyDown(e: KeyboardEvent): void {
    // Prevent default for game keys
    if (
      [
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        ' ',
        'Escape',
        'w',
        'W',
        'a',
        'A',
        's',
        'S',
        'd',
        'D',
        'p',
        'P',
      ].includes(e.key)
    ) {
      e.preventDefault()
    }

    // Direction controls (Arrows + WASD)
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        this.directionCallback?.('up')
        break
      case 'ArrowDown':
      case 's':
      case 'S':
        this.directionCallback?.('down')
        break
      case 'ArrowLeft':
      case 'a':
      case 'A':
        this.directionCallback?.('left')
        break
      case 'ArrowRight':
      case 'd':
      case 'D':
        this.directionCallback?.('right')
        break
    }

    // Pause with Space or P
    if (e.key === ' ' || e.key === 'p' || e.key === 'P') {
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

  onDirectionChange(callback: DirectionCallback): void {
    this.directionCallback = callback
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
  }
}
