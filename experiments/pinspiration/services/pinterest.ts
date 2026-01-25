// Pinspiration - Pinterest Service

import { fetchViaProxy, fetchRedirectUrl } from './proxy'
import { normalizeUrl, isShortUrl, parseBoardUrl } from './url-parser'
import type { Pin, BoardPageResult, PinspirationError } from './types'

/**
 * Expands a short Pinterest URL to a full board URL
 */
export async function expandShortUrl(shortUrl: string): Promise<string> {
  try {
    const fullUrl = await fetchRedirectUrl(shortUrl)
    return fullUrl
  } catch {
    throw {
      type: 'NETWORK_ERROR',
      message: 'Could not expand short URL',
      retryable: true,
    } as PinspirationError
  }
}

/**
 * Extracts pins from Pinterest HTML response with improved parsing
 */
function extractPinsFromHtml(html: string): {
  pins: Pin[]
  boardName: string
  bookmark: string | null
} {
  const pins: Pin[] = []
  let boardName = 'Pinterest Board'
  let bookmark: string | null = null

  try {
    // Method 1: Parse __PWS_DATA__ (Pinterest Web State Data)
    const pwsMatch = html.match(/<script[^>]*id="__PWS_DATA__"[^>]*>([^<]+)<\/script>/i)
    if (pwsMatch?.[1]) {
      try {
        const jsonData = JSON.parse(pwsMatch[1])
        const extracted = extractFromPwsData(jsonData)
        if (extracted.pins.length > 0) {
          pins.push(...extracted.pins)
          boardName = extracted.boardName || boardName
          bookmark = extracted.bookmark
        }
      } catch (e) {
        console.warn('Failed to parse __PWS_DATA__:', e)
      }
    }

    // Method 2: Parse __NEXT_DATA__ (Next.js data)
    if (pins.length === 0) {
      const nextMatch = html.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>([^<]+)<\/script>/i)
      if (nextMatch?.[1]) {
        try {
          const jsonData = JSON.parse(nextMatch[1])
          const extracted = extractFromNextData(jsonData)
          if (extracted.pins.length > 0) {
            pins.push(...extracted.pins)
            boardName = extracted.boardName || boardName
            bookmark = extracted.bookmark
          }
        } catch (e) {
          console.warn('Failed to parse __NEXT_DATA__:', e)
        }
      }
    }

    // Method 3: Parse inline JSON data (various patterns)
    if (pins.length === 0) {
      const inlineExtracted = extractFromInlineJson(html)
      if (inlineExtracted.pins.length > 0) {
        pins.push(...inlineExtracted.pins)
        boardName = inlineExtracted.boardName || boardName
        bookmark = inlineExtracted.bookmark
      }
    }

    // Method 4: Fallback to HTML parsing with improved patterns
    if (pins.length === 0) {
      const htmlExtracted = extractFromHtmlContent(html)
      pins.push(...htmlExtracted.pins)
      boardName = htmlExtracted.boardName || boardName
    }

    // Extract board name from title if not found
    if (boardName === 'Pinterest Board') {
      const titleMatch = html.match(/<title>([^<]+)<\/title>/i)
      if (titleMatch?.[1]) {
        boardName = titleMatch[1]
          .replace(/ \| Pinterest$/i, '')
          .replace(/ - Pinterest$/i, '')
          .replace(/ on Pinterest$/i, '')
          .trim()
      }
    }

    // Try to find bookmark for pagination
    if (!bookmark) {
      const bookmarkMatch = html.match(/"bookmark":\s*"([^"]+)"/i)
      if (bookmarkMatch?.[1] && bookmarkMatch[1] !== '-end-') {
        bookmark = bookmarkMatch[1]
      }
    }
  } catch (error) {
    console.error('Error parsing Pinterest HTML:', error)
  }

  return { pins, boardName, bookmark }
}

/**
 * Extract pins from __PWS_DATA__ structure
 */
