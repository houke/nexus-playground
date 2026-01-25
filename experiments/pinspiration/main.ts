// Pinspiration - Main Entry Point
import './styles/pinspiration.css'
import { createPinStore, type PinStore } from './store/pin-store'
import { fetchBoardSmart, fetchBoardPage } from './services/pinterest'
import { normalizeUrl, validateUrl, isShortUrl } from './services/url-parser'
import { expandShortUrl } from './services/pinterest'
import type { Pin, AppStatus, PinspirationError } from './services/types'
import { ERROR_MESSAGES } from './services/types'
import {
  renderHeader,
  renderInput,
  renderInspireButton,
  renderSkeleton,
  renderPinCard,
  renderChangeBoard,
  renderBoardName,
  renderEmptyState,
  renderBackButton,
  showToast,
} from './ui/components'

class PinspirationApp {
  private container: HTMLElement
  private store: PinStore
  private status: AppStatus = 'idle'
  private currentPin: Pin | null = null
  private error: string | null = null
  private inputValue: string = ''
  private isBackgroundLoading: boolean = false
  private abortController: AbortController | null = null

  constructor(container: HTMLElement) {
    this.container = container
    this.store = createPinStore()
    this.render()
    this.bindEvents()
  }

  private render(): void {
    const isInputMode = this.status === 'idle' || this.status === 'error'
    const showSkeleton = this.status === 'loading-first'
    const showPin = this.status === 'ready' || this.status === 'loading-more'

    let content = `
      ${renderBackButton()}
      <div class="pinspiration-app">
        ${renderHeader()}
    `

    if (isInputMode) {
      content += renderInput(this.inputValue, this.error)
      content += renderInspireButton(!this.inputValue.trim(), this.status === 'loading-first')
      content += renderEmptyState()
    } else if (showSkeleton) {
      content += renderSkeleton()
      content += renderInspireButton(true, true)
    } else if (showPin && this.currentPin) {
      content += renderChangeBoard()
      if (this.store.board) {
        content += renderBoardName(this.store.board.name)
      }
      content += renderPinCard(this.currentPin)
      // Progress bar removed - users don't need to see loading status
      content += renderInspireButton(false, false)
    }

    content += `</div>`
    this.container.innerHTML = content

    // Re-bind events after render
    this.bindEvents()
  }

  private bindEvents(): void {
    // Back button
    const backBtn = document.querySelector('.back-btn')
    if (backBtn) {
      backBtn.addEventListener('click', this.goHome.bind(this))
    }

    // URL input
    const input = document.getElementById('board-url-input') as HTMLInputElement | null
    if (input) {
      input.addEventListener('input', this.handleInputChange.bind(this))
      input.addEventListener('keydown', this.handleInputKeydown.bind(this))
      // Focus input on idle state
      if (this.status === 'idle') {
        input.focus()
      }
    }

    // Clear button
    const clearBtn = document.getElementById('clear-input-btn')
    if (clearBtn) {
      clearBtn.addEventListener('click', this.handleClear.bind(this))
    }

    // Inspire button
    const inspireBtn = document.getElementById('inspire-btn')
    if (inspireBtn) {
      inspireBtn.addEventListener('click', this.handleInspire.bind(this))
    }

    // Change board button
    const changeBtn = document.getElementById('change-board-btn')
    if (changeBtn) {
      changeBtn.addEventListener('click', this.handleChangeBoard.bind(this))
    }
  }

  private handleInputChange(event: Event): void {
    const input = event.target as HTMLInputElement
    this.inputValue = input.value
    this.error = null

    // Update only the button state and clear button visibility without full re-render
    // This prevents animations from restarting on every keystroke
    const inspireBtn = document.getElementById('inspire-btn') as HTMLButtonElement | null
    const clearBtn = document.getElementById('clear-input-btn')
    const errorEl = document.querySelector('.error-message')

    if (inspireBtn) {
      inspireBtn.disabled = !this.inputValue.trim()
    }

    if (clearBtn) {
      clearBtn.style.display = this.inputValue ? 'flex' : 'none'
    }

    if (errorEl) {
      errorEl.remove()
    }
  }

