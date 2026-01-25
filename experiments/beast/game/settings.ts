// Beast Game - Settings Manager
import type { GameSettings, HighScores } from './types'
import { DEFAULT_SETTINGS } from './types'

const SETTINGS_KEY = 'beast-settings'
const HIGH_SCORES_KEY = 'beast-high-scores'
const MAX_HIGH_SCORES = 10

export class SettingsManager {
  private settings: GameSettings
  private listeners: ((settings: GameSettings) => void)[] = []

  constructor() {
    this.settings = this.load()
  }

  private load(): GameSettings {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return { ...DEFAULT_SETTINGS, ...parsed }
      }
    } catch {
      // Ignore storage errors
    }
    return { ...DEFAULT_SETTINGS }
  }

  private save(): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings))
    } catch {
      // Ignore storage errors
    }
  }

  get(): GameSettings {
    return { ...this.settings }
  }

  set<K extends keyof GameSettings>(key: K, value: GameSettings[K]): void {
    this.settings[key] = value
    this.save()
    this.notifyListeners()
  }

  onChange(listener: (settings: GameSettings) => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private notifyListeners(): void {
    const settings = this.get()
    this.listeners.forEach((l) => l(settings))
  }

  // High score management
  getHighScores(): HighScores {
    try {
      const stored = localStorage.getItem(HIGH_SCORES_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch {
      // Ignore
    }
    return { scores: [] }
  }

  addHighScore(score: number, level: number): boolean {
    const highScores = this.getHighScores()
    const newEntry = {
      score,
      level,
      date: new Date().toISOString(),
    }

    // Check if this is a new high score
    const isNewHigh =
      highScores.scores.length < MAX_HIGH_SCORES ||
      score > (highScores.scores[highScores.scores.length - 1]?.score ?? 0)

    if (isNewHigh) {
      highScores.scores.push(newEntry)
      highScores.scores.sort((a, b) => b.score - a.score)
      highScores.scores = highScores.scores.slice(0, MAX_HIGH_SCORES)

      try {
        localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(highScores))
      } catch {
        // Ignore
      }
    }

    return isNewHigh
  }

  getTopScore(): number {
    const highScores = this.getHighScores()
    return highScores.scores[0]?.score ?? 0
  }
}
