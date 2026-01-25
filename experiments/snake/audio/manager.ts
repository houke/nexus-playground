// Audio Manager for Snake Game
import type { GameSettings } from '../game/types'

type SoundType = 'eat' | 'death' | 'levelup' | 'move' | 'click'

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

    // Generate sounds programmatically
    switch (sound) {
      case 'eat':
        this.playEatSound(ctx)
        break
      case 'death':
        this.playDeathSound(ctx)
        break
      case 'levelup':
        this.playLevelUpSound(ctx)
        break
      case 'move':
        this.playMoveSound(ctx)
        break
      case 'click':
        this.playClickSound(ctx)
        break
    }
  }

  private playEatSound(ctx: AudioContext): void {
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.type = 'square'
    oscillator.frequency.setValueAtTime(400, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1)

    gainNode.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.1)
  }

  private playDeathSound(ctx: AudioContext): void {
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.type = 'sawtooth'
    oscillator.frequency.setValueAtTime(300, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.5)

    gainNode.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.5)
  }

  private playLevelUpSound(ctx: AudioContext): void {
    const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6

    notes.forEach((freq, i) => {
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.type = 'square'
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1)

      gainNode.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime + i * 0.1)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.15)

      oscillator.start(ctx.currentTime + i * 0.1)
      oscillator.stop(ctx.currentTime + i * 0.1 + 0.15)
    })
  }

  private playMoveSound(ctx: AudioContext): void {
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(100, ctx.currentTime)

    gainNode.gain.setValueAtTime(this.volume * 0.05, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.03)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.03)
  }

  private playClickSound(ctx: AudioContext): void {
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(800, ctx.currentTime)

    gainNode.gain.setValueAtTime(this.volume * 0.1, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.05)
  }

  updateSettings(settings: GameSettings): void {
    this.enabled = settings.soundEnabled
    this.volume = settings.volume / 100
  }

  // Enable audio after user interaction (for autoplay policy)
  async enable(): Promise<void> {
    const ctx = this.getContext()
    if (ctx && ctx.state === 'suspended') {
      await ctx.resume()
    }
    this.enabled = true
  }

  disable(): void {
    this.enabled = false
  }
}
