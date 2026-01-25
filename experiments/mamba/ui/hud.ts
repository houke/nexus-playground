// HUD (Heads-Up Display) Component for Mamba Game - Endless Mode
import type { GameState } from '../game/types'

interface HUDOptions {
  state: GameState
  onBack: () => void
}

export function renderHUD(container: HTMLElement, options: HUDOptions): void {
  const { state, onBack } = options
  const { score, multiplier, shedCount, walls, status } = state

  const isPaused = status === 'paused'
  const isPlaying = status === 'playing'
  const wallCount = walls.size

  container.innerHTML = `
    <div class="game-hud" role="status" aria-live="polite" aria-atomic="false">
      <div class="hud-row hud-top">
        <button class="hud-btn hud-back-btn" aria-label="Back to menu" type="button">←</button>
        <div class="hud-score" aria-label="Score: ${score}">
          <span class="hud-label">SCORE</span>
          <span class="hud-value">${score.toString().padStart(6, '0')}</span>
        </div>
        <div class="hud-sheds" aria-label="Sheds: ${shedCount}">
          <span class="hud-label">SHEDS</span>
          <span class="hud-value">${shedCount.toString().padStart(2, '0')}</span>
        </div>
        <div class="hud-multiplier" aria-label="Multiplier: ${multiplier}x">
          <span class="hud-label">×</span>
          <span class="hud-value">${multiplier}</span>
        </div>
      </div>
      
      <div class="hud-row hud-bottom">
        <div class="hud-walls ${wallCount > 50 ? 'hud-walls-danger' : ''}" aria-label="Walls: ${wallCount}">
          <span class="hud-label">WALLS</span>
          <span class="hud-value">${wallCount}</span>
        </div>
        <div class="hud-status">
          ${isPaused ? '<span class="status-paused" role="alert">PAUSED</span>' : ''}
          ${isPlaying ? '<span class="status-hint">SPACE=Pause ESC=Menu</span>' : ''}
        </div>
      </div>
    </div>
  `

  container.querySelector('.hud-back-btn')?.addEventListener('click', onBack)
}
