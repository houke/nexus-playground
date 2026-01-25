// Beast Game - Settings Screen
import type { GameSettings } from '../game/types'

export interface SettingsCallbacks {
  settings: GameSettings
  onSettingChange: <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => void
  onBack: () => void
}

export function renderSettings(container: HTMLElement, callbacks: SettingsCallbacks): void {
  const { settings, onSettingChange, onBack } = callbacks

  container.innerHTML = `
    <div class="beast-menu beast-settings">
      <div class="menu-content">
        <h1 class="menu-title">
          <span class="title-text">SETTINGS</span>
        </h1>
        
        <div class="settings-list">
          <div class="setting-item">
            <label class="setting-label">SOUND</label>
            <button class="setting-toggle ${settings.soundEnabled ? 'active' : ''}" data-setting="soundEnabled">
              ${settings.soundEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
          
          <div class="setting-item">
            <label class="setting-label">VOLUME</label>
            <div class="setting-slider">
              <input 
                type="range" 
                min="0" 
                max="100" 
                value="${settings.volume}"
                data-setting="volume"
                class="volume-slider"
              />
              <span class="volume-value">${settings.volume}%</span>
            </div>
          </div>
        </div>
        
        <div class="menu-buttons">
          <button class="menu-btn menu-btn--primary" data-action="back">
            <span class="btn-icon">←</span>
            BACK
          </button>
        </div>
        
        <div class="settings-info">
          <p class="info-title">ABOUT</p>
          <p class="info-text">
            Beast is a 1984 MS-DOS game where you crush beasts by pushing blocks.
            Originally created by Dan Baker, Alan Brown, Mark Hamilton, and Derrick Shadel.
          </p>
        </div>
      </div>
    </div>
  `

  // Event listeners
  const soundToggle = container.querySelector('[data-setting="soundEnabled"]')
  soundToggle?.addEventListener('click', () => {
    const newValue = !settings.soundEnabled
    onSettingChange('soundEnabled', newValue)
    soundToggle.textContent = newValue ? 'ON' : 'OFF'
    soundToggle.classList.toggle('active', newValue)
  })

  const volumeSlider = container.querySelector('[data-setting="volume"]') as HTMLInputElement
  const volumeValue = container.querySelector('.volume-value')
  volumeSlider?.addEventListener('input', () => {
    const value = parseInt(volumeSlider.value, 10)
    onSettingChange('volume', value)
    if (volumeValue) volumeValue.textContent = `${value}%`
  })

  const backBtn = container.querySelector('[data-action="back"]')
  backBtn?.addEventListener('click', onBack)
}
