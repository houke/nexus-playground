// Splashy - Grid Renderer
import type { PuzzleData, Cell, PaletteColor } from '../game/types'
import { CELL_SIZE, NUMBER_FONT_SIZE } from '../game/types'

export interface GridRendererOptions {
  cellSize?: number
  numberFontSize?: number
  showNumbers?: boolean
  font?: string
}

export class GridRenderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private cellSize: number
  private numberFontSize: number
  private showNumbers: boolean
  private font: string

  private offsetX: number = 0
  private offsetY: number = 0

  constructor(canvas: HTMLCanvasElement, options: GridRendererOptions = {}) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.cellSize = options.cellSize ?? CELL_SIZE
    this.numberFontSize = options.numberFontSize ?? NUMBER_FONT_SIZE
    this.showNumbers = options.showNumbers ?? true
    this.font = options.font ?? "'Baloo 2', 'Nunito', sans-serif"
  }

  /**
   * Initialize renderer for a puzzle
   */
  init(puzzle: PuzzleData): { width: number; height: number; offsetX: number; offsetY: number } {
    const gridWidth = puzzle.gridWidth * this.cellSize
    const gridHeight = puzzle.gridHeight * this.cellSize

    // Add padding for centering
    const padding = 20
    this.canvas.width = gridWidth + padding * 2
    this.canvas.height = gridHeight + padding * 2

    this.offsetX = padding
    this.offsetY = padding

    return {
      width: this.canvas.width,
      height: this.canvas.height,
      offsetX: this.offsetX,
      offsetY: this.offsetY,
    }
  }

  /**
   * Get the offset values
   */
  getOffsets(): { offsetX: number; offsetY: number } {
    return { offsetX: this.offsetX, offsetY: this.offsetY }
  }

  /**
   * Render the entire grid
   */
  render(puzzle: PuzzleData, selectedColorIndex: number | null): void {
    const { ctx, cellSize, offsetX, offsetY } = this

    // Clear canvas
    ctx.fillStyle = '#fff8e7' // --pbn-bg-canvas
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // Draw each cell
    for (let y = 0; y < puzzle.gridHeight; y++) {
      for (let x = 0; x < puzzle.gridWidth; x++) {
        const cell = puzzle.cells[y]?.[x]
        if (!cell) continue

        this.renderCell(
          cell,
          puzzle.palette,
          offsetX + x * cellSize,
          offsetY + y * cellSize,
          selectedColorIndex
        )
      }
    }
  }

  /**
   * Render a single cell
   */
  private renderCell(
    cell: Cell,
    palette: PaletteColor[],
    x: number,
    y: number,
    selectedColorIndex: number | null
  ): void {
    const { ctx, cellSize, numberFontSize } = this

    // Get target color
    const targetColor = palette[cell.targetColorIndex - 1]
    if (!targetColor) return

    // Cell background
    if (cell.paintedColorIndex !== null) {
      // Painted - use painted color
      const paintedColor = palette[cell.paintedColorIndex - 1]
      ctx.fillStyle = paintedColor?.hex ?? '#cccccc'
    } else {
      // Unpainted - light background with color hint
      ctx.fillStyle = this.lightenColor(targetColor.hex, 0.85)
    }

    ctx.fillRect(x, y, cellSize, cellSize)

    // Cell border
    ctx.strokeStyle = '#d4d4d8'
    ctx.lineWidth = 1
    ctx.strokeRect(x + 0.5, y + 0.5, cellSize - 1, cellSize - 1)

    // Highlight if this color is selected and cell is unpainted
    if (cell.paintedColorIndex === null && selectedColorIndex === cell.targetColorIndex) {
      ctx.strokeStyle = targetColor.hex
      ctx.lineWidth = 2
      ctx.strokeRect(x + 1, y + 1, cellSize - 2, cellSize - 2)
    }

    // Draw number if:
    // - Cell is unpainted OR
    // - Cell is painted with wrong color
    const shouldShowNumber =
      this.showNumbers && (cell.paintedColorIndex === null || !cell.isCorrect)

    if (shouldShowNumber) {
      ctx.font = `bold ${numberFontSize}px ${this.font}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // Text color - dark for light backgrounds, white for dark
      if (cell.paintedColorIndex !== null) {
        // Wrong color - use contrasting color
        const paintedColor = palette[cell.paintedColorIndex - 1]
        ctx.fillStyle = this.getContrastColor(paintedColor?.hex ?? '#000000')
      } else {
        // Unpainted - use dark text
        ctx.fillStyle = '#374151'
      }

      ctx.fillText(
        String(cell.targetColorIndex),
        x + cellSize / 2,
        y + cellSize / 2 + 2 // Slight offset for visual centering
      )
    }
  }

  /**
   * Lighten a hex color
   */
  private lightenColor(hex: string, amount: number): string {
    const num = parseInt(hex.slice(1), 16)
    const r = Math.round((num >> 16) + (255 - (num >> 16)) * amount)
    const g = Math.round(((num >> 8) & 0x00ff) + (255 - ((num >> 8) & 0x00ff)) * amount)
    const b = Math.round((num & 0x0000ff) + (255 - (num & 0x0000ff)) * amount)

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
  }

  /**
   * Get a contrasting text color (black or white)
   */
  private getContrastColor(hex: string): string {
    const num = parseInt(hex.slice(1), 16)
    const r = num >> 16
    const g = (num >> 8) & 0x00ff
    const b = num & 0x0000ff

    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

    return luminance > 0.5 ? '#1f2937' : '#ffffff'
  }

  /**
   * Apply shake animation to canvas container
   */
  shake(container: HTMLElement): void {
    container.classList.remove('shake')
    // Force reflow to restart animation
    void container.offsetWidth
    container.classList.add('shake')

    setTimeout(() => {
      container.classList.remove('shake')
    }, 400)
  }

  /**
   * Clean up renderer
   */
  destroy(): void {
    // Nothing to clean up currently
  }
}
