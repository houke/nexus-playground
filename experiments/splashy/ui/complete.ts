// Splashy - Completion Screen
import type { PuzzleData } from '../game/types'

interface CompleteCallbacks {
  onPlayAgain: () => void
  onChooseAnother: () => void
}

export function renderComplete(
  container: HTMLElement,
  puzzle: PuzzleData,
  callbacks: CompleteCallbacks
): void {
  container.innerHTML = `
    <div class="complete-screen">
      <div class="complete-content">
        <h2 class="complete-title">🎉 TADAAA! 🎉</h2>
        
        <div class="complete-image-container">
          <img 
            src="${puzzle.sourceImageUrl}" 
            alt="${puzzle.name}" 
            class="complete-image"
          />
        </div>
        
        <p class="complete-message">You colored ${puzzle.name}!</p>
        
        <div class="complete-buttons">
          <button class="complete-btn complete-btn-primary">
            <span class="btn-icon">🔄</span>
            Play Again
          </button>
          <button class="complete-btn complete-btn-secondary">
            <span class="btn-icon">🏠</span>
            Choose Another
          </button>
        </div>
      </div>
    </div>
  `

  // Animate in
  requestAnimationFrame(() => {
    const content = container.querySelector('.complete-content')
    content?.classList.add('animate-in')
  })

  // Button handlers
  const playAgainBtn = container.querySelector('.complete-btn-primary')
  playAgainBtn?.addEventListener('click', () => {
    callbacks.onPlayAgain()
  })

  const chooseAnotherBtn = container.querySelector('.complete-btn-secondary')
  chooseAnotherBtn?.addEventListener('click', () => {
    callbacks.onChooseAnother()
  })
}

/**
 * Create morph transition effect
 * Overlays the original image and fades/morphs the grid into it
 */
export function createMorphTransition(
  gridCanvas: HTMLCanvasElement,
  imageUrl: string,
  duration: number = 2000
): Promise<void> {
  return new Promise((resolve) => {
    // Create overlay container
    const overlay = document.createElement('div')
    overlay.className = 'morph-overlay'

    // Create image element
    const img = document.createElement('img')
    img.src = imageUrl
    img.className = 'morph-image'
    img.style.opacity = '0'

    overlay.appendChild(img)

    // Position overlay over the canvas
    const rect = gridCanvas.getBoundingClientRect()
    overlay.style.position = 'absolute'
    overlay.style.left = `${rect.left}px`
    overlay.style.top = `${rect.top}px`
    overlay.style.width = `${rect.width}px`
    overlay.style.height = `${rect.height}px`

    // Add to DOM
    gridCanvas.parentElement?.appendChild(overlay)

    // Start image load
    img.onload = () => {
      // Fade in image over duration
      img.style.transition = `opacity ${duration}ms ease-in-out`
      requestAnimationFrame(() => {
        img.style.opacity = '1'
      })

      // Resolve when done
      setTimeout(() => {
        resolve()
      }, duration)
    }

    // Handle load error
    img.onerror = () => {
      overlay.remove()
      resolve()
    }
  })
}

/**
 * Clean up morph overlay
 */
export function removeMorphOverlay(): void {
  const overlay = document.querySelector('.morph-overlay')
  overlay?.remove()
}
