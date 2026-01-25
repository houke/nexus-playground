// Mamba Game - Main Entry Point (Endless Mode)
import './styles/mamba.css'
import { MambaEngine } from './game/engine'
import { InputController } from './game/input'
import { SettingsManager } from './game/settings'
import { AudioManager } from './audio/manager'
import { createRenderer } from './renderers'
import { renderMenu } from './ui/menu'
import { renderHUD } from './ui/hud'
import { renderGameOver } from './ui/gameover'
import { renderSettings } from './ui/settings'
import type { GameState } from './game/types'

class MambaGame {
  private container: HTMLElement
  private canvas: HTMLCanvasElement
  private engine: MambaEngine
  private input: InputController
  private settings: SettingsManager
  private audio: AudioManager
  private renderer: ReturnType<typeof createRenderer> | null = null
  private animationId: number | null = null
  private lastTime = 0

  constructor(container: HTMLElement) {
    this.container = container
    this.canvas = document.createElement('canvas')
    this.canvas.id = 'game-canvas'

    this.settings = new SettingsManager()
    this.audio = new AudioManager(this.settings.get())
    this.engine = new MambaEngine()
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
    })

    // Handle visibility change (pause when tab hidden)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.engine.getState().status === 'playing') {
        this.engine.pause()
      }
    })
  }

  private showMenu(): void {
    this.stopGame()
    this.container.innerHTML = ''
    renderMenu(this.container, {
      onStart: () => this.startGame(),
      onSettings: () => this.showSettings(),
      onBack: () => this.goHome(),
      highScore: this.settings.getHighScore(),
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
    })
  }

  private goHome(): void {
    // Navigate to the main playground
    window.location.href = '/nexus-playground/'
  }

  private startGame(): void {
    this.container.innerHTML = ''

    // Create game container
    const gameContainer = document.createElement('div')
    gameContainer.className = 'game-container'

    // Add canvas - size based on viewport
    const maxWidth = Math.min(window.innerWidth - 32, 600)
    const maxHeight = Math.min(window.innerHeight - 120, 400)
    const cellSize = Math.floor(Math.min(maxWidth / 30, maxHeight / 20))

    this.canvas.width = cellSize * 30
    this.canvas.height = cellSize * 20
    gameContainer.appendChild(this.canvas)

    // Add HUD container
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
    this.renderer = createRenderer(this.canvas)

    // Set up input
    this.input.init()
    this.input.onDirectionChange((dir) => this.engine.setDirection(dir))
    this.input.onPause(() => {
      const state = this.engine.getState()
      if (state.status === 'playing') {
        this.engine.pause()
      } else if (state.status === 'paused') {
        this.engine.resume()
      }
    })
    this.input.onMenu(() => {
      this.showMenu()
    })

    // Start game
    this.engine.start()
    this.startGameLoop()
  }

  private startGameLoop(): void {
    this.lastTime = Date.now()

    const loop = () => {
      const currentTime = Date.now()
      const deltaTime = currentTime - this.lastTime
      this.lastTime = currentTime

      // Update game
      this.engine.update(deltaTime)

      // Render
      const state = this.engine.getState()
      if (this.renderer && state.status === 'playing') {
        this.renderer.render(state)
      }

      this.animationId = requestAnimationFrame(loop)
    }

    this.animationId = requestAnimationFrame(loop)
  }

  private stopGame(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
    this.input.destroy()
    if (this.renderer) {
      this.renderer.destroy()
      this.renderer = null
    }
  }

  private handleStateChange(state: GameState): void {
    // Play sounds
    if (state.lastEvent) {
      switch (state.lastEvent) {
        case 'bronze':
          this.audio.play('bronze')
          break
        case 'silver':
          this.audio.play('silver')
          break
        case 'shed':
          this.audio.play('shed')
          break
        case 'death':
          this.audio.play('death')
          break
      }
    }

    // Update HUD
    const hudContainer = document.getElementById('hud-container')
    if (hudContainer && (state.status === 'playing' || state.status === 'paused')) {
      renderHUD(hudContainer, {
        state,
        onBack: () => this.showMenu(),
      })

      // Re-render if paused
      if (state.status === 'paused' && this.renderer) {
        this.renderer.render(state)
      }
    }

    // Handle game over
    if (state.status === 'gameover') {
      const isHighScore = this.settings.addHighScore(state.score, state.shedCount)

      // Final render
      if (this.renderer) {
        this.renderer.render(state)
      }

      // Show game over screen
      const gameContainer = this.container.querySelector('.game-container')
      if (gameContainer) {
        const overlay = document.createElement('div')
        overlay.id = 'gameover-overlay'
        gameContainer.appendChild(overlay)

        renderGameOver(overlay, {
          state,
          isHighScore,
          onPlayAgain: () => this.startGame(),
          onMenu: () => this.showMenu(),
        })
      }
    }
  }

  private createTouchControls(): HTMLElement {
    const controls = document.createElement('div')
    controls.className = 'touch-controls'

    const buttons = [
      { dir: 'up', label: '▲', className: 'touch-btn-up' },
      { dir: 'left', label: '◄', className: 'touch-btn-left' },
      { dir: 'down', label: '▼', className: 'touch-btn-down' },
      { dir: 'right', label: '►', className: 'touch-btn-right' },
    ] as const

    buttons.forEach(({ dir, label, className }) => {
      const btn = document.createElement('button')
      btn.className = `touch-btn ${className}`
      btn.textContent = label
      btn.setAttribute('aria-label', dir)
      btn.addEventListener('touchstart', (e) => {
        e.preventDefault()
        this.engine.setDirection(dir)
      })
      controls.appendChild(btn)
    })

    return controls
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('game-root')
  if (root) {
    new MambaGame(root)
  }
})