  private handleInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.inputValue.trim()) {
      this.handleInspire()
    }
  }

  private handleClear(): void {
    this.inputValue = ''
    this.error = null

    // Update DOM directly without full re-render to preserve animations
    const input = document.getElementById('board-url-input') as HTMLInputElement | null
    const inspireBtn = document.getElementById('inspire-btn') as HTMLButtonElement | null
    const clearBtn = document.getElementById('clear-input-btn')
    const errorEl = document.querySelector('.error-message')

    if (input) {
      input.value = ''
      input.focus()
    }

    if (inspireBtn) {
      inspireBtn.disabled = true
    }

    if (clearBtn) {
      clearBtn.style.display = 'none'
    }

    if (errorEl) {
      errorEl.remove()
    }
  }

  private async handleInspire(): Promise<void> {
    // If we already have pins, show a random one
    if (this.store.totalCount > 0 && (this.status === 'ready' || this.status === 'loading-more')) {
      this.showRandomPin()
      return
    }

    // Validate URL
    const normalized = normalizeUrl(this.inputValue)
    const validationError = validateUrl(normalized)

    if (validationError) {
      this.error = validationError
      this.render()
      return
    }

    // Start loading
    this.status = 'loading-first'
    this.error = null
    this.render()

    try {
      // Expand short URL if needed
      let boardUrl = normalized
      if (isShortUrl(normalized)) {
        boardUrl = await expandShortUrl(normalized)
      }

      // Fetch using smart method (RSS first for better metadata, fallback to HTML)
      const result = await fetchBoardSmart(boardUrl)

      if (result.pins.length === 0) {
        throw { type: 'PARSE_ERROR', message: ERROR_MESSAGES.PARSE_ERROR } as PinspirationError
      }

      // Initialize store
      this.store.setBoard(result.boardName, boardUrl)
      this.store.addPins(result.pins)

      // Show first random pin
      this.status = 'ready'
      this.showRandomPin() // This already calls render(), no duplicate needed

      // Start background loading for more pins
      // RSS only returns ~25 pins, HTML scraping can get more
      // Always try to load more via HTML for pagination
      this.loadMorePinsInBackground(boardUrl, result.bookmark)
    } catch (error) {
      this.handleError(error as PinspirationError)
    }
  }

  private showRandomPin(): void {
    const pin = this.store.getRandomUnseen()
    if (!pin) return

    // Check if this is a genuine first pin or a reset (all pins seen)
    const isFirstEver = this.store.seenCount === 0 && this.currentPin === null

    this.currentPin = pin
    this.store.markSeen(pin.id)

    // Trigger haptic feedback on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(10)
    }

    // Show milestone toasts (only for genuine first, not resets)
    const seenCount = this.store.seenCount
    if (isFirstEver && seenCount === 1) {
      showToast('🎉 Your first inspiration!')
    } else if (seenCount > 1 && seenCount % 10 === 0) {
      showToast(`✨ You've explored ${seenCount} pins!`)
    }

    // Check if pin card already exists - if so, update it instead of full re-render
    const existingCard = document.querySelector('.pin-card')
    if (existingCard) {
      // Create a temporary container to parse the new card HTML
      const temp = document.createElement('div')
      temp.innerHTML = renderPinCard(this.currentPin)
      const newCard = temp.firstElementChild as HTMLElement

      // Replace the old card with the new one
      existingCard.replaceWith(newCard)
    } else {
      // First time showing pin - full render needed
      this.render()
    }
  }

  private async loadMorePinsInBackground(
    boardUrl: string,
    initialBookmark: string | null
  ): Promise<void> {
    if (this.isBackgroundLoading) return

    this.isBackgroundLoading = true
    this.abortController = new AbortController()

    // If no bookmark (from RSS), start HTML scraping from the beginning
    let bookmark: string | null = initialBookmark
    let needsFirstHtmlFetch = !initialBookmark

    try {
      // If RSS was used (no bookmark), do one HTML fetch to get more pins + bookmark
      if (needsFirstHtmlFetch && !this.abortController.signal.aborted) {
        await this.sleep(500)
        const firstPage = await fetchBoardPage(boardUrl)

        // Add any new pins not already in store
        const newPins = firstPage.pins.filter((p) => !this.store.hasPin(p.id))
        if (newPins.length > 0) {
          this.store.addPins(newPins)
        }

        bookmark = firstPage.bookmark
      }

      // Continue pagination while we have a bookmark
      while (bookmark && !this.abortController.signal.aborted) {
        await this.sleep(800)

        const result = await fetchBoardPage(boardUrl, bookmark)

        // Add only new pins (avoid duplicates)
        const newPins = result.pins.filter((p) => !this.store.hasPin(p.id))
        if (newPins.length > 0) {
          this.store.addPins(newPins)
        }

        bookmark = result.bookmark
      }
    } catch {
      // Stop background loading on error, but don't show error to user
      console.warn('Background loading stopped due to error')
    }

    this.store.setFullyLoaded()
    this.isBackgroundLoading = false
  }

  private handleError(error: PinspirationError): void {
    this.status = 'error'
    this.error = ERROR_MESSAGES[error.type] || error.message || 'An unexpected error occurred'
    this.render()
  }

  private handleChangeBoard(): void {
    // Stop any background loading
    if (this.abortController) {
      this.abortController.abort()
    }

    // Reset state
    this.store.clear()
    this.status = 'idle'
    this.currentPin = null
    this.error = null
    this.inputValue = ''
    this.isBackgroundLoading = false
    this.render()
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private goHome(): void {
    window.location.href = '/nexus-playground/'
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('app-root')
  if (root) {
    new PinspirationApp(root)
  }
})
