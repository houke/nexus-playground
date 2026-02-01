/**
 * Unit tests for Splashy GameEngine
 * Tests state machine transitions, painting mechanics, and game flow
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GameEngine } from '../engine'
import type { PuzzleData, Cell, PaletteColor, GameState } from '../types'

// Mock ImageProcessor to avoid canvas dependencies
vi.mock('../image-processor', () => {
  return {
    ImageProcessor: class MockImageProcessor {
      process = vi.fn()
    },
  }
})

/**
 * Create a mock puzzle for testing
 */
function createMockPuzzle(width = 3, height = 3, numColors = 3): PuzzleData {
  const palette: PaletteColor[] = Array.from({ length: numColors }, (_, i) => ({
    r: Math.floor(255 * (i / numColors)),
    g: 100,
    b: 200,
    index: i + 1,
    hex: `#${Math.floor(255 * (i / numColors))
      .toString(16)
      .padStart(2, '0')}64c8`,
    cellCount: Math.floor((width * height) / numColors),
  }))

  const cells: Cell[][] = []
  for (let y = 0; y < height; y++) {
    const row: Cell[] = []
    for (let x = 0; x < width; x++) {
      row.push({
        x,
        y,
        targetColorIndex: ((x + y) % numColors) + 1, // Deterministic pattern
        paintedColorIndex: null,
        isCorrect: false,
      })
    }
    cells.push(row)
  }

  return {
    id: 'test-puzzle',
    name: 'Test Puzzle',
    sourceImageUrl: '/test/image.png',
    gridWidth: width,
    gridHeight: height,
    palette,
    cells,
    totalCells: width * height,
  }
}

describe('GameEngine', () => {
  let engine: GameEngine

  beforeEach(() => {
    engine = new GameEngine('/test-path')
  })

  describe('Initial State', () => {
    it('should start in menu status', () => {
      const state = engine.getState()
      expect(state.status).toBe('menu')
    })

    it('should have null puzzle initially', () => {
      const state = engine.getState()
      expect(state.currentPuzzle).toBeNull()
    })

    it('should have null selected color initially', () => {
      const state = engine.getState()
      expect(state.selectedColorIndex).toBeNull()
    })

    it('should have zero progress initially', () => {
      const state = engine.getState()
      expect(state.progress.correctCells).toBe(0)
      expect(state.progress.totalCells).toBe(0)
      expect(state.progress.percentComplete).toBe(0)
    })
  })

  describe('Color Selection', () => {
    it('should select a color', () => {
      engine.selectColor(1)
      expect(engine.getState().selectedColorIndex).toBe(1)
    })

    it('should set lastEvent to colorSelect', () => {
      engine.selectColor(2)
      expect(engine.getState().lastEvent).toBe('colorSelect')
    })

    it('should allow selecting null for eraser mode', () => {
      engine.selectColor(1)
      engine.selectColor(null)
      expect(engine.getState().selectedColorIndex).toBeNull()
      expect(engine.getState().lastEvent).toBe('eraser')
    })

    it('should allow changing selected color', () => {
      engine.selectColor(1)
      engine.selectColor(3)
      expect(engine.getState().selectedColorIndex).toBe(3)
    })
  })

  describe('State Change Callbacks', () => {
    it('should notify listeners on state change', () => {
      const callback = vi.fn()
      engine.onStateChange(callback)

      engine.selectColor(1)

      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedColorIndex: 1,
        })
      )
    })

    it('should allow removing callbacks', () => {
      const callback = vi.fn()
      engine.onStateChange(callback)
      engine.offStateChange(callback)

      engine.selectColor(1)

      expect(callback).not.toHaveBeenCalled()
    })

    it('should support multiple callbacks', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()
      engine.onStateChange(callback1)
      engine.onStateChange(callback2)

      engine.selectColor(1)

      expect(callback1).toHaveBeenCalledTimes(1)
      expect(callback2).toHaveBeenCalledTimes(1)
    })
  })

  describe('goToMenu', () => {
    it('should reset state to initial values', () => {
      // First modify some state
      engine.selectColor(2)

      // Then go to menu
      engine.goToMenu()

      const state = engine.getState()
      expect(state.status).toBe('menu')
      expect(state.currentPuzzle).toBeNull()
      expect(state.selectedColorIndex).toBeNull()
      expect(state.progress.correctCells).toBe(0)
    })
  })
})

