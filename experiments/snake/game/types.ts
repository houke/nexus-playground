// Snake Game Types

export type Direction = 'up' | 'down' | 'left' | 'right'

export type SpeedSetting = 'slow' | 'medium' | 'fast' | 'insane'

export type VisualStyle = 1 | 2 | 3 | 4 | 5

export type GameMode = 'single' | 'multiplayer'

export type GameStatus = 'menu' | 'playing' | 'paused' | 'gameover'

export interface Position {
  x: number
  y: number
}

export interface PlayerState {
  snake: Position[]
  direction: Direction
  nextDirection: Direction
  alive: boolean
  color?: string
}

export interface GameState {
  mode: GameMode
  status: GameStatus
  players: PlayerState[]
  food: Position
  score: number[]
  level: number
  tickRate: number
  gridWidth: number
  gridHeight: number
  lastEvent?: 'food' | 'death' | 'levelup' | null
  winner?: number | null
}

export interface GameSettings {
  visualStyle: VisualStyle
  soundEnabled: boolean
  volume: number
  speed: SpeedSetting
  lastPlayed?: string
}

export interface HighScores {
  single: { score: number; date: string; style: number }[]
  multiplayer: { winner: 1 | 2; scores: [number, number]; date: string }[]
}

// Speed settings in milliseconds per tick
export const SPEED_VALUES: Record<SpeedSetting, number> = {
  slow: 200,
  medium: 150,
  fast: 100,
  insane: 60,
}

// Grid dimensions
export const GRID_WIDTH = 20
export const GRID_HEIGHT = 20

// Default settings
export const DEFAULT_SETTINGS: GameSettings = {
  visualStyle: 1,
  soundEnabled: true,
  volume: 70,
  speed: 'medium',
}

// Food required per level
export const FOOD_PER_LEVEL = 10
