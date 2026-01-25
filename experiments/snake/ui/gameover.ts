// Game Over Screen Component
import type { GameState } from '../game/types'

interface GameOverOptions {
  state: GameState
  isHighScore: boolean
  onPlayAgain: () => void
  onMenu: () => void
}

export function renderGameOver(container: HTMLElement, options: GameOverOptions): void {
  const { state, isHighScore, onPlayAgain, onMenu } = options
  const { score, mode, winner } = state

  const isSinglePlayer = mode === 'single'
  const finalScore = score[0] ?? 0
  const hasWinner = winner !== undefined && winner !== null

  container.innerHTML = `
    <div class="gameover-screen">
      <div class="gameover-content">
        ${
          isSinglePlayer
            ? `
          <h2 class="gameover-title">GAME OVER</h2>
          ${
            isHighScore
              ? `
            <div class="new-highscore">
              <span class="highscore-badge">🏆 NEW HIGH SCORE!</span>
            </div>
          `
              : ''
          }
          <div class="final-score">
            <span class="score-label">Score</span>
            <span class="score-value">${finalScore}</span>
          </div>
        `
            : `
          <h2 class="gameover-title">
            ${hasWinner ? `PLAYER ${(winner as number) + 1} WINS!` : "IT'S A TIE!"}
          </h2>
          <div class="final-scores">
            <div class="player-score ${winner === 0 ? 'winner' : ''}">
              <span class="player-label">P1</span>
              <span class="player-value">${score[0] ?? 0}</span>
              ${winner === 0 ? '<span class="crown">👑</span>' : ''}
            </div>
            <div class="player-score ${winner === 1 ? 'winner' : ''}">
              <span class="player-label">P2</span>
              <span class="player-value">${score[1] ?? 0}</span>
              ${winner === 1 ? '<span class="crown">👑</span>' : ''}
            </div>
          </div>
        `
        }
        
        <div class="gameover-buttons">
          <button class="gameover-btn gameover-btn-primary" data-action="again">
            ${isSinglePlayer ? 'Play Again' : 'Rematch'}
          </button>
          <button class="gameover-btn gameover-btn-secondary" data-action="menu">
            Menu
          </button>
        </div>
      </div>
    </div>
  `

  container.querySelector('[data-action="again"]')?.addEventListener('click', onPlayAgain)
  container.querySelector('[data-action="menu"]')?.addEventListener('click', onMenu)

  // Add animation class after a short delay
  setTimeout(() => {
    container.querySelector('.gameover-content')?.classList.add('animate-in')
  }, 50)
}
