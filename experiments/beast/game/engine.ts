// Beast Game - Core Engine
/* eslint-disable no-undef */
import type { GameState, GameStatus, Direction, Entity } from './types'
import {
  GRID_WIDTH,
  GRID_HEIGHT,
  BASE_TICK_RATE,
  TICK_RATE_DECREASE,
  MIN_TICK_RATE,
  INITIAL_LIVES,
  LEVEL_CLEAR_BONUS,
  posEquals,
  generateEntityId,
} from './types'
import { generateLevel } from './level'
import { calculatePlayerMove, calculateBeastMove } from './collision'

type StateChangeCallback = (state: GameState) => void

export class GameEngine {
  private state: GameState
  private stateListeners: StateChangeCallback[] = []
  private gameLoopId: number | null = null
  private lastTickTime = 0
  private pendingMove: Direction | null = null

  constructor() {
    this.state = this.createInitialState()
  }

  private createInitialState(): GameState {
    return {
      status: 'menu',
      player: { x: 0, y: 0 },
      entities: [],
      blocks: [],
      level: 1,
      lives: INITIAL_LIVES,
      score: 0,
      gridWidth: GRID_WIDTH,
      gridHeight: GRID_HEIGHT,
      currentTick: 0,
      tickRate: BASE_TICK_RATE,
      lastEvent: null,
      crushedEntities: [],
    }
  }

  getState(): GameState {
    return { ...this.state }
  }

  onStateChange(callback: StateChangeCallback): () => void {
    this.stateListeners.push(callback)
    return () => {
      this.stateListeners = this.stateListeners.filter((l) => l !== callback)
    }
  }

  private notifyStateChange(): void {
    const state = this.getState()
    this.stateListeners.forEach((l) => l(state))
  }

  private setStatus(status: GameStatus): void {
    this.state.status = status
    this.notifyStateChange()
  }

  // Start a new game
  startGame(): void {
    const level = generateLevel(1)

    this.state = {
      ...this.createInitialState(),
      status: 'playing',
      player: level.player,
      entities: level.entities,
      blocks: level.blocks,
      level: 1,
      tickRate: BASE_TICK_RATE,
    }

    this.pendingMove = null
    this.startGameLoop()
    this.notifyStateChange()
  }

  // Load a specific level
  private loadLevel(levelNum: number): void {
    const level = generateLevel(levelNum)

    this.state.player = level.player
    this.state.entities = level.entities
    this.state.blocks = level.blocks
    this.state.level = levelNum
    this.state.tickRate = Math.max(
      MIN_TICK_RATE,
      BASE_TICK_RATE - (levelNum - 1) * TICK_RATE_DECREASE
    )
    this.state.currentTick = 0
    this.state.lastEvent = null
    this.state.crushedEntities = []
    this.pendingMove = null
  }

  // Process player input
  handleInput(direction: Direction): void {
    if (this.state.status !== 'playing') return
    this.pendingMove = direction
  }

  // Pause/resume game
  pause(): void {
    if (this.state.status === 'playing') {
      this.stopGameLoop()
      this.setStatus('paused')
    }
  }

  resume(): void {
    if (this.state.status === 'paused') {
      this.startGameLoop()
      this.setStatus('playing')
    }
  }

  togglePause(): void {
    if (this.state.status === 'playing') {
      this.pause()
    } else if (this.state.status === 'paused') {
      this.resume()
    }
  }

  // Restart current level
  restart(): void {
    if (this.state.status === 'gameover') {
      this.startGame()
    } else {
      this.loadLevel(this.state.level)
      this.state.status = 'playing'
      this.startGameLoop()
      this.notifyStateChange()
    }
  }

  // Continue to next level
  nextLevel(): void {
    if (this.state.status === 'levelcomplete') {
      this.loadLevel(this.state.level + 1)
      this.state.status = 'playing'
      this.startGameLoop()
      this.notifyStateChange()
    }
  }

  // Return to menu
  returnToMenu(): void {
    this.stopGameLoop()
    this.state = this.createInitialState()
    this.notifyStateChange()
  }

  // Main game loop
  private startGameLoop(): void {
    if (this.gameLoopId !== null) return

    this.lastTickTime = performance.now()

    const loop = (currentTime: number): void => {
      if (this.state.status !== 'playing') {
        this.gameLoopId = null
        return
      }

      const elapsed = currentTime - this.lastTickTime

      if (elapsed >= this.state.tickRate) {
        this.tick()
        this.lastTickTime = currentTime
      }

      this.gameLoopId = requestAnimationFrame(loop)
    }

    this.gameLoopId = requestAnimationFrame(loop)
  }

