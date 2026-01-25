// Style 3: Modern Flat Renderer (2015)
// Material Design inspired, vibrant flat colors, smooth corners
import type { SnakeRenderer } from './index'
import type { GameState, Position } from '../game/types'

const COLORS = {
  bg: '#121212',
  surface: '#1e1e1e',
  snake1: '#4ade80',
  snake1Dark: '#22c55e',
  snake2: '#a78bfa',
  snake2Dark: '#8b5cf6',
  food: '#fb923c',
  foodDark: '#f97316',
}

export class ModernRenderer implements SnakeRenderer {
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

    // Draw food
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

    this.ctx.fillStyle = COLORS.surface

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if ((x + y) % 2 === 0) {
          this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize)
        }
      }
    }
  }

  private drawSnake(snake: Position[], playerIndex: number): void {
    if (!this.ctx) return

    const mainColor = playerIndex === 0 ? COLORS.snake1 : COLORS.snake2
    const darkColor = playerIndex === 0 ? COLORS.snake1Dark : COLORS.snake2Dark

    // Draw body segments (from tail to head)
    for (let i = snake.length - 1; i >= 0; i--) {
      const segment = snake[i]
      if (!segment) continue

      const isHead = i === 0
      const padding = 1
      const radius = 4

      // Segment size varies slightly
      const size = this.cellSize - padding * 2

      this.ctx.fillStyle = isHead ? mainColor : darkColor
      this.roundRect(
        segment.x * this.cellSize + padding,
        segment.y * this.cellSize + padding,
        size,
        size,
        radius
      )

      // Draw eyes on head
      if (isHead) {
        this.drawEyes(segment)
      }
    }
  }

  private drawEyes(head: Position): void {
    if (!this.ctx) return

    const eyeSize = this.cellSize / 6
    const eyeOffset = this.cellSize / 3.5

    // White of eyes
    this.ctx.fillStyle = 'white'

    // Left eye
    this.ctx.beginPath()
    this.ctx.arc(
      head.x * this.cellSize + eyeOffset + eyeSize,
      head.y * this.cellSize + eyeOffset + eyeSize,
      eyeSize,
      0,
      Math.PI * 2
    )
    this.ctx.fill()

    // Right eye
    this.ctx.beginPath()
    this.ctx.arc(
      head.x * this.cellSize + this.cellSize - eyeOffset - eyeSize,
      head.y * this.cellSize + eyeOffset + eyeSize,
      eyeSize,
      0,
      Math.PI * 2
    )
    this.ctx.fill()

    // Pupils
    this.ctx.fillStyle = '#1e1e1e'
    const pupilSize = eyeSize * 0.5

    this.ctx.beginPath()
    this.ctx.arc(
      head.x * this.cellSize + eyeOffset + eyeSize + pupilSize * 0.3,
      head.y * this.cellSize + eyeOffset + eyeSize,
      pupilSize,
      0,
      Math.PI * 2
    )
    this.ctx.fill()

    this.ctx.beginPath()
    this.ctx.arc(
      head.x * this.cellSize + this.cellSize - eyeOffset - eyeSize + pupilSize * 0.3,
      head.y * this.cellSize + eyeOffset + eyeSize,
      pupilSize,
      0,
      Math.PI * 2
    )
    this.ctx.fill()
  }

  private drawFood(food: Position): void {
    if (!this.ctx) return

    const padding = 4
    const size = this.cellSize - padding * 2
    const x = food.x * this.cellSize + padding
    const y = food.y * this.cellSize + padding

    // Draw shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
    this.roundRect(x + 2, y + 2, size, size, 4)

    // Draw food
    this.ctx.fillStyle = COLORS.food
    this.roundRect(x, y, size, size, 4)

    // Highlight
    this.ctx.fillStyle = COLORS.foodDark
    this.roundRect(x + size * 0.1, y + size * 0.1, size * 0.3, size * 0.3, 2)
  }

  private roundRect(x: number, y: number, w: number, h: number, r: number): void {
    if (!this.ctx) return

    this.ctx.beginPath()
    this.ctx.moveTo(x + r, y)
    this.ctx.lineTo(x + w - r, y)
    this.ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    this.ctx.lineTo(x + w, y + h - r)
    this.ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    this.ctx.lineTo(x + r, y + h)
    this.ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    this.ctx.lineTo(x, y + r)
    this.ctx.quadraticCurveTo(x, y, x + r, y)
    this.ctx.closePath()
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
