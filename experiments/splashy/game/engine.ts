// Splashy - Game Engine
import type { GameState, ImageConfig, Cell } from './types'
import { MILESTONES } from './types'
import { ImageProcessor } from './image-processor'

type StateChangeCallback = (state: GameState) => void

export class GameEngine {
  private state: GameState
  private callbacks: StateChangeCallback[] = []
  private imageProcessor: ImageProcessor
  private basePath: string

  constructor(basePath: string = '/nexus-playground/drawings') {
    this.imageProcessor = new ImageProcessor()
    this.basePath = basePath
    this.state = this.createInitialState()
  }

  private createInitialState(): GameState {
    return {
      status: 'menu',
      currentPuzzle: null,
      selectedColorIndex: null,
      progress: {
        correctCells: 0,
        totalCells: 0,
        percentComplete: 0,
      },
      startTime: null,
      lastEvent: null,
      lastMilestone: 0,
    }
  }

  /**
   * Load a puzzle by config
   */
  async loadPuzzle(config: ImageConfig): Promise<void> {
    this.state.status = 'loading'
    this.state.lastEvent = null
    this.notifyStateChange()

    try {
      const puzzle = await this.imageProcessor.process(config, this.basePath)
      this.state.currentPuzzle = puzzle
      this.state.progress = {
        correctCells: 0,
        totalCells: puzzle.totalCells,
        percentComplete: 0,
      }
      this.state.selectedColorIndex = null
      this.state.startTime = Date.now()
      this.state.lastMilestone = 0
      this.state.status = 'playing'
      this.notifyStateChange()
    } catch (error) {
      console.error('Failed to load puzzle:', error)
      this.state.status = 'menu'
      this.notifyStateChange()
      throw error
    }
  }

  /**
   * Select a color from the palette (1-based index)
   */
  selectColor(colorIndex: number | null): void {
    this.state.selectedColorIndex = colorIndex
    this.state.lastEvent = colorIndex === null ? 'eraser' : 'colorSelect'
    this.notifyStateChange()
  }

  /**
   * Paint a cell at grid coordinates
   * Returns true if the paint was applied
   */
  paintCell(gridX: number, gridY: number): boolean {
    const { currentPuzzle, selectedColorIndex, status } = this.state

    if (status !== 'playing' || !currentPuzzle) {
      return false
    }

    // Bounds check
    if (
      gridY < 0 ||
      gridY >= currentPuzzle.gridHeight ||
      gridX < 0 ||
      gridX >= currentPuzzle.gridWidth
    ) {
      return false
    }

    const cell = currentPuzzle.cells[gridY]?.[gridX]
    if (!cell) return false

    // Eraser mode - remove paint
    if (selectedColorIndex === null) {
      if (cell.paintedColorIndex !== null) {
        // Decrease correct count if was correct
        if (cell.isCorrect) {
          this.state.progress.correctCells--
        }
        cell.paintedColorIndex = null
        cell.isCorrect = false
        this.updateProgress()
        this.state.lastEvent = 'eraser'
        this.notifyStateChange()
        return true
      }
      return false
    }

    // Paint mode
    // Guard: Don't repaint if same color already applied
    if (cell.paintedColorIndex === selectedColorIndex) {
      return false
    }

    // Guard: Don't allow painting over correct cells (locked)
    if (cell.isCorrect) {
      return false
    }

    const wasCorrectPreviously = cell.paintedColorIndex === cell.targetColorIndex

    cell.paintedColorIndex = selectedColorIndex
    cell.isCorrect = selectedColorIndex === cell.targetColorIndex

    // Update correct count
    if (cell.isCorrect && !wasCorrectPreviously) {
      this.state.progress.correctCells++
      this.state.lastEvent = 'correct'
    } else if (!cell.isCorrect && wasCorrectPreviously) {
      this.state.progress.correctCells--
      this.state.lastEvent = 'incorrect'
    } else if (cell.isCorrect) {
      this.state.lastEvent = 'correct'
    } else {
      this.state.lastEvent = 'incorrect'
    }

    this.updateProgress()

    // Check for milestones
    const percent = this.state.progress.percentComplete
    for (const milestone of MILESTONES) {
      if (percent >= milestone && this.state.lastMilestone < milestone) {
        this.state.lastMilestone = milestone
        if (milestone < 100) {
          this.state.lastEvent = 'milestone'
        }
        break
      }
    }

    // Check for completion
    if (this.state.progress.percentComplete >= 100) {
      this.state.status = 'complete'
      this.state.lastEvent = 'complete'
    }

    this.notifyStateChange()
    return true
  }

  /**
   * Erase a cell at grid coordinates
   */
  eraseCell(gridX: number, gridY: number): boolean {
    const prevColor = this.state.selectedColorIndex
    this.state.selectedColorIndex = null
    const result = this.paintCell(gridX, gridY)
    this.state.selectedColorIndex = prevColor
    return result
  }

  /**
   * Update progress calculations
   */
  private updateProgress(): void {
    const { totalCells, correctCells } = this.state.progress
    this.state.progress.percentComplete =
      totalCells > 0 ? Math.round((correctCells / totalCells) * 100) : 0
  }

  /**
   * Get current game state
   */
  getState(): GameState {
    return this.state
  }

  /**
   * Get a cell at coordinates
   */
  getCell(gridX: number, gridY: number): Cell | null {
    const puzzle = this.state.currentPuzzle
    if (!puzzle) return null
    return puzzle.cells[gridY]?.[gridX] ?? null
  }

  /**
   * Reset to menu
   */
  goToMenu(): void {
    this.state = this.createInitialState()
    this.notifyStateChange()
  }

  /**
   * Play again with same puzzle
   */
  playAgain(): void {
    const puzzle = this.state.currentPuzzle
    if (!puzzle) return

    // Reset all cells
    for (const row of puzzle.cells) {
      for (const cell of row) {
        cell.paintedColorIndex = null
        cell.isCorrect = false
      }
    }

    this.state.progress = {
      correctCells: 0,
      totalCells: puzzle.totalCells,
      percentComplete: 0,
    }
    this.state.selectedColorIndex = null
    this.state.startTime = Date.now()
    this.state.lastMilestone = 0
    this.state.lastEvent = null
    this.state.status = 'playing'
    this.notifyStateChange()
  }

  /**
   * Register state change callback
   */
  onStateChange(callback: StateChangeCallback): void {
    this.callbacks.push(callback)
  }

  /**
   * Remove state change callback
   */
  offStateChange(callback: StateChangeCallback): void {
    const idx = this.callbacks.indexOf(callback)
    if (idx >= 0) {
      this.callbacks.splice(idx, 1)
    }
  }

  /**
   * Notify all listeners of state change
   */
  private notifyStateChange(): void {
    for (const callback of this.callbacks) {
      callback(this.state)
    }
  }
}
