// HUD (Heads-Up Display) Component
import type { GameState } from '../game/types'

interface HUDOptions {
  state: GameState
  onPause: () => void
  onBack: () => void
  onSettings: () => void
}

export function renderHUD(container: HTMLElement, options: HUDOptions): void {
  const { state, onPause: _onPause, onBack, onSettings } = options
  void _onPause // Reserved for future use
  const { score, level, status, mode } = state

  const isPaused = status === 'paused'
  const isPlaying = status === 'playing'

  container.innerHTML = `
    <div class="game-header">
      <button class="hud-nav-btn hud-back-btn" aria-label="Back to menu" title="Back to menu">←</button>
      <button 
        class="hud-nav-btn hud-settings-btn ${!isPaused ? 'hud-nav-btn--disabled' : ''}" 
        aria-label="Settings${!isPaused ? ' (pause first)' : ''}"
        title="${isPaused ? 'Open settings' : 'Pause to access settings'}"
        ${!isPaused ? 'aria-disabled="true"' : ''}
      >⚙️</button>
    </div>
    
    <div class="game-hud">
      <div class="hud-left">
        <div class="hud-score">
          <span class="hud-label">SCORE</span>
          <span class="hud-value">${score[0] ?? 0}</span>
        </div>
        ${
          mode === 'multiplayer'
            ? `
          <div class="hud-score hud-score-p2">
            <span class="hud-label">P2</span>
            <span class="hud-value">${score[1] ?? 0}</span>
          </div>
        `
            : ''
        }
      </div>
      
      <div class="hud-right">
        <div class="hud-level">
          <span class="hud-label">LEVEL</span>
          <span class="hud-value">${level}</span>
        </div>
      </div>
    </div>
    
    <div class="controls-hint-bar">
      ${
        mode === 'multiplayer'
          ? `
        <div class="controls-group">
          <span class="controls-player">P1</span>
          <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>
        </div>
        <div class="controls-group">
          <span class="controls-player controls-player-p2">P2</span>
          <kbd>↑</kbd><kbd>←</kbd><kbd>↓</kbd><kbd>→</kbd>
        </div>
      `
          : `
        <div class="controls-group">
          <kbd>↑</kbd><kbd>←</kbd><kbd>↓</kbd><kbd>→</kbd>
          <span class="controls-sep">or</span>
          <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>
        </div>
      `
      }
      <div class="controls-group">
        <kbd>Space</kbd><span class="controls-label">${isPlaying ? 'Pause' : 'Resume'}</span>
        <kbd>Esc</kbd><span class="controls-label">Menu</span>
      </div>
    </div>
    
    ${
      isPaused
        ? `
      <div class="pause-overlay">
        <div class="pause-content">
          <h2>PAUSED</h2>
          <p>Press Space to resume or Escape for menu</p>
        </div>
      </div>
    `
        : ''
    }
  `

  // Back button always works
  container.querySelector('.hud-back-btn')?.addEventListener('click', (e) => {
    e.preventDefault()
    e.stopPropagation()
    onBack()
  })

  // Settings button only works when paused
  const settingsBtn = container.querySelector('.hud-settings-btn')
  if (settingsBtn) {
    settingsBtn.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      if (isPaused) {
        onSettings()
      }
    })
  }
}
