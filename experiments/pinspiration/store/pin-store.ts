// Pinspiration - Pin Store (State Management)

import type { Pin, BoardState } from '../services/types'

export interface PinStore {
  readonly pins: Pin[]
  readonly board: BoardState | null
  readonly seenCount: number
  readonly totalCount: number
  readonly isFullyLoaded: boolean
  readonly seenPinIds: Set<string>

  setBoard(name: string, url: string): void
  addPins(pins: Pin[]): void
  setFullyLoaded(): void
  getRandomUnseen(): Pin | null
  markSeen(pinId: string): void
  resetSeen(): void
  clear(): void
  hasPin(pinId: string): boolean
}

export function createPinStore(): PinStore {
  let pins: Pin[] = []
  let board: BoardState | null = null
  const seenPinIds = new Set<string>()

  return {
    get pins() {
      return pins
    },

    get board() {
      return board
    },

    get seenCount() {
      return seenPinIds.size
    },

    get totalCount() {
      return pins.length
    },

    get isFullyLoaded() {
      return board?.isFullyLoaded ?? false
    },

    get seenPinIds() {
      return seenPinIds
    },

    setBoard(name: string, url: string) {
      board = {
        name,
        url,
        pins: [],
        totalPins: 0,
        pagesLoaded: 0,
        isFullyLoaded: false,
      }
      pins = []
      seenPinIds.clear()
    },

    addPins(newPins: Pin[]) {
      // Filter duplicates
      const existingIds = new Set(pins.map((p) => p.id))
      const uniquePins = newPins.filter((p) => !existingIds.has(p.id))
      pins = [...pins, ...uniquePins]

      if (board) {
        board.pins = pins
        board.totalPins = pins.length
        board.pagesLoaded++
      }
    },

    setFullyLoaded() {
      if (board) {
        board.isFullyLoaded = true
      }
    },

    getRandomUnseen(): Pin | null {
      if (pins.length === 0) return null

      const unseen = pins.filter((p) => !seenPinIds.has(p.id))

      if (unseen.length === 0) {
        // All pins seen - just pick a random one (don't clear seen set)
        // The caller can decide to reset if needed
        return pins[Math.floor(Math.random() * pins.length)] ?? null
      }

      return unseen[Math.floor(Math.random() * unseen.length)] ?? null
    },

    markSeen(pinId: string) {
      seenPinIds.add(pinId)
    },

    resetSeen() {
      seenPinIds.clear()
    },

    hasPin(pinId: string): boolean {
      return pins.some((p) => p.id === pinId)
    },

    clear() {
      pins = []
      board = null
      seenPinIds.clear()
    },
  }
}
