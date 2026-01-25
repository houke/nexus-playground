// Beast Game - Help Overlay Component

export interface HelpCallbacks {
  onClose: () => void
}

export function renderHelp(container: HTMLElement, callbacks: HelpCallbacks): void {
  const overlay = document.createElement('div')
  overlay.className = 'beast-overlay beast-help-overlay visible'
  overlay.innerHTML = `
    <div class="beast-modal help-modal">
      <h2 class="modal-title">HOW TO PLAY</h2>
      
      <div class="help-content">
        <section class="help-section">
          <h3 class="help-heading">OBJECTIVE</h3>
          <p class="help-text">
            Crush all the beasts by pushing blocks into them.
            Clear each level to advance!
          </p>
        </section>

        <section class="help-section">
          <h3 class="help-heading">CHARACTERS</h3>
          <div class="help-legend">
            <div class="legend-item">
              <span class="legend-char player">◄►</span>
              <span class="legend-desc">You (the player)</span>
            </div>
            <div class="legend-item">
              <span class="legend-char beast">├┤</span>
              <span class="legend-desc">Beast - crush with any block</span>
            </div>
            <div class="legend-item">
              <span class="legend-char super">╟╢</span>
              <span class="legend-desc">Super-Beast - crush against walls only</span>
            </div>
            <div class="legend-item">
              <span class="legend-char egg">○</span>
              <span class="legend-desc">Egg - hatches when near</span>
            </div>
          </div>
        </section>

        <section class="help-section">
          <h3 class="help-heading">BLOCKS</h3>
          <div class="help-legend">
            <div class="legend-item">
              <span class="legend-char block">█</span>
              <span class="legend-desc">Movable block - push to crush</span>
            </div>
            <div class="legend-item">
              <span class="legend-char static">▓</span>
              <span class="legend-desc">Static block - cannot move</span>
            </div>
            <div class="legend-item">
              <span class="legend-char explosive">▒</span>
              <span class="legend-desc">Explosive - damages nearby</span>
            </div>
          </div>
        </section>

        <section class="help-section">
          <h3 class="help-heading">CONTROLS</h3>
          <div class="help-controls">
            <div class="control-group">
              <span class="control-keys">WASD / ARROWS</span>
              <span class="control-action">Move (4 directions)</span>
            </div>
            <div class="control-group">
              <span class="control-keys">Q E Z C</span>
              <span class="control-action">Move diagonally</span>
            </div>
            <div class="control-group">
              <span class="control-keys">SPACE / P</span>
              <span class="control-action">Pause game</span>
            </div>
            <div class="control-group">
              <span class="control-keys">? / H</span>
              <span class="control-action">Show this help</span>
            </div>
            <div class="control-group">
              <span class="control-keys">SWIPE</span>
              <span class="control-action">Mobile touch controls</span>
            </div>
          </div>
        </section>

        <section class="help-section">
          <h3 class="help-heading">TIPS</h3>
          <ul class="help-tips">
            <li>Beasts chase you - use this to lure them into traps!</li>
            <li>Push multiple blocks in a row for chain reactions</li>
            <li>Super-beasts need walls to crush, not movable blocks</li>
            <li>Watch out for eggs - they hatch into fast beasts!</li>
          </ul>
        </section>
      </div>

      <div class="modal-buttons">
        <button class="menu-btn menu-btn--primary" data-action="close">
          <span class="btn-icon">✓</span>
          GOT IT
        </button>
      </div>
    </div>
  `

  container.appendChild(overlay)

  // Close handlers
  const closeHelp = (): void => {
    overlay.classList.remove('visible')
    setTimeout(() => overlay.remove(), 300)
    callbacks.onClose()
  }

  overlay.querySelector('[data-action="close"]')?.addEventListener('click', closeHelp)

  // Close on overlay click (outside modal)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeHelp()
    }
  })

  // Close on Escape key
  const handleKeydown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape' || e.key === '?' || e.key === 'h' || e.key === 'H') {
      closeHelp()
      document.removeEventListener('keydown', handleKeydown)
    }
  }
  document.addEventListener('keydown', handleKeydown)
}
