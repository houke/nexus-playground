// Collision Detection for Snake Game
import type { Position } from './types'

/**
 * Check if position is outside the grid (wall collision)
 */
export function checkCollision(pos: Position, gridWidth: number, gridHeight: number): boolean {
  return pos.x < 0 || pos.x >= gridWidth || pos.y < 0 || pos.y >= gridHeight
}

/**
 * Check if head position collides with food
 */
export function checkFoodCollision(head: Position, food: Position): boolean {
  return head.x === food.x && head.y === food.y
}

/**
 * Check if head position collides with own body
 * Skip first segment (the head itself)
 */
export function checkSelfCollision(head: Position, snake: Position[]): boolean {
  return snake.slice(1).some((segment) => segment.x === head.x && segment.y === head.y)
}

/**
 * Check if head position collides with another player's snake
 */
export function checkOtherPlayerCollision(head: Position, otherSnake: Position[]): boolean {
  return otherSnake.some((segment) => segment.x === head.x && segment.y === head.y)
}

/**
 * Check if two positions are the same
 */
export function positionsEqual(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y
}
