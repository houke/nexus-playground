// Menu UI Component

interface MenuOptions {
  onSinglePlayer: () => void
  onMultiplayer: () => void
  onSettings: () => void
  onBack: () => void
  highScore: number
}

export function renderMenu(container: HTMLElement, options: MenuOptions): void {
  const { onSinglePlayer, onMultiplayer, onSettings, onBack, highScore } = options

  container.innerHTML = `
    <div class="snake-menu">
      <header class="menu-header">
        <button class="back-btn" aria-label="Back to home">←</button>
        <button class="settings-btn" aria-label="Settings">⚙️</button>
      </header>
      
      <div class="menu-content">
        <div class="menu-logo">
          <span class="logo-emoji">🐍</span>
          <h1 class="logo-title">SNAKE</h1>
        </div>
        
        <div class="menu-buttons">
          <button class="menu-btn menu-btn-primary" data-action="single">
            <span class="btn-icon">👤</span>
            1 Player
          </button>
          <button class="menu-btn menu-btn-secondary" data-action="multi">
            <span class="btn-icon">👥</span>
            2 Players
          </button>
        </div>
        
        <div class="menu-info">
          <div class="high-score">
            <span class="high-score-label">High Score</span>
            <span class="high-score-value">${highScore}</span>
          </div>
        </div>
      </div>
      
      <footer class="menu-footer">
        <p class="controls-hint">
          <span class="hint-single">Arrow keys or WASD to move</span>
          <span class="hint-multi">P1: WASD • P2: Arrows</span>
        </p>
      </footer>
    </div>
  `

  // Event listeners
  container.querySelector('.back-btn')?.addEventListener('click', onBack)
  container.querySelector('.settings-btn')?.addEventListener('click', onSettings)
  container.querySelector('[data-action="single"]')?.addEventListener('click', onSinglePlayer)
  container.querySelector('[data-action="multi"]')?.addEventListener('click', onMultiplayer)
}
