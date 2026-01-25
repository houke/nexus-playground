// Beast Game - Game Over Screen
export interface GameOverCallbacks {
  onRestart: () => void
  onMenu: () => void
}

export function renderGameOver(
  container: HTMLElement,
  score: number,
  level: number,
  isNewHighScore: boolean,
  callbacks: GameOverCallbacks
): void {
  const overlay = document.createElement('div')
  overlay.className = 'beast-overlay'

  overlay.innerHTML = `
    <div class="beast-modal game-over-modal">
      <h2 class="modal-title">GAME OVER</h2>
      
      ${isNewHighScore ? '<p class="new-highscore">★ NEW HIGH SCORE! ★</p>' : ''}
      
      <div class="modal-stats">
        <div class="stat-item">
          <span class="stat-label">FINAL SCORE</span>
          <span class="stat-value">${score.toLocaleString()}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">LEVEL REACHED</span>
          <span class="stat-value">${level}</span>
        </div>
      </div>
      
      <div class="modal-buttons">
        <button class="menu-btn menu-btn--primary" data-action="restart">
          <span class="btn-icon">↺</span>
          TRY AGAIN
        </button>
        <button class="menu-btn" data-action="menu">
          <span class="btn-icon">☰</span>
          MAIN MENU
        </button>
      </div>
    </div>
  `

  container.appendChild(overlay)

  // Event listeners
  const restartBtn = overlay.querySelector('[data-action="restart"]')
  const menuBtn = overlay.querySelector('[data-action="menu"]')

  restartBtn?.addEventListener('click', () => {
    overlay.remove()
    callbacks.onRestart()
  })

  menuBtn?.addEventListener('click', () => {
    overlay.remove()
    callbacks.onMenu()
  })

  // Animate in
  requestAnimationFrame(() => {
    overlay.classList.add('visible')
  })
}

export function removeGameOver(container: HTMLElement): void {
  const overlay = container.querySelector('.beast-overlay')
  if (overlay) {
    overlay.classList.remove('visible')
    setTimeout(() => overlay.remove(), 300)
  }
}
