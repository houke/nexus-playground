// Renderer Factory and Base Types
import type { GameState, VisualStyle } from '../game/types'
import { NokiaRenderer } from './nokia'
import { RetroRenderer } from './retro'
import { ModernRenderer } from './modern'
import { NeonRenderer } from './neon'
import { WebGLRenderer } from './webgl'

export interface SnakeRenderer {
  init(canvas: HTMLCanvasElement): void
  render(state: GameState): void
  resize(width: number, height: number): void
  destroy(): void
}

export function createRenderer(style: VisualStyle, _canvas: HTMLCanvasElement): SnakeRenderer {
  switch (style) {
    case 1:
      return new NokiaRenderer()
    case 2:
      return new RetroRenderer()
    case 3:
      return new ModernRenderer()
    case 4:
      return new NeonRenderer()
    case 5: {
      // WebGL renderer - needs canvas to initialize Three.js
      // Check WebGL support by testing with a temporary canvas
      const testCanvas = document.createElement('canvas')
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl')
      if (gl) {
        return new WebGLRenderer(_canvas)
      }
      // Fallback to Neon if WebGL not supported
      console.warn('WebGL not supported, falling back to Neon style')
      return new NeonRenderer()
    }
    default:
      return new NokiaRenderer()
  }
}
