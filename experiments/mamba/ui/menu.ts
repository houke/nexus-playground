// Menu UI Component for Mamba Game

interface MenuOptions {
  onStart: () => void
  onSettings: () => void
  onBack: () => void
  highScore: number
}

export function renderMenu(container: HTMLElement, options: MenuOptions): void {
  const { onStart, onSettings, onBack, highScore } = options

  container.innerHTML = `
    <div class="mamba-menu" role="main">
      <header class="menu-header">
        <button class="back-btn" aria-label="Back to home" type="button">←</button>
        <button class="settings-btn" aria-label="Settings" type="button">⚙️</button>
      </header>
      
      <div class="menu-content">
        <div class="menu-logo">
          <span class="logo-emoji" aria-hidden="true">🐍</span>
          <h1 class="logo-title">MAMBA</h1>
          <p class="logo-subtitle">DOS Classic • 1989</p>
        </div>
        
        <div class="menu-buttons">
          <button class="menu-btn menu-btn-primary" data-action="start" type="button" autofocus>
            <span class="btn-icon" aria-hidden="true">▶</span>
            START GAME
          </button>
        </div>
        
        <div class="menu-info" aria-label="High score information">
          <div class="high-score">
            <span class="high-score-label">HIGH SCORE</span>
            <span class="high-score-value" aria-label="High score: ${highScore}">${highScore}</span>
          </div>
        </div>
        
        <div class="how-to-play">
          <h3>HOW TO PLAY</h3>
          <ul>
            <li>Collect <span class="bronze">bronze candy</span> to grow</li>
            <li>Shed your tail to create <span class="gray">walls</span></li>
            <li>Walls age into <span class="silver">silver gems</span></li>
            <li><span class="danger">Survive</span> as walls accumulate!</li>
          </ul>
        </div>
      </div>
      
      <footer class="menu-footer">
        <p class="controls-hint">
          Arrow keys or WASD to move • Space to pause
        </p>
      </footer>
    </div>
  `

  container.querySelector('.back-btn')?.addEventListener('click', onBack)
  container.querySelector('.settings-btn')?.addEventListener('click', onSettings)
  container.querySelector('[data-action="start"]')?.addEventListener('click', onStart)
}
