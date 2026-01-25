// experiments/snake/renderers/webgl.ts
// Style 5: WebGL Space Snake (2026) - Premium 3D Edition
// Features: PBR materials, bloom post-processing, particle physics, grid visualization

import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import type { GameState, Position } from '../game/types'
import { GRID_WIDTH, GRID_HEIGHT } from '../game/types'

// Cyberpunk color palette
const COLORS = {
  SNAKE_HEAD: 0x00ff88, // Cyan-green
  SNAKE_BODY: 0x0088ff, // Electric blue
  SNAKE_TAIL: 0x0044aa, // Deep blue
  ENEMY_HEAD: 0xff00ff, // Magenta
  ENEMY_BODY: 0xff0088, // Hot pink
  ENEMY_TAIL: 0xaa0066, // Deep pink
  FOOD: 0xffd700, // Gold
  BACKGROUND: 0x0a0a1a, // Dark blue-black
  GRID: 0x2a2a4a, // Visible grid
  WALL: 0x4a1a6a, // Purple walls
  PARTICLE: 0xffffff, // White for particles
  FLOOR: 0x0f0f2f, // Dark floor
}

const TILE_SIZE = 1.5 // Grid cell size in world units (smaller = tighter)

// Particle physics
interface Particle {
  mesh: THREE.Mesh
  velocity: THREE.Vector3
  lifetime: number
  maxLifetime: number
}

// Snake segment with smooth animation
interface SnakeSegment {
  mesh: THREE.Mesh
  targetPos: THREE.Vector3
  currentPos: THREE.Vector3
}

export class WebGLRenderer {
  private canvas: HTMLCanvasElement
  private renderer: THREE.WebGLRenderer
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private composer: EffectComposer
  private bloomPass: UnrealBloomPass

  // Grid dimensions from game state
  private gridWidth: number = GRID_WIDTH
  private gridHeight: number = GRID_HEIGHT

  // Game objects
  private snakeSegments: SnakeSegment[] = []
  private enemySegments: SnakeSegment[] = []
  private foodMesh: THREE.Mesh | null = null
  private gridGroup: THREE.Group | null = null
  private floorMesh: THREE.Mesh | null = null
  private wallGroup: THREE.Group | null = null

  // Particles
  private particles: Particle[] = []
  private particlePool: THREE.Mesh[] = []

  // Animation state
  private animationFrame: number | null = null
  private cameraShake: { intensity: number; decay: number } = { intensity: 0, decay: 0.92 }
  private pulseTime: number = 0
  private baseCameraPos: THREE.Vector3
  private initialized: boolean = false
  private lastGameStatus: string = 'menu'

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas

