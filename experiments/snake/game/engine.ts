// Snake Game Engine - Core Game Loop
import type { GameState, GameMode, Direction, Position, PlayerState, SpeedSetting } from './types'
import { SPEED_VALUES, GRID_WIDTH, GRID_HEIGHT, FOOD_PER_LEVEL } from './types'
import {
  checkCollision,
  checkFoodCollision,
  checkSelfCollision,
  checkOtherPlayerCollision,
} from './collision'

type StateChangeCallback = (state: GameState) => void

export class GameEngine {
  private state: GameState
  private callbacks: StateChangeCallback[] = []
  private accumulator = 0
  private foodEatenThisLevel = 0

  constructor() {
    this.state = this.createInitialState('single')
  }

  private createInitialState(mode: GameMode): GameState {
    const players: PlayerState[] = [
      {
        snake: [
          { x: 5, y: 10 },
          { x: 4, y: 10 },
          { x: 3, y: 10 },
        ],
        direction: 'right',
        nextDirection: 'right',
        alive: true,
        color: '#22C55E', // Green
      },
    ]

    if (mode === 'multiplayer') {
      players.push({
        snake: [
          { x: 14, y: 10 },
          { x: 15, y: 10 },
          { x: 16, y: 10 },
        ],
        direction: 'left',
        nextDirection: 'left',
        alive: true,
        color: '#8B5CF6', // Purple
      })
    }

    return {
      mode,
      status: 'menu',
      players,
      food: this.spawnFood(players),
      score: mode === 'multiplayer' ? [0, 0] : [0],
      level: 1,
      tickRate: SPEED_VALUES.medium,
      gridWidth: GRID_WIDTH,
      gridHeight: GRID_HEIGHT,
      lastEvent: null,
      winner: null,
    }
  }

  private spawnFood(players: PlayerState[]): Position {
    const occupiedPositions = new Set<string>()

    // Mark all snake positions as occupied
    players.forEach((player) => {
      player.snake.forEach((pos) => {
        occupiedPositions.add(`${pos.x},${pos.y}`)
      })
    })

    // Find a random unoccupied position
    let food: Position
    do {
      food = {
        x: Math.floor(Math.random() * GRID_WIDTH),
        y: Math.floor(Math.random() * GRID_HEIGHT),
      }
    } while (occupiedPositions.has(`${food.x},${food.y}`))

    return food
  }

  start(mode: GameMode, speed: SpeedSetting): void {
    this.state = this.createInitialState(mode)
    this.state.status = 'playing'
    this.state.tickRate = SPEED_VALUES[speed]
    this.accumulator = 0
    this.foodEatenThisLevel = 0
    this.notifyStateChange()
  }

  pause(): void {
    if (this.state.status === 'playing') {
      this.state.status = 'paused'
      this.notifyStateChange()
    }
  }

  resume(): void {
    if (this.state.status === 'paused') {
      this.state.status = 'playing'
      this.notifyStateChange()
    }
  }

  reset(): void {
    this.state = this.createInitialState(this.state.mode)
    this.notifyStateChange()
  }

  setDirection(playerIndex: number, direction: Direction): void {
    const player = this.state.players[playerIndex]
    if (!player || !player.alive) return

    // Prevent 180-degree turns
    const opposites: Record<Direction, Direction> = {
      up: 'down',
      down: 'up',
      left: 'right',
      right: 'left',
    }

    if (opposites[direction] !== player.direction) {
      player.nextDirection = direction
    }
  }

  update(deltaTime: number): void {
    if (this.state.status !== 'playing') return

    this.accumulator += deltaTime
    this.state.lastEvent = null

    while (this.accumulator >= this.state.tickRate) {
      this.tick()
      this.accumulator -= this.state.tickRate
    }
  }

  private tick(): void {
    const { players, food } = this.state
    let foodEaten = false

    // Update each player
    players.forEach((player, playerIndex) => {
      if (!player.alive) return

      // Apply queued direction
      player.direction = player.nextDirection

      // Calculate new head position
      const head = player.snake[0]
      if (!head) return

      const newHead = this.getNewPosition(head, player.direction)

      // Check wall collision
      if (checkCollision(newHead, GRID_WIDTH, GRID_HEIGHT)) {
        player.alive = false
        return
      }

      // Check self collision
      if (checkSelfCollision(newHead, player.snake)) {
        player.alive = false
        return
      }

      // Check collision with other players (multiplayer)
      if (this.state.mode === 'multiplayer') {
        const otherPlayer = players[playerIndex === 0 ? 1 : 0]
        if (otherPlayer && checkOtherPlayerCollision(newHead, otherPlayer.snake)) {
          player.alive = false
          return
        }
      }

      // Check food collision
      if (checkFoodCollision(newHead, food)) {
        // Grow snake (don't remove tail)
        player.snake.unshift(newHead)
        this.state.score[playerIndex] = (this.state.score[playerIndex] ?? 0) + this.state.level
        foodEaten = true
        this.foodEatenThisLevel++
        this.state.lastEvent = 'food'

        // Check for level up
        if (this.foodEatenThisLevel >= FOOD_PER_LEVEL) {
          this.state.level++
          this.foodEatenThisLevel = 0
          this.state.lastEvent = 'levelup'
          // Speed up slightly with each level
          this.state.tickRate = Math.max(50, this.state.tickRate - 10)
        }
      } else {
        // Move snake (add head, remove tail)
        player.snake.unshift(newHead)
        player.snake.pop()
      }
    })

    // Spawn new food if eaten
    if (foodEaten) {
      this.state.food = this.spawnFood(players)
    }

    // Check for game over
    const alivePlayers = players.filter((p) => p.alive)
    if (
      alivePlayers.length === 0 ||
      (this.state.mode === 'multiplayer' && alivePlayers.length === 1)
    ) {
      this.state.status = 'gameover'
      this.state.lastEvent = 'death'

      // Determine winner in multiplayer
      if (this.state.mode === 'multiplayer') {
        const winner = players.findIndex((p) => p.alive)
        this.state.winner = winner >= 0 ? winner : null
      }
    }

    this.notifyStateChange()
  }

  private getNewPosition(pos: Position, direction: Direction): Position {
    switch (direction) {
      case 'up':
        return { x: pos.x, y: pos.y - 1 }
      case 'down':
        return { x: pos.x, y: pos.y + 1 }
      case 'left':
        return { x: pos.x - 1, y: pos.y }
      case 'right':
        return { x: pos.x + 1, y: pos.y }
    }
  }

  getState(): GameState {
    return this.state
  }

  onStateChange(callback: StateChangeCallback): void {
    this.callbacks.push(callback)
  }

  private notifyStateChange(): void {
    this.callbacks.forEach((cb) => cb(this.state))
  }
}
