// Beast Game - Main Entry Point
import './styles/beast.css'
import { GameEngine } from './game/engine'
import { InputController } from './game/input'
import { SettingsManager } from './game/settings'
import { AudioManager } from './audio/manager'
import { createRenderer, type DOSRenderer } from './renderers'
import { renderMenu } from './ui/menu'
import { renderHUD, updateHUD, setupHUDListeners } from './ui/hud'
import { renderGameOver } from './ui/gameover'
import { renderLevelComplete } from './ui/levelcomplete'
import { renderSettings } from './ui/settings'
import { renderHelp } from './ui/help'
import type { GameState } from './game/types'
import { LEVEL_CLEAR_BONUS } from './game/types'

class BeastGame {
  private container: HTMLElement
  private canvas: HTMLCanvasElement
  private engine: GameEngine
  private input: InputController
  private settings: SettingsManager
  private audio: AudioManager
  private renderer: DOSRenderer | null = null
  private animationId: number | null = null

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
    })

    // Handle visibility change (pause when tab hidden)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.engine.getState().status === 'playing') {
        this.engine.pause()
      }
    })
  }

  private showMenu(): void {
    this.stopRenderLoop()
    this.input.disable()
    this.container.innerHTML = ''

    renderMenu(this.container, {
      onNewGame: () => this.startGame(),
      onSettings: () => this.showSettings(),
      onBack: () => this.goHome(),
      highScore: this.settings.getTopScore(),
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
    // Navigate back to main Nexus Playground page
    window.location.href = '/nexus-playground/'
  }

  private startGame(): void {
    // Set up game UI
    this.container.innerHTML = `
      <div class="beast-game">
        <div class="beast-canvas-container"></div>
      </div>
    `

    const canvasContainer = this.container.querySelector('.beast-canvas-container')!
    canvasContainer.appendChild(this.canvas)

    // Initialize renderer
    this.renderer = createRenderer(this.canvas, { showScanlines: true })

    // Start game engine
    this.engine.startGame()

    // Set up input
    this.input.onMove((direction) => {
      this.engine.handleInput(direction)
    })

    this.input.onAction((action) => {
      switch (action) {
        case 'pause':
          this.engine.togglePause()
          break
        case 'restart':
          this.engine.restart()
          break
        case 'help':
          this.showHelpOverlay()
          break
      }
    })

    this.input.enable()

    // Render initial HUD
    const state = this.engine.getState()
    renderHUD(this.container.querySelector('.beast-game')!, state)
    setupHUDListeners(
      this.container,
      () => this.engine.togglePause(),
      () => this.showHelpOverlay()
    )

    // Start render loop
    this.startRenderLoop()
  }

  private handleStateChange(state: GameState): void {
    // Update HUD
    const gameContainer = this.container.querySelector('.beast-game')
    if (gameContainer) {
      updateHUD(gameContainer as HTMLElement, state)
    }

    // Handle events
    if (state.lastEvent === 'crush') {
      this.renderer?.triggerCrushEffect(state.crushedEntities)
      this.audio.playCrush()
    }

    if (state.lastEvent === 'death') {
      this.renderer?.triggerDeathFlash()
      this.audio.playDeath()
    }

    if (state.lastEvent === 'hatch') {
      this.audio.playHatch()
    }

    // Handle status changes
    if (state.status === 'gameover') {
      this.handleGameOver(state)
    }

    if (state.status === 'levelcomplete') {
      this.handleLevelComplete(state)
    }

    if (state.status === 'paused') {
      this.showPauseOverlay()
    }
  }

  private handleGameOver(state: GameState): void {
    this.stopRenderLoop()
    this.input.disable()

    const isNewHighScore = this.settings.addHighScore(state.score, state.level)

    renderGameOver(this.container, state.score, state.level, isNewHighScore, {
      onRestart: () => {
        this.startGame()
      },
      onMenu: () => {
        this.showMenu()
      },
    })
  }

  private handleLevelComplete(state: GameState): void {
    this.renderer?.triggerLevelUpFlash()
    this.audio.playLevelUp()

    const bonus = LEVEL_CLEAR_BONUS * state.level

    renderLevelComplete(this.container, state.level, state.score, bonus, {
      onContinue: () => {
        this.engine.nextLevel()
      },
    })
  }

  private showPauseOverlay(): void {
    // Remove existing overlay if any
    const existingOverlay = this.container.querySelector('.pause-overlay')
    if (existingOverlay) existingOverlay.remove()

    const overlay = document.createElement('div')
    overlay.className = 'beast-overlay pause-overlay visible'
    overlay.innerHTML = `
      <div class="beast-modal">
        <h2 class="modal-title">PAUSED</h2>
        <div class="modal-buttons">
          <button class="menu-btn menu-btn--primary" data-action="resume">
            <span class="btn-icon">▶</span>
            RESUME
          </button>
          <button class="menu-btn" data-action="restart">
            <span class="btn-icon">↺</span>
            RESTART
          </button>
          <button class="menu-btn" data-action="menu">
            <span class="btn-icon">☰</span>
            MAIN MENU
          </button>
        </div>
      </div>
    `

    this.container.appendChild(overlay)

    // Event listeners
    overlay.querySelector('[data-action="resume"]')?.addEventListener('click', () => {
      overlay.remove()
      this.engine.resume()
    })

    overlay.querySelector('[data-action="restart"]')?.addEventListener('click', () => {
      overlay.remove()
      this.engine.restart()
    })

    overlay.querySelector('[data-action="menu"]')?.addEventListener('click', () => {
      overlay.remove()
      this.showMenu()
    })
  }

  private showHelpOverlay(): void {
    // Pause game while help is open
    const wasPlaying = this.engine.getState().status === 'playing'
    if (wasPlaying) {
      this.engine.pause()
    }

    // Remove pause overlay if visible
    const pauseOverlay = this.container.querySelector('.pause-overlay')
    if (pauseOverlay) pauseOverlay.remove()

    renderHelp(this.container, {
      onClose: () => {
        // Resume if was playing
        if (wasPlaying) {
          this.engine.resume()
        }
      },
    })
  }

  private startRenderLoop(): void {
    if (this.animationId !== null) return

    const render = (): void => {
      const state = this.engine.getState()
      if (this.renderer && state.status === 'playing') {
        this.renderer.render(state)
      }
      this.animationId = requestAnimationFrame(render)
    }

    this.animationId = requestAnimationFrame(render)
  }

  private stopRenderLoop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }

  destroy(): void {
    this.stopRenderLoop()
    this.engine.destroy()
    this.input.destroy()
    this.renderer?.destroy()
    this.audio.destroy()
  }
}

// Initialize game when DOM is ready
function init(): void {
  const root = document.getElementById('game-root')
  if (!root) {
    console.error('Game root element not found')
    return
  }

  new BeastGame(root)
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
