// Settings UI Component for Mamba Game
import type { GameSettings } from '../game/types'

interface SettingsOptions {
  settings: GameSettings
  onSettingChange: <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => void
  onBack: () => void
}

export function renderSettings(container: HTMLElement, options: SettingsOptions): void {
  const { settings, onSettingChange, onBack } = options

  container.innerHTML = `
    <div class="mamba-settings">
      <header class="settings-header">
        <button class="back-btn" aria-label="Back">←</button>
        <h2>SETTINGS</h2>
      </header>
      
      <div class="settings-content">
        <div class="setting-item">
          <label class="setting-label">
            <span class="setting-name">Sound Effects</span>
            <input 
              type="checkbox" 
              class="setting-checkbox" 
              data-setting="soundEnabled"
              ${settings.soundEnabled ? 'checked' : ''}
            />
            <span class="setting-toggle"></span>
          </label>
        </div>
        
        <div class="setting-item ${!settings.soundEnabled ? 'setting-disabled' : ''}">
          <label class="setting-label">
            <span class="setting-name">Volume</span>
            <span class="setting-value">${settings.volume}%</span>
          </label>
          <input 
            type="range" 
            class="setting-slider" 
            data-setting="volume"
            min="0" 
            max="100" 
            value="${settings.volume}"
            ${!settings.soundEnabled ? 'disabled' : ''}
          />
        </div>
      </div>
      
      <div class="settings-footer">
        <p class="settings-hint">Settings are saved automatically</p>
      </div>
    </div>
  `

  // Event listeners
  container.querySelector('.back-btn')?.addEventListener('click', onBack)

  container.querySelector('[data-setting="soundEnabled"]')?.addEventListener('change', (e) => {
    const checked = (e.target as HTMLInputElement).checked
    onSettingChange('soundEnabled', checked)
    // Re-render to update volume slider state
    renderSettings(container, { ...options, settings: { ...settings, soundEnabled: checked } })
  })

  container.querySelector('[data-setting="volume"]')?.addEventListener('input', (e) => {
    const value = parseInt((e.target as HTMLInputElement).value, 10)
    onSettingChange('volume', value)
    const valueDisplay = container.querySelector('.setting-value')
    if (valueDisplay) {
      valueDisplay.textContent = `${value}%`
    }
  })
}
