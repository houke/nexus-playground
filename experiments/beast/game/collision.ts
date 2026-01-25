// Beast Game - Collision System
import type { Position, Block, Entity, GameState, Direction, CardinalDirection } from './types'
import {
  GRID_WIDTH,
  GRID_HEIGHT,
  DIRECTIONS,
  posEquals,
  posAdd,
  BEAST_POINTS,
  SUPER_BEAST_POINTS,
  HATCHED_BEAST_POINTS,
  CHAIN_BONUS_MULTIPLIER,
} from './types'

export interface MoveResult {
  success: boolean
  newPosition: Position
  blocksToMove: { from: Position; to: Position }[]
  crushedEntities: Entity[]
  playerDied: boolean
  scoreEarned: number
}

// Check if position is within grid bounds
function isInBounds(pos: Position): boolean {
  return pos.x >= 0 && pos.x < GRID_WIDTH && pos.y >= 0 && pos.y < GRID_HEIGHT
}

// Get block at position
function getBlockAt(blocks: Block[], pos: Position): Block | undefined {
  return blocks.find((b) => posEquals(b.position, pos))
}

// Get entity at position
function getEntityAt(entities: Entity[], pos: Position): Entity | undefined {
  return entities.find((e) => posEquals(e.position, pos))
}

// Check if position is blocked (by block or entity)
function isBlocked(state: GameState, pos: Position): boolean {
  if (!isInBounds(pos)) return true
  if (getBlockAt(state.blocks, pos)) return true
  if (getEntityAt(state.entities, pos)) return true
  return false
}

// Try to push blocks in a direction, returns chain of blocks that would move
function getPushChain(
  state: GameState,
  startPos: Position,
  direction: Direction
): { canPush: boolean; chain: Position[]; crushedEntities: Entity[] } {
  const delta = DIRECTIONS[direction]
  const chain: Position[] = []
  const crushedEntities: Entity[] = []
  let currentPos = startPos

  while (true) {
    const block = getBlockAt(state.blocks, currentPos)
    if (!block) break

    // Static and explosive blocks can't be pushed
    if (block.type !== 'movable') {
      return { canPush: false, chain: [], crushedEntities: [] }
    }

    chain.push(currentPos)
    const nextPos = posAdd(currentPos, delta)

    // Check what's at the next position
    if (!isInBounds(nextPos)) {
      return { canPush: false, chain: [], crushedEntities: [] }
    }

    const nextBlock = getBlockAt(state.blocks, nextPos)
    const nextEntity = getEntityAt(state.entities, nextPos)

    if (nextBlock) {
      // Another block - check if we can crush an entity against it
      currentPos = nextPos
      continue
    }

    if (nextEntity) {
      // Entity in the way - check if we can crush it
      const entityNextPos = posAdd(nextEntity.position, delta)
      const blockBehindEntity = getBlockAt(state.blocks, entityNextPos)
      const wallBehindEntity = !isInBounds(entityNextPos)

      // Check crushing conditions
      if (nextEntity.type === 'egg') {
        // Eggs can be crushed by any block against anything
        crushedEntities.push(nextEntity)
        return { canPush: true, chain, crushedEntities }
      } else if (nextEntity.type === 'beast' || nextEntity.type === 'hatched-beast') {
        // Regular beasts can be crushed against any obstacle
        if (blockBehindEntity || wallBehindEntity) {
          crushedEntities.push(nextEntity)
          return { canPush: true, chain, crushedEntities }
        }
      } else if (nextEntity.type === 'super-beast') {
        // Super-beasts can only be crushed against static blocks
        if (blockBehindEntity && blockBehindEntity.type === 'static') {
          crushedEntities.push(nextEntity)
          return { canPush: true, chain, crushedEntities }
        } else if (wallBehindEntity) {
          // Wall counts as static
          crushedEntities.push(nextEntity)
          return { canPush: true, chain, crushedEntities }
        }
      }

      // Can't crush the entity - can't push
      return { canPush: false, chain: [], crushedEntities: [] }
    }

    // Empty space - can push
    return { canPush: true, chain, crushedEntities }
  }

  return { canPush: true, chain, crushedEntities }
}

