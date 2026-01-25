// Style 1: Nokia Classic Renderer (1997)
// Monochrome green palette, chunky pixels, authentic retro feel
import type { SnakeRenderer } from './index'
import type { GameState, Position } from '../game/types'

const NOKIA_GREEN = '#9BBC0F'
const NOKIA_DARK = '#0F380F'
const NOKIA_LIGHT = '#8BAC0F'
const NOKIA_DARKEST = '#306230'

export class NokiaRenderer implements SnakeRenderer {
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private cellSize = 20

  init(canvas: HTMLCanvasElement): void {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')

    if (this.ctx) {
      // Disable image smoothing for crisp pixels
      this.ctx.imageSmoothingEnabled = false
    }
  }

  render(state: GameState): void {
    if (!this.ctx || !this.canvas) return

    const { gridWidth, gridHeight, players, food } = state
    this.cellSize = Math.min(this.canvas.width / gridWidth, this.canvas.height / gridHeight)

    // Clear with Nokia dark green
    this.ctx.fillStyle = NOKIA_DARK
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // Draw grid pattern (subtle)
    this.drawGrid(gridWidth, gridHeight)

    // Draw food
    this.drawFood(food)

    // Draw snakes
    players.forEach((player, index) => {
      if (player.alive || state.status === 'gameover') {
        this.drawSnake(player.snake, index)
      }
    })

    // Draw scanlines effect
    this.drawScanlines()
  }

  private drawGrid(width: number, height: number): void {
    if (!this.ctx) return

    this.ctx.strokeStyle = NOKIA_DARKEST
    this.ctx.lineWidth = 1

    for (let x = 0; x <= width; x++) {
      this.ctx.beginPath()
      this.ctx.moveTo(x * this.cellSize, 0)
      this.ctx.lineTo(x * this.cellSize, height * this.cellSize)
      this.ctx.stroke()
    }

    for (let y = 0; y <= height; y++) {
      this.ctx.beginPath()
      this.ctx.moveTo(0, y * this.cellSize)
      this.ctx.lineTo(width * this.cellSize, y * this.cellSize)
      this.ctx.stroke()
    }
  }

  private drawSnake(snake: Position[], _playerIndex: number): void {
    if (!this.ctx) return

    snake.forEach((segment, i) => {
      const isHead = i === 0
      const padding = 1

      // Draw segment
      this.ctx!.fillStyle = isHead ? NOKIA_GREEN : NOKIA_LIGHT
      this.ctx!.fillRect(
        segment.x * this.cellSize + padding,
        segment.y * this.cellSize + padding,
        this.cellSize - padding * 2,
        this.cellSize - padding * 2
      )

      // Draw head details
      if (isHead) {
        this.drawHeadDetails(segment)
      }
    })
  }

  private drawHeadDetails(head: Position): void {
    if (!this.ctx) return

    // Simple pixel eyes
    const eyeSize = Math.max(2, this.cellSize / 6)
    const eyeOffset = this.cellSize / 4

    this.ctx.fillStyle = NOKIA_DARK

    // Left eye
    this.ctx.fillRect(
      head.x * this.cellSize + eyeOffset,
      head.y * this.cellSize + eyeOffset,
      eyeSize,
      eyeSize
    )

    // Right eye
    this.ctx.fillRect(
      head.x * this.cellSize + this.cellSize - eyeOffset - eyeSize,
      head.y * this.cellSize + eyeOffset,
      eyeSize,
      eyeSize
    )
  }

  private drawFood(food: Position): void {
    if (!this.ctx) return

    const padding = 3

    // Draw food as a small square (apple/dot)
    this.ctx.fillStyle = NOKIA_GREEN
    this.ctx.fillRect(
      food.x * this.cellSize + padding,
      food.y * this.cellSize + padding,
      this.cellSize - padding * 2,
      this.cellSize - padding * 2
    )
  }

  private drawScanlines(): void {
    if (!this.ctx || !this.canvas) return

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'

    for (let y = 0; y < this.canvas.height; y += 4) {
      this.ctx.fillRect(0, y, this.canvas.width, 2)
    }
  }

  resize(width: number, height: number): void {
    if (!this.canvas) return
    this.canvas.width = width
    this.canvas.height = height
  }

  destroy(): void {
    this.canvas = null
    this.ctx = null
  }
}
