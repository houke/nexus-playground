// Snake Game - Main Entry Point
import './styles/snake.css'
import { GameEngine } from './game/engine'
import { InputController } from './game/input'
import { SettingsManager } from './game/settings'
import { AudioManager } from './audio/manager'
import { createRenderer } from './renderers'
import { renderMenu } from './ui/menu'
import { renderHUD } from './ui/hud'
import { renderGameOver } from './ui/gameover'
import { renderSettings } from './ui/settings'
import type { GameState, GameSettings } from './game/types'

class SnakeGame {
  private container: HTMLElement
  private canvas: HTMLCanvasElement
  private engine: GameEngine
  private input: InputController
  private settings: SettingsManager
  private audio: AudioManager
  private currentRenderer: ReturnType<typeof createRenderer> | null = null
  private animationId: number | null = null
  private lastHUDState: { score: number[]; level: number; status: string } | null = null

  constructor(container: HTMLElement) {
    this.container = container
    this.canvas = document.createElement('canvas')
    this.canvas.id = 'game-canvas'

    this.settings = new SettingsManager()
    this.audio = new AudioManager(this.settings.get())
    this.engine = new GameEngine()
    this.input = new InputController()

    this.init()
  }

  private init(): void {
    // Show menu initially
    this.showMenu()

    // Listen for game state changes
    this.engine.onStateChange((state) => {
      this.handleStateChange(state)
    })

    // Listen for settings changes
    this.settings.onChange((newSettings) => {
      this.audio.updateSettings(newSettings)
      if (this.currentRenderer) {
        this.updateRenderer(newSettings)
      }
    })

    // Handle visibility change (pause when tab hidden)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.engine.getState().status === 'playing') {
        this.engine.pause()
      }
    })
  }

  private showMenu(): void {
    this.container.innerHTML = ''
    renderMenu(this.container, {
      onSinglePlayer: () => this.startGame('single'),
      onMultiplayer: () => this.startGame('multiplayer'),
      onSettings: () => this.showSettings(),
      onBack: () => this.goHome(),
      highScore: this.settings.getHighScore('single'),
    })
  }

  private showSettings(): void {
    this.container.innerHTML = ''
    renderSettings(this.container, {
      settings: this.settings.get(),
      onSettingChange: (key, value) => {
        this.settings.set(key, value)
      },
      onBack: () => this.showMenu(),
      onPreviewStyle: (style) => {
        // Could show a preview animation here
        this.settings.set('visualStyle', style)
      },
    })
  }

  private startGame(mode: 'single' | 'multiplayer'): void {
    this.container.innerHTML = ''

    // Create game container
    const gameContainer = document.createElement('div')
    gameContainer.className = 'game-container'

    // Add canvas
    this.canvas.width = 400
    this.canvas.height = 400
    gameContainer.appendChild(this.canvas)

    // Add HUD
    const hudContainer = document.createElement('div')
    hudContainer.id = 'hud-container'
    gameContainer.appendChild(hudContainer)

    // Add touch controls for mobile
    if ('ontouchstart' in window) {
      const touchControls = this.createTouchControls()
      gameContainer.appendChild(touchControls)
    }

    this.container.appendChild(gameContainer)

    // Initialize renderer
    this.updateRenderer(this.settings.get())

    // Set up input
    this.input.init(mode)
    this.input.onDirectionChange(0, (dir) => this.engine.setDirection(0, dir))
    if (mode === 'multiplayer') {
      this.input.onDirectionChange(1, (dir) => this.engine.setDirection(1, dir))
    }
    this.input.onPause(() => {
      if (this.engine.getState().status === 'playing') {
        this.engine.pause()
      } else if (this.engine.getState().status === 'paused') {
        this.engine.resume()
      }
    })
    this.input.onMenu(() => {
      this.stopGame()
      this.showMenu()
    })

    // Start game
    this.engine.start(mode, this.settings.get().speed)
    this.startGameLoop()
  }

  private updateRenderer(settings: GameSettings): void {
    if (this.currentRenderer) {
      this.currentRenderer.destroy()
    }

    // Canvas context type is immutable - must replace canvas when switching styles
    // to avoid "Canvas has an existing context of a different type" error
    const parent = this.canvas.parentElement
    const width = this.canvas.width
    const height = this.canvas.height

    // Create fresh canvas
    const newCanvas = document.createElement('canvas')
    newCanvas.id = 'game-canvas'
    newCanvas.width = width
    newCanvas.height = height

    // Replace canvas in DOM if it's attached
    if (parent) {
      parent.replaceChild(newCanvas, this.canvas)
    }
    this.canvas = newCanvas

    this.currentRenderer = createRenderer(settings.visualStyle, this.canvas)
    this.currentRenderer.init(this.canvas)
  }

  private startGameLoop(): void {
    let lastTime = 0
    let firstFrame = true

    // Bind callbacks once (not on every frame) to avoid stale closures
    const handleBack = () => {
      this.stopGame()
      this.showMenu()
    }

    const handleSettings = () => {
      // Settings only accessible when paused
      const currentState = this.engine.getState()
      if (currentState.status === 'paused') {
        this.stopGame()
        this.showSettings()
      }
    }

    const handlePause = () => {
      const currentState = this.engine.getState()
      if (currentState.status === 'playing') {
        this.engine.pause()
      } else if (currentState.status === 'paused') {
        this.engine.resume()
      }
    }

    // Initial HUD render
    const hudContainer = document.getElementById('hud-container')
    if (hudContainer) {
      const initialState = this.engine.getState()
      renderHUD(hudContainer, {
        state: initialState,
        onPause: handlePause,
        onBack: handleBack,
        onSettings: handleSettings,
      })
      this.lastHUDState = {
        score: [...initialState.score],
        level: initialState.level,
        status: initialState.status,
      }
    }

    const loop = (currentTime: number) => {
      // On first frame, initialize lastTime to avoid massive deltaTime
      if (firstFrame) {
        lastTime = currentTime
        firstFrame = false
      }

      const deltaTime = currentTime - lastTime
      lastTime = currentTime

      // Update game state
      this.engine.update(deltaTime)

      // Get current state
      const state = this.engine.getState()

      // Render game
      if (this.currentRenderer && state.status === 'playing') {
        this.currentRenderer.render(state)
      }

      // Only update HUD when state actually changes (not every frame!)
      // This prevents destroying event listeners on every frame
      const hudContainer = document.getElementById('hud-container')
      if (hudContainer && this.hudStateChanged(state)) {
        renderHUD(hudContainer, {
          state,
          onPause: handlePause,
          onBack: handleBack,
          onSettings: handleSettings,
        })
        this.lastHUDState = {
          score: [...state.score],
          level: state.level,
          status: state.status,
        }
      }

      // Continue loop
      if (state.status === 'playing' || state.status === 'paused') {
        this.animationId = requestAnimationFrame(loop)
      }
    }

    this.animationId = requestAnimationFrame(loop)
  }

  private hudStateChanged(state: GameState): boolean {
    if (!this.lastHUDState) return true
    return (
      state.status !== this.lastHUDState.status ||
      state.level !== this.lastHUDState.level ||
      state.score[0] !== this.lastHUDState.score[0] ||
      state.score[1] !== this.lastHUDState.score[1]
    )
  }

  private handleStateChange(state: GameState): void {
    // Play sounds
    if (state.lastEvent === 'food') {
      this.audio.play('eat')
    } else if (state.lastEvent === 'death') {
      this.audio.play('death')
      this.showGameOver(state)
    } else if (state.lastEvent === 'levelup') {
      this.audio.play('levelup')
    }
  }

  private showGameOver(state: GameState): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }

    // Check for high score
    const mode = state.mode
    const score = state.score[0] ?? 0
    const isHighScore = this.settings.checkAndSaveHighScore(mode, score)

    // Render game over screen
    const overlay = document.createElement('div')
    overlay.className = 'game-over-overlay'
    this.container.appendChild(overlay)

    renderGameOver(overlay, {
      state,
      isHighScore,
      onPlayAgain: () => {
        overlay.remove()
        this.startGame(state.mode)
      },
      onMenu: () => {
        overlay.remove()
        this.showMenu()
      },
    })
  }

  private createTouchControls(): HTMLElement {
    const controls = document.createElement('div')
    controls.className = 'touch-controls'
    controls.innerHTML = `
      <button class="touch-btn touch-up" data-dir="up">▲</button>
      <div class="touch-middle">
        <button class="touch-btn touch-left" data-dir="left">◀</button>
        <button class="touch-btn touch-right" data-dir="right">▶</button>
      </div>
      <button class="touch-btn touch-down" data-dir="down">▼</button>
    `

    controls.querySelectorAll('.touch-btn').forEach((btn) => {
      btn.addEventListener('touchstart', (e) => {
        e.preventDefault()
        const dir = (btn as HTMLElement).dataset.dir as 'up' | 'down' | 'left' | 'right'
        this.input.triggerDirection(0, dir)
      })
    })

    return controls
  }

  private goHome(): void {
    window.location.href = '/nexus-playground/'
  }

  private stopGame(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
    this.input.destroy()
    if (this.currentRenderer) {
      this.currentRenderer.destroy()
      this.currentRenderer = null
    }
  }

  destroy(): void {
    this.stopGame()
  }
}

// Initialize game
const root = document.getElementById('game-root')
if (root) {
  new SnakeGame(root)
}