function extractFromPwsData(data: Record<string, unknown>): {
  pins: Pin[]
  boardName: string | null
  bookmark: string | null
} {
  const pins: Pin[] = []
  let boardName: string | null = null
  let bookmark: string | null = null

  try {
    // Navigate nested structure
    const props = (data.props as Record<string, unknown>) || {}
    const initialReduxState = (props.initialReduxState as Record<string, unknown>) || props

    // Extract board info
    const boards = (initialReduxState.boards as Record<string, Record<string, unknown>>) || {}
    for (const boardId of Object.keys(boards)) {
      const board = boards[boardId]
      if (board?.name) {
        boardName = board.name as string
        break
      }
    }

    // Extract pins
    const pinsData = (initialReduxState.pins as Record<string, Record<string, unknown>>) || {}
    for (const pinId of Object.keys(pinsData)) {
      const pinData = pinsData[pinId]
      if (pinData) {
        const pin = parsePinData(pinData, pinId)
        if (pin) pins.push(pin)
      }
    }

    // Extract bookmark
    const resources = (initialReduxState.resources as Record<string, unknown>) || {}
    const boardFeed = (resources.BoardFeedResource as Record<string, unknown>) || {}
    for (const key of Object.keys(boardFeed)) {
      const feed = boardFeed[key] as Record<string, unknown>
      if (feed?.nextBookmark && feed.nextBookmark !== '-end-') {
        bookmark = feed.nextBookmark as string
        break
      }
    }
  } catch (e) {
    console.warn('Error extracting from PWS data:', e)
  }

  return { pins, boardName, bookmark }
}

/**
 * Extract pins from __NEXT_DATA__ structure
 */
function extractFromNextData(data: Record<string, unknown>): {
  pins: Pin[]
  boardName: string | null
  bookmark: string | null
} {
  const pins: Pin[] = []
  let boardName: string | null = null
  let bookmark: string | null = null

  try {
    const props = (data.props as Record<string, unknown>) || {}
    const pageProps = (props.pageProps as Record<string, unknown>) || {}
    const initialReduxState = (pageProps.initialReduxState as Record<string, unknown>) || {}

    // Extract board info
    const boards = (initialReduxState.boards as Record<string, Record<string, unknown>>) || {}
    for (const boardId of Object.keys(boards)) {
      const board = boards[boardId]
      if (board?.name) {
        boardName = board.name as string
        break
      }
    }

    // Extract pins
    const pinsData = (initialReduxState.pins as Record<string, Record<string, unknown>>) || {}
    for (const pinId of Object.keys(pinsData)) {
      const pinData = pinsData[pinId]
      if (pinData) {
        const pin = parsePinData(pinData, pinId)
        if (pin) pins.push(pin)
      }
    }
  } catch (e) {
    console.warn('Error extracting from NEXT data:', e)
  }

  return { pins, boardName, bookmark }
}

/**
 * Extract pins from inline JSON patterns in HTML
 */
function extractFromInlineJson(html: string): {
  pins: Pin[]
  boardName: string | null
  bookmark: string | null
} {
  const pins: Pin[] = []
  const boardName: string | null = null
  const bookmark: string | null = null

  try {
    // Try to find pins with rich data using regex patterns
    const richPinPattern =
      /"id":\s*"(\d+)"[^}]*"images":\s*\{[^}]*"736x":\s*\{[^}]*"url":\s*"([^"]+)"[^}]*\}[^}]*\}[^}]*(?:"title":\s*"([^"]*)")?[^}]*(?:"description":\s*"([^"]*)")?/g
    let match
    while ((match = richPinPattern.exec(html)) !== null) {
      const [, id, imageUrl, title, description] = match
      if (id && imageUrl) {
        pins.push({
          id,
          imageUrl: imageUrl.replace(/\\u002F/g, '/'),
          title: decodeJsonString(title || ''),
          description: decodeJsonString(description || ''),
          link: `https://www.pinterest.com/pin/${id}/`,
        })
      }
    }

    // Look for board feed data
    const feedPattern = /"data":\s*\[([^\]]*"id":[^\]]+)\]/g
    while ((match = feedPattern.exec(html)) !== null) {
      try {
        // Try to parse the array content
        const arrayContent = `[${match[1]}]`
        const items = JSON.parse(arrayContent.replace(/'/g, '"'))
        for (const item of items) {
          if (item?.id && item?.images) {
            const pin = parsePinData(item, item.id)
            if (pin) pins.push(pin)
          }
        }
      } catch {
        // Continue with next match
      }
    }
  } catch (e) {
    console.warn('Error extracting from inline JSON:', e)
  }

  return { pins, boardName, bookmark }
}

