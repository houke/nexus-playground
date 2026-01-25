// DOS-Authentic Renderer for Mamba Game
import type { GameState, Position, WallSegment, Collectible } from '../game/types'
import type { Renderer } from './index'

// CGA Color Palette (authentic DOS Mamba colors)
const COLORS = {
  background: '#0C0C0C', // Deep black
  border: '#555555', // Gray border
  mamba: '#AA5500', // Mamba gold/brown
  mambaHead: '#FFAA00', // Brighter head
  wallSolid: '#AAAAAA', // Gray walls
  bronze: '#AA5500', // Bronze/orange (candy)
  silver: '#C0C0C0', // Silver (wall transforms)
  text: '#FFB000', // Phosphor amber
  textDim: '#AA7700', // Dimmer text
}

export class DOSRenderer implements Renderer {
  private ctx: CanvasRenderingContext2D
  private cellSize: number
  private offsetX: number
  private offsetY: number

  constructor(private canvas: HTMLCanvasElement) {
    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('Could not get 2D context')
    }
    this.ctx = context

    // Calculate cell size based on canvas dimensions
    // Leave some space for border
    const maxCellWidth = Math.floor((canvas.width - 4) / 30)
    const maxCellHeight = Math.floor((canvas.height - 4) / 20)
    this.cellSize = Math.min(maxCellWidth, maxCellHeight)

    // Center the grid
    this.offsetX = Math.floor((canvas.width - this.cellSize * 30) / 2)
    this.offsetY = Math.floor((canvas.height - this.cellSize * 20) / 2)

    // Pixel-perfect rendering
    this.ctx.imageSmoothingEnabled = false
  }

  render(state: GameState): void {
    const { ctx } = this

    // Clear with background
    ctx.fillStyle = COLORS.background
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // Draw subtle scanlines for CRT effect
    this.drawScanlines()

    // Draw border
    this.drawBorder(state)

    // Draw game elements
    this.drawWalls(state.walls)
    this.drawCollectibles(state.collectibles)
    this.drawMamba(state)
  }

  private drawScanlines(): void {
    const { ctx } = this
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
    for (let y = 0; y < this.canvas.height; y += 2) {
      ctx.fillRect(0, y, this.canvas.width, 1)
    }
  }

  private drawBorder(state: GameState): void {
    const { ctx } = this
    const x = this.offsetX - 2
    const y = this.offsetY - 2
    const w = state.gridWidth * this.cellSize + 4
    const h = state.gridHeight * this.cellSize + 4

    ctx.strokeStyle = COLORS.border
    ctx.lineWidth = 2
    ctx.strokeRect(x, y, w, h)
  }

  private drawWalls(walls: Map<string, WallSegment>): void {
    const { ctx, cellSize, offsetX, offsetY } = this

    for (const [, wall] of walls) {
      const x = offsetX + wall.position.x * cellSize
      const y = offsetY + wall.position.y * cellSize

      // All walls are solid (silver collectibles are in collectibles array now)
      ctx.fillStyle = COLORS.wallSolid
      ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2)
    }
  }

  private drawCollectibles(collectibles: Collectible[]): void {
    const { ctx, cellSize, offsetX, offsetY } = this

    for (const collectible of collectibles) {
      const x = offsetX + collectible.position.x * cellSize
      const y = offsetY + collectible.position.y * cellSize
      const centerX = x + cellSize / 2
      const centerY = y + cellSize / 2

      if (collectible.type === 'bronze') {
        // Bronze candy - small circular dot
        ctx.fillStyle = COLORS.bronze
        const radius = cellSize / 3
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
        ctx.fill()
      } else if (collectible.type === 'silver') {
        // Silver - larger shiny dot (transformed from wall)
        ctx.fillStyle = COLORS.silver
        const radius = cellSize / 2.5
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
        ctx.fill()
        // Add shine effect
        ctx.fillStyle = '#FFFFFF'
        ctx.beginPath()
        ctx.arc(centerX - 2, centerY - 2, radius / 3, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  private drawMamba(state: GameState): void {
    const { ctx, cellSize, offsetX, offsetY } = this
    const { mamba } = state

    // Draw body segments
    ctx.fillStyle = COLORS.mamba
    for (const segment of mamba.body) {
      const x = offsetX + segment.x * cellSize
      const y = offsetY + segment.y * cellSize
      ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2)
    }

    // Draw head (brighter)
    ctx.fillStyle = COLORS.mambaHead
    const headX = offsetX + mamba.head.x * cellSize
    const headY = offsetY + mamba.head.y * cellSize
    ctx.fillRect(headX + 1, headY + 1, cellSize - 2, cellSize - 2)

    // Draw eyes based on direction
    this.drawEyes(mamba.head, mamba.direction)
  }

  private drawEyes(head: Position, direction: string): void {
    const { ctx, cellSize, offsetX, offsetY } = this
    const x = offsetX + head.x * cellSize
    const y = offsetY + head.y * cellSize
    const eyeSize = Math.max(2, cellSize / 6)

    ctx.fillStyle = '#000000'

    let eye1X: number, eye1Y: number, eye2X: number, eye2Y: number

    switch (direction) {
      case 'up':
        eye1X = x + cellSize * 0.3
        eye1Y = y + cellSize * 0.3
        eye2X = x + cellSize * 0.7 - eyeSize
        eye2Y = y + cellSize * 0.3
        break
      case 'down':
        eye1X = x + cellSize * 0.3
        eye1Y = y + cellSize * 0.7 - eyeSize
        eye2X = x + cellSize * 0.7 - eyeSize
        eye2Y = y + cellSize * 0.7 - eyeSize
        break
      case 'left':
        eye1X = x + cellSize * 0.3
        eye1Y = y + cellSize * 0.3
        eye2X = x + cellSize * 0.3
        eye2Y = y + cellSize * 0.7 - eyeSize
        break
      case 'right':
      default:
        eye1X = x + cellSize * 0.7 - eyeSize
        eye1Y = y + cellSize * 0.3
        eye2X = x + cellSize * 0.7 - eyeSize
        eye2Y = y + cellSize * 0.7 - eyeSize
        break
    }

    ctx.fillRect(eye1X, eye1Y, eyeSize, eyeSize)
    ctx.fillRect(eye2X, eye2Y, eyeSize, eyeSize)
  }

  destroy(): void {
    // Nothing to clean up
  }
}
