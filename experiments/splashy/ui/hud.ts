// Splashy - HUD (Heads Up Display)
import type { GameProgress } from '../game/types'

interface HUDCallbacks {
  onBack: () => void
}

export function renderHUD(
  container: HTMLElement,
  progress: GameProgress,
  callbacks: HUDCallbacks
): void {
  container.innerHTML = `
    <div class="game-hud">
      <button class="hud-back-btn" aria-label="Back to menu">
        <span class="back-icon">←</span>
      </button>
      
      <div class="hud-progress">
        <div class="progress-bar-container">
          <div class="progress-bar" style="width: ${progress.percentComplete}%"></div>
        </div>
      </div>
      
      <div class="hud-percent">${progress.percentComplete}%</div>
    </div>
  `

  // Back button handler
  const backBtn = container.querySelector('.hud-back-btn')
  backBtn?.addEventListener('click', () => {
    callbacks.onBack()
  })
}

/**
 * Update progress without full re-render
 */
export function updateHUDProgress(container: HTMLElement, progress: GameProgress): void {
  const progressBar = container.querySelector('.progress-bar') as HTMLElement
  const percentText = container.querySelector('.hud-percent')

  if (progressBar) {
    progressBar.style.width = `${progress.percentComplete}%`
  }
  if (percentText) {
    percentText.textContent = `${progress.percentComplete}%`
  }
}

/**
 * Show milestone celebration in HUD
 */
export function showMilestoneEffect(container: HTMLElement, milestone: number): void {
  const starCount = milestone === 25 ? 1 : milestone === 50 ? 2 : milestone === 75 ? 3 : 0

  if (starCount === 0) return

  const stars = '⭐'.repeat(starCount)
  const effect = document.createElement('div')
  effect.className = 'milestone-effect'
  effect.innerHTML = `<span class="milestone-stars">${stars}</span>`

  container.appendChild(effect)

  // Remove after animation
  setTimeout(() => {
    effect.remove()
  }, 1500)
}
