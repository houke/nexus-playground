// Splashy - Paint by Numbers for Kids
// Main Entry Point

import './styles/splashy.css'
import { GameEngine } from './game/engine'
import { InputController } from './game/input'
import { SettingsManager } from './game/settings'
import { AudioManager } from './audio/manager'
import { GridRenderer } from './renderers/grid'
import { SparkleSystem, ConfettiSystem } from './particles/sparkle'
import { renderMenu, renderLoading } from './ui/menu'
import { renderPalette, updatePaletteSelection } from './ui/palette'
import { renderHUD, updateHUDProgress, showMilestoneEffect } from './ui/hud'
import { renderComplete, createMorphTransition, removeMorphOverlay } from './ui/complete'
import type { GameState, ImageConfig, PuzzleData } from './game/types'
import { CELL_SIZE } from './game/types'

class SplashyGame {
  private container: HTMLElement
  private canvas: HTMLCanvasElement
  private engine: GameEngine
  private input: InputController
  private settings: SettingsManager
  private audio: AudioManager
  private renderer: GridRenderer | null = null
  private sparkles: SparkleSystem | null = null
  private confetti: ConfettiSystem | null = null

  // UI container references
  private hudContainer: HTMLElement | null = null
  private paletteContainer: HTMLElement | null = null
  private canvasContainer: HTMLElement | null = null

  // Track last tap position for sparkle effects
  private lastTapPosition: { x: number; y: number } | null = null

