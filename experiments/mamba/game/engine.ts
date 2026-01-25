// Mamba Game Engine - Endless Mode (Progressive Difficulty)
import type { GameState, Direction, Position, WallSegment, MambaState } from './types'
import {
  GRID_WIDTH,
  GRID_HEIGHT,
  BASE_TICK_RATE,
  TICK_RATE_DECREASE_PER_SHED,
  MIN_TICK_RATE,
  MIN_WALL_THRESHOLD,
  MAX_WALL_THRESHOLD,
  KEEP_BODY_AFTER_SHED,
  WALL_LIFESPAN_MIN,
  WALL_LIFESPAN_MAX,
  WALL_LIFESPAN_INCREASE_PER_SHED,
  MAX_WALL_LIFESPAN_MULTIPLIER,
  MIN_STARTING_BRONZE,
  MAX_STARTING_BRONZE,
  MAX_BRONZE_ON_SCREEN,
  BRONZE_POINTS,
  SILVER_POINTS,
  INITIAL_LENGTH,
  posKey,
  DIRECTION_VECTORS,
  OPPOSITE_DIRECTIONS,
} from './types'
import {
  checkBoundaryCollision,
  checkWallCollision,
  checkSilverCollision,
  checkCollectibleCollision,
} from './collision'

type StateChangeCallback = (state: GameState) => void

