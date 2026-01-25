// Pinspiration - CORS Proxy Client

/**
 * CORS proxy configuration with content extraction support.
 * Some proxies wrap responses (e.g., AllOrigins returns JSON),
 * so we need custom extractors for each.
 */
interface ProxyConfig {
  name: string
  buildUrl: (url: string) => string
  extractContent: (text: string) => string
  headers?: Record<string, string>
}

/**
 * List of CORS proxy endpoints ordered by reliability and speed.
 * Each proxy has a custom URL builder and content extractor.
 */
const CORS_PROXIES: ProxyConfig[] = [
  // AllOrigins - Most reliable, returns JSON wrapper
  {
    name: 'allorigins',
    buildUrl: (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    extractContent: (text) => {
      try {
        const json = JSON.parse(text)
        return json.contents || text
      } catch {
        return text
      }
    },
  },
  // Cloudflare Workers - Fast and reliable
  {
    name: 'cloudflare-workers',
    buildUrl: (url) => `https://test.cors.workers.dev/?${encodeURIComponent(url)}`,
    extractContent: (text) => text,
  },
  // CorsProxy.io - Reliable
  {
    name: 'corsproxy.io',
    buildUrl: (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    extractContent: (text) => text,
  },
  // Cors.sh - Simple and fast
  {
    name: 'cors.sh',
    buildUrl: (url) => `https://cors.sh/${url}`,
    extractContent: (text) => text,
    headers: { 'x-cors-api-key': 'temp_public' },
  },
  // X2U - Direct prepend style
  {
    name: 'cors.x2u',
    buildUrl: (url) => `https://cors.x2u.in/${url}`,
    extractContent: (text) => text,
  },
  // CodeTabs - Established service
  {
    name: 'codetabs',
    buildUrl: (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
    extractContent: (text) => text,
  },
  // TheBugging - Additional fallback
  {
    name: 'thebugging',
    buildUrl: (url) => `https://cors-proxy.thebugging.com/?url=${encodeURIComponent(url)}`,
    extractContent: (text) => text,
  },
  // Cors.eu.org - Another option
  {
    name: 'cors.eu.org',
    buildUrl: (url) => `https://cors.eu.org/${url}`,
    extractContent: (text) => text,
  },
  // ThingProxy - Backup
  {
    name: 'thingproxy',
    buildUrl: (url) => `https://thingproxy.freeboard.io/fetch/${url}`,
    extractContent: (text) => text,
  },
]

/**
 * Fetches a URL through CORS proxies with automatic fallback.
 * Tries each proxy in order until one succeeds.
 */
export async function fetchViaProxy(url: string, signal?: AbortSignal): Promise<string> {
  const errors: string[] = []

  for (const proxy of CORS_PROXIES) {
    if (signal?.aborted) {
      throw new Error('Request aborted')
    }

    try {
      const proxyUrl = proxy.buildUrl(url)
      const response = await fetch(proxyUrl, {
        signal,
        headers: {
          Accept: 'text/html,application/xhtml+xml,application/xml,application/json,*/*',
          ...proxy.headers,
        },
      })

      if (response.ok) {
        const text = await response.text()
        const content = proxy.extractContent(text)

        // Validate we got actual content (not empty or error page)
        if (content && content.length > 100) {
          return content
        }
        errors.push(`${proxy.name}: Empty or invalid response`)
      } else {
        errors.push(`${proxy.name}: HTTP ${response.status}`)
      }
    } catch (error) {
      if (signal?.aborted) {
        throw new Error('Request aborted')
      }
      const message = error instanceof Error ? error.message : 'Unknown error'
      errors.push(`${proxy.name}: ${message}`)
      continue
    }
  }

  throw new Error(`All ${CORS_PROXIES.length} proxies failed:\n${errors.join('\n')}`)
}

/**
 * Expands a short URL (pin.it) by following redirects via proxy.
 * Returns the canonical/full Pinterest URL.
 */
export async function fetchRedirectUrl(shortUrl: string, signal?: AbortSignal): Promise<string> {
  const html = await fetchViaProxy(shortUrl, signal)

  // Try multiple patterns to extract the canonical URL

  // Pattern 1: canonical link tag (rel before href)
  const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)
  if (canonicalMatch?.[1]) {
    return canonicalMatch[1]
  }

  // Pattern 2: canonical link tag (href before rel)
  const canonicalAlt = html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i)
  if (canonicalAlt?.[1]) {
    return canonicalAlt[1]
  }

  // Pattern 3: Open Graph URL
  const ogUrlMatch = html.match(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i)
  if (ogUrlMatch?.[1]) {
    return ogUrlMatch[1]
  }

  // Pattern 4: OG URL with content before property
  const ogUrlAlt = html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:url["']/i)
  if (ogUrlAlt?.[1]) {
    return ogUrlAlt[1]
  }

  // Pattern 5: JavaScript redirect
  const jsRedirect = html.match(/window\.location\s*=\s*["']([^"']+pinterest\.com[^"']*)["']/i)
  if (jsRedirect?.[1]) {
    return jsRedirect[1]
  }

  // Pattern 6: Meta refresh redirect
  const metaRefresh = html.match(
    /<meta[^>]+http-equiv=["']refresh["'][^>]+content=["'][^"']*url=([^"'\s]+)/i
  )
  if (metaRefresh?.[1]) {
    return metaRefresh[1]
  }

  throw new Error('Could not extract redirect URL from short link')
}