  constructor(container: HTMLElement) {
    this.container = container
    this.canvas = document.createElement('canvas')
    this.canvas.id = 'game-canvas'

    this.settings = new SettingsManager()
    this.audio = new AudioManager(this.settings.get())
    this.engine = new GameEngine('/nexus-playground/drawings')
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

    // Handle visibility change (pause audio when hidden)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Could pause game here if needed
      }
    })
  }

  private showMenu(): void {
    this.cleanup()
    this.container.innerHTML = ''

    renderMenu(this.container, {
      onSelectImage: (config) => this.startGame(config),
      onBack: () => this.goHome(),
    })
  }

  private async startGame(config: ImageConfig): Promise<void> {
    this.container.innerHTML = ''
    renderLoading(this.container)

    try {
      // Enable audio on user interaction
      await this.audio.enable()

      // Load the puzzle
      await this.engine.loadPuzzle(config)

      // Set up game UI
      this.setupGameUI()
    } catch (error) {
      console.error('Failed to start game:', error)
      this.showMenu()
    }
  }

  private setupGameUI(): void {
    const state = this.engine.getState()
    const puzzle = state.currentPuzzle

    if (!puzzle) return

    this.container.innerHTML = ''

    // Create game layout
    const gameLayout = document.createElement('div')
    gameLayout.className = 'game-layout'

    // HUD container
    this.hudContainer = document.createElement('div')
    this.hudContainer.className = 'hud-container'
    gameLayout.appendChild(this.hudContainer)

    // Canvas container (for shake effect)
    this.canvasContainer = document.createElement('div')
    this.canvasContainer.className = 'canvas-container'

    // Set up canvas and renderer
    this.renderer = new GridRenderer(this.canvas, { cellSize: CELL_SIZE })
    const { offsetX, offsetY } = this.renderer.init(puzzle)

    this.canvasContainer.appendChild(this.canvas)
    gameLayout.appendChild(this.canvasContainer)

    // Create overlay canvas for sparkles (same size as main canvas)
    const sparkleCanvas = document.createElement('canvas')
    sparkleCanvas.className = 'sparkle-canvas'
    sparkleCanvas.width = this.canvas.width
    sparkleCanvas.height = this.canvas.height
    this.canvasContainer.appendChild(sparkleCanvas)

    this.sparkles = new SparkleSystem(sparkleCanvas)
    this.confetti = new ConfettiSystem(sparkleCanvas)

    // Palette container
    this.paletteContainer = document.createElement('div')
    this.paletteContainer.className = 'palette-container'
    gameLayout.appendChild(this.paletteContainer)

    this.container.appendChild(gameLayout)

    // Initialize input controller
    this.input.init(this.canvas, puzzle.gridWidth, puzzle.gridHeight, CELL_SIZE, offsetX, offsetY)

    this.input.onCellTap((x, y) => {
      this.lastTapPosition = { x, y }
      this.engine.paintCell(x, y)
    })

    // Render initial state
    this.renderGame()
  }

  private renderGame(): void {
    const state = this.engine.getState()
    const puzzle = state.currentPuzzle

    if (!puzzle || !this.renderer) return

    // Render grid
    this.renderer.render(puzzle, state.selectedColorIndex)

    // Render HUD
    if (this.hudContainer) {
      renderHUD(this.hudContainer, state.progress, {
        onBack: () => this.showMenu(),
      })
    }

    // Render palette
    if (this.paletteContainer) {
      renderPalette(this.paletteContainer, puzzle.palette, state.selectedColorIndex, {
        onColorSelect: (index) => {
          this.engine.selectColor(index)
          this.audio.play('color_select')
        },
      })
    }
  }

  private handleStateChange(state: GameState): void {
    // Handle events
    switch (state.lastEvent) {
      case 'correct':
        this.audio.play('tap_correct')
        this.emitSparkles(state)
        this.updateGameUI(state)
        break

      case 'incorrect':
        this.audio.play('tap_wrong')
        if (this.canvasContainer && this.renderer) {
          this.renderer.shake(this.canvasContainer)
        }
        this.updateGameUI(state)
        break

      case 'eraser':
        this.audio.play('eraser')
        this.updateGameUI(state)
        break

      case 'colorSelect':
        this.updatePaletteUI(state)
        break

      case 'milestone':
        this.audio.play('milestone')
        if (this.hudContainer) {
          showMilestoneEffect(this.hudContainer, state.lastMilestone)
        }
        this.updateGameUI(state)
        break

      case 'complete':
        this.handleComplete(state)
        break
    }
  }

  private updateGameUI(state: GameState): void {
    const puzzle = state.currentPuzzle
    if (!puzzle || !this.renderer) return

    // Re-render grid
    this.renderer.render(puzzle, state.selectedColorIndex)

    // Update HUD progress
    if (this.hudContainer) {
      updateHUDProgress(this.hudContainer, state.progress)
    }
  }

  private updatePaletteUI(state: GameState): void {
    if (this.paletteContainer) {
      updatePaletteSelection(this.paletteContainer, state.selectedColorIndex)
    }

    // Also update grid to show selected color hints
    const puzzle = state.currentPuzzle
    if (puzzle && this.renderer) {
      this.renderer.render(puzzle, state.selectedColorIndex)
    }
  }

  private emitSparkles(state: GameState): void {
    if (!this.sparkles || !this.renderer || !this.lastTapPosition) return

    const puzzle = state.currentPuzzle
    if (!puzzle) return

    // Calculate canvas coordinates from the tapped grid cell
    const { offsetX, offsetY } = this.renderer.getOffsets()
    const canvasX = offsetX + this.lastTapPosition.x * CELL_SIZE + CELL_SIZE / 2
    const canvasY = offsetY + this.lastTapPosition.y * CELL_SIZE + CELL_SIZE / 2

    this.sparkles.emit(canvasX, canvasY)
  }

  private async handleComplete(state: GameState): Promise<void> {
    const puzzle = state.currentPuzzle
    if (!puzzle) return

    // Play sounds
    this.audio.play('morph')

    // Small delay then morph
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Morph transition
    await createMorphTransition(this.canvas, puzzle.sourceImageUrl, 2000)

    // TADAAA!
    this.audio.play('tadaaa')

    // Wait a bit then show completion screen (confetti handled there)
    await new Promise((resolve) => setTimeout(resolve, 300))

    this.showComplete(puzzle)
  }

  private showComplete(puzzle: PuzzleData): void {
    // Clean up morph overlay and old particle systems
    removeMorphOverlay()
    this.sparkles?.destroy()
    this.confetti?.destroy()
    this.sparkles = null
    this.confetti = null

    // Show completion UI
    this.container.innerHTML = ''

    // Create a container for confetti
    const completeLayout = document.createElement('div')
    completeLayout.className = 'complete-layout'

    // Add confetti canvas (positioned behind content via CSS z-index)
    const confettiCanvas = document.createElement('canvas')
    confettiCanvas.className = 'confetti-canvas'
    confettiCanvas.width = window.innerWidth
    confettiCanvas.height = window.innerHeight
    completeLayout.appendChild(confettiCanvas)

    this.confetti = new ConfettiSystem(confettiCanvas)
    this.confetti.celebrate()

    this.container.appendChild(completeLayout)

    renderComplete(completeLayout, puzzle, {
      onPlayAgain: () => {
        this.confetti?.destroy()
        this.confetti = null
        this.engine.playAgain()
        this.setupGameUI()
      },
      onChooseAnother: () => {
        this.confetti?.destroy()
        this.confetti = null
        this.showMenu()
      },
    })
  }

  private cleanup(): void {
    this.input.destroy()
    this.renderer?.destroy()
    this.sparkles?.destroy()
    this.confetti?.destroy()
    removeMorphOverlay()

    this.renderer = null
    this.sparkles = null
    this.confetti = null
    this.hudContainer = null
    this.paletteContainer = null
    this.canvasContainer = null
  }

  private goHome(): void {
    window.location.href = '/nexus-playground/'
  }

  destroy(): void {
    this.cleanup()
  }
}

// Initialize game
const root = document.getElementById('game-root')
if (root) {
  new SplashyGame(root)
}
