// Splashy - Paint by Numbers Types

// === Core Types ===

export interface RGB {
  r: number // 0-255
  g: number // 0-255
  b: number // 0-255
}

export interface PaletteColor extends RGB {
  index: number // 1-based color number shown to user
  hex: string // "#RRGGBB" for CSS
  cellCount: number // How many cells use this color
}

export interface Cell {
  x: number // Grid column (0-based)
  y: number // Grid row (0-based)
  targetColorIndex: number // Which color this cell should be (1-based)
  paintedColorIndex: number | null // What user painted (null = empty)
  isCorrect: boolean // Does painted match target?
}

export interface PuzzleData {
  id: string // Unique puzzle identifier
  name: string // Display name
  sourceImageUrl: string // Original image path
  gridWidth: number // Number of columns
  gridHeight: number // Number of rows
  palette: PaletteColor[] // Reduced color palette
  cells: Cell[][] // 2D array [row][col] of cells
  totalCells: number // Total paintable cells
}

export type GameStatus = 'menu' | 'loading' | 'playing' | 'complete'

export type GameEvent =
  | 'correct'
  | 'incorrect'
  | 'complete'
  | 'colorSelect'
  | 'eraser'
  | 'milestone'
  | null

export interface GameProgress {
  correctCells: number
  totalCells: number
  percentComplete: number
}

export interface GameState {
  status: GameStatus
  currentPuzzle: PuzzleData | null
  selectedColorIndex: number | null // null means eraser mode
  progress: GameProgress
  startTime: number | null
  lastEvent: GameEvent
  lastMilestone: number // Track last milestone percentage (25, 50, 75)
}

// === Image Config ===

export interface ImageConfig {
  id: string
  name: string
  file: string // Filename in /public/drawings/
  maxColors: number // Color limit for quantization
  gridSize: number // Target grid dimension (width/height vary by aspect ratio)
}

export const IMAGE_CONFIGS: ImageConfig[] = [
  { id: 'bluey', name: 'Bluey', file: 'bluey.png', maxColors: 12, gridSize: 12 },
  { id: 'oddbods', name: 'Oddbods', file: 'oddbods.jpg', maxColors: 14, gridSize: 14 },
  { id: 'peppa', name: 'Peppa Pig', file: 'peppa.jpg', maxColors: 14, gridSize: 14 },
  { id: 'sunnybunny', name: 'Sunny Bunnies', file: 'sunnybunny.jpg', maxColors: 16, gridSize: 16 },
  { id: 'kpop', name: 'K-Pop', file: 'kpop.png', maxColors: 16, gridSize: 18 },
]

// === Settings ===

export interface GameSettings {
  soundEnabled: boolean
  volume: number
}

export const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  volume: 70,
}

// === Constants ===

export const CELL_SIZE = 48 // px - grid cell size
export const PALETTE_BUTTON_SIZE = 80 // px - color button size
export const NUMBER_FONT_SIZE = 24 // px - number display size
export const MIN_TOUCH_TARGET = 56 // px - minimum touch target for ages 4-5

// Milestone percentages for celebrations
export const MILESTONES = [25, 50, 75, 100]
