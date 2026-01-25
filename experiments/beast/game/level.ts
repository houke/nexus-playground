// Beast Game - Level Generator
import type { Position, Block, Entity, EntityType } from './types'
import {
  GRID_WIDTH,
  GRID_HEIGHT,
  BASE_BEASTS,
  BEASTS_PER_LEVEL,
  MAX_BEASTS,
  SUPER_BEAST_START_LEVEL,
  EGG_START_LEVEL,
  EXPLOSIVE_START_LEVEL,
  EGG_HATCH_TICKS,
  MOVABLE_BLOCK_DENSITY,
  STATIC_BLOCK_DENSITY,
  posKey,
  generateEntityId,
  resetEntityIdCounter,
} from './types'

export interface LevelData {
  player: Position
  blocks: Block[]
  entities: Entity[]
}

// Seeded random for reproducible levels
function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed / 0x7fffffff
  }
}

export function generateLevel(level: number): LevelData {
  resetEntityIdCounter()
  const random = seededRandom(level * 12345)
  const occupied = new Set<string>()

  // Reserve border cells
  for (let x = 0; x < GRID_WIDTH; x++) {
    occupied.add(posKey({ x, y: 0 }))
    occupied.add(posKey({ x, y: GRID_HEIGHT - 1 }))
  }
  for (let y = 0; y < GRID_HEIGHT; y++) {
    occupied.add(posKey({ x: 0, y }))
    occupied.add(posKey({ x: GRID_WIDTH - 1, y }))
  }

  // Place player in a safe zone (center-left area)
  const player: Position = {
    x: Math.floor(GRID_WIDTH * 0.25),
    y: Math.floor(GRID_HEIGHT / 2),
  }
  occupied.add(posKey(player))

  // Create safe zone around player (3x3)
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      occupied.add(posKey({ x: player.x + dx, y: player.y + dy }))
    }
  }

  const blocks: Block[] = []
  const entities: Entity[] = []

  // Calculate block counts
  const innerArea = (GRID_WIDTH - 2) * (GRID_HEIGHT - 2)
  const movableCount = Math.floor(innerArea * MOVABLE_BLOCK_DENSITY)
  const staticCount = Math.floor(innerArea * STATIC_BLOCK_DENSITY)

  // Helper to get random free position
  const getRandomFreePosition = (): Position | null => {
    let attempts = 0
    while (attempts < 100) {
      const x = 1 + Math.floor(random() * (GRID_WIDTH - 2))
      const y = 1 + Math.floor(random() * (GRID_HEIGHT - 2))
      const pos = { x, y }
      if (!occupied.has(posKey(pos))) {
        return pos
      }
      attempts++
    }
    return null
  }

  // Place static blocks (including border representation)
  // Add border blocks
  for (let x = 0; x < GRID_WIDTH; x++) {
    blocks.push({ position: { x, y: 0 }, type: 'static' })
    blocks.push({ position: { x, y: GRID_HEIGHT - 1 }, type: 'static' })
  }
  for (let y = 1; y < GRID_HEIGHT - 1; y++) {
    blocks.push({ position: { x: 0, y }, type: 'static' })
    blocks.push({ position: { x: GRID_WIDTH - 1, y }, type: 'static' })
  }

  // Place inner static blocks
  const useExplosive = level >= EXPLOSIVE_START_LEVEL
  for (let i = 0; i < staticCount; i++) {
    const pos = getRandomFreePosition()
    if (pos) {
      // Some static blocks become explosive at higher levels
      const isExplosive = useExplosive && random() < 0.3
      blocks.push({
        position: pos,
        type: isExplosive ? 'explosive' : 'static',
      })
      occupied.add(posKey(pos))
    }
  }

  // Place movable blocks
  for (let i = 0; i < movableCount; i++) {
    const pos = getRandomFreePosition()
    if (pos) {
      blocks.push({ position: pos, type: 'movable' })
      occupied.add(posKey(pos))
    }
  }

  // Calculate entity counts for this level
  const totalBeasts = Math.min(BASE_BEASTS + level * BEASTS_PER_LEVEL, MAX_BEASTS)
  const useSuperBeasts = level >= SUPER_BEAST_START_LEVEL
  const useEggs = level >= EGG_START_LEVEL

  // Distribute entity types
  let regularBeasts = totalBeasts
  let superBeasts = 0
  let eggs = 0

  if (useSuperBeasts) {
    superBeasts = Math.min(
      Math.floor((level - SUPER_BEAST_START_LEVEL + 1) * 0.5),
      Math.floor(totalBeasts * 0.3)
    )
    regularBeasts -= superBeasts
  }

  if (useEggs) {
    eggs = Math.min(Math.floor((level - EGG_START_LEVEL + 1) * 0.5), Math.floor(totalBeasts * 0.2))
    regularBeasts -= eggs
  }

  // Place entities (prefer right side of screen, away from player)
  const placeEntity = (type: EntityType): void => {
    let attempts = 0
    while (attempts < 100) {
      // Bias toward right side
      const x = Math.floor(GRID_WIDTH * 0.5 + random() * (GRID_WIDTH * 0.4))
      const y = 1 + Math.floor(random() * (GRID_HEIGHT - 2))
      const pos = { x: Math.min(x, GRID_WIDTH - 2), y }
      const key = posKey(pos)

      if (!occupied.has(key)) {
        const entity: Entity = {
          id: generateEntityId(),
          position: pos,
          type,
        }
        if (type === 'egg') {
          entity.hatchTimer = EGG_HATCH_TICKS + Math.floor(random() * EGG_HATCH_TICKS)
        }
        entities.push(entity)
        occupied.add(key)
        return
      }
      attempts++
    }
  }

  // Place all entities
  for (let i = 0; i < regularBeasts; i++) placeEntity('beast')
  for (let i = 0; i < superBeasts; i++) placeEntity('super-beast')
  for (let i = 0; i < eggs; i++) placeEntity('egg')

  return { player, blocks, entities }
}
