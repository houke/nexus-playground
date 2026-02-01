// Splashy - Color Palette UI
import type { PaletteColor } from '../game/types'

interface PaletteCallbacks {
  onColorSelect: (colorIndex: number | null) => void
}

export function renderPalette(
  container: HTMLElement,
  palette: PaletteColor[],
  selectedColorIndex: number | null,
  callbacks: PaletteCallbacks
): void {
  container.innerHTML = `
    <div class="color-palette">
      <div class="palette-colors">
        ${palette
          .map(
            (color) => `
          <button 
            class="palette-btn ${selectedColorIndex === color.index ? 'palette-btn--selected' : ''}"
            data-index="${color.index}"
            style="background-color: ${color.hex}"
            aria-label="Color ${color.index}"
            aria-pressed="${selectedColorIndex === color.index}"
          >
            <span class="palette-number">${color.index}</span>
          </button>
        `
          )
          .join('')}
      </div>
      <button 
        class="eraser-btn ${selectedColorIndex === null ? 'eraser-btn--selected' : ''}"
        aria-label="Eraser"
        aria-pressed="${selectedColorIndex === null}"
      >
        <span class="eraser-icon">🧹</span>
        <span class="eraser-text">Eraser</span>
      </button>
    </div>
  `

  // Color button handlers
  const colorBtns = container.querySelectorAll('.palette-btn')
  colorBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const index = parseInt((btn as HTMLElement).dataset.index ?? '0', 10)
      callbacks.onColorSelect(index)
    })
  })

  // Eraser button handler
  const eraserBtn = container.querySelector('.eraser-btn')
  eraserBtn?.addEventListener('click', () => {
    callbacks.onColorSelect(null)
  })
}

/**
 * Update palette selection without full re-render
 */
export function updatePaletteSelection(
  container: HTMLElement,
  selectedColorIndex: number | null
): void {
  // Update color buttons
  const colorBtns = container.querySelectorAll('.palette-btn')
  colorBtns.forEach((btn) => {
    const index = parseInt((btn as HTMLElement).dataset.index ?? '0', 10)
    const isSelected = selectedColorIndex === index
    btn.classList.toggle('palette-btn--selected', isSelected)
    btn.setAttribute('aria-pressed', String(isSelected))
  })

  // Update eraser button
  const eraserBtn = container.querySelector('.eraser-btn')
  const eraserSelected = selectedColorIndex === null
  eraserBtn?.classList.toggle('eraser-btn--selected', eraserSelected)
  eraserBtn?.setAttribute('aria-pressed', String(eraserSelected))
}
