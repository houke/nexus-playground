// Renderer Factory for Mamba Game
import { DOSRenderer } from './dos'
import type { GameState } from '../game/types'

export interface Renderer {
  render(state: GameState): void
  destroy(): void
}

export function createRenderer(canvas: HTMLCanvasElement): Renderer {
  return new DOSRenderer(canvas)
}
