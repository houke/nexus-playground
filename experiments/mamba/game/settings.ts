// Settings Manager for Mamba Game
import type { GameSettings, HighScores } from './types'
import { DEFAULT_SETTINGS } from './types'

const SETTINGS_KEY = 'mamba-settings'
const SCORES_KEY = 'mamba-highscores'

type SettingsChangeCallback = (settings: GameSettings) => void

export class SettingsManager {
  private settings: GameSettings
  private callbacks: SettingsChangeCallback[] = []

  constructor() {
    this.settings = this.load()
  }

  private load(): GameSettings {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<GameSettings>
        return { ...DEFAULT_SETTINGS, ...parsed }
      }
    } catch {
      // Ignore parse errors
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
    this.notifyChange()
  }

  onChange(callback: SettingsChangeCallback): void {
    this.callbacks.push(callback)
  }

  private notifyChange(): void {
    const settings = this.get()
    this.callbacks.forEach((cb) => cb(settings))
  }

  // High scores
  getHighScore(): number {
    const scores = this.getHighScores()
    if (scores.scores.length === 0) return 0
    const topScore = scores.scores[0]
    return topScore ? topScore.score : 0
  }

  getHighScores(): HighScores {
    try {
      const stored = localStorage.getItem(SCORES_KEY)
      if (stored) {
        return JSON.parse(stored) as HighScores
      }
    } catch {
      // Ignore
    }
    return { scores: [] }
  }

  addHighScore(score: number, shedCount: number): boolean {
    const scores = this.getHighScores()
    const topScore = scores.scores[0]
    const isNew = scores.scores.length === 0 || score > (topScore?.score ?? 0)

    scores.scores.push({
      score,
      shedCount,
      date: new Date().toISOString(),
    })

    // Sort descending and keep top 10
    scores.scores.sort((a, b) => b.score - a.score)
    scores.scores = scores.scores.slice(0, 10)

    try {
      localStorage.setItem(SCORES_KEY, JSON.stringify(scores))
    } catch {
      // Ignore storage errors
    }

    return isNew
  }
}
