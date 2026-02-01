// Splashy - Game Settings
import type { GameSettings } from './types'
import { DEFAULT_SETTINGS } from './types'

const STORAGE_KEY = 'splashy_settings'

export class SettingsManager {
  private settings: GameSettings
  private callbacks: ((settings: GameSettings) => void)[] = []

  constructor() {
    this.settings = this.load()
  }

  /**
   * Load settings from localStorage
   */
  private load(): GameSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<GameSettings>
        return { ...DEFAULT_SETTINGS, ...parsed }
      }
    } catch {
      // Ignore errors, use defaults
    }
    return { ...DEFAULT_SETTINGS }
  }

  /**
   * Save settings to localStorage
   */
  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings))
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Get current settings
   */
  get(): GameSettings {
    return { ...this.settings }
  }

  /**
   * Set a single setting
   */
  set<K extends keyof GameSettings>(key: K, value: GameSettings[K]): void {
    this.settings[key] = value
    this.save()
    this.notifyChange()
  }

  /**
   * Update multiple settings
   */
  update(partial: Partial<GameSettings>): void {
    this.settings = { ...this.settings, ...partial }
    this.save()
    this.notifyChange()
  }

  /**
   * Reset to defaults
   */
  reset(): void {
    this.settings = { ...DEFAULT_SETTINGS }
    this.save()
    this.notifyChange()
  }

  /**
   * Register settings change callback
   */
  onChange(callback: (settings: GameSettings) => void): void {
    this.callbacks.push(callback)
  }

  /**
   * Notify listeners of settings change
   */
  private notifyChange(): void {
    for (const callback of this.callbacks) {
      callback(this.settings)
    }
  }
}
