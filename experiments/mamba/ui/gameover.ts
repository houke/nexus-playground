// Game Over Screen Component for Mamba Game - Endless Mode
import type { GameState } from '../game/types'

interface GameOverOptions {
  state: GameState
  isHighScore: boolean
  onPlayAgain: () => void
  onMenu: () => void
}

export function renderGameOver(container: HTMLElement, options: GameOverOptions): void {
  const { state, isHighScore, onPlayAgain, onMenu } = options
  const { score, shedCount, walls } = state

  container.innerHTML = `
    <div class="gameover-screen" role="dialog" aria-modal="true" aria-labelledby="gameover-title">
      <div class="gameover-content">
        <h2 id="gameover-title" class="gameover-title">GAME OVER</h2>
        
        ${
          isHighScore
            ? `
          <div class="new-highscore" role="alert" aria-live="polite">
            <span class="highscore-badge">★ NEW HIGH SCORE! ★</span>
          </div>
        `
            : ''
        }
        
        <div class="final-stats" aria-label="Final statistics">
          <div class="stat">
            <span class="stat-label">SCORE</span>
            <span class="stat-value" aria-label="Score: ${score}">${score}</span>
          </div>
          <div class="stat">
            <span class="stat-label">SHEDS</span>
            <span class="stat-value" aria-label="Sheds: ${shedCount}">${shedCount}</span>
          </div>
          <div class="stat">
            <span class="stat-label">WALLS</span>
            <span class="stat-value" aria-label="Walls at end: ${walls.size}">${walls.size}</span>
          </div>
        </div>
        
        <div class="gameover-buttons">
          <button class="gameover-btn gameover-btn-primary" data-action="again">
            PLAY AGAIN
          </button>
          <button class="gameover-btn gameover-btn-secondary" data-action="menu">
            MENU
          </button>
        </div>
        
        <p class="restart-hint">Press ENTER or SPACE to restart</p>
      </div>
    </div>
  `

  container.querySelector('[data-action="again"]')?.addEventListener('click', onPlayAgain)
  container.querySelector('[data-action="menu"]')?.addEventListener('click', onMenu)

  // Keyboard shortcuts for quick restart
  const handleKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      document.removeEventListener('keydown', handleKey)
      onPlayAgain()
    }
  }
  document.addEventListener('keydown', handleKey)

  // Animate in
  setTimeout(() => {
    container.querySelector('.gameover-content')?.classList.add('animate-in')
  }, 50)
}