function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export class MambaEngine {
  private state: GameState
  private callbacks: StateChangeCallback[] = []
  private accumulator = 0

  constructor() {
    this.state = this.createInitialState()
  }

  private createInitialBody(): Position[] {
    const y = Math.floor(GRID_HEIGHT / 2)
    const body: Position[] = []
    for (let i = 1; i < INITIAL_LENGTH; i++) {
      body.push({ x: 5 - i, y })
    }
    return body
  }

  private createInitialState(): GameState {
    const mamba: MambaState = {
      head: { x: 5, y: Math.floor(GRID_HEIGHT / 2) },
      body: this.createInitialBody(),
      direction: 'right',
      nextDirection: 'right',
      length: INITIAL_LENGTH,
    }

    return {
      status: 'menu',
      mamba,
      walls: new Map(),
      collectibles: [],
      score: 0,
      multiplier: 1,
      wallThreshold: random(MIN_WALL_THRESHOLD, MAX_WALL_THRESHOLD),
      bronzeCollected: 0,
      shedCount: 0,
      wallLifespanMultiplier: 1.0,
      currentTick: 0,
      tickRate: BASE_TICK_RATE,
      gridWidth: GRID_WIDTH,
      gridHeight: GRID_HEIGHT,
      lastEvent: null,
    }
  }

  private createGameState(): GameState {
    const mamba: MambaState = {
      head: { x: 5, y: Math.floor(GRID_HEIGHT / 2) },
      body: this.createInitialBody(),
      direction: 'right',
      nextDirection: 'right',
      length: INITIAL_LENGTH,
    }

    const state: GameState = {
      status: 'playing',
      mamba,
      walls: new Map(),
      collectibles: [],
      score: 0,
      multiplier: 1,
      wallThreshold: random(MIN_WALL_THRESHOLD, MAX_WALL_THRESHOLD),
      bronzeCollected: 0,
      shedCount: 0,
      wallLifespanMultiplier: 1.0,
      currentTick: 0,
      tickRate: BASE_TICK_RATE,
      gridWidth: GRID_WIDTH,
      gridHeight: GRID_HEIGHT,
      lastEvent: null,
    }

    // Spawn initial bronze
    const startingBronze = random(MIN_STARTING_BRONZE, MAX_STARTING_BRONZE)
    this.spawnBronze(state, startingBronze)

    return state
  }

  private getOccupiedPositions(state: GameState): Set<string> {
    const occupied = new Set<string>()

    // Mamba head and body
    occupied.add(posKey(state.mamba.head))
    state.mamba.body.forEach((pos) => occupied.add(posKey(pos)))

    // Walls
    for (const key of state.walls.keys()) {
      occupied.add(key)
    }

    // Collectibles
    state.collectibles.forEach((c) => occupied.add(posKey(c.position)))

    return occupied
  }

  private findFreePosition(state: GameState, occupied: Set<string>): Position | null {
    const maxAttempts = 100
    for (let i = 0; i < maxAttempts; i++) {
      const pos: Position = {
        x: Math.floor(Math.random() * state.gridWidth),
        y: Math.floor(Math.random() * state.gridHeight),
      }
      if (!occupied.has(posKey(pos))) {
        return pos
      }
    }
    return null
  }

  private spawnBronze(state: GameState, count: number): void {
    const occupied = this.getOccupiedPositions(state)
    const bronzeCount = state.collectibles.filter((c) => c.type === 'bronze').length

    for (let i = 0; i < count && bronzeCount + i < MAX_BRONZE_ON_SCREEN; i++) {
      const pos = this.findFreePosition(state, occupied)
      if (pos) {
        state.collectibles.push({
          position: pos,
          type: 'bronze',
          value: BRONZE_POINTS,
        })
        occupied.add(posKey(pos))
      }
    }
  }

  private spawnSingleBronze(state: GameState): void {
    const bronzeCount = state.collectibles.filter((c) => c.type === 'bronze').length
    if (bronzeCount < MAX_BRONZE_ON_SCREEN) {
      const occupied = this.getOccupiedPositions(state)
      const pos = this.findFreePosition(state, occupied)
      if (pos) {
        state.collectibles.push({
          position: pos,
          type: 'bronze',
          value: BRONZE_POINTS,
        })
      }
    }
  }

  private addSilverFromWall(state: GameState, pos: Position): void {
    state.collectibles.push({
      position: pos,
      type: 'silver',
      value: SILVER_POINTS,
    })
  }

  start(): void {
    this.state = this.createGameState()
    this.accumulator = 0
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
    this.state = this.createInitialState()
    this.notifyStateChange()
  }

  setDirection(direction: Direction): void {
    const { mamba } = this.state
    if (this.state.status !== 'playing') return

    // Prevent 180-degree turns
    if (OPPOSITE_DIRECTIONS[direction] !== mamba.direction) {
      mamba.nextDirection = direction
    }
  }

  update(deltaTime: number): void {
    if (this.state.status !== 'playing') return

    this.accumulator += deltaTime
    this.state.lastEvent = null

    while (this.accumulator >= this.state.tickRate) {
      this.tick()
      this.accumulator -= this.state.tickRate

      // Stop processing if game ended
      if (this.state.status !== 'playing') break
    }
  }

  private tick(): void {
    const { mamba, walls, collectibles } = this.state

    // Apply direction change
    mamba.direction = mamba.nextDirection

    // Calculate new head position
    const delta = DIRECTION_VECTORS[mamba.direction]
    const newHead: Position = {
      x: mamba.head.x + delta.x,
      y: mamba.head.y + delta.y,
    }

    // Check boundary collision
    if (checkBoundaryCollision(newHead, this.state.gridWidth, this.state.gridHeight)) {
      this.gameOver()
      return
    }

    // Check wall collision (solid walls = death)
    const wallHit = checkWallCollision(newHead, walls)
    if (wallHit) {
      this.gameOver()
      return
    }

    // Check silver collection (walls turned into collectibles)
    const silverHit = checkSilverCollision(newHead, collectibles)
    if (silverHit) {
      const points = SILVER_POINTS * this.state.multiplier
      this.state.score += points
      // Remove silver
      const idx = collectibles.findIndex(
        (c) => c.position.x === silverHit.position.x && c.position.y === silverHit.position.y
      )
      if (idx !== -1) {
        collectibles.splice(idx, 1)
      }
      // Collecting silver spawns more bronze
      this.spawnSingleBronze(this.state)
      // Speed up wall decay slightly
      this.decrementWallLifespans(0.2)
      mamba.length++ // Grow when eating silver
      this.state.lastEvent = 'silver'
    }

    // Check collectible collision (bronze only in endless mode)
    const collectibleHit = checkCollectibleCollision(newHead, collectibles)
    if (collectibleHit) {
      // Remove the collected item
      const idx = collectibles.findIndex(
        (c) =>
          c.position.x === collectibleHit.position.x && c.position.y === collectibleHit.position.y
      )
      if (idx !== -1) {
        collectibles.splice(idx, 1)
      }

      if (collectibleHit.type === 'bronze') {
        const points = BRONZE_POINTS * this.state.multiplier
        this.state.score += points
        mamba.length++ // Grow when eating bronze
        this.state.bronzeCollected++
        this.state.lastEvent = 'bronze'

        // Speed up wall decay slightly
        this.decrementWallLifespans(1)

        // Spawn more bronze (keeps game going)
        this.spawnSingleBronze(this.state)
      }
    }

    // Move body: add current head position to front of body
    mamba.body.unshift({ ...mamba.head })

    // Move head to new position
    ;(mamba as { head: Position }).head = newHead

    // Check for self-collision (hitting own body)
    const selfCollision = mamba.body.some(
      (segment) => segment.x === newHead.x && segment.y === newHead.y
    )
    if (selfCollision) {
      this.gameOver()
      return
    }

    // Normal tail trimming - don't trim beyond target length
    while (mamba.body.length >= mamba.length) {
      mamba.body.pop()
    }

    // SHEDDING MECHANIC: When snake gets long enough, shed the tail as walls
    // Total length = head (1) + body.length
    const totalLength = 1 + mamba.body.length
    if (totalLength >= this.state.wallThreshold) {
      // Shed everything past KEEP_BODY_AFTER_SHED
      const toShed = mamba.body.splice(KEEP_BODY_AFTER_SHED)

      if (toShed.length > 0) {
        // Create wall segments from shed body with scaled lifespan
        // Walls last longer as the game progresses (progressive difficulty)
        for (const shedPos of toShed) {
          const baseLifespan = random(WALL_LIFESPAN_MIN, WALL_LIFESPAN_MAX)
          const scaledLifespan = Math.floor(baseLifespan * this.state.wallLifespanMultiplier)
          const wallSegment: WallSegment = {
            position: { ...shedPos },
            state: 'solid',
            lifespan: scaledLifespan,
            createdAt: this.state.currentTick,
          }
          walls.set(posKey(shedPos), wallSegment)
        }

        // Adjust target length to match new body
        mamba.length = KEEP_BODY_AFTER_SHED + 1

        // Set new wall threshold
        this.state.wallThreshold = random(MIN_WALL_THRESHOLD, MAX_WALL_THRESHOLD)

        // Increase multiplier (max 10)
        if (this.state.multiplier < 10) {
          this.state.multiplier++
        }

        // PROGRESSIVE DIFFICULTY: Increase wall lifespan multiplier
        // Walls will last longer, making the game harder over time
        this.state.shedCount++
        this.state.wallLifespanMultiplier = Math.min(
          MAX_WALL_LIFESPAN_MULTIPLIER,
          1.0 + this.state.shedCount * WALL_LIFESPAN_INCREASE_PER_SHED
        )

        // Slightly speed up the game with each shed
        this.state.tickRate = Math.max(
          MIN_TICK_RATE,
          BASE_TICK_RATE - this.state.shedCount * TICK_RATE_DECREASE_PER_SHED
        )

        this.state.lastEvent = 'shed'
      }
    }

    // Process wall aging (decrement lifespans, convert to silver)
    this.processWallAging()

    // Increment tick
    this.state.currentTick++

    this.notifyStateChange()
  }

  private decrementWallLifespans(amount: number): void {
    for (const wall of this.state.walls.values()) {
      if (wall.state === 'solid') {
        wall.lifespan -= amount
      }
    }
  }

  private processWallAging(): void {
    const { walls } = this.state
    const toRemove: string[] = []

    for (const [key, wall] of walls.entries()) {
      if (wall.state === 'solid') {
        wall.lifespan--
        if (wall.lifespan <= 0) {
          // Wall becomes silver collectible
          toRemove.push(key)
          this.addSilverFromWall(this.state, wall.position)
        }
      }
    }

    // Remove walls that became silver
    for (const key of toRemove) {
      walls.delete(key)
    }
  }

  private gameOver(): void {
    this.state.status = 'gameover'
    this.state.lastEvent = 'death'
    this.notifyStateChange()
  }

  onStateChange(callback: StateChangeCallback): void {
    this.callbacks.push(callback)
  }

  private notifyStateChange(): void {
    this.callbacks.forEach((cb) => cb(this.state))
  }

  getState(): GameState {
    return this.state
  }
}
