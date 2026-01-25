// Style 2: Retro Enhanced Renderer (2005)
// Limited color palette, rounded segments, simple gradients
import type { SnakeRenderer } from './index'
import type { GameState, Position } from '../game/types'

const COLORS = {
  bg: '#1a1a2e',
  grid: '#16213e',
  snake1: '#00d4aa',
  snake1Light: '#00ffd0',
  snake2: '#ff6b9d',
  snake2Light: '#ff8fb3',
  food: '#ffd93d',
  foodGlow: '#ffec8b',
}

export class RetroRenderer implements SnakeRenderer {
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private cellSize = 20

  init(canvas: HTMLCanvasElement): void {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
  }

  render(state: GameState): void {
    if (!this.ctx || !this.canvas) return

    const { gridWidth, gridHeight, players, food } = state
    this.cellSize = Math.min(this.canvas.width / gridWidth, this.canvas.height / gridHeight)

    // Clear with dark background
    this.ctx.fillStyle = COLORS.bg
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // Draw subtle grid
    this.drawGrid(gridWidth, gridHeight)

    // Draw food with glow
    this.drawFood(food)

    // Draw snakes
    players.forEach((player, index) => {
      if (player.alive || state.status === 'gameover') {
        this.drawSnake(player.snake, index)
      }
    })
  }

  private drawGrid(width: number, height: number): void {
    if (!this.ctx) return

    this.ctx.strokeStyle = COLORS.grid
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

  private drawSnake(snake: Position[], playerIndex: number): void {
    if (!this.ctx) return

    const baseColor = playerIndex === 0 ? COLORS.snake1 : COLORS.snake2
    const lightColor = playerIndex === 0 ? COLORS.snake1Light : COLORS.snake2Light

    snake.forEach((segment, i) => {
      const isHead = i === 0
      const padding = 2
      const radius = (this.cellSize - padding * 2) / 2

      const x = segment.x * this.cellSize + this.cellSize / 2
      const y = segment.y * this.cellSize + this.cellSize / 2

      // Draw shadow
      this.ctx!.fillStyle = 'rgba(0, 0, 0, 0.3)'
      this.ctx!.beginPath()
      this.ctx!.arc(x + 2, y + 2, radius, 0, Math.PI * 2)
      this.ctx!.fill()

      // Draw gradient circle
      const gradient = this.ctx!.createRadialGradient(
        x - radius / 3,
        y - radius / 3,
        0,
        x,
        y,
        radius
      )
      gradient.addColorStop(0, lightColor)
      gradient.addColorStop(1, baseColor)

      this.ctx!.fillStyle = gradient
      this.ctx!.beginPath()
      this.ctx!.arc(x, y, radius, 0, Math.PI * 2)
      this.ctx!.fill()

      // Draw eyes on head
      if (isHead) {
        this.drawEyes(x, y, radius * 0.6)
      }
    })
  }

  private drawEyes(x: number, y: number, size: number): void {
    if (!this.ctx) return

    const eyeOffset = size * 0.4
    const eyeRadius = size * 0.25
    const pupilRadius = eyeRadius * 0.5

    // Left eye
    this.ctx.fillStyle = 'white'
    this.ctx.beginPath()
    this.ctx.arc(x - eyeOffset, y - eyeOffset * 0.5, eyeRadius, 0, Math.PI * 2)
    this.ctx.fill()

    this.ctx.fillStyle = 'black'
    this.ctx.beginPath()
    this.ctx.arc(x - eyeOffset, y - eyeOffset * 0.5, pupilRadius, 0, Math.PI * 2)
    this.ctx.fill()

    // Right eye
    this.ctx.fillStyle = 'white'
    this.ctx.beginPath()
    this.ctx.arc(x + eyeOffset, y - eyeOffset * 0.5, eyeRadius, 0, Math.PI * 2)
    this.ctx.fill()

    this.ctx.fillStyle = 'black'
    this.ctx.beginPath()
    this.ctx.arc(x + eyeOffset, y - eyeOffset * 0.5, pupilRadius, 0, Math.PI * 2)
    this.ctx.fill()
  }

  private drawFood(food: Position): void {
    if (!this.ctx) return

    const x = food.x * this.cellSize + this.cellSize / 2
    const y = food.y * this.cellSize + this.cellSize / 2
    const radius = this.cellSize / 2 - 4

    // Draw glow
    const glowGradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius * 2)
    glowGradient.addColorStop(0, 'rgba(255, 217, 61, 0.4)')
    glowGradient.addColorStop(1, 'rgba(255, 217, 61, 0)')

    this.ctx.fillStyle = glowGradient
    this.ctx.beginPath()
    this.ctx.arc(x, y, radius * 2, 0, Math.PI * 2)
    this.ctx.fill()

    // Draw food
    const gradient = this.ctx.createRadialGradient(x - radius / 3, y - radius / 3, 0, x, y, radius)
    gradient.addColorStop(0, COLORS.foodGlow)
    gradient.addColorStop(1, COLORS.food)

    this.ctx.fillStyle = gradient
    this.ctx.beginPath()
    this.ctx.arc(x, y, radius, 0, Math.PI * 2)
    this.ctx.fill()
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
