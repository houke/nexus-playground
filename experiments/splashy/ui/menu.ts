// Splashy - Menu UI
import type { ImageConfig } from '../game/types'
import { IMAGE_CONFIGS } from '../game/types'

interface MenuCallbacks {
  onSelectImage: (config: ImageConfig) => void
  onBack: () => void
}

export function renderMenu(container: HTMLElement, callbacks: MenuCallbacks): void {
  const basePath = '/nexus-playground/drawings'

  container.innerHTML = `
    <div class="splashy-menu">
      <header class="menu-header">
        <button class="back-btn" aria-label="Back to landing page">←</button>
        <h1 class="menu-title">🎨 Splashy</h1>
        <div class="header-spacer"></div>
      </header>

      <main class="menu-content">
        <p class="menu-subtitle">Choose a picture to color!</p>
        
        <div class="character-grid">
          ${IMAGE_CONFIGS.map(
            (config) => `
            <button class="character-card" data-id="${config.id}" aria-label="Color ${config.name}">
              <div class="character-thumb-container">
                <img 
                  src="${basePath}/${config.file}" 
                  alt="${config.name}" 
                  class="character-thumb"
                  loading="lazy"
                />
              </div>
              <span class="character-name">${config.name}</span>
              <span class="character-colors">${config.maxColors} colors</span>
            </button>
          `
          ).join('')}
        </div>
      </main>
    </div>
  `

  // Back button handler
  const backBtn = container.querySelector('.back-btn')
  backBtn?.addEventListener('click', () => {
    callbacks.onBack()
  })

  // Character card handlers
  const cards = container.querySelectorAll('.character-card')
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const id = (card as HTMLElement).dataset.id
      const config = IMAGE_CONFIGS.find((c) => c.id === id)
      if (config) {
        callbacks.onSelectImage(config)
      }
    })
  })
}

export function renderLoading(container: HTMLElement): void {
  container.innerHTML = `
    <div class="splashy-loading">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading picture...</p>
    </div>
  `
}