/**
 * Extract pins from HTML content as fallback
 */
function extractFromHtmlContent(html: string): {
  pins: Pin[]
  boardName: string | null
} {
  const pins: Pin[] = []
  let boardName: string | null = null

  try {
    // Extract board name from og:title
    const ogTitleMatch = html.match(
      /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i
    )
    if (ogTitleMatch?.[1]) {
      boardName = ogTitleMatch[1].replace(/ on Pinterest$/i, '').trim()
    }

    // Pattern 1: data-pin-id with nearby image
    const pinIdPattern =
      /data-pin-id="(\d+)"[\s\S]*?<img[^>]+src="(https:\/\/i\.pinimg\.com\/[^"]+)"/g
    let match
    while ((match = pinIdPattern.exec(html)) !== null) {
      const [, id, imageUrl] = match
      if (id && imageUrl && imageUrl.includes('pinimg.com')) {
        // Try to find title/description nearby
        const contextStart = Math.max(0, match.index - 500)
        const contextEnd = Math.min(html.length, match.index + match[0].length + 500)
        const context = html.substring(contextStart, contextEnd)

        const title = extractTextFromContext(context, ['alt="', 'title="', 'data-pin-title="'])
        const description = extractTextFromContext(context, ['data-pin-description="'])

        pins.push({
          id,
          imageUrl: imageUrl.replace(/\/\d+x\//, '/736x/'),
          title: sanitizeText(title),
          description: sanitizeText(description),
          link: `https://www.pinterest.com/pin/${id}/`,
        })
      }
    }

    // Pattern 2: Direct image extraction with pin IDs from URLs
    if (pins.length === 0) {
      const imgPattern = /<img[^>]+src="(https:\/\/i\.pinimg\.com\/\d+x\/[^"]+)"[^>]*>/g
      const seenUrls = new Set<string>()
      let pinId = 1

      while ((match = imgPattern.exec(html)) !== null) {
        const imageUrl = match[1]
        // Skip avatars, tiny images, and duplicates
        if (
          imageUrl &&
          !imageUrl.includes('75x75') &&
          !imageUrl.includes('avatars') &&
          !imageUrl.includes('user/') &&
          !seenUrls.has(imageUrl)
        ) {
          seenUrls.add(imageUrl)

          // Try to extract pin ID from image URL pattern
          const urlPinIdMatch = imageUrl.match(/\/([a-f0-9]{32})/)
          const extractedId = urlPinIdMatch?.[1] ?? `extracted-${pinId++}`

          pins.push({
            id: extractedId,
            imageUrl: imageUrl.replace(/\/\d+x\//, '/736x/'),
            title: '',
            description: '',
            link: `https://www.pinterest.com/pin/${extractedId}/`,
          })
        }
      }
    }
  } catch (e) {
    console.warn('Error extracting from HTML content:', e)
  }

  return { pins, boardName }
}

/**
 * Extract text from HTML context using multiple patterns
 */
function extractTextFromContext(context: string, patterns: string[]): string {
  for (const pattern of patterns) {
    const regex = new RegExp(`${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^"<>]+)`, 'i')
    const match = context.match(regex)
    if (match?.[1] && match[1].length > 2) {
      return match[1]
    }
  }
  return ''
}

/**
 * Decode JSON escape sequences
 */
