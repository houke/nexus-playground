// Pinspiration - URL Parser & Validator

// Supported Pinterest domains
const PINTEREST_DOMAINS = [
  'pinterest.com',
  'pinterest.co.uk',
  'pinterest.ca',
  'pinterest.de',
  'pinterest.fr',
  'pinterest.es',
  'pinterest.it',
  'pinterest.nl',
  'pinterest.at',
  'pinterest.ch',
  'pinterest.com.au',
  'pinterest.co.nz',
  'pinterest.jp',
  'pinterest.kr',
  'pinterest.se',
  'pinterest.dk',
  'pinterest.no',
  'pinterest.fi',
  'pinterest.pt',
  'pinterest.ie',
  'pinterest.be',
  'pinterest.ru',
  'pinterest.pl',
  'pinterest.cz',
  'pinterest.hu',
  'pinterest.gr',
  'pinterest.tr',
  'pinterest.com.mx',
  'pinterest.cl',
  'pinterest.com.ar',
  'pinterest.com.br',
]

const SHORT_URL_PATTERN = /^https?:\/\/pin\.it\/[a-zA-Z0-9]+$/

const BOARD_URL_PATTERN = new RegExp(
  `^https?:\\/\\/(www\\.)?(${PINTEREST_DOMAINS.map((d) => d.replace(/\./g, '\\.')).join('|')})\\/([a-zA-Z0-9_-]+)\\/([a-zA-Z0-9_-]+)\\/?`
)

export interface ParsedBoardUrl {
  username: string
  boardSlug: string
  fullUrl: string
}

/**
 * Normalizes a URL input (adds protocol if missing, trims whitespace)
 */
export function normalizeUrl(input: string): string {
  let url = input.trim()

  // Remove any leading/trailing quotes
  url = url.replace(/^["']|["']$/g, '')

  // Add protocol if missing
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url
  }

  return url
}

/**
 * Checks if a URL is a short Pinterest URL (pin.it)
 */
export function isShortUrl(url: string): boolean {
  return SHORT_URL_PATTERN.test(url)
}

/**
 * Checks if a URL is a valid Pinterest board URL
 */
export function isValidBoardUrl(url: string): boolean {
  return BOARD_URL_PATTERN.test(url)
}

/**
 * Parses a Pinterest board URL to extract username and board slug
 */
export function parseBoardUrl(url: string): ParsedBoardUrl | null {
  const match = url.match(BOARD_URL_PATTERN)

  if (!match) {
    return null
  }

  const username = match[3]
  const boardSlug = match[4]

  if (!username || !boardSlug) {
    return null
  }

  // Reconstruct a clean URL
  const fullUrl = `https://www.pinterest.com/${username}/${boardSlug}/`

  return {
    username,
    boardSlug,
    fullUrl,
  }
}

/**
 * Validates a URL and returns an error message if invalid
 */
export function validateUrl(url: string): string | null {
  const normalized = normalizeUrl(url)

  if (isShortUrl(normalized)) {
    return null // Short URLs are valid, will be expanded later
  }

  if (isValidBoardUrl(normalized)) {
    return null
  }

  return "That doesn't look like a Pinterest board URL. Try pasting a link like pinterest.com/user/board"
}
