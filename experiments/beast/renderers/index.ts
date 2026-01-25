// Beast Game - Renderer Factory
import { DOSRenderer, type RendererOptions } from './dos'

export function createRenderer(canvas: HTMLCanvasElement, options?: RendererOptions): DOSRenderer {
  return new DOSRenderer(canvas, options)
}

export { DOSRenderer }
export type { RendererOptions }