  private stopGameLoop(): void {
    if (this.gameLoopId !== null) {
      cancelAnimationFrame(this.gameLoopId)
      this.gameLoopId = null
    }
  }

  // Single game tick
  private tick(): void {
    this.state.currentTick++
    this.state.lastEvent = null
    this.state.crushedEntities = []

    // Process player move if pending
    if (this.pendingMove) {
      this.processPlayerMove(this.pendingMove)
      this.pendingMove = null
    }

    // Process egg hatching
    this.processEggHatching()

    // Check for level complete
    if (this.checkLevelComplete()) {
      return
    }

    // Process enemy movement (every other tick to slow them down)
    if (this.state.currentTick % 2 === 0) {
      this.processEnemyMoves()
    }

    // Check for level complete again (in case enemy crushed themselves)
    this.checkLevelComplete()

    this.notifyStateChange()
  }

  private processPlayerMove(direction: Direction): void {
    const result = calculatePlayerMove(this.state, direction)

    if (!result.success) return

    // Update player position
    this.state.player = result.newPosition

    // Handle player death
    if (result.playerDied) {
      this.handlePlayerDeath()
      return
    }

    // Move blocks
    for (const blockMove of result.blocksToMove.reverse()) {
      const block = this.state.blocks.find((b) => posEquals(b.position, blockMove.from))
      if (block) {
        block.position = blockMove.to
      }
    }

    // Remove crushed entities
    if (result.crushedEntities.length > 0) {
      this.state.crushedEntities = result.crushedEntities.map((e) => e.position)
      this.state.entities = this.state.entities.filter(
        (e) => !result.crushedEntities.some((crushed) => crushed.id === e.id)
      )
      this.state.score += result.scoreEarned
      this.state.lastEvent = 'crush'
    }
  }

  private processEggHatching(): void {
    const newEntities: Entity[] = []

    for (const entity of this.state.entities) {
      if (entity.type === 'egg' && entity.hatchTimer !== undefined) {
        entity.hatchTimer--
        if (entity.hatchTimer <= 0) {
          // Hatch into hatched-beast
          newEntities.push({
            id: generateEntityId(),
            position: entity.position,
            type: 'hatched-beast',
          })
          this.state.lastEvent = 'hatch'
        }
      }
    }

    // Remove hatched eggs and add new hatched beasts
    if (newEntities.length > 0) {
      this.state.entities = this.state.entities.filter(
        (e) => !(e.type === 'egg' && e.hatchTimer !== undefined && e.hatchTimer <= 0)
      )
      this.state.entities.push(...newEntities)
    }
  }

  private processEnemyMoves(): void {
    // Process each beast (excluding eggs)
    const beasts = this.state.entities.filter((e) => e.type !== 'egg')

    for (const beast of beasts) {
      const result = calculateBeastMove(this.state, beast)

      // Check if beast crushed player
      if (result.crushedPlayer) {
        this.handlePlayerDeath()
        return
      }

      // Handle block pushing (hatched beasts only)
      if (result.pushedBlock) {
        const block = this.state.blocks.find((b) => posEquals(b.position, result.pushedBlock!.from))
        if (block && block.type === 'movable') {
          block.position = result.pushedBlock.to

          // Check if pushed block crushed player
          if (posEquals(result.pushedBlock.to, this.state.player)) {
            this.handlePlayerDeath()
            return
          }
        }
      }

      // Update beast position
      const entityIndex = this.state.entities.findIndex((e) => e.id === beast.id)
      if (entityIndex !== -1 && this.state.entities[entityIndex]) {
        this.state.entities[entityIndex].position = result.newPosition
      }
    }
  }

  private handlePlayerDeath(): void {
    this.state.lives--
    this.state.lastEvent = 'death'

    if (this.state.lives <= 0) {
      this.stopGameLoop()
      this.setStatus('gameover')
    } else {
      // Respawn on current level
      this.loadLevel(this.state.level)
      this.notifyStateChange()
    }
  }

  private checkLevelComplete(): boolean {
    // Level is complete when no beasts remain (eggs don't count)
    const hasEnemies = this.state.entities.some((e) => e.type !== 'egg')

    if (!hasEnemies) {
      this.stopGameLoop()
      this.state.score += LEVEL_CLEAR_BONUS * this.state.level
      this.state.lastEvent = 'levelup'
      this.setStatus('levelcomplete')
      return true
    }

    return false
  }

  destroy(): void {
    this.stopGameLoop()
    this.stateListeners = []
  }
}
