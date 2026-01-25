// Beast Game - Menu UI
export interface MenuCallbacks {
  onNewGame: () => void
  onSettings: () => void
  onBack: () => void
  highScore: number
}

export function renderMenu(container: HTMLElement, callbacks: MenuCallbacks): void {
  const { onNewGame, onSettings, onBack, highScore } = callbacks

  container.innerHTML = `
    <div class="beast-menu">
      <div class="menu-content">
        <h1 class="menu-title">
          <span class="title-emoji">🐻</span>
          <span class="title-text">BEAST</span>
          <span class="title-emoji">🐻</span>
        </h1>
        <p class="menu-subtitle">— 1984 DOS Classic —</p>
        
        <div class="menu-buttons">
          <button class="menu-btn menu-btn--primary" data-action="newgame">
            <span class="btn-icon">▶</span>
            NEW GAME
          </button>
          <button class="menu-btn" data-action="settings">
            <span class="btn-icon">⚙</span>
            SETTINGS
          </button>
          <button class="menu-btn" data-action="back">
            <span class="btn-icon">←</span>
            BACK
          </button>
        </div>
        
        <div class="menu-highscore">
          HIGH SCORE: <span class="highscore-value">${highScore.toLocaleString()}</span>
        </div>
        
        <div class="menu-controls">
          <p class="controls-title">CONTROLS</p>
          <div class="controls-grid">
            <div class="control-item">
              <span class="control-key">↑↓←→</span>
              <span class="control-desc">Move</span>
            </div>
            <div class="control-item">
              <span class="control-key">Q E Z C</span>
              <span class="control-desc">Diagonal</span>
            </div>
            <div class="control-item">
              <span class="control-key">ESC</span>
              <span class="control-desc">Pause</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="menu-footer">
        <p>Push blocks to crush the beasts!</p>
      </div>
    </div>
  `

  // Event listeners
  const buttons = container.querySelectorAll('.menu-btn')
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-action')
      switch (action) {
        case 'newgame':
          onNewGame()
          break
        case 'settings':
          onSettings()
          break
        case 'back':
          onBack()
          break
      }
    })
  })
}