function decodeJsonString(str: string): string {
  if (!str) return ''
  return str
    .replace(/\\u002F/g, '/')
    .replace(/\\u0026/g, '&')
    .replace(/\\u003C/g, '<')
    .replace(/\\u003E/g, '>')
    .replace(/\\"/g, '"')
    .replace(/\\n/g, ' ')
    .replace(/\\/g, '')
}

/**
 * Parses pin data from Pinterest JSON structure
 */
function parsePinData(data: Record<string, unknown>, fallbackId: string): Pin | null {
  try {
    const id = (data.id as string) || fallbackId

    // Try different image URL patterns
    let imageUrl = ''
    const images = data.images as Record<string, { url?: string }> | undefined
    if (images) {
      imageUrl =
        images['736x']?.url ||
        images['564x']?.url ||
        images['474x']?.url ||
        images['236x']?.url ||
        ''
    }

    // Try image_large_url
    if (!imageUrl && data.image_large_url) {
      imageUrl = data.image_large_url as string
    }

    // Try imageSpec patterns
    if (!imageUrl) {
      const specs = ['imageSpec_736x', 'imageSpec_564x', 'imageSpec_474x']
      for (const spec of specs) {
        if (data[spec]) {
          imageUrl = (data[spec] as { url?: string })?.url || ''
          if (imageUrl) break
        }
      }
    }

    // Try image_cover_url
    if (!imageUrl && data.image_cover_url) {
      imageUrl = data.image_cover_url as string
    }

    if (!imageUrl) return null

    // Clean up image URL
    imageUrl = imageUrl.replace(/\\u002F/g, '/')

    // Extract title from multiple possible fields
    const title = sanitizeText(
      (data.title as string) ||
        (data.grid_title as string) ||
        (data.seo_title as string) ||
        (data.rich_metadata as { title?: string })?.title ||
        ''
    )

    // Extract description from multiple possible fields
    const description = sanitizeText(
      (data.description as string) ||
        (data.closeup_description as string) ||
        (data.seo_description as string) ||
        (data.rich_metadata as { description?: string })?.description ||
        ''
    )

    // Get the proper Pinterest link
    const link = `https://www.pinterest.com/pin/${id}/`

    // Get dominant color for placeholder
    const dominantColor = (data.dominant_color as string) || undefined

    return { id, imageUrl, title, description, link, dominantColor }
  } catch {
    return null
  }
}

/**
 * Sanitizes text to prevent XSS
 */
function sanitizeText(text: string): string {
  if (!text) return ''
  return text
    .replace(/\\u002F/g, '/')
    .replace(/\\u0026/g, '&')
    .replace(/\\n/g, ' ')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .trim()
    .substring(0, 500)
}

/**
 * Fetches a page of pins from a Pinterest board
 */
export async function fetchBoardPage(
  boardUrl: string,
  bookmark?: string
): Promise<BoardPageResult> {
  const normalized = normalizeUrl(boardUrl)
  let urlToFetch = normalized

  // Handle short URLs
  if (isShortUrl(normalized)) {
    urlToFetch = await expandShortUrl(normalized)
  }

  // Parse the board URL
  const parsed = parseBoardUrl(urlToFetch)
  if (!parsed) {
    throw {
      type: 'INVALID_URL',
      message: 'Could not parse board URL',
    } as PinspirationError
  }

  // Add bookmark for pagination if provided
  let fetchUrl = parsed.fullUrl
  if (bookmark) {
    fetchUrl += `?bookmark=${encodeURIComponent(bookmark)}`
  }

  try {
    const html = await fetchViaProxy(fetchUrl)

    // Check for private board indicators
    if (
      html.includes('This board is private') ||
      html.includes('Sorry, this board is private') ||
      html.includes('board_privacy')
    ) {
      throw {
        type: 'PRIVATE_BOARD',
        message: 'This board appears to be private',
      } as PinspirationError
    }

    const { pins, boardName, bookmark: nextBookmark } = extractPinsFromHtml(html)

    if (pins.length === 0 && !bookmark) {
      // If first page has no pins, might be an error
      throw {
        type: 'PARSE_ERROR',
        message: 'Could not find any pins on this board',
      } as PinspirationError
    }

    return {
      pins,
      boardName,
      bookmark: nextBookmark,
    }
  } catch (error) {
    if ((error as PinspirationError).type) {
      throw error
    }
    throw {
      type: 'NETWORK_ERROR',
      message: 'Failed to fetch board data',
      retryable: true,
    } as PinspirationError
  }
}

/**
 * Fetches pins from RSS feed (better metadata: title, description)
 * RSS feeds contain ~25 most recent pins with clean metadata
 * Note: Pinterest RSS does NOT support pagination - only returns ~25 most recent pins
 */
export async function fetchBoardRss(boardUrl: string): Promise<BoardPageResult> {
  const normalized = normalizeUrl(boardUrl)
  let urlToFetch = normalized

  // Handle short URLs
  if (isShortUrl(normalized)) {
    urlToFetch = await expandShortUrl(normalized)
  }

  // Parse the board URL
  const parsed = parseBoardUrl(urlToFetch)
  if (!parsed) {
    throw {
      type: 'INVALID_URL',
      message: 'Could not parse board URL',
    } as PinspirationError
  }

  // Build RSS URL
  const rssUrl = `https://www.pinterest.com/${parsed.username}/${parsed.boardSlug}.rss`

  // Pinterest RSS always requires proxy (CORS blocked)
  const xmlText = await fetchViaProxy(rssUrl)

  // Validate RSS response
  if (!xmlText.includes('<rss') && !xmlText.includes('<item>')) {
    throw new Error('Invalid RSS response')
  }

  // Parse XML
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml')

  // Check for parse errors
  const parseError = xmlDoc.querySelector('parsererror')
  if (parseError) {
    throw new Error('RSS parse error')
  }

  // Extract board name from channel title
  const boardName =
    xmlDoc.querySelector('channel > title')?.textContent?.replace(' on Pinterest', '').trim() ||
    `${parsed.username}/${parsed.boardSlug}`

  // Extract pins from items
  const items = xmlDoc.querySelectorAll('item')
  const pins: Pin[] = []

  items.forEach((item) => {
    const title = item.querySelector('title')?.textContent || ''
    const description = item.querySelector('description')?.textContent || ''
    const link = item.querySelector('link')?.textContent || ''
    const pubDate = item.querySelector('pubDate')?.textContent || ''

    // Extract image URL from description HTML
    const imgMatch = description.match(/<img[^>]+src=["']([^"']+)["']/i)
    let imageUrl = imgMatch ? imgMatch[1] : ''

    // Upgrade to higher resolution
    if (imageUrl) {
      imageUrl = imageUrl.replace(/\/\d+x\//, '/736x/')
    }

    // Extract pin ID from link
    const pinIdMatch = link.match(/\/pin\/(\d+)/)
    const id = pinIdMatch?.[1] ?? `rss-${pins.length}`

    // Clean description (remove HTML tags)
    const cleanDescription = description
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim()

    if (imageUrl) {
      pins.push({
        id,
        imageUrl,
        title: sanitizeText(title),
        description: sanitizeText(cleanDescription),
        link: link || `https://www.pinterest.com/pin/${id}/`,
        pubDate,
      })
    }
  })

  return {
    pins,
    boardName,
    bookmark: null, // RSS doesn't support pagination
  }
}

/**
 * Fetches pins using RSS first (better metadata), falls back to HTML scraping
 */
export async function fetchBoardSmart(boardUrl: string): Promise<BoardPageResult> {
  // Try RSS first for better metadata
  try {
    const rssResult = await fetchBoardRss(boardUrl)
    if (rssResult.pins.length > 0) {
      return rssResult
    }
  } catch {
    // RSS failed, continue to HTML scraping
  }

  // Fall back to HTML scraping
  return fetchBoardPage(boardUrl)
}
