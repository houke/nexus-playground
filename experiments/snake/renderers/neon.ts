// Style 4: Neon Cyberpunk Renderer (2020)
// Dark background with neon glow effects, synthwave colors
import type { SnakeRenderer } from './index'
import type { GameState, Position } from '../game/types'

const COLORS = {
  bg: '#0a0a0f',
  grid: '#1a1a2e',
  gridLine: '#2d2d44',
  snake1: '#00ff88',
  snake1Glow: 'rgba(0, 255, 136, 0.6)',
  snake2: '#ff00ff',
  snake2Glow: 'rgba(255, 0, 255, 0.6)',
  food: '#00f5ff',
  foodGlow: 'rgba(0, 245, 255, 0.8)',
  neonPink: '#ff2d95',
  neonCyan: '#00f5ff',
}

export class NeonRenderer implements SnakeRenderer {
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private cellSize = 20
  private time = 0

  init(canvas: HTMLCanvasElement): void {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
  }

  render(state: GameState): void {
    if (!this.ctx || !this.canvas) return

    this.time += 0.05

    const { gridWidth, gridHeight, players, food } = state
    this.cellSize = Math.min(this.canvas.width / gridWidth, this.canvas.height / gridHeight)

    // Clear with dark background
    this.ctx.fillStyle = COLORS.bg
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // Draw animated grid
    this.drawGrid(gridWidth, gridHeight)

    // Draw food with pulsing glow
    this.drawFood(food)

    // Draw snakes with neon glow
    players.forEach((player, index) => {
      if (player.alive || state.status === 'gameover') {
        this.drawSnake(player.snake, index)
      }
    })

    // Draw scanlines
    this.drawScanlines()
  }

  private drawGrid(width: number, height: number): void {
    if (!this.ctx || !this.canvas) return

    // Horizontal lines
    this.ctx.strokeStyle = COLORS.gridLine
    this.ctx.lineWidth = 1

    for (let y = 0; y <= height; y++) {
      const alpha = 0.3 + Math.sin(this.time + y * 0.1) * 0.1
      this.ctx.strokeStyle = `rgba(45, 45, 68, ${alpha})`
      this.ctx.beginPath()
      this.ctx.moveTo(0, y * this.cellSize)
      this.ctx.lineTo(this.canvas.width, y * this.cellSize)
      this.ctx.stroke()
    }

    // Vertical lines
    for (let x = 0; x <= width; x++) {
      const alpha = 0.3 + Math.sin(this.time + x * 0.1) * 0.1
      this.ctx.strokeStyle = `rgba(45, 45, 68, ${alpha})`
      this.ctx.beginPath()
      this.ctx.moveTo(x * this.cellSize, 0)
      this.ctx.lineTo(x * this.cellSize, this.canvas.height)
      this.ctx.stroke()
    }
  }

  private drawSnake(snake: Position[], playerIndex: number): void {
    if (!this.ctx) return

    const mainColor = playerIndex === 0 ? COLORS.snake1 : COLORS.snake2
    const glowColor = playerIndex === 0 ? COLORS.snake1Glow : COLORS.snake2Glow

    snake.forEach((segment, i) => {
      const isHead = i === 0
      const x = segment.x * this.cellSize + this.cellSize / 2
      const y = segment.y * this.cellSize + this.cellSize / 2
      const radius = (this.cellSize - 4) / 2

      // Outer glow
      this.ctx!.shadowColor = mainColor
      this.ctx!.shadowBlur = isHead ? 20 : 12

      // Draw glow circle
      this.ctx!.fillStyle = glowColor
      this.ctx!.beginPath()
      this.ctx!.arc(x, y, radius + 2, 0, Math.PI * 2)
      this.ctx!.fill()

      // Draw main circle
      this.ctx!.fillStyle = mainColor
      this.ctx!.beginPath()
      this.ctx!.arc(x, y, radius, 0, Math.PI * 2)
      this.ctx!.fill()

      // Inner highlight
      this.ctx!.fillStyle = 'rgba(255, 255, 255, 0.3)'
      this.ctx!.beginPath()
      this.ctx!.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.4, 0, Math.PI * 2)
      this.ctx!.fill()

      // Reset shadow
      this.ctx!.shadowBlur = 0

      // Eyes on head
      if (isHead) {
        this.drawEyes(x, y, radius)
      }
    })
  }

  private drawEyes(x: number, y: number, radius: number): void {
    if (!this.ctx) return

    const eyeOffset = radius * 0.4
    const eyeRadius = radius * 0.25

    // Glowing eyes
    this.ctx.shadowColor = '#ffffff'
    this.ctx.shadowBlur = 5

    this.ctx.fillStyle = '#ffffff'

    // Left eye
    this.ctx.beginPath()
    this.ctx.arc(x - eyeOffset, y - eyeOffset * 0.3, eyeRadius, 0, Math.PI * 2)
    this.ctx.fill()

    // Right eye
    this.ctx.beginPath()
    this.ctx.arc(x + eyeOffset, y - eyeOffset * 0.3, eyeRadius, 0, Math.PI * 2)
    this.ctx.fill()

    this.ctx.shadowBlur = 0

    // Pupils
    this.ctx.fillStyle = '#000000'
    const pupilRadius = eyeRadius * 0.5

    this.ctx.beginPath()
    this.ctx.arc(x - eyeOffset, y - eyeOffset * 0.3, pupilRadius, 0, Math.PI * 2)
    this.ctx.fill()

    this.ctx.beginPath()
    this.ctx.arc(x + eyeOffset, y - eyeOffset * 0.3, pupilRadius, 0, Math.PI * 2)
    this.ctx.fill()
  }

  private drawFood(food: Position): void {
    if (!this.ctx) return

    const x = food.x * this.cellSize + this.cellSize / 2
    const y = food.y * this.cellSize + this.cellSize / 2
    const baseRadius = (this.cellSize - 8) / 2

    // Pulsing effect
    const pulse = 1 + Math.sin(this.time * 3) * 0.15
    const radius = baseRadius * pulse

    // Outer glow
    this.ctx.shadowColor = COLORS.food
    this.ctx.shadowBlur = 25

    // Glow rings
    for (let i = 3; i > 0; i--) {
      const alpha = 0.2 / i
      this.ctx.fillStyle = `rgba(0, 245, 255, ${alpha})`
      this.ctx.beginPath()
      this.ctx.arc(x, y, radius + i * 5, 0, Math.PI * 2)
      this.ctx.fill()
    }

    // Main food
    this.ctx.fillStyle = COLORS.food
    this.ctx.beginPath()
    this.ctx.arc(x, y, radius, 0, Math.PI * 2)
    this.ctx.fill()

    // Inner highlight
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    this.ctx.beginPath()
    this.ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.3, 0, Math.PI * 2)
    this.ctx.fill()

    this.ctx.shadowBlur = 0
  }

  private drawScanlines(): void {
    if (!this.ctx || !this.canvas) return

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'

    for (let y = 0; y < this.canvas.height; y += 3) {
      this.ctx.fillRect(0, y, this.canvas.width, 1)
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
