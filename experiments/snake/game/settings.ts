// Settings Manager for Snake Game
import type { GameSettings, VisualStyle, SpeedSetting, GameMode } from './types'
import { DEFAULT_SETTINGS } from './types'

const STORAGE_KEY = 'nexus-snake-settings'
const HIGHSCORE_KEY = 'nexus-snake-highscores'

type SettingsChangeCallback = (settings: GameSettings) => void

export class SettingsManager {
  private settings: GameSettings
  private callbacks: SettingsChangeCallback[] = []

  constructor() {
    this.settings = this.load()
  }

  private load(): GameSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<GameSettings>
        return { ...DEFAULT_SETTINGS, ...parsed }
      }
    } catch {
      // localStorage not available or corrupted
    }
    return { ...DEFAULT_SETTINGS }
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings))
    } catch {
      // localStorage not available
    }
  }

  get(): GameSettings {
    return { ...this.settings }
  }

  set<K extends keyof GameSettings>(key: K, value: GameSettings[K]): void {
    this.settings[key] = value
    this.save()
    this.notifyChange()
  }

  setAll(settings: Partial<GameSettings>): void {
    this.settings = { ...this.settings, ...settings }
    this.save()
    this.notifyChange()
  }

  onChange(callback: SettingsChangeCallback): void {
    this.callbacks.push(callback)
  }

  private notifyChange(): void {
    const settings = this.get()
    this.callbacks.forEach((cb) => cb(settings))
  }

  // Visual style helpers
  setVisualStyle(style: VisualStyle): void {
    this.set('visualStyle', style)
  }

  // Speed helpers
  setSpeed(speed: SpeedSetting): void {
    this.set('speed', speed)
  }

  // Sound helpers
  toggleSound(): void {
    this.set('soundEnabled', !this.settings.soundEnabled)
  }

  setVolume(volume: number): void {
    this.set('volume', Math.max(0, Math.min(100, volume)))
  }

  // High score management
  getHighScore(mode: GameMode): number {
    try {
      const stored = localStorage.getItem(HIGHSCORE_KEY)
      if (stored) {
        const scores = JSON.parse(stored) as Record<string, number>
        return scores[mode] ?? 0
      }
    } catch {
      // Ignore errors
    }
    return 0
  }

  checkAndSaveHighScore(mode: GameMode, score: number): boolean {
    const currentHigh = this.getHighScore(mode)
    if (score > currentHigh) {
      try {
        const stored = localStorage.getItem(HIGHSCORE_KEY)
        const scores = stored ? (JSON.parse(stored) as Record<string, number>) : {}
        scores[mode] = score
        localStorage.setItem(HIGHSCORE_KEY, JSON.stringify(scores))
        return true
      } catch {
        // Ignore errors
      }
    }
    return false
  }

  // Update last played timestamp
  updateLastPlayed(): void {
    this.set('lastPlayed', new Date().toISOString())
  }
}