// Calculate move result for player
export function calculatePlayerMove(state: GameState, direction: Direction): MoveResult {
  const delta = DIRECTIONS[direction]
  const newPosition = posAdd(state.player, delta)

  // Check bounds
  if (!isInBounds(newPosition)) {
    return {
      success: false,
      newPosition: state.player,
      blocksToMove: [],
      crushedEntities: [],
      playerDied: false,
      scoreEarned: 0,
    }
  }

  // Check for explosive block collision
  const explosiveBlock = getBlockAt(state.blocks, newPosition)
  if (explosiveBlock?.type === 'explosive') {
    return {
      success: true,
      newPosition,
      blocksToMove: [],
      crushedEntities: [],
      playerDied: true,
      scoreEarned: 0,
    }
  }

  // Check for entity collision (player dies if they walk into an entity)
  const entity = getEntityAt(state.entities, newPosition)
  if (entity && entity.type !== 'egg') {
    return {
      success: true,
      newPosition,
      blocksToMove: [],
      crushedEntities: [],
      playerDied: true,
      scoreEarned: 0,
    }
  }

  // Check for block at new position
  const block = getBlockAt(state.blocks, newPosition)
  if (block) {
    if (block.type !== 'movable') {
      // Can't push static blocks
      return {
        success: false,
        newPosition: state.player,
        blocksToMove: [],
        crushedEntities: [],
        playerDied: false,
        scoreEarned: 0,
      }
    }

    // Try to push the block
    const { canPush, chain, crushedEntities } = getPushChain(state, newPosition, direction)

    if (!canPush) {
      return {
        success: false,
        newPosition: state.player,
        blocksToMove: [],
        crushedEntities: [],
        playerDied: false,
        scoreEarned: 0,
      }
    }

    // Calculate score for crushed entities
    let scoreEarned = 0
    let chainMultiplier = 1
    for (const crushed of crushedEntities) {
      let points = 0
      switch (crushed.type) {
        case 'beast':
          points = BEAST_POINTS
          break
        case 'super-beast':
          points = SUPER_BEAST_POINTS
          break
        case 'hatched-beast':
          points = HATCHED_BEAST_POINTS
          break
        case 'egg':
          points = 50 // Eggs give less points
          break
      }
      scoreEarned += Math.floor(points * chainMultiplier)
      chainMultiplier *= CHAIN_BONUS_MULTIPLIER
    }

    // Calculate block movements
    const blocksToMove = chain.map((pos) => ({
      from: pos,
      to: posAdd(pos, delta),
    }))

    return {
      success: true,
      newPosition,
      blocksToMove,
      crushedEntities,
      playerDied: false,
      scoreEarned,
    }
  }

  // Empty space - just move
  return {
    success: true,
    newPosition,
    blocksToMove: [],
    crushedEntities: [],
    playerDied: false,
    scoreEarned: 0,
  }
}

// Calculate beast movement toward player
export function calculateBeastMove(
  state: GameState,
  entity: Entity
): {
  newPosition: Position
  pushedBlock?: { from: Position; to: Position }
  crushedPlayer: boolean
} {
  const player = state.player

  // Find best direction toward player
  let bestDirection: CardinalDirection | null = null
  let bestDistance = Infinity

  const cardinalDirections: CardinalDirection[] = ['up', 'down', 'left', 'right']

  for (const dir of cardinalDirections) {
    const delta = DIRECTIONS[dir]
    const newPos = posAdd(entity.position, delta)

    if (!isInBounds(newPos)) continue

    // Check if position is blocked
    const block = getBlockAt(state.blocks, newPos)
    const otherEntity = getEntityAt(
      state.entities.filter((e) => e.id !== entity.id),
      newPos
    )

    // Hatched beasts can push blocks
    if (entity.type === 'hatched-beast' && block?.type === 'movable') {
      const pushTarget = posAdd(newPos, delta)
      const canPush =
        isInBounds(pushTarget) &&
        !isBlocked(
          { ...state, entities: state.entities.filter((e) => e.id !== entity.id) },
          pushTarget
        )

      // Check if pushing would crush player
      if (posEquals(pushTarget, player)) {
        return {
          newPosition: entity.position,
          pushedBlock: { from: newPos, to: pushTarget },
          crushedPlayer: true,
        }
      }

      if (canPush) {
        const distance = Math.abs(newPos.x - player.x) + Math.abs(newPos.y - player.y)
        if (distance < bestDistance) {
          bestDistance = distance
          bestDirection = dir
        }
      }
      continue
    }

    // Regular movement
    if (block || otherEntity) continue

    // Check if this would move onto player
    if (posEquals(newPos, player)) {
      return { newPosition: newPos, crushedPlayer: true }
    }

    const distance = Math.abs(newPos.x - player.x) + Math.abs(newPos.y - player.y)
    if (distance < bestDistance) {
      bestDistance = distance
      bestDirection = dir
    }
  }

  if (bestDirection) {
    const newPos = posAdd(entity.position, DIRECTIONS[bestDirection])

    // Handle block pushing for hatched beasts
    if (entity.type === 'hatched-beast') {
      const block = getBlockAt(state.blocks, newPos)
      if (block?.type === 'movable') {
        const pushTarget = posAdd(newPos, DIRECTIONS[bestDirection])
        return {
          newPosition: newPos,
          pushedBlock: { from: newPos, to: pushTarget },
          crushedPlayer: false,
        }
      }
    }

    return { newPosition: newPos, crushedPlayer: false }
  }

  return { newPosition: entity.position, crushedPlayer: false }
}
