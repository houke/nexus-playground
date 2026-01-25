// Mamba Game Types - DOS Classic (1989)

export type Direction = 'up' | 'down' | 'left' | 'right'

export type GameStatus = 'menu' | 'playing' | 'paused' | 'gameover'

export type WallState = 'solid' | 'collectible'

export type CollectibleType = 'bronze' | 'silver'

export interface Position {
  readonly x: number
  readonly y: number
}

export interface WallSegment {
  readonly position: Position
  state: WallState
  lifespan: number // Remaining ticks until becomes collectible (silver)
  readonly createdAt: number // Game tick when created
}

export interface Collectible {
  readonly position: Position
  readonly type: CollectibleType
  readonly value: number
}

export interface MambaState {
  readonly head: Position
  readonly body: Position[] // Tail segments (doesn't include head)
  direction: Direction
  nextDirection: Direction
  length: number // Target length (grows when eating)
}

export interface GameState {
  status: GameStatus
  mamba: MambaState
  walls: Map<string, WallSegment> // Position key for O(1) lookup
  collectibles: Collectible[]
  score: number
  multiplier: number // Score multiplier (1-10), increases after shedding
  wallThreshold: number // Snake length at which shedding occurs
  bronzeCollected: number // Total bronze collected (used for difficulty scaling)
  shedCount: number // Number of times snake has shed (drives difficulty)
  wallLifespanMultiplier: number // Increases over time, making walls last longer
  currentTick: number
  tickRate: number
  gridWidth: number
  gridHeight: number
  lastEvent: 'bronze' | 'silver' | 'death' | 'shed' | null
}

export interface GameSettings {
  soundEnabled: boolean
  volume: number
}

export interface HighScores {
  scores: { score: number; shedCount: number; date: string }[]
}

// Grid dimensions (DOS original was 39x22)
export const GRID_WIDTH = 30
export const GRID_HEIGHT = 20

// Timing constants
export const BASE_TICK_RATE = 150 // ms per tick at level 1
export const TICK_RATE_DECREASE = 8 // ms faster per level
export const MIN_TICK_RATE = 70 // Fastest possible

// Wall mechanics - endless mode with progressive difficulty
export const MIN_WALL_THRESHOLD = 12 // Minimum snake length before shedding
export const MAX_WALL_THRESHOLD = 24 // Maximum snake length before shedding
export const KEEP_BODY_AFTER_SHED = 5 // Keep this many body segments after shedding
export const WALL_LIFESPAN_MIN = 80 // Min ticks before wall becomes silver (~12s)
export const WALL_LIFESPAN_MAX = 250 // Max ticks before wall becomes silver (~37s)

// Difficulty scaling - walls last longer as game progresses
export const WALL_LIFESPAN_INCREASE_PER_SHED = 0.12 // 12% longer walls per shed
export const MAX_WALL_LIFESPAN_MULTIPLIER = 4.0 // Walls can last up to 4x longer
export const TICK_RATE_DECREASE_PER_SHED = 2 // Get slightly faster each shed

// Bronze (candy) spawning
export const MIN_STARTING_BRONZE = 4 // Starting bronze count
export const MAX_STARTING_BRONZE = 8 // Max starting bronze
export const MAX_BRONZE_ON_SCREEN = 30 // Maximum bronze allowed
export const BRONZE_SPAWN_CHANCE = 0.15 // Chance to spawn new bronze each tick
export const BRONZE_DESPAWN_MIN = 40 // Min ticks before bronze despawns
export const BRONZE_DESPAWN_MAX = 80 // Max ticks before bronze despawns

// Scoring
export const BRONZE_POINTS = 1 // Base points per bronze (multiplied by multiplier)
export const SILVER_POINTS = 10 // Base points per silver (multiplied by multiplier)

// Initial mamba length
export const INITIAL_LENGTH = 5

// Default settings
export const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  volume: 70,
}

// Position key helper
export function posKey(pos: Position): string {
  return `${pos.x},${pos.y}`
}

// Direction vectors
export const DIRECTION_VECTORS: Record<Direction, Position> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}

// Opposite directions
export const OPPOSITE_DIRECTIONS: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
}
