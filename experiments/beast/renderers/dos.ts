// Beast Game - DOS ASCII Renderer
import type { GameState, Position, Block, Entity } from '../game/types'
import { CHARS, GRID_WIDTH, GRID_HEIGHT } from '../game/types'

export interface RendererOptions {
  cellSize?: number
  showScanlines?: boolean
}

export class DOSRenderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private cellWidth: number
  private cellHeight: number
  private showScanlines: boolean
  private animationFrame: number | null = null

  // Colors matching DOS CGA/EGA palette
  private colors = {
    background: '#000000',
    text: '#00FF00',
    player: '#FFFFFF',
    beast: '#FF0000',
    superBeast: '#FF00FF',
    hatchedBeast: '#FFFF00',
    egg: '#00FFFF',
    movableBlock: '#00AA00',
    staticBlock: '#AAAAAA',
    explosiveBlock: '#FF6600',
    border: '#555555',
    glow: 'rgba(0, 255, 0, 0.1)',
  }

  // Death/crush animation state
  private flashTimer = 0
  private flashColor: string | null = null
  private crushedPositions: Position[] = []
  private crushAnimTimer = 0

  constructor(canvas: HTMLCanvasElement, options: RendererOptions = {}) {
    this.canvas = canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not get canvas context')
    this.ctx = ctx

    this.showScanlines = options.showScanlines ?? true
    this.cellWidth = 0
    this.cellHeight = 0

    this.resize()
    window.addEventListener('resize', this.resize.bind(this))
  }

  private resize(): void {
    const container = this.canvas.parentElement
    if (!container) return

    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight

    // Calculate cell size to fit grid
    const maxCellWidth = Math.floor(containerWidth / GRID_WIDTH)
    const maxCellHeight = Math.floor(containerHeight / GRID_HEIGHT)

    // Use the smaller dimension to maintain aspect ratio
    // Characters are roughly 2:1 aspect ratio
    this.cellHeight = Math.min(maxCellHeight, Math.floor(maxCellWidth * 1.5))
    this.cellWidth = Math.floor(this.cellHeight * 0.7)

    // Set canvas size
    this.canvas.width = this.cellWidth * GRID_WIDTH
    this.canvas.height = this.cellHeight * GRID_HEIGHT

    // Center canvas in container
    this.canvas.style.width = `${this.canvas.width}px`
    this.canvas.style.height = `${this.canvas.height}px`
  }

  render(state: GameState): void {
    const { ctx, cellHeight } = this

    // Clear with background
    ctx.fillStyle = this.flashColor || this.colors.background
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // Reset flash
    if (this.flashTimer > 0) {
      this.flashTimer--
      if (this.flashTimer === 0) {
        this.flashColor = null
      }
    }

    // Update crush animation
    if (this.crushAnimTimer > 0) {
      this.crushAnimTimer--
      if (this.crushAnimTimer === 0) {
        this.crushedPositions = []
      }
    }

    // Set font
    const fontSize = Math.floor(cellHeight * 0.85)
    ctx.font = `${fontSize}px VT323, monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Draw blocks
    for (const block of state.blocks) {
      this.drawBlock(block)
    }

    // Draw entities
    for (const entity of state.entities) {
      this.drawEntity(entity)
    }

    // Draw player
    this.drawPlayer(state.player)

    // Draw crush animations
    for (const pos of this.crushedPositions) {
      this.drawCrushEffect(pos)
    }

    // Draw scanlines effect
    if (this.showScanlines) {
      this.drawScanlines()
    }

    // Draw CRT glow
    this.drawGlow()
  }

  private drawBlock(block: Block): void {
    const { ctx, cellWidth, cellHeight, colors } = this
    const x = block.position.x * cellWidth + cellWidth / 2
    const y = block.position.y * cellHeight + cellHeight / 2

    let color: string
    let char: string

    switch (block.type) {
      case 'movable':
        color = colors.movableBlock
        char = CHARS.movableBlock
        break
      case 'static':
        color = colors.staticBlock
        char = CHARS.staticBlock
        break
      case 'explosive':
        color = colors.explosiveBlock
        char = CHARS.explosiveBlock
        break
      default:
        return
    }

    ctx.fillStyle = color
    ctx.fillText(char, x, y)
  }

  private drawEntity(entity: Entity): void {
    const { ctx, cellWidth, cellHeight, colors } = this
    const x = entity.position.x * cellWidth + cellWidth / 2
    const y = entity.position.y * cellHeight + cellHeight / 2

    let color: string
    let char: string

    switch (entity.type) {
      case 'beast':
        color = colors.beast
        char = CHARS.beast
        break
      case 'super-beast':
        color = colors.superBeast
        char = CHARS.superBeast
        break
      case 'hatched-beast':
        color = colors.hatchedBeast
        char = CHARS.hatchedBeast
        break
      case 'egg':
        color = colors.egg
        char = CHARS.egg
        break
      default:
        return
    }

    // Add glow effect for enemies
    ctx.shadowColor = color
    ctx.shadowBlur = 5
    ctx.fillStyle = color
    ctx.fillText(char, x, y)
    ctx.shadowBlur = 0
  }

  private drawPlayer(position: Position): void {
    const { ctx, cellWidth, cellHeight, colors } = this
    const x = position.x * cellWidth + cellWidth / 2
    const y = position.y * cellHeight + cellHeight / 2

    // Player with glow
    ctx.shadowColor = colors.player
    ctx.shadowBlur = 8
    ctx.fillStyle = colors.player
    ctx.fillText(CHARS.player, x, y)
    ctx.shadowBlur = 0
  }

  private drawCrushEffect(pos: Position): void {
    const { ctx, cellWidth, cellHeight } = this
    const x = pos.x * cellWidth
    const y = pos.y * cellHeight

    // Flash effect
    const alpha = this.crushAnimTimer / 10
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
    ctx.fillRect(x, y, cellWidth, cellHeight)
  }

  private drawScanlines(): void {
    const { ctx, canvas } = this

    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
    for (let y = 0; y < canvas.height; y += 3) {
      ctx.fillRect(0, y, canvas.width, 1)
    }
  }

  private drawGlow(): void {
    const { ctx, canvas, colors } = this

    // Vignette effect
    const gradient = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      canvas.width * 0.3,
      canvas.width / 2,
      canvas.height / 2,
      canvas.width * 0.7
    )
    gradient.addColorStop(0, 'transparent')
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Border glow
    ctx.strokeStyle = colors.glow
    ctx.lineWidth = 2
    ctx.strokeRect(0, 0, canvas.width, canvas.height)
  }

  // Trigger visual effects
  triggerDeathFlash(): void {
    this.flashColor = 'rgba(255, 0, 0, 0.3)'
    this.flashTimer = 5
  }

  triggerCrushEffect(positions: Position[]): void {
    this.crushedPositions = positions
    this.crushAnimTimer = 10
  }

  triggerLevelUpFlash(): void {
    this.flashColor = 'rgba(0, 255, 0, 0.2)'
    this.flashTimer = 8
  }

  destroy(): void {
    window.removeEventListener('resize', this.resize.bind(this))
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
    }
  }
}