    // Initialize Three.js renderer with proper settings
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight)
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.5
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap

    // Scene setup
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(COLORS.BACKGROUND)

    // Camera setup - will be positioned in setupScene
    const aspect = canvas.clientWidth / canvas.clientHeight
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 200)
    this.baseCameraPos = new THREE.Vector3()

    // Post-processing: Bloom effect
    this.composer = new EffectComposer(this.renderer)
    const renderPass = new RenderPass(this.scene, this.camera)
    this.composer.addPass(renderPass)

    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(canvas.clientWidth, canvas.clientHeight),
      0.8, // strength - visible but not overwhelming
      0.3, // radius
      0.7 // threshold
    )
    this.composer.addPass(this.bloomPass)

    // Handle window resize
    window.addEventListener('resize', this.handleResize)

    // Start animation loop
    this.animate()
  }

  private setupScene(): void {
    // Clear previous scene objects
    if (this.gridGroup) {
      this.scene.remove(this.gridGroup)
      this.gridGroup = null
    }
    if (this.floorMesh) {
      this.scene.remove(this.floorMesh)
      this.floorMesh = null
    }
    if (this.wallGroup) {
      this.scene.remove(this.wallGroup)
      this.wallGroup = null
    }

    // Calculate world dimensions
    const worldWidth = this.gridWidth * TILE_SIZE
    const worldHeight = this.gridHeight * TILE_SIZE
    const centerX = worldWidth / 2
    const centerZ = worldHeight / 2

    // Position camera to see entire grid with some padding
    const maxDim = Math.max(worldWidth, worldHeight)
    const cameraHeight = maxDim * 1.2
    const cameraZ = centerZ + maxDim * 0.5

    this.baseCameraPos.set(centerX, cameraHeight, cameraZ)
    this.camera.position.copy(this.baseCameraPos)
    this.camera.lookAt(centerX, 0, centerZ)

    // Add lighting
    this.setupLighting(centerX, centerZ, maxDim)

    // Create game elements
    this.createFloor(worldWidth, worldHeight, centerX, centerZ)
    this.createGrid(worldWidth, worldHeight)
    this.createWalls(worldWidth, worldHeight)

    // Pre-create particle pool
    if (this.particlePool.length === 0) {
      this.createParticlePool(100)
    }

    this.initialized = true
  }

  private setupLighting(centerX: number, centerZ: number, maxDim: number): void {
    // Remove existing lights
    this.scene.children
      .filter((child) => child instanceof THREE.Light)
      .forEach((light) => this.scene.remove(light))

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x303050, 0.5)
    this.scene.add(ambientLight)

    // Key light (main directional)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.0)
    keyLight.position.set(centerX + maxDim * 0.5, maxDim, centerZ - maxDim * 0.3)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.width = 2048
    keyLight.shadow.mapSize.height = 2048
    keyLight.shadow.camera.near = 0.5
    keyLight.shadow.camera.far = maxDim * 3
    keyLight.shadow.camera.left = -maxDim
    keyLight.shadow.camera.right = maxDim
    keyLight.shadow.camera.top = maxDim
    keyLight.shadow.camera.bottom = -maxDim
    this.scene.add(keyLight)

    // Fill light (cyan tint from left)
    const fillLight = new THREE.DirectionalLight(0x00ffff, 0.3)
    fillLight.position.set(centerX - maxDim, maxDim * 0.5, centerZ)
    this.scene.add(fillLight)

    // Rim light (magenta from behind)
    const rimLight = new THREE.PointLight(0xff00ff, 1.5, maxDim * 2)
    rimLight.position.set(centerX, maxDim * 0.3, centerZ + maxDim * 0.8)
    this.scene.add(rimLight)

    // Ground glow
    const groundLight = new THREE.PointLight(0x4444ff, 0.5, maxDim)
    groundLight.position.set(centerX, -2, centerZ)
    this.scene.add(groundLight)
  }

  private createFloor(width: number, height: number, centerX: number, centerZ: number): void {
    const floorGeometry = new THREE.PlaneGeometry(width + 4, height + 4)
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.FLOOR,
      metalness: 0.8,
      roughness: 0.3,
    })
    this.floorMesh = new THREE.Mesh(floorGeometry, floorMaterial)
    this.floorMesh.rotation.x = -Math.PI / 2
    this.floorMesh.position.set(centerX, -0.1, centerZ)
    this.floorMesh.receiveShadow = true
    this.scene.add(this.floorMesh)
  }

  private createGrid(worldWidth: number, worldHeight: number): void {
    this.gridGroup = new THREE.Group()

    const material = new THREE.LineBasicMaterial({
      color: COLORS.GRID,
      transparent: true,
      opacity: 0.5,
    })

    // Vertical lines (along Z axis)
    for (let x = 0; x <= this.gridWidth; x++) {
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x * TILE_SIZE, 0.01, 0),
        new THREE.Vector3(x * TILE_SIZE, 0.01, worldHeight),
      ])
      const line = new THREE.Line(geometry, material)
      this.gridGroup.add(line)
    }

    // Horizontal lines (along X axis)
    for (let z = 0; z <= this.gridHeight; z++) {
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0.01, z * TILE_SIZE),
        new THREE.Vector3(worldWidth, 0.01, z * TILE_SIZE),
      ])
      const line = new THREE.Line(geometry, material)
      this.gridGroup.add(line)
    }

    this.scene.add(this.gridGroup)
  }

  private createWalls(worldWidth: number, worldHeight: number): void {
    this.wallGroup = new THREE.Group()

    const wallHeight = 0.8
    const wallThickness = 0.3

    const wallMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.WALL,
      metalness: 0.7,
      roughness: 0.3,
      emissive: COLORS.WALL,
      emissiveIntensity: 0.3,
    })

    // Top wall (Z = 0)
    const topWallGeo = new THREE.BoxGeometry(
      worldWidth + wallThickness * 2,
      wallHeight,
      wallThickness
    )
    const topWall = new THREE.Mesh(topWallGeo, wallMaterial)
    topWall.position.set(worldWidth / 2, wallHeight / 2, -wallThickness / 2)
    topWall.castShadow = true
    this.wallGroup.add(topWall)

    // Bottom wall (Z = worldHeight)
    const bottomWall = new THREE.Mesh(topWallGeo, wallMaterial)
    bottomWall.position.set(worldWidth / 2, wallHeight / 2, worldHeight + wallThickness / 2)
    bottomWall.castShadow = true
    this.wallGroup.add(bottomWall)

    // Left wall (X = 0)
    const sideWallGeo = new THREE.BoxGeometry(
      wallThickness,
      wallHeight,
      worldHeight + wallThickness * 2
    )
    const leftWall = new THREE.Mesh(sideWallGeo, wallMaterial)
    leftWall.position.set(-wallThickness / 2, wallHeight / 2, worldHeight / 2)
    leftWall.castShadow = true
    this.wallGroup.add(leftWall)

    // Right wall (X = worldWidth)
    const rightWall = new THREE.Mesh(sideWallGeo, wallMaterial)
    rightWall.position.set(worldWidth + wallThickness / 2, wallHeight / 2, worldHeight / 2)
    rightWall.castShadow = true
    this.wallGroup.add(rightWall)

    // Corner posts for extra flair
    const postGeo = new THREE.CylinderGeometry(0.2, 0.2, wallHeight * 1.5, 8)
    const postMaterial = new THREE.MeshStandardMaterial({
      color: 0xff00ff,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0xff00ff,
      emissiveIntensity: 0.5,
    })

    const corners: [number, number][] = [
      [0, 0],
      [worldWidth, 0],
      [0, worldHeight],
      [worldWidth, worldHeight],
    ]

    corners.forEach(([x, z]) => {
      const post = new THREE.Mesh(postGeo, postMaterial)
      post.position.set(x, wallHeight * 0.75, z)
      post.castShadow = true
      if (this.wallGroup) {
        this.wallGroup.add(post)
      }
    })

    this.scene.add(this.wallGroup)
  }

  private handleResize = (): void => {
    const width = this.canvas.clientWidth
    const height = this.canvas.clientHeight

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(width, height)
    this.composer.setSize(width, height)
  }

  private createParticlePool(count: number): void {
    const geometry = new THREE.SphereGeometry(0.08, 6, 6)

    for (let i = 0; i < count; i++) {
      const material = new THREE.MeshBasicMaterial({
        color: COLORS.PARTICLE,
        transparent: true,
      })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.visible = false
      this.scene.add(mesh)
      this.particlePool.push(mesh)
    }
  }

  private spawnParticles(position: THREE.Vector3, color: number, count: number): void {
    for (let i = 0; i < count && this.particlePool.length > 0; i++) {
      const mesh = this.particlePool.pop()
      if (!mesh) break

      mesh.position.copy(position)
      mesh.visible = true
      ;(mesh.material as THREE.MeshBasicMaterial).color.setHex(color)
      ;(mesh.material as THREE.MeshBasicMaterial).opacity = 1
      mesh.scale.setScalar(1)

      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        Math.random() * 5 + 2,
        (Math.random() - 0.5) * 4
      )

      this.particles.push({
        mesh,
        velocity,
        lifetime: 0,
        maxLifetime: Math.random() * 0.8 + 0.4,
      })
    }
  }

  private updateParticles(deltaTime: number): void {
    const gravity = new THREE.Vector3(0, -15, 0)

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i]
      if (!particle) continue

      particle.lifetime += deltaTime

      if (particle.lifetime >= particle.maxLifetime) {
        particle.mesh.visible = false
        this.particlePool.push(particle.mesh)
        this.particles.splice(i, 1)
        continue
      }

      // Physics
      particle.velocity.add(gravity.clone().multiplyScalar(deltaTime))
      particle.mesh.position.add(particle.velocity.clone().multiplyScalar(deltaTime))

      // Fade out and shrink
      const lifeRatio = particle.lifetime / particle.maxLifetime
      ;(particle.mesh.material as THREE.MeshBasicMaterial).opacity = 1 - lifeRatio
      particle.mesh.scale.setScalar(1 - lifeRatio * 0.5)
    }
  }

  private gridToWorld(pos: Position): THREE.Vector3 {
    // Convert grid position to world coordinates
    // Grid (0,0) is top-left, maps to world (0.5*TILE, 0, 0.5*TILE)
    return new THREE.Vector3(
      (pos.x + 0.5) * TILE_SIZE,
      0.4, // Slightly above floor
      (pos.y + 0.5) * TILE_SIZE
    )
  }

  private createSnakeSegment(color: number, isHead: boolean): SnakeSegment {
    const radius = isHead ? TILE_SIZE * 0.35 : TILE_SIZE * 0.3
    const geometry = new THREE.SphereGeometry(radius, 16, 16)
    const material = new THREE.MeshStandardMaterial({
      color,
      metalness: 0.4,
      roughness: 0.5,
      emissive: color,
      emissiveIntensity: 0.3,
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow = true
    mesh.receiveShadow = true
    this.scene.add(mesh)

    return {
      mesh,
      targetPos: new THREE.Vector3(),
      currentPos: new THREE.Vector3(),
    }
  }

  private clearSnakeSegments(segments: SnakeSegment[]): void {
    segments.forEach((segment) => {
      this.scene.remove(segment.mesh)
      segment.mesh.geometry.dispose()
      ;(segment.mesh.material as THREE.Material).dispose()
    })
    segments.length = 0
  }

  private updateSnakeSegments(
    segments: SnakeSegment[],
    snake: Position[],
    colorHead: number,
    colorBody: number,
    colorTail: number,
    isAlive: boolean
  ): void {
    // If not alive, hide all segments
    if (!isAlive) {
      segments.forEach((seg) => (seg.mesh.visible = false))
      return
    }

    // Add segments if needed
    while (segments.length < snake.length) {
      const isHead = segments.length === 0
      const segment = this.createSnakeSegment(isHead ? colorHead : colorBody, isHead)
      segments.push(segment)
    }

    // Remove excess segments
    while (segments.length > snake.length) {
      const segment = segments.pop()
      if (segment) {
        this.scene.remove(segment.mesh)
        segment.mesh.geometry.dispose()
        ;(segment.mesh.material as THREE.Material).dispose()
      }
    }

    // Update segment positions
    snake.forEach((pos, index) => {
      const segment = segments[index]
      if (!segment) return

      segment.mesh.visible = true
      const worldPos = this.gridToWorld(pos)
      segment.targetPos.copy(worldPos)

      // Smooth interpolation
      segment.currentPos.lerp(segment.targetPos, 0.25)
      segment.mesh.position.copy(segment.currentPos)

      // Color gradient
      const isHead = index === 0
      const isTail = index === snake.length - 1
      let color = colorBody
      if (isHead) color = colorHead
      else if (isTail) color = colorTail
      else {
        const ratio = index / Math.max(1, snake.length - 1)
        color = new THREE.Color(colorBody).lerp(new THREE.Color(colorTail), ratio).getHex()
      }

      const mat = segment.mesh.material as THREE.MeshStandardMaterial
      mat.color.setHex(color)
      mat.emissive.setHex(color)

      // Head pulse effect
      if (isHead) {
        const scale = 1 + Math.sin(this.pulseTime * 5) * 0.08
        segment.mesh.scale.setScalar(scale)
        mat.emissiveIntensity = 0.3 + Math.sin(this.pulseTime * 5) * 0.15
      } else {
        segment.mesh.scale.setScalar(1)
        mat.emissiveIntensity = 0.2
      }
    })
  }

  init(): void {
    // Setup happens on first render with actual game state
  }

  resize(width: number, height: number): void {
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
    this.composer.setSize(width, height)
  }

  render(state: GameState): void {
    // Setup scene on first render or when grid dimensions change
    if (
      !this.initialized ||
      this.gridWidth !== state.gridWidth ||
      this.gridHeight !== state.gridHeight
    ) {
      this.gridWidth = state.gridWidth
      this.gridHeight = state.gridHeight
      this.setupScene()
    }

    // Reset on game restart
    if (state.status === 'playing' && this.lastGameStatus !== 'playing') {
      // Clear old segments for fresh start
      this.clearSnakeSegments(this.snakeSegments)
      this.clearSnakeSegments(this.enemySegments)
      this.cameraShake.intensity = 0
      this.camera.position.copy(this.baseCameraPos)
    }
    this.lastGameStatus = state.status

    // Update player 1 snake
    const player1 = state.players[0]
    if (player1) {
      this.updateSnakeSegments(
        this.snakeSegments,
        player1.snake,
        COLORS.SNAKE_HEAD,
        COLORS.SNAKE_BODY,
        COLORS.SNAKE_TAIL,
        player1.alive
      )
    }

    // Update player 2 snake (if multiplayer)
    const player2 = state.players[1]
    if (player2) {
      this.updateSnakeSegments(
        this.enemySegments,
        player2.snake,
        COLORS.ENEMY_HEAD,
        COLORS.ENEMY_BODY,
        COLORS.ENEMY_TAIL,
        player2.alive
      )
    }

    // Update food
    this.updateFood(state)

    // Handle events
    if (state.lastEvent === 'food' && state.food) {
      const foodPos = this.gridToWorld(state.food)
      this.spawnParticles(foodPos, COLORS.FOOD, 20)
      this.cameraShake.intensity = 0.1
    }

    if (state.lastEvent === 'death') {
      // Find dead player's head position for death effect
      state.players.forEach((player, idx) => {
        if (!player.alive && player.snake[0]) {
          const segments = idx === 0 ? this.snakeSegments : this.enemySegments
          const headPos = segments[0]?.currentPos || this.gridToWorld(player.snake[0])
          this.spawnParticles(headPos, idx === 0 ? COLORS.SNAKE_HEAD : COLORS.ENEMY_HEAD, 40)
        }
      })
      this.cameraShake.intensity = 0.4
    }
  }

  private updateFood(state: GameState): void {
    if (!state.food) {
      if (this.foodMesh) {
        this.foodMesh.visible = false
      }
      return
    }

    // Validate food is within bounds
    if (
      state.food.x < 0 ||
      state.food.x >= this.gridWidth ||
      state.food.y < 0 ||
      state.food.y >= this.gridHeight
    ) {
      if (this.foodMesh) {
        this.foodMesh.visible = false
      }
      return
    }

    if (!this.foodMesh) {
      const geometry = new THREE.IcosahedronGeometry(TILE_SIZE * 0.25, 1)
      const material = new THREE.MeshStandardMaterial({
        color: COLORS.FOOD,
        metalness: 0.9,
        roughness: 0.1,
        emissive: COLORS.FOOD,
        emissiveIntensity: 0.6,
      })
      this.foodMesh = new THREE.Mesh(geometry, material)
      this.foodMesh.castShadow = true
      this.scene.add(this.foodMesh)
    }

    this.foodMesh.visible = true
    const foodPos = this.gridToWorld(state.food)
    this.foodMesh.position.copy(foodPos)

    // Animations
    this.foodMesh.rotation.y += 0.03
    this.foodMesh.rotation.x = Math.sin(this.pulseTime * 2) * 0.2
    this.foodMesh.position.y = 0.4 + Math.sin(this.pulseTime * 4) * 0.15

    const scale = 1 + Math.sin(this.pulseTime * 6) * 0.12
    this.foodMesh.scale.setScalar(scale)
  }

  private animate = (): void => {
    this.animationFrame = requestAnimationFrame(this.animate)

    const deltaTime = 0.016 // ~60fps
    this.pulseTime += deltaTime

    // Update particles
    this.updateParticles(deltaTime)

    // Camera shake with position reset
    if (this.cameraShake.intensity > 0.01) {
      const shakeX = (Math.random() - 0.5) * this.cameraShake.intensity * 2
      const shakeZ = (Math.random() - 0.5) * this.cameraShake.intensity * 2
      this.camera.position.x = this.baseCameraPos.x + shakeX
      this.camera.position.z = this.baseCameraPos.z + shakeZ
      this.cameraShake.intensity *= this.cameraShake.decay
    } else {
      this.cameraShake.intensity = 0
      this.camera.position.copy(this.baseCameraPos)
    }

    // Render with bloom
    this.composer.render()
  }

  destroy(): void {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame)
    }

    window.removeEventListener('resize', this.handleResize)

    // Dispose snake segments
    this.clearSnakeSegments(this.snakeSegments)
    this.clearSnakeSegments(this.enemySegments)

    // Dispose food
    if (this.foodMesh) {
      this.scene.remove(this.foodMesh)
      this.foodMesh.geometry.dispose()
      ;(this.foodMesh.material as THREE.Material).dispose()
    }

    // Dispose grid
    if (this.gridGroup) {
      this.gridGroup.traverse((obj) => {
        if (obj instanceof THREE.Line) {
          obj.geometry.dispose()
          ;(obj.material as THREE.Material).dispose()
        }
      })
      this.scene.remove(this.gridGroup)
    }

    // Dispose walls
    if (this.wallGroup) {
      this.wallGroup.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose()
          ;(obj.material as THREE.Material).dispose()
        }
      })
      this.scene.remove(this.wallGroup)
    }

    // Dispose floor
    if (this.floorMesh) {
      this.scene.remove(this.floorMesh)
      this.floorMesh.geometry.dispose()
      ;(this.floorMesh.material as THREE.Material).dispose()
    }

    // Dispose particles
    ;[...this.particles, ...this.particlePool.map((m) => ({ mesh: m }))].forEach((item) => {
      const mesh = 'mesh' in item ? item.mesh : item
      if (mesh instanceof THREE.Mesh) {
        this.scene.remove(mesh)
        mesh.geometry.dispose()
        ;(mesh.material as THREE.Material).dispose()
      }
    })

    this.composer.dispose()
    this.renderer.dispose()
  }
}
