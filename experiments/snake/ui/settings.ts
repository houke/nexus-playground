// Settings Panel Component
import type { GameSettings, VisualStyle, SpeedSetting } from '../game/types'

interface SettingsOptions {
  settings: GameSettings
  onSettingChange: <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => void
  onBack: () => void
  onPreviewStyle: (style: VisualStyle) => void
}

const STYLE_NAMES: Record<VisualStyle, string> = {
  1: 'Nokia Classic',
  2: 'Retro Enhanced',
  3: 'Modern Flat',
  4: 'Neon Cyberpunk',
  5: '3D WebGL',
}

const SPEED_NAMES: Record<SpeedSetting, string> = {
  slow: 'Slow',
  medium: 'Medium',
  fast: 'Fast',
  insane: 'Insane',
}

export function renderSettings(container: HTMLElement, options: SettingsOptions): void {
  const { settings, onSettingChange, onBack, onPreviewStyle } = options

  container.innerHTML = `
    <div class="settings-panel">
      <header class="settings-header">
        <button class="back-btn" aria-label="Back to menu">←</button>
        <h2 class="settings-title">Settings</h2>
        <div class="header-spacer"></div>
      </header>
      
      <div class="settings-content">
        <!-- Visual Style -->
        <div class="settings-section">
          <h3 class="section-title">Visual Style</h3>
          <div class="style-grid">
            ${([1, 2, 3, 4, 5] as VisualStyle[])
              .map(
                (style) => `
              <button 
                class="style-option ${settings.visualStyle === style ? 'style-option-active' : ''}"
                data-style="${style}"
              >
                <span class="style-number">${style}</span>
                <span class="style-name">${STYLE_NAMES[style]}</span>
              </button>
            `
              )
              .join('')}
          </div>
        </div>
        
        <!-- Speed -->
        <div class="settings-section">
          <h3 class="section-title">Game Speed</h3>
          <div class="speed-buttons">
            ${(['slow', 'medium', 'fast', 'insane'] as SpeedSetting[])
              .map(
                (speed) => `
              <button 
                class="speed-btn ${settings.speed === speed ? 'speed-btn-active' : ''}"
                data-speed="${speed}"
              >
                ${SPEED_NAMES[speed]}
              </button>
            `
              )
              .join('')}
          </div>
        </div>
        
        <!-- Sound -->
        <div class="settings-section">
          <h3 class="section-title">Sound</h3>
          <div class="sound-controls">
            <button 
              class="sound-toggle ${settings.soundEnabled ? 'sound-toggle-on' : ''}"
              data-action="toggle-sound"
            >
              ${settings.soundEnabled ? '🔊 On' : '🔇 Off'}
            </button>
            <div class="volume-control ${!settings.soundEnabled ? 'volume-disabled' : ''}">
              <label for="volume-slider" class="volume-label">Volume</label>
              <input 
                type="range" 
                id="volume-slider" 
                class="volume-slider"
                min="0" 
                max="100" 
                value="${settings.volume}"
                ${!settings.soundEnabled ? 'disabled' : ''}
              />
              <span class="volume-value">${settings.volume}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `

  // Event listeners
  container.querySelector('.back-btn')?.addEventListener('click', onBack)

  // Style selection
  container.querySelectorAll('.style-option').forEach((btn) => {
    btn.addEventListener('click', () => {
      const style = parseInt((btn as HTMLElement).dataset.style || '1', 10) as VisualStyle
      container
        .querySelectorAll('.style-option')
        .forEach((b) => b.classList.remove('style-option-active'))
      btn.classList.add('style-option-active')
      onSettingChange('visualStyle', style)
      onPreviewStyle(style)
    })
  })

  // Speed selection
  container.querySelectorAll('.speed-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const speed = (btn as HTMLElement).dataset.speed as SpeedSetting
      container
        .querySelectorAll('.speed-btn')
        .forEach((b) => b.classList.remove('speed-btn-active'))
      btn.classList.add('speed-btn-active')
      onSettingChange('speed', speed)
    })
  })

  // Sound toggle
  container.querySelector('[data-action="toggle-sound"]')?.addEventListener('click', () => {
    const newValue = !settings.soundEnabled
    onSettingChange('soundEnabled', newValue)
    // Re-render to update UI
    renderSettings(container, { ...options, settings: { ...settings, soundEnabled: newValue } })
  })

  // Volume slider
  container.querySelector('#volume-slider')?.addEventListener('input', (e) => {
    const value = parseInt((e.target as HTMLInputElement).value, 10)
    const volumeValue = container.querySelector('.volume-value')
    if (volumeValue) {
      volumeValue.textContent = `${value}%`
    }
    onSettingChange('volume', value)
  })
}
