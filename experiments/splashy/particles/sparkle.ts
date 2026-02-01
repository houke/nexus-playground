// Splashy - Sparkle Particle System

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  life: number
  maxLife: number
  rotation: number
  rotationSpeed: number
}

interface SparkleOptions {
  colors?: string[]
  particleCount?: number
  duration?: number
  spread?: number
  size?: number
}

const DEFAULT_COLORS = ['#ffd700', '#ff69b4', '#00ced1'] // Gold, Pink, Cyan

export class SparkleSystem {
  private ctx: CanvasRenderingContext2D
  private particles: Particle[] = []
  private animationId: number | null = null
  private isActive: boolean = false

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!
  }

  /**
   * Emit a burst of sparkles at a position
   */
  emit(x: number, y: number, options: SparkleOptions = {}): void {
    const colors = options.colors ?? DEFAULT_COLORS
    const count = options.particleCount ?? 12
    const duration = options.duration ?? 500
    const baseSize = options.size ?? 8

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5
      const speed = 2 + Math.random() * 3
      const color = colors[Math.floor(Math.random() * colors.length)]!

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2, // Slight upward bias
        size: baseSize * (0.5 + Math.random() * 0.5),
        color,
        life: duration,
        maxLife: duration,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.3,
      })
    }

    if (!this.isActive) {
      this.start()
    }
  }

  /**
   * Start the animation loop
   */
  private start(): void {
    if (this.isActive) return
    this.isActive = true
    this.lastTime = performance.now()
    this.animate()
  }

  private lastTime: number = 0

  /**
   * Animation loop
   */
  private animate = (): void => {
    if (!this.isActive) return

    const now = performance.now()
    const deltaTime = now - this.lastTime
    this.lastTime = now

    // Update particles
    this.particles = this.particles.filter((p) => {
      p.life -= deltaTime
      if (p.life <= 0) return false

      p.x += p.vx
      p.y += p.vy
      p.vy += 0.1 // Gravity
      p.vx *= 0.98 // Friction
      p.rotation += p.rotationSpeed

      return true
    })

    // Draw particles
    this.render()

    // Continue or stop
    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(this.animate)
    } else {
      this.stop()
    }
  }

  /**
   * Render all particles
   */
  private render(): void {
    const { ctx } = this
    const canvas = ctx.canvas

    // Clear the canvas for fresh frame
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (const p of this.particles) {
      const progress = 1 - p.life / p.maxLife
      const alpha = 1 - progress * progress // Ease out
      const scale = 1 - progress * 0.5

      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rotation)
      ctx.globalAlpha = alpha

      // Draw star shape
      this.drawStar(ctx, 0, 0, p.size * scale, p.color)

      ctx.restore()
    }
  }

  /**
   * Draw a 4-pointed star
   */
  private drawStar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    color: string
  ): void {
    ctx.fillStyle = color

    ctx.beginPath()
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI / 2) * i
      const px = x + Math.cos(angle) * size
      const py = y + Math.sin(angle) * size
      if (i === 0) {
        ctx.moveTo(px, py)
      } else {
        ctx.lineTo(px, py)
      }

      // Inner point
      const innerAngle = angle + Math.PI / 4
      const innerSize = size * 0.4
      const ipx = x + Math.cos(innerAngle) * innerSize
      const ipy = y + Math.sin(innerAngle) * innerSize
      ctx.lineTo(ipx, ipy)
    }
    ctx.closePath()
    ctx.fill()
  }

  /**
   * Stop the animation loop
   */
  private stop(): void {
    this.isActive = false
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }

  /**
   * Clear all particles
   */
  clear(): void {
    this.particles = []
    this.stop()
    // Clear the canvas
    const canvas = this.ctx.canvas
    this.ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  /**
   * Destroy the system
   */
  destroy(): void {
    this.clear()
  }
}

/**
 * Create a confetti burst for celebration
 * Particles emit from edges only to frame the content, not cover it
 */
export class ConfettiSystem {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private particles: Particle[] = []
  private animationId: number | null = null
  private isActive: boolean = false
  private colors = ['#ff6b9d', '#7dd3fc', '#ffd700', '#10b981', '#8b5cf6', '#f87171']

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
  }

  /**
   * Start a confetti celebration - particles fall from edges only
   */
  celebrate(duration: number = 1800): void {
    const count = 20 // Reduced from 50
    const edgeZone = 0.25 // Particles spawn in outer 25% of screen width

    for (let i = 0; i < count; i++) {
      // Spawn only on left or right edges
      const onLeft = i < count / 2
      const x = onLeft
        ? Math.random() * this.canvas.width * edgeZone
        : this.canvas.width * (1 - edgeZone) + Math.random() * this.canvas.width * edgeZone
      const y = -10 - Math.random() * 60
      const color = this.colors[Math.floor(Math.random() * this.colors.length)]!

      this.particles.push({
        x,
        y,
        vx: onLeft ? 0.5 + Math.random() * 1.5 : -0.5 - Math.random() * 1.5, // Drift inward slightly
        vy: 1.5 + Math.random() * 2,
        size: 5 + Math.random() * 5, // Smaller: 5-10px instead of 8-16px
        color,
        life: duration,
        maxLife: duration,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.15,
      })
    }

    if (!this.isActive) {
      this.start()
    }
  }

  private lastTime: number = 0

  private start(): void {
    if (this.isActive) return
    this.isActive = true
    this.lastTime = performance.now()
    this.animate()
  }

  private animate = (): void => {
    if (!this.isActive) return

    const now = performance.now()
    const deltaTime = now - this.lastTime
    this.lastTime = now

    // Update particles
    this.particles = this.particles.filter((p) => {
      p.life -= deltaTime
      if (p.life <= 0) return false

      p.x += p.vx
      p.y += p.vy
      p.vy += 0.05 // Light gravity
      p.vx *= 0.99
      p.rotation += p.rotationSpeed

      // Remove if off screen
      if (p.y > this.canvas.height + 50) return false

      return true
    })

    // Draw
    this.render()

    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(this.animate)
    } else {
      this.stop()
    }
  }

  private render(): void {
    const { ctx, canvas } = this

    // Clear canvas for fresh frame - critical for proper fade-out
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (const p of this.particles) {
      const progress = 1 - p.life / p.maxLife
      const alpha = Math.min(1, 1 - progress * 0.5)

      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rotation)
      ctx.globalAlpha = alpha
      ctx.fillStyle = p.color

      // Draw rectangle confetti
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)

      ctx.restore()
    }
  }

  private stop(): void {
    this.isActive = false
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }

  clear(): void {
    this.particles = []
    this.stop()
    // Clear the canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  destroy(): void {
    this.clear()
    // Remove canvas from DOM if it exists
    this.canvas.remove()
  }
}
