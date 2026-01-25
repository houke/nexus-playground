// Beast Game Types - 1984 DOS Classic

export type Direction =
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'up-left'
  | 'up-right'
  | 'down-left'
  | 'down-right'

export type CardinalDirection = 'up' | 'down' | 'left' | 'right'

export type EntityType = 'beast' | 'super-beast' | 'hatched-beast' | 'egg'

export type BlockType = 'movable' | 'static' | 'explosive'

export type GameStatus = 'menu' | 'playing' | 'paused' | 'gameover' | 'levelcomplete'

export interface Position {
  readonly x: number
  readonly y: number
}

export interface Entity {
  readonly id: string
  position: Position
  type: EntityType
  hatchTimer?: number // For eggs: ticks until hatching
}

export interface Block {
  position: Position
  type: BlockType
}

export interface GameState {
  status: GameStatus
  player: Position
  entities: Entity[]
  blocks: Block[]
  level: number
  lives: number
  score: number
  gridWidth: number
  gridHeight: number
  currentTick: number
  tickRate: number
  lastEvent: 'crush' | 'death' | 'levelup' | 'hatch' | null
  crushedEntities: Position[] // For death animations
}

export interface GameSettings {
  soundEnabled: boolean
  volume: number
}

export interface HighScores {
  scores: { score: number; level: number; date: string }[]
}

// Grid dimensions (original DOS was 39x22, we use slightly smaller for mobile)
export const GRID_WIDTH = 35
export const GRID_HEIGHT = 20

// Timing constants
export const BASE_TICK_RATE = 200 // ms per tick at level 1
export const TICK_RATE_DECREASE = 10 // ms faster per level
export const MIN_TICK_RATE = 80 // Fastest possible

// Entity counts per level
export const BASE_BEASTS = 4
export const BEASTS_PER_LEVEL = 2
export const MAX_BEASTS = 15
export const SUPER_BEAST_START_LEVEL = 4
export const EGG_START_LEVEL = 7
export const EXPLOSIVE_START_LEVEL = 7

// Egg mechanics
export const EGG_HATCH_TICKS = 50 // Ticks until egg hatches

// Block density
export const MOVABLE_BLOCK_DENSITY = 0.15 // % of grid
export const STATIC_BLOCK_DENSITY = 0.08 // % of grid

// Scoring
export const BEAST_POINTS = 100
export const SUPER_BEAST_POINTS = 250
export const HATCHED_BEAST_POINTS = 150
export const CHAIN_BONUS_MULTIPLIER = 1.5
export const LEVEL_CLEAR_BONUS = 500

// Player lives
export const INITIAL_LIVES = 3

// Character representations (DOS Code Page 437 style)
export const CHARS = {
  player: '◄►',
  beast: '├┤',
  superBeast: '╟╢',
  hatchedBeast: '╬╬',
  egg: '○',
  movableBlock: '█',
  staticBlock: '▓',
  explosiveBlock: '▒',
  empty: ' ',
  wall: '▓',
} as const

// Direction vectors
export const DIRECTIONS: Record<Direction, Position> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  'up-left': { x: -1, y: -1 },
  'up-right': { x: 1, y: -1 },
  'down-left': { x: -1, y: 1 },
  'down-right': { x: 1, y: 1 },
} as const

export const CARDINAL_DIRECTIONS: CardinalDirection[] = ['up', 'down', 'left', 'right']

// Default settings
export const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  volume: 70,
}

// Helper to create position key for Map lookups
export function posKey(pos: Position): string {
  return `${pos.x},${pos.y}`
}

// Helper to check position equality
export function posEquals(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y
}

// Helper to add positions
export function posAdd(a: Position, b: Position): Position {
  return { x: a.x + b.x, y: a.y + b.y }
}

// Generate unique entity ID
let entityIdCounter = 0
export function generateEntityId(): string {
  return `entity-${++entityIdCounter}`
}

export function resetEntityIdCounter(): void {
  entityIdCounter = 0
}
