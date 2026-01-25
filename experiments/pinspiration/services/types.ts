// Pinspiration - Core Types

export interface Pin {
  id: string
  imageUrl: string
  title: string
  description: string
  link: string
  dominantColor?: string
  pubDate?: string
}

export interface BoardState {
  url: string
  name: string
  pins: Pin[]
  totalPins: number
  pagesLoaded: number
  isFullyLoaded: boolean
}

export type AppStatus = 'idle' | 'loading-first' | 'loading-more' | 'ready' | 'error'

export interface AppState {
  status: AppStatus
  board: BoardState | null
  currentPin: Pin | null
  seenPinIds: Set<string>
  error: string | null
}

export type PinspirationErrorType =
  | 'INVALID_URL'
  | 'PRIVATE_BOARD'
  | 'NETWORK_ERROR'
  | 'RATE_LIMITED'
  | 'PARSE_ERROR'

export interface PinspirationError {
  type: PinspirationErrorType
  message: string
  retryable?: boolean
}

export const ERROR_MESSAGES: Record<PinspirationErrorType, string> = {
  INVALID_URL:
    "That doesn't look like a Pinterest board URL. Try pasting a link like pinterest.com/user/board",
  PRIVATE_BOARD: 'This board appears to be private. Only public boards can be explored.',
  NETWORK_ERROR: "Couldn't reach Pinterest. Check your connection and try again.",
  RATE_LIMITED: 'Too many requests. Please wait a moment and try again.',
  PARSE_ERROR: "Couldn't read the board data. Pinterest may have changed their format.",
}

export interface BoardPageResult {
  pins: Pin[]
  bookmark: string | null
  boardName: string
  totalPins?: number
}
