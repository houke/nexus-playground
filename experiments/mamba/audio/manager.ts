// Audio Manager for Mamba Game - PC Speaker Style (Endless Mode)
import type { GameSettings } from '../game/types'

type SoundType = 'bronze' | 'silver' | 'death' | 'shed' | 'click'

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
        return null
      }
    }
    return this.context
  }

  play(sound: SoundType): void {
    if (!this.enabled) return

    const ctx = this.getContext()
    if (!ctx) return

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {
        // Ignore resume errors
      })
    }

    switch (sound) {
      case 'bronze':
        this.playBronzeSound(ctx)
        break
      case 'silver':
        this.playSilverSound(ctx)
        break
      case 'death':
        this.playDeathSound(ctx)
        break
      case 'shed':
        this.playShedSound(ctx)
        break
      case 'click':
        this.playClickSound(ctx)
        break
    }
  }

  private playBronzeSound(ctx: AudioContext): void {
    // Short beep - PC speaker style
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.type = 'square'
    osc.frequency.setValueAtTime(800, ctx.currentTime)
    osc.frequency.setValueAtTime(1000, ctx.currentTime + 0.05)

    gain.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.1)
  }

  private playSilverSound(ctx: AudioContext): void {
    // Rising tone for bonus
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.type = 'square'
    osc.frequency.setValueAtTime(400, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15)

    gain.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.15)
  }

  private playShedSound(ctx: AudioContext): void {
    // Low rumble for shedding
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(100, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.2)

    gain.gain.setValueAtTime(this.volume * 0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.2)
  }

  private playDeathSound(ctx: AudioContext): void {
    // Descending buzz
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(300, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.4)

    gain.gain.setValueAtTime(this.volume * 0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.4)
  }

  private playClickSound(ctx: AudioContext): void {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.type = 'square'
    osc.frequency.setValueAtTime(1000, ctx.currentTime)

    gain.gain.setValueAtTime(this.volume * 0.1, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.03)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.03)
  }

  updateSettings(settings: GameSettings): void {
    this.enabled = settings.soundEnabled
    this.volume = settings.volume / 100
  }
}
