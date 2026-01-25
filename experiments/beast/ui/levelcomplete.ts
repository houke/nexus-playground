// Beast Game - Level Complete Screen
export interface LevelCompleteCallbacks {
  onContinue: () => void
}

export function renderLevelComplete(
  container: HTMLElement,
  level: number,
  score: number,
  bonus: number,
  callbacks: LevelCompleteCallbacks
): void {
  const overlay = document.createElement('div')
  overlay.className = 'beast-overlay'

  overlay.innerHTML = `
    <div class="beast-modal level-complete-modal">
      <h2 class="modal-title success">LEVEL ${level} COMPLETE!</h2>
      
      <div class="modal-stats">
        <div class="stat-item">
          <span class="stat-label">LEVEL BONUS</span>
          <span class="stat-value bonus">+${bonus.toLocaleString()}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">TOTAL SCORE</span>
          <span class="stat-value">${score.toLocaleString()}</span>
        </div>
      </div>
      
      <div class="modal-buttons">
        <button class="menu-btn menu-btn--primary" data-action="continue">
          <span class="btn-icon">▶</span>
          CONTINUE
        </button>
      </div>
      
      <p class="level-hint">Get ready for Level ${level + 1}!</p>
    </div>
  `

  container.appendChild(overlay)

  // Event listeners
  const continueBtn = overlay.querySelector('[data-action="continue"]')

  continueBtn?.addEventListener('click', () => {
    overlay.classList.remove('visible')
    setTimeout(() => {
      overlay.remove()
      callbacks.onContinue()
    }, 200)
  })

  // Also allow spacebar/enter to continue
  const handleKeypress = (e: KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      overlay.classList.remove('visible')
      setTimeout(() => {
        overlay.remove()
        callbacks.onContinue()
      }, 200)
      window.removeEventListener('keydown', handleKeypress)
    }
  }
  window.addEventListener('keydown', handleKeypress)

  // Animate in
  requestAnimationFrame(() => {
    overlay.classList.add('visible')
  })
}

export function removeLevelComplete(container: HTMLElement): void {
  const overlay = container.querySelector('.beast-overlay')
  if (overlay) {
    overlay.classList.remove('visible')
    setTimeout(() => overlay.remove(), 300)
  }
}
