// Splashy - Audio Manager
import type { GameSettings } from '../game/types'

type SoundType =
  | 'tap_correct'
  | 'tap_wrong'
  | 'eraser'
  | 'color_select'
  | 'milestone'
  | 'morph'
  | 'tadaaa'

export class AudioManager {
  private context: AudioContext | null = null
  private enabled: boolean
  private volume: number

  constructor(settings: GameSettings) {
    this.enabled = settings.soundEnabled
    this.volume = settings.volume / 100
  }

  private getContext(): AudioContext | null {
    if (!this.context) {
      try {
        this.context = new AudioContext()
      } catch {
        // Web Audio API not supported
        return null
      }
    }
    return this.context
  }

  /**
   * Play a sound effect
   */
  play(sound: SoundType): void {
    if (!this.enabled) return

    const ctx = this.getContext()
    if (!ctx) return

    // Resume context if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {
        // Ignore resume errors
      })
    }

    switch (sound) {
      case 'tap_correct':
        this.playCorrectSound(ctx)
        break
      case 'tap_wrong':
        this.playWrongSound(ctx)
        break
      case 'eraser':
        this.playEraserSound(ctx)
        break
      case 'color_select':
        this.playSelectSound(ctx)
        break
      case 'milestone':
        this.playMilestoneSound(ctx)
        break
      case 'morph':
        this.playMorphSound(ctx)
        break
      case 'tadaaa':
        this.playTadaaaSound(ctx)
        break
    }
  }

  /**
   * Happy ding for correct paint
   */
  private playCorrectSound(ctx: AudioContext): void {
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(523.25, ctx.currentTime) // C5
    oscillator.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.1) // G5

    gainNode.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.15)
  }

  /**
   * Soft bonk for wrong paint
   */
  private playWrongSound(ctx: AudioContext): void {
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.type = 'triangle'
    oscillator.frequency.setValueAtTime(220, ctx.currentTime) // A3
    oscillator.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.15) // A2

    gainNode.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.15)
  }

  /**
   * Eraser sound - soft swish
   */
  private playEraserSound(ctx: AudioContext): void {
    // White noise burst
    const bufferSize = ctx.sampleRate * 0.1
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3
    }

    const source = ctx.createBufferSource()
    source.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 2000

    const gainNode = ctx.createGain()
    gainNode.gain.setValueAtTime(this.volume * 0.15, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)

    source.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(ctx.destination)

    source.start(ctx.currentTime)
  }

  /**
   * Color select - soft pop
   */
  private playSelectSound(ctx: AudioContext): void {
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(600, ctx.currentTime)

    gainNode.gain.setValueAtTime(this.volume * 0.15, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.05)
  }

  /**
   * Milestone fanfare (25%, 50%, 75%)
   */
  private playMilestoneSound(ctx: AudioContext): void {
    const notes = [523.25, 659.25, 783.99] // C5, E5, G5

    notes.forEach((freq, i) => {
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1)

      gainNode.gain.setValueAtTime(this.volume * 0.25, ctx.currentTime + i * 0.1)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.2)

      oscillator.start(ctx.currentTime + i * 0.1)
      oscillator.stop(ctx.currentTime + i * 0.1 + 0.2)
    })
  }

  /**
   * Morph transition - magical swoosh
   */
  private playMorphSound(ctx: AudioContext): void {
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(200, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 1)
    oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 2)

    gainNode.gain.setValueAtTime(0.01, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.2, ctx.currentTime + 0.5)
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.1, ctx.currentTime + 1.5)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 2)
  }

  /**
   * TADAAA! celebration sound
   */
  private playTadaaaSound(ctx: AudioContext): void {
    // Triumphant fanfare
    const notes = [
      { freq: 523.25, time: 0, duration: 0.15 }, // C5
      { freq: 659.25, time: 0.12, duration: 0.15 }, // E5
      { freq: 783.99, time: 0.24, duration: 0.15 }, // G5
      { freq: 1046.5, time: 0.36, duration: 0.4 }, // C6 (hold)
    ]

    notes.forEach(({ freq, time, duration }) => {
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.type = 'square'
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + time)

      gainNode.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime + time)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + time + duration)

      oscillator.start(ctx.currentTime + time)
      oscillator.stop(ctx.currentTime + time + duration)
    })
  }

  /**
   * Update settings
   */
  updateSettings(settings: GameSettings): void {
    this.enabled = settings.soundEnabled
    this.volume = settings.volume / 100
  }

  /**
   * Enable audio after user interaction
   */
  async enable(): Promise<void> {
    const ctx = this.getContext()
    if (ctx && ctx.state === 'suspended') {
      await ctx.resume()
    }
    this.enabled = true
  }

  /**
   * Disable audio
   */
  disable(): void {
    this.enabled = false
  }
}
