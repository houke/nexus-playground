// Beast Game - HUD Component
import type { GameState } from '../game/types'

export function renderHUD(container: HTMLElement, state: GameState): void {
  // Check if HUD already exists
  let hud = container.querySelector('.beast-hud') as HTMLElement

  if (!hud) {
    hud = document.createElement('div')
    hud.className = 'beast-hud'
    container.insertBefore(hud, container.firstChild)
  }

  // Generate lives display
  const livesDisplay = '♥'.repeat(state.lives) + '♡'.repeat(Math.max(0, 3 - state.lives))

  hud.innerHTML = `
    <div class="hud-item">
      <span class="hud-label">LEVEL</span>
      <span class="hud-value">${String(state.level).padStart(2, '0')}</span>
    </div>
    <div class="hud-item">
      <span class="hud-label">SCORE</span>
      <span class="hud-value">${state.score.toLocaleString()}</span>
    </div>
    <div class="hud-item">
      <span class="hud-label">LIVES</span>
      <span class="hud-value hud-lives">${livesDisplay}</span>
    </div>
    <div class="hud-buttons">
      <button class="hud-btn hud-help-btn" aria-label="Help">?</button>
      <button class="hud-btn hud-pause-btn" aria-label="Pause game">❚❚</button>
    </div>
  `
}

export function updateHUD(container: HTMLElement, state: GameState): void {
  const hud = container.querySelector('.beast-hud')
  if (!hud) {
    renderHUD(container, state)
    return
  }

  const livesDisplay = '♥'.repeat(state.lives) + '♡'.repeat(Math.max(0, 3 - state.lives))

  const levelEl = hud.querySelector('.hud-item:nth-child(1) .hud-value')
  const scoreEl = hud.querySelector('.hud-item:nth-child(2) .hud-value')
  const livesEl = hud.querySelector('.hud-lives')

  if (levelEl) levelEl.textContent = String(state.level).padStart(2, '0')
  if (scoreEl) scoreEl.textContent = state.score.toLocaleString()
  if (livesEl) livesEl.textContent = livesDisplay
}

export function setupHUDListeners(
  container: HTMLElement,
  onPause: () => void,
  onHelp?: () => void
): void {
  const pauseBtn = container.querySelector('.hud-pause-btn')
  if (pauseBtn) {
    pauseBtn.addEventListener('click', onPause)
  }

  const helpBtn = container.querySelector('.hud-help-btn')
  if (helpBtn && onHelp) {
    helpBtn.addEventListener('click', onHelp)
  }
}
