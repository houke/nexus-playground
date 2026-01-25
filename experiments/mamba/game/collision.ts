// Collision Detection for Mamba Game
import type { Position, WallSegment, Collectible } from './types'
import { posKey } from './types'

/**
 * Check if position is outside the grid (boundary collision)
 */
export function checkBoundaryCollision(
  pos: Position,
  gridWidth: number,
  gridHeight: number
): boolean {
  return pos.x < 0 || pos.x >= gridWidth || pos.y < 0 || pos.y >= gridHeight
}

/**
 * Check if position collides with a solid wall
 * Returns the wall segment if collision, null otherwise
 */
export function checkWallCollision(
  pos: Position,
  walls: Map<string, WallSegment>
): WallSegment | null {
  const key = posKey(pos)
  const wall = walls.get(key)
  if (wall && wall.state === 'solid') {
    return wall
  }
  return null
}

/**
 * Check if position collides with a silver collectible
 * Returns the collectible if collision, null otherwise
 */
export function checkSilverCollision(
  pos: Position,
  collectibles: Collectible[]
): Collectible | null {
  return (
    collectibles.find(
      (c) => c.type === 'silver' && c.position.x === pos.x && c.position.y === pos.y
    ) || null
  )
}

/**
 * Check if position collides with any collectible (bronze - not silver which is separate)
 * Returns the collectible if collision, null otherwise
 */
export function checkCollectibleCollision(
  pos: Position,
  collectibles: Collectible[]
): Collectible | null {
  return (
    collectibles.find(
      (c) => c.type !== 'silver' && c.position.x === pos.x && c.position.y === pos.y
    ) || null
  )
}

/**
 * Check if two positions are the same
 */
export function positionsEqual(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y
}
