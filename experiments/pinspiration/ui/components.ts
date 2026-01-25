// Pinspiration - UI Components

import type { Pin } from '../services/types'

/**
 * Renders the back button (positioned fixed in top-left)
 */
export function renderBackButton(): string {
  return `<button class="back-btn" aria-label="Back to home">←</button>`
}

/**
 * Renders the app header with animated gradient title
 */
export function renderHeader(): string {
  return `
    <header class="app-header">
      <div class="header-content">
        <h1 class="app-title">
          <span class="sparkle">✨</span>
          Pinspiration
          <span class="sparkle">✨</span>
        </h1>
        <p class="app-subtitle">Discover random inspiration from any Pinterest board</p>
      </div>
    </header>
  `
}

/**
 * Renders the URL input section
 */
export function renderInput(value: string = '', error: string | null = null): string {
  return `
    <section class="input-section">
      <div class="url-input-wrapper">
        <input
          type="url"
          class="url-input ${error ? 'error' : ''}"
          id="board-url-input"
          placeholder="Paste Pinterest board URL..."
          value="${escapeHtml(value)}"
          autocomplete="off"
          spellcheck="false"
          aria-label="Pinterest board URL"
          aria-describedby="${error ? 'url-error' : ''}"
        />
        <button class="clear-input" type="button" aria-label="Clear input" id="clear-input-btn"></button>
      </div>
      ${error ? renderError(error) : ''}
    </section>
  `
}

/**
 * Renders an error message
 */
export function renderError(message: string): string {
  return `
    <div class="error-message" id="url-error" role="alert">
      <svg class="error-icon" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
      </svg>
      <span class="error-text">${escapeHtml(message)}</span>
    </div>
  `
}

/**
 * Renders the inspire button with loading state
 */
export function renderInspireButton(disabled: boolean = true, loading: boolean = false): string {
  return `
    <button 
      class="inspire-button" 
      id="inspire-btn"
      ${disabled ? 'disabled' : ''}
      aria-busy="${loading}"
    >
      <span class="sparkle-icon">${loading ? '⏳' : '✨'}</span>
      <span>${loading ? 'Discovering...' : 'Inspire Me'}</span>
    </button>
  `
}

/**
 * Renders a loading skeleton card
 */
export function renderSkeleton(): string {
  return `
    <article class="skeleton-card" aria-label="Loading pin...">
      <div class="skeleton-image"></div>
      <div class="skeleton-content">
        <div class="skeleton-title"></div>
        <div class="skeleton-description"></div>
        <div class="skeleton-description"></div>
      </div>
    </article>
  `
}

/**
 * Renders a pin card with image and metadata
 */
export function renderPinCard(pin: Pin): string {
  const title = pin.title || 'Untitled Pin'
  const description = pin.description || 'No description available'
  const hasMetadata = pin.title || pin.description

  return `
    <article class="pin-card" aria-label="Pin: ${escapeHtml(title)}">
      <div class="pin-image-container">
        <img 
          class="pin-image" 
          src="${escapeHtml(pin.imageUrl)}" 
          alt="${escapeHtml(title)}"
          loading="eager"
          onload="this.classList.add('loaded')"
          onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23292524%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2250%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%2378716C%22 font-size=%2210%22>Image unavailable</text></svg>'; this.classList.add('loaded')"
        />
        <div class="pin-image-placeholder" aria-hidden="true"></div>
      </div>
      <div class="pin-content">
        <h2 class="pin-title">${escapeHtml(title)}</h2>
        ${hasMetadata ? `<p class="pin-description">${escapeHtml(description)}</p>` : ''}
        <a 
          class="pin-link" 
          href="${escapeHtml(pin.link)}" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          View on Pinterest
        </a>
      </div>
    </article>
  `
}

/**
 * Renders the progress section
 */
export function renderProgress(
  seenCount: number,
  totalCount: number,
  isFullyLoaded: boolean
): string {
  const percentage = totalCount > 0 ? Math.round((seenCount / totalCount) * 100) : 0
  const loadingPercentage = isFullyLoaded ? 100 : Math.min(95, percentage + 20)

  return `
    <section class="progress-section" aria-label="Progress">
      <p class="progress-stats">
        ${seenCount} of ${totalCount} pins explored
      </p>
      <div class="progress-bar-container" role="progressbar" aria-valuenow="${loadingPercentage}" aria-valuemin="0" aria-valuemax="100">
        <div class="progress-bar ${isFullyLoaded ? 'complete' : ''}" style="width: ${loadingPercentage}%"></div>
      </div>
      ${isFullyLoaded ? '<p class="progress-complete-text">All pins loaded ✓</p>' : ''}
    </section>
  `
}

/**
 * Renders the change board button
 */
export function renderChangeBoard(): string {
  return `
    <button class="change-board-button" id="change-board-btn">
      Change Board
    </button>
  `
}

/**
 * Renders the board name
 */
export function renderBoardName(name: string): string {
  return `
    <p class="board-name">
      Exploring <strong>${escapeHtml(name)}</strong>
    </p>
  `
}

/**
 * Renders the empty state with animated pin icon
 */
export function renderEmptyState(): string {
  return `
    <div class="empty-state">
      <div class="empty-state-icon">📌</div>
      <p class="empty-state-text">
        Paste a Pinterest board URL above and let the magic begin ✨
      </p>
    </div>
  `
}

/**
 * Creates and shows a toast notification
 */
export function showToast(message: string, duration: number = 3000): void {
  // Remove existing toast if any
  const existingToast = document.querySelector('.toast')
  if (existingToast) {
    existingToast.remove()
  }

  const toast = document.createElement('div')
  toast.className = 'toast'
  toast.textContent = message
  toast.setAttribute('role', 'status')
  toast.setAttribute('aria-live', 'polite')
  document.body.appendChild(toast)

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('visible')
  })

  // Remove after duration
  setTimeout(() => {
    toast.classList.remove('visible')
    setTimeout(() => toast.remove(), 300)
  }, duration)
}

/**
 * Escapes HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