describe('GameEngine with Mock Puzzle', () => {
  let engine: GameEngine
  let mockPuzzle: PuzzleData

  beforeEach(() => {
    engine = new GameEngine('/test-path')
    mockPuzzle = createMockPuzzle(3, 3, 3)

    // Manually set up the engine state with mock puzzle
    // We'll access private state via type assertion for testing
    const state = engine.getState() as GameState
    Object.assign(state, {
      status: 'playing',
      currentPuzzle: mockPuzzle,
      progress: {
        correctCells: 0,
        totalCells: mockPuzzle.totalCells,
        percentComplete: 0,
      },
      startTime: Date.now(),
      lastMilestone: 0,
    })
  })

  describe('paintCell', () => {
    it('should not paint without selected color (before selecting)', () => {
      const result = engine.paintCell(0, 0)
      expect(result).toBe(false)
    })

    it('should paint cell when color is selected', () => {
      engine.selectColor(1)
      const result = engine.paintCell(0, 0)
      expect(result).toBe(true)
    })

    it('should reject out-of-bounds coordinates', () => {
      engine.selectColor(1)

      expect(engine.paintCell(-1, 0)).toBe(false)
      expect(engine.paintCell(0, -1)).toBe(false)
      expect(engine.paintCell(100, 0)).toBe(false)
      expect(engine.paintCell(0, 100)).toBe(false)
    })

    it('should mark cell as correct when matching target color', () => {
      // Cell at (0, 0) has target index: (0 + 0) % 3 + 1 = 1
      engine.selectColor(1)
      engine.paintCell(0, 0)

      const cell = engine.getCell(0, 0)
      expect(cell?.paintedColorIndex).toBe(1)
      expect(cell?.isCorrect).toBe(true)
    })

    it('should mark cell as incorrect when not matching target', () => {
      // Cell at (0, 0) has target index 1, paint with 2
      engine.selectColor(2)
      engine.paintCell(0, 0)

      const cell = engine.getCell(0, 0)
      expect(cell?.paintedColorIndex).toBe(2)
      expect(cell?.isCorrect).toBe(false)
    })

    it('should set lastEvent to correct on correct paint', () => {
      // Cell at (0, 0) has target index 1
      engine.selectColor(1)
      engine.paintCell(0, 0)

      expect(engine.getState().lastEvent).toBe('correct')
    })

    it('should set lastEvent to incorrect on wrong paint', () => {
      // Cell at (0, 0) has target index 1, paint with 2
      engine.selectColor(2)
      engine.paintCell(0, 0)

      expect(engine.getState().lastEvent).toBe('incorrect')
    })

    it('should update progress when painting correctly', () => {
      engine.selectColor(1)
      engine.paintCell(0, 0)

      const state = engine.getState()
      expect(state.progress.correctCells).toBe(1)
      expect(state.progress.percentComplete).toBeGreaterThan(0)
    })

    it('should allow painting over with a different color', () => {
      // Paint with wrong color first
      engine.selectColor(2)
      engine.paintCell(0, 0)

      // Now paint with correct color
      engine.selectColor(1)
      engine.paintCell(0, 0)

      const cell = engine.getCell(0, 0)
      expect(cell?.paintedColorIndex).toBe(1)
      expect(cell?.isCorrect).toBe(true)
    })

    it('should not allow painting over correct cells (locked)', () => {
      // First paint correctly
      engine.selectColor(1)
      engine.paintCell(0, 0)
      expect(engine.getState().progress.correctCells).toBe(1)

      // Try to paint over with wrong color - should be prevented
      engine.selectColor(2)
      const result = engine.paintCell(0, 0)
      expect(result).toBe(false) // Action was rejected
      expect(engine.getState().progress.correctCells).toBe(1) // Still correct
      expect(engine.getCell(0, 0)?.paintedColorIndex).toBe(1) // Color unchanged
      expect(engine.getCell(0, 0)?.isCorrect).toBe(true) // Still correct
    })

    it('should not repaint with the same color', () => {
      // Paint a cell
      engine.selectColor(1)
      const firstResult = engine.paintCell(0, 0)
      expect(firstResult).toBe(true)

      // Try to paint the same cell with the same color
      const secondResult = engine.paintCell(0, 0)
      expect(secondResult).toBe(false) // Action was rejected
      expect(engine.getCell(0, 0)?.paintedColorIndex).toBe(1) // Still the same
    })
  })

  describe('eraseCell', () => {
    it('should remove paint from a painted cell', () => {
      // Paint cell first
      engine.selectColor(1)
      engine.paintCell(0, 0)

      // Erase it
      const result = engine.eraseCell(0, 0)
      expect(result).toBe(true)

      const cell = engine.getCell(0, 0)
      expect(cell?.paintedColorIndex).toBeNull()
      expect(cell?.isCorrect).toBe(false)
    })

    it('should return false when erasing unpainted cell', () => {
      const result = engine.eraseCell(0, 0)
      expect(result).toBe(false)
    })

    it('should decrement correctCells when erasing correct cell', () => {
      engine.selectColor(1)
      engine.paintCell(0, 0)
      expect(engine.getState().progress.correctCells).toBe(1)

      engine.eraseCell(0, 0)
      expect(engine.getState().progress.correctCells).toBe(0)
    })

    it('should preserve selected color after erasing', () => {
      engine.selectColor(2)
      engine.eraseCell(0, 0)

      // Should still have color 2 selected (eraseCell uses temp null)
      expect(engine.getState().selectedColorIndex).toBe(2)
    })
  })

  describe('getCell', () => {
    it('should return cell at valid coordinates', () => {
      const cell = engine.getCell(1, 1)
      expect(cell).not.toBeNull()
      expect(cell?.x).toBe(1)
      expect(cell?.y).toBe(1)
    })

    it('should return null for invalid coordinates', () => {
      expect(engine.getCell(-1, 0)).toBeNull()
      expect(engine.getCell(0, -1)).toBeNull()
      expect(engine.getCell(100, 100)).toBeNull()
    })
  })

  describe('Milestones', () => {
    it('should trigger milestone at 25% completion', () => {
      // With 9 cells, 25% is ~2.25, so 3 cells
      // Paint 3 cells correctly
      // Cells at positions that have target 1: (0,0), (1,2), (2,1) based on formula
      engine.selectColor(1)
      engine.paintCell(0, 0)

      // After 1 correct of 9 = 11%, no milestone
      expect(engine.getState().lastMilestone).toBe(0)

      // Paint more cells correctly to reach 25%
      engine.selectColor(2)
      engine.paintCell(1, 0)
      engine.selectColor(3)
      engine.paintCell(2, 0)

      // 3 of 9 = 33%, should trigger 25% milestone
      expect(engine.getState().lastMilestone).toBeGreaterThanOrEqual(25)
    })
  })

  describe('Completion', () => {
    it('should complete when all cells are correctly painted', () => {
      const puzzle = engine.getState().currentPuzzle
      if (!puzzle) return

      // Paint all cells correctly based on their target
      for (let y = 0; y < puzzle.gridHeight; y++) {
        for (let x = 0; x < puzzle.gridWidth; x++) {
          const cell = puzzle.cells[y]?.[x]
          if (cell) {
            engine.selectColor(cell.targetColorIndex)
            engine.paintCell(x, y)
          }
        }
      }

      const state = engine.getState()
      expect(state.status).toBe('complete')
      expect(state.lastEvent).toBe('complete')
      expect(state.progress.percentComplete).toBe(100)
    })
  })

  describe('playAgain', () => {
    it('should reset all cells to unpainted', () => {
      // Paint some cells
      engine.selectColor(1)
      engine.paintCell(0, 0)
      engine.paintCell(1, 0)

      // Play again
      engine.playAgain()

      // Check cells are reset
      const cell1 = engine.getCell(0, 0)
      const cell2 = engine.getCell(1, 0)
      expect(cell1?.paintedColorIndex).toBeNull()
      expect(cell2?.paintedColorIndex).toBeNull()
    })

    it('should reset progress to 0', () => {
      engine.selectColor(1)
      engine.paintCell(0, 0)

      engine.playAgain()

      const state = engine.getState()
      expect(state.progress.correctCells).toBe(0)
      expect(state.progress.percentComplete).toBe(0)
    })

    it('should set status back to playing', () => {
      engine.playAgain()
      expect(engine.getState().status).toBe('playing')
    })

    it('should clear selected color', () => {
      engine.selectColor(2)
      engine.playAgain()
      expect(engine.getState().selectedColorIndex).toBeNull()
    })
  })
})
