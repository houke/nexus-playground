// Splashy - Input Controller
type CellTapCallback = (gridX: number, gridY: number) => void
type ActionCallback = () => void

export class InputController {
  private canvas: HTMLCanvasElement | null = null
  private cellSize: number = 48
  private offsetX: number = 0
  private offsetY: number = 0
  private gridWidth: number = 0
  private gridHeight: number = 0

  private cellTapCallback: CellTapCallback | null = null
  private backCallback: ActionCallback | null = null

  private lastTapTime: number = 0
  private tapDebounceMs: number = 100 // Debounce rapid taps

  private boundPointerDown: (e: PointerEvent) => void
  private boundPointerMove: (e: PointerEvent) => void
  private boundPointerUp: (e: PointerEvent) => void

  private activePointerId: number | null = null
  private isDragging: boolean = false

  constructor() {
    this.boundPointerDown = this.handlePointerDown.bind(this)
    this.boundPointerMove = this.handlePointerMove.bind(this)
    this.boundPointerUp = this.handlePointerUp.bind(this)
  }

  /**
   * Initialize input handling on a canvas
   */
  init(
    canvas: HTMLCanvasElement,
    gridWidth: number,
    gridHeight: number,
    cellSize: number,
    offsetX: number = 0,
    offsetY: number = 0
  ): void {
    this.canvas = canvas
    this.gridWidth = gridWidth
    this.gridHeight = gridHeight
    this.cellSize = cellSize
    this.offsetX = offsetX
    this.offsetY = offsetY

    canvas.addEventListener('pointerdown', this.boundPointerDown)
    canvas.addEventListener('pointermove', this.boundPointerMove)
    canvas.addEventListener('pointerup', this.boundPointerUp)
    canvas.addEventListener('pointercancel', this.boundPointerUp)
    canvas.addEventListener('pointerleave', this.boundPointerUp)

    // Prevent context menu on long press
    canvas.addEventListener('contextmenu', (e) => e.preventDefault())

    // Touch-specific: prevent scrolling while drawing
    canvas.style.touchAction = 'none'
  }

  /**
   * Update grid parameters (after loading a new puzzle)
   */
  updateGrid(
    gridWidth: number,
    gridHeight: number,
    cellSize: number,
    offsetX: number = 0,
    offsetY: number = 0
  ): void {
    this.gridWidth = gridWidth
    this.gridHeight = gridHeight
    this.cellSize = cellSize
    this.offsetX = offsetX
    this.offsetY = offsetY
  }

  /**
   * Handle pointer down event
   */
  private handlePointerDown(e: PointerEvent): void {
    if (this.activePointerId !== null) return // Already tracking a pointer

    this.activePointerId = e.pointerId
    this.isDragging = true

    // Capture pointer for drag events
    this.canvas?.setPointerCapture(e.pointerId)

    this.processPointerEvent(e)
  }

  /**
   * Handle pointer move event (drag painting)
   */
  private handlePointerMove(e: PointerEvent): void {
    if (e.pointerId !== this.activePointerId || !this.isDragging) return
    this.processPointerEvent(e)
  }

  /**
   * Handle pointer up event
   */
  private handlePointerUp(e: PointerEvent): void {
    if (e.pointerId !== this.activePointerId) return

    this.activePointerId = null
    this.isDragging = false

    this.canvas?.releasePointerCapture(e.pointerId)
  }

  /**
   * Process a pointer event and trigger cell tap if valid
   */
  private processPointerEvent(e: PointerEvent): void {
    if (!this.canvas || !this.cellTapCallback) return

    // Debounce rapid taps
    const now = performance.now()
    if (now - this.lastTapTime < this.tapDebounceMs) return
    this.lastTapTime = now

    // Get canvas-relative coordinates
    const rect = this.canvas.getBoundingClientRect()
    const scaleX = this.canvas.width / rect.width
    const scaleY = this.canvas.height / rect.height

    const canvasX = (e.clientX - rect.left) * scaleX
    const canvasY = (e.clientY - rect.top) * scaleY

    // Convert to grid coordinates
    const gridX = Math.floor((canvasX - this.offsetX) / this.cellSize)
    const gridY = Math.floor((canvasY - this.offsetY) / this.cellSize)

    // Bounds check
    if (gridX >= 0 && gridX < this.gridWidth && gridY >= 0 && gridY < this.gridHeight) {
      this.cellTapCallback(gridX, gridY)
    }
  }

  /**
   * Register cell tap callback
   */
  onCellTap(callback: CellTapCallback): void {
    this.cellTapCallback = callback
  }

  /**
   * Register back button callback
   */
  onBack(callback: ActionCallback): void {
    this.backCallback = callback
  }

  /**
   * Trigger back action (called from UI button)
   */
  triggerBack(): void {
    this.backCallback?.()
  }

  /**
   * Clean up event listeners
   */
  destroy(): void {
    if (this.canvas) {
      this.canvas.removeEventListener('pointerdown', this.boundPointerDown)
      this.canvas.removeEventListener('pointermove', this.boundPointerMove)
      this.canvas.removeEventListener('pointerup', this.boundPointerUp)
      this.canvas.removeEventListener('pointercancel', this.boundPointerUp)
      this.canvas.removeEventListener('pointerleave', this.boundPointerUp)
    }
    this.canvas = null
    this.cellTapCallback = null
    this.backCallback = null
    this.activePointerId = null
    this.isDragging = false
  }
}
