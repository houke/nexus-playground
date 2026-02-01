---
title: 'Pinspiration - Pinterest Board Random Pin Explorer'
date: '2025-01-25'
type: 'new-feature'
agents:
  [
    '@product-manager',
    '@architect',
    '@tech-lead',
    '@software-developer',
    '@ux-designer',
    '@visual-designer',
    '@qa-engineer',
    '@security',
    '@devops',
    '@gamer',
  ]
status: complete
---

# Pinspiration - Pinterest Board Random Pin Explorer

> **⚠️ Status Tracking**: This plan's status should be updated by workflows:
>
> - `draft` → `in-progress`: When execution workflow starts
> - `in-progress` → `complete`: When review workflow finishes
> - If work happens outside formal workflows, run `nexus-sync` prompt to reconcile

## 1. Executive Summary

_(Owners: @product-manager, @tech-lead)_

### Vision

Pinspiration is a lightweight, delightful app that transforms Pinterest board exploration into a serendipitous discovery experience. Users enter a public Pinterest board URL (full or short share link), press "Inspire Me," and are presented with a random pin from that board—complete with image, title, description, and a direct link to view it on Pinterest. The app progressively loads all pages of the board in the background, enabling continuous random discovery across the entire board collection.

This experiment showcases elegant handling of paginated external APIs, progressive loading patterns, CORS proxy strategies, and engaging micro-interactions—all within the established Nexus Playground architecture.

### Success Criteria

- [ ] User can paste any public Pinterest board URL (full or short) and retrieve random pins
- [ ] First pin displays within 2 seconds of initial load (first page only)
- [ ] Background pagination loads remaining pins without blocking UI
- [ ] "Inspire Me" button shows different random pins without repetition until all shown
- [ ] App handles CORS gracefully via proxy with clear error messaging
- [ ] Mobile-first, responsive design consistent with other experiments
- [ ] Smooth animations and "juice" on pin reveals

### Scope

| In Scope                                      | Out of Scope                    |
| --------------------------------------------- | ------------------------------- |
| Public board URL input (full + short)         | Pinterest authentication/login  |
| Short URL expansion to full URL               | Private boards                  |
| Random pin selection from loaded pins         | Saving/bookmarking pins locally |
| Progressive background pagination             | Creating Pinterest boards       |
| Pin display (image, title, description, link) | Pin analytics or statistics     |
| CORS proxy for API requests                   | Multiple boards simultaneously  |
| "Inspire Me" button for new random pins       | Search within board             |
| Loading states and progress indication        | Offline caching of pins         |
| Error handling for invalid URLs               | Pinterest account integration   |

---

## 2. Product Requirements

_(Owner: @product-manager)_

### User Stories

#### Primary User Story

```
As a casual Pinterest browser,
I want to enter a public board URL and get random pin inspiration,
So that I can discover content serendipitously without endless scrolling.
```

#### Secondary User Stories

```
As a creative professional,
I want to quickly cycle through random pins from a mood board,
So that I can spark new ideas without decision fatigue.
```

```
As a mobile user,
I want to share a Pinterest board link and immediately see random pins,
So that I can get inspiration on the go without opening the full Pinterest app.
```

### Acceptance Criteria

- [ ] Given a valid full Pinterest board URL, when user clicks "Inspire Me", then a random pin from the board is displayed within 2 seconds
- [ ] Given a short Pinterest share URL (pin.it), when user enters it, then it is automatically expanded to full URL and processed
- [ ] Given a board with multiple pages, when first page loads, then user can immediately get random pins while remaining pages load in background
- [ ] Given the "Inspire Me" button is clicked repeatedly, then different pins are shown until all pins have been displayed once
- [ ] Given all pins have been shown, when "Inspire Me" is clicked, then the pool resets and pins can repeat
- [ ] Given an invalid or private board URL, when user submits, then a clear error message is displayed
- [ ] Given a network error, when fetching fails, then user sees retry option with error context
- [ ] Given a pin is displayed, when user clicks the link, then Pinterest opens in a new tab

### User Personas Affected

| Persona         | Impact | Notes                                                      |
| --------------- | ------ | ---------------------------------------------------------- |
| The Casual User | High   | Primary audience—quick, fun inspiration without complexity |
| The Power User  | Medium | May want to track seen pins or filter results (future)     |
| The Newcomer    | High   | Simple single-purpose app, easy to understand immediately  |

### Priority & Timeline

- **Priority**: P2 (Medium) - Fun experiment showcasing external API patterns
- **Target Date**: Sprint completion
- **Dependencies**: CORS proxy service (can use existing solutions like allorigins)

---

## 3. Technical Architecture

_(Owner: @architect)_

### System Overview

Pinspiration follows a client-side architecture with a CORS proxy for Pinterest API access. The app progressively fetches board data, maintaining local state for random pin selection.

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Pinspiration  │────▶│  CORS Proxy  │────▶│   Pinterest     │
│   (Browser)     │◀────│  (allorigins)│◀────│   (Public API)  │
└─────────────────┘     └──────────────┘     └─────────────────┘
        │
        ▼
┌─────────────────┐
│   Local State   │
│   - pins[]      │
│   - seenSet     │
│   - loading     │
└─────────────────┘
```

### Core Components

| Component          | Responsibility                                          | New/Modified |
| ------------------ | ------------------------------------------------------- | ------------ |
| `PinspirationApp`  | Main app class, orchestrates all components             | New          |
| `PinterestService` | Handles URL parsing, expansion, and board fetching      | New          |
| `PinStore`         | Manages pin collection, seen tracking, random selection | New          |
| `UIRenderer`       | Renders input, pin display, loading states              | New          |
| `ProxyClient`      | Abstracts CORS proxy communication                      | New          |

### Data Model

```typescript
// Core types for Pinspiration
interface Pin {
  id: string
  imageUrl: string
  title: string
  description: string
  link: string // Direct Pinterest link
  dominantColor?: string // For placeholder while loading
}

interface BoardState {
  url: string
  name: string
  pins: Pin[]
  totalPins: number
  pagesLoaded: number
  totalPages: number
  isFullyLoaded: boolean
}

interface AppState {
  status: 'idle' | 'loading-first' | 'loading-more' | 'ready' | 'error'
  board: BoardState | null
  currentPin: Pin | null
  seenPinIds: Set<string>
  error: string | null
}
```

### URL Handling Strategy

Pinterest URLs come in several formats:

```typescript
// Full board URLs
'https://www.pinterest.com/username/board-name/'
'https://pinterest.com/username/board-name/'
'https://www.pinterest.co.uk/username/board-name/'

// Short share URLs (need expansion)
'https://pin.it/abc123'

// Board with section
'https://www.pinterest.com/username/board-name/section-name/'
```

**URL Expansion Flow:**

1. Detect if URL is short form (`pin.it/*`)
2. Make HEAD request through proxy to get redirect Location
3. Extract canonical board URL
4. Parse username and board slug from full URL

### Pinterest Data Fetching Strategy

Pinterest doesn't have a public API, but board data can be scraped from the HTML/JSON embedded in board pages:

```typescript
// Approach: Fetch board page HTML via proxy, extract JSON data
// Pinterest embeds board data in a <script> tag with initial state

interface PinterestBoardResponse {
  resource_response: {
    data: {
      id: string
      name: string
      pins: PinterestPin[]
      bookmark: string | null // Pagination cursor
    }
  }
}
```

**Pagination Strategy:**

1. Fetch first page immediately → show random pin
2. If `bookmark` exists, queue background fetch for next page
3. Continue until `bookmark` is null (all pages loaded)
4. Update UI to show loading progress

### External Dependencies

| Dependency        | Version | Purpose                          | License |
| ----------------- | ------- | -------------------------------- | ------- |
| None (vanilla TS) | -       | Keep lightweight like other exps | -       |

### Performance Constraints

- [ ] First pin display < 2s on broadband (first page only)
- [ ] Background pagination shouldn't block main thread
- [ ] Smooth 60fps animations on pin transitions
- [ ] Image lazy loading with blur-up placeholder
- [ ] Memory efficient: don't store full image data, just URLs

### CORS Proxy Options

Several free CORS proxy options:

1. **allorigins.win** - Reliable, returns JSON with `contents` field
2. **corsproxy.io** - Simple URL prefix
3. **Self-hosted** - Cloudflare Worker (most reliable for production)

Recommend starting with allorigins for MVP, with abstraction layer for easy swap.

---

## 4. Implementation Specifications

_(Owner: @tech-lead)_

### Code Structure

```
experiments/
└── pinspiration/
    ├── index.html           # Entry HTML
    ├── main.ts              # App entry point
    ├── styles/
    │   └── pinspiration.css # Component styles
    ├── services/
    │   ├── pinterest.ts     # Pinterest API handling
    │   ├── proxy.ts         # CORS proxy client
    │   └── url-parser.ts    # URL parsing utilities
    ├── store/
    │   └── pin-store.ts     # State management
    └── ui/
        ├── input.ts         # URL input component
        ├── pin-display.ts   # Pin card component
        ├── loading.ts       # Loading states
        └── error.ts         # Error display
```

### Key Interfaces & Types

```typescript
// services/pinterest.ts
interface PinterestService {
  expandShortUrl(shortUrl: string): Promise<string>
  fetchBoardPage(boardUrl: string, bookmark?: string): Promise<BoardPageResult>
  parsePin(rawPin: unknown): Pin
}

interface BoardPageResult {
  pins: Pin[]
  bookmark: string | null // null = last page
  boardName: string
  totalPins?: number
}

// store/pin-store.ts
interface PinStore {
  readonly pins: Pin[]
  readonly seenCount: number
  readonly totalCount: number
  readonly isFullyLoaded: boolean

  addPins(pins: Pin[]): void
  getRandomUnseen(): Pin | null
  markSeen(pinId: string): void
  resetSeen(): void
  clear(): void
}

// Proxy abstraction for easy swapping
interface ProxyClient {
  fetch(url: string): Promise<string>
}
```

### Algorithm: Random Pin Selection

```typescript
// Ensures variety before repeating
function getRandomUnseen(pins: Pin[], seenIds: Set<string>): Pin | null {
  const unseen = pins.filter((p) => !seenIds.has(p.id))

  if (unseen.length === 0) {
    // All pins seen - reset and pick from full pool
    seenIds.clear()
    return pins[Math.floor(Math.random() * pins.length)] ?? null
  }

  return unseen[Math.floor(Math.random() * unseen.length)]
}
```

### Algorithm: Progressive Loading

```typescript
async function loadBoardProgressively(
  boardUrl: string,
  onFirstPage: (pins: Pin[]) => void,
  onProgress: (loaded: number, total: number) => void,
  onComplete: () => void
): Promise<void> {
  let bookmark: string | null = null
  let isFirstPage = true

  do {
    const result = await pinterest.fetchBoardPage(boardUrl, bookmark)

    if (isFirstPage) {
      onFirstPage(result.pins) // Immediately show random pin
      isFirstPage = false
    } else {
      store.addPins(result.pins)
    }

    onProgress(store.totalCount, result.totalPins ?? store.totalCount)
    bookmark = result.bookmark

    // Small delay to avoid rate limiting
    if (bookmark) await sleep(500)
  } while (bookmark)

  onComplete()
}
```

### Error Handling Strategy

```typescript
type PinspirationError =
  | { type: 'INVALID_URL'; message: string }
  | { type: 'PRIVATE_BOARD'; message: string }
  | { type: 'NETWORK_ERROR'; message: string; retryable: true }
  | { type: 'RATE_LIMITED'; message: string; retryAfter?: number }
  | { type: 'PARSE_ERROR'; message: string }

// All errors should be user-friendly
const errorMessages: Record<PinspirationError['type'], string> = {
  INVALID_URL:
    "That doesn't look like a Pinterest board URL. Try pasting a link like pinterest.com/user/board",
  PRIVATE_BOARD: 'This board appears to be private. Only public boards can be explored.',
  NETWORK_ERROR: "Couldn't reach Pinterest. Check your connection and try again.",
  RATE_LIMITED: 'Too many requests. Please wait a moment and try again.',
  PARSE_ERROR: "Couldn't read the board data. Pinterest may have changed their format.",
}
```

---

## 5. User Experience Design

_(Owner: @ux-designer)_

### User Flow

```
[Landing] → (Paste URL) → [URL Input Filled]
                │
                └─▶ (Click "Inspire Me") → [Loading First Page]
                                                    │
                                                    ▼
                                          [Pin Displayed] ◀─────────────┐
                                                    │                   │
                                                    ├─▶ (Click Link) → [Pinterest Tab Opens]
                                                    │
                                                    └─▶ (Click "Inspire Me") ──────┘
                                                    │
                                                    └─▶ (Paste New URL) → [Reset] → [Loading First Page]
```

### Wireframes

#### Initial State (Mobile)

```
┌─────────────────────────────────────┐
│            Status Bar               │
├─────────────────────────────────────┤
│                                     │
│         ✨ Pinspiration ✨          │
│                                     │
│    Discover random inspiration      │
│    from any Pinterest board         │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ Paste Pinterest board URL...   ││
│  └─────────────────────────────────┘│
│                                     │
│       [ ✨ Inspire Me ]             │
│                                     │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

#### Pin Display State

```
┌─────────────────────────────────────┐
│            Status Bar               │
├─────────────────────────────────────┤
│  ← Change Board                     │
├─────────────────────────────────────┤
│  ┌─────────────────────────────────┐│
│  │                                 ││
│  │         [Pin Image]             ││
│  │                                 ││
│  │                                 ││
│  └─────────────────────────────────┘│
│                                     │
│  Pin Title Goes Here                │
│  ─────────────────────────────────  │
│  Description text that may span     │
│  multiple lines with details...     │
│                                     │
│  [View on Pinterest →]              │
│                                     │
│  ────────────────────────────────── │
│  7 of 156 pins explored             │
│  [Loading more... ████░░░░░░ 45%]   │
│                                     │
│       [ ✨ Inspire Me ]             │
│                                     │
└─────────────────────────────────────┘
```

### Interaction Patterns

- **Primary Action**: "Inspire Me" button - large, centered, prominent
- **Feedback**: Pin card animates in with scale + fade, image loads with blur-up
- **Error States**: Inline error below input with retry action
- **Empty States**: Encouraging illustration/message when no URL entered
- **Loading States**:
  - Initial: Skeleton card with shimmer
  - Background: Progress bar showing pages loaded

### Screen States

| State             | What User Sees                                      |
| ----------------- | --------------------------------------------------- |
| Idle              | Input field + "Inspire Me" button (disabled)        |
| Input Filled      | "Inspire Me" button becomes active                  |
| Loading First     | Skeleton card with shimmer animation                |
| Pin Displayed     | Full pin card + progress + active "Inspire Me"      |
| Loading More (BG) | Small progress indicator, doesn't block interaction |
| Fully Loaded      | Progress shows "All X pins loaded"                  |
| Error             | Error message with retry button                     |

### Accessibility Requirements

- [ ] URL input has visible label and placeholder
- [ ] "Inspire Me" button has clear disabled/enabled states
- [ ] Pin image has alt text from pin title
- [ ] Loading state announced to screen readers
- [ ] New pin announced when displayed (aria-live region)
- [ ] All interactive elements keyboard accessible
- [ ] Focus moves to pin card when displayed
- [ ] Color contrast meets WCAG AA

---

## 6. Visual Design & Polish

_(Owner: @visual-designer)_

### Design Direction

A playful, inspiring aesthetic that evokes creativity and discovery. Think mood board meets magic 8-ball—each "Inspire Me" click should feel like unwrapping a gift. Use soft gradients, generous whitespace, and smooth animations.

### Typography

| Use Case    | Font Family     | Size/Weight     | Notes                       |
| ----------- | --------------- | --------------- | --------------------------- |
| App Title   | Cabinet Grotesk | 32px / Bold     | Distinctive display font    |
| Pin Title   | Plus Jakarta    | 20px / Semibold | Clear, readable             |
| Description | Plus Jakarta    | 14px / Regular  | Secondary, good line height |
| Button      | Plus Jakarta    | 16px / Semibold | All caps optional           |
| Progress    | Space Mono      | 12px / Regular  | Technical, monospace        |

### Color Palette

| Token Name            | Value     | Usage                     |
| --------------------- | --------- | ------------------------- |
| `--pin-bg`            | `#FAFAF9` | Card background           |
| `--pin-border`        | `#E7E5E4` | Subtle card border        |
| `--accent-primary`    | `#E11D48` | Pinterest-inspired rose   |
| `--accent-secondary`  | `#FB7185` | Lighter accent for hovers |
| `--text-primary`      | `#1C1917` | Headings, titles          |
| `--text-secondary`    | `#78716C` | Descriptions, metadata    |
| `--bg-gradient-start` | `#FFF1F2` | Page background gradient  |
| `--bg-gradient-end`   | `#FEF2F2` | Warm, creative feel       |
| `--success`           | `#10B981` | Fully loaded indicator    |
| `--skeleton`          | `#E7E5E4` | Loading skeleton base     |

### Animation & Motion

| Element        | Animation                  | Duration/Easing         | Trigger         |
| -------------- | -------------------------- | ----------------------- | --------------- |
| Pin Card Enter | Scale 0.95→1 + Fade in     | 400ms / ease-out        | New pin loads   |
| Pin Image      | Blur 20px→0 + Scale 1.02→1 | 600ms / ease-out        | Image loaded    |
| Button Hover   | Scale 1.02 + Shadow lift   | 150ms / ease-out        | Mouse enter     |
| Button Click   | Scale 0.98                 | 100ms / ease-in-out     | Mouse down      |
| Progress Bar   | Width transition           | 300ms / ease-out        | Progress update |
| Shimmer        | Gradient slide             | 1.5s / linear, infinite | Loading state   |
| Error Shake    | TranslateX wiggle          | 400ms / ease-out        | Error displayed |

### Responsive Breakpoints

| Breakpoint        | Layout Changes                                        |
| ----------------- | ----------------------------------------------------- |
| Mobile (<640px)   | Full-width card, stacked layout, larger touch targets |
| Tablet (640-1024) | Centered card with max-width 480px, more padding      |
| Desktop (>1024)   | Card max-width 520px, centered with generous margins  |

### Pin Card Design

```css
.pin-card {
  /* Soft, Pinterest-inspired card */
  background: var(--pin-bg);
  border-radius: 24px;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.04),
    0 4px 12px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.pin-image {
  aspect-ratio: 4/5; /* Pinterest-style tall images */
  object-fit: cover;
  width: 100%;
}
```

---

## 7. Gamification & Engagement

_(Owner: @gamer)_

### Engagement Hooks

| Trigger            | Reward/Feedback                           | Purpose                  |
| ------------------ | ----------------------------------------- | ------------------------ |
| First pin revealed | Celebratory scale + subtle confetti       | First impression matters |
| Every 10 pins seen | "You've explored X pins!" toast           | Progress awareness       |
| All pins explored  | "🎉 You've seen them all!" + reset option | Completion celebration   |
| New board loaded   | Board name reveal animation               | Context setting          |

### Progression Elements

- **Pins Explored Counter**: Shows "X of Y explored" - clear progress visibility
- **Board Completion**: Visual celebration when all pins from a board have been seen
- **Visual Progress Bar**: Shows background loading progress - satisfying to watch fill

### Feedback Loops

- **Immediate**: Button press animation + instant skeleton/loading state
- **Short-term**: Pin reveal animation creates anticipation-reward cycle
- **Session-based**: Counter tracks how many pins you've discovered this session

### "Juice" Specifications

```typescript
// Pin reveal should feel magical
const pinRevealSequence = [
  { transform: 'scale(0.9) translateY(20px)', opacity: 0 }, // Start
  { transform: 'scale(1.02)', opacity: 1, offset: 0.7 }, // Overshoot
  { transform: 'scale(1) translateY(0)', opacity: 1 }, // Settle
]

// Button should feel responsive
const buttonPressAnimation = {
  transform: ['scale(1)', 'scale(0.95)', 'scale(1)'],
  easing: 'ease-out',
  duration: 150,
}

// Consider subtle haptic feedback on mobile (if supported)
if ('vibrate' in navigator) {
  navigator.vibrate(10) // Quick tap feedback
}
```

---

## 8. Security Considerations

_(Owner: @security)_

### Threat Model

| Threat              | Risk Level | Mitigation                                            |
| ------------------- | ---------- | ----------------------------------------------------- |
| XSS via pin content | Medium     | Sanitize all pin titles/descriptions before rendering |
| CORS proxy abuse    | Low        | Rate limit requests client-side                       |
| URL injection       | Medium     | Strict URL validation before proxy requests           |
| Data exposure       | Low        | Only public data accessed, no auth                    |

### Data Security

- [ ] No user data stored - stateless session only
- [ ] No authentication required - public boards only
- [ ] Pin content sanitized with DOMPurify or text-only rendering
- [ ] URLs validated against allowlist of Pinterest domains

### Input Validation

```typescript
// URL validation
const PINTEREST_URL_PATTERNS = [
  /^https?:\/\/(www\.)?pinterest\.(com|co\.uk|ca|de|fr|es|it|nl|at|ch|com\.au|co\.nz|jp|kr|se|dk|no|fi|pt|ie|be|ru|pl|cz|hu|gr|tr|com\.mx|cl|ar|br)\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+\/?/,
  /^https?:\/\/pin\.it\/[a-zA-Z0-9]+$/,
]

function isValidPinterestUrl(url: string): boolean {
  return PINTEREST_URL_PATTERNS.some((pattern) => pattern.test(url))
}
```

### Input Sanitization

- [ ] Pin titles rendered as text only (no HTML)
- [ ] Descriptions truncated and sanitized
- [ ] Image URLs validated to be from Pinterest CDN only
- [ ] External links open with `rel="noopener noreferrer"`

### Rate Limiting

```typescript
// Client-side rate limiting to prevent abuse
const rateLimiter = {
  requests: 0,
  windowStart: Date.now(),
  maxRequests: 30,
  windowMs: 60000,

  canRequest(): boolean {
    const now = Date.now()
    if (now - this.windowStart > this.windowMs) {
      this.requests = 0
      this.windowStart = now
    }
    return this.requests < this.maxRequests
  },
}
```

---

## 9. Quality Assurance Strategy

_(Owner: @qa-engineer)_

### Test Scenarios

#### Happy Path

1. User pastes valid board URL → Pin displays within 2s
2. User clicks "Inspire Me" → Different pin appears
3. User clicks Pinterest link → Opens in new tab
4. Background loading completes → Progress shows 100%

#### Edge Cases

| Scenario                 | Input                       | Expected Output                       |
| ------------------------ | --------------------------- | ------------------------------------- |
| Short URL                | `https://pin.it/abc123`     | Expands to full URL, loads board      |
| Board with 1 pin         | Single-pin board URL        | Shows pin, "Inspire Me" re-shows same |
| Very large board (1000+) | Large board URL             | First pin fast, background loads      |
| International Pinterest  | pinterest.de URL            | Works same as .com                    |
| URL with trailing slash  | `pinterest.com/user/board/` | Handles correctly                     |
| URL without protocol     | `pinterest.com/user/board`  | Auto-adds https://                    |
| Empty input              | (empty)                     | Button disabled                       |
| Whitespace only          | `   `                       | Button disabled, input trimmed        |
| Non-Pinterest URL        | `google.com`                | Error: invalid URL                    |

#### Error Scenarios

| Error Condition | User Experience                             | Recovery Path                |
| --------------- | ------------------------------------------- | ---------------------------- |
| Invalid URL     | "That doesn't look like a Pinterest URL..." | Edit input and retry         |
| Network failure | "Couldn't reach Pinterest" + Retry button   | Click retry or check network |
| Private board   | "This board appears to be private"          | Try different board          |
| Rate limited    | "Too many requests, wait a moment"          | Auto-retry after delay       |
| Proxy failure   | "Service temporarily unavailable"           | Retry later                  |

### Test Types Required

- [ ] Unit tests: URL parsing, pin store logic, sanitization (90%+ coverage)
- [ ] Integration tests: Pinterest service with mocked proxy
- [ ] E2E tests: Full user flow with Playwright
- [ ] Accessibility tests: axe-core scan, keyboard navigation
- [ ] Performance tests: First pin load time < 2s

### Mock Data Requirements

```typescript
// Mock Pinterest board response
const mockBoardResponse = {
  name: 'Test Board',
  pins: [
    {
      id: '123',
      images: { '736x': { url: 'https://i.pinimg.com/736x/...' } },
      title: 'Test Pin',
      description: 'A test description',
      link: 'https://www.pinterest.com/pin/123/',
    },
  ],
  bookmark: 'next_page_token',
}
```

---

## 10. Infrastructure & Deployment

_(Owner: @devops)_

### Build Configuration

- [ ] Add `pinspiration` entry to `vite.config.ts` rollupOptions.input
- [ ] Ensure fonts (Cabinet Grotesk, Plus Jakarta Sans) are loaded
- [ ] No new dependencies - vanilla TypeScript

```typescript
// vite.config.ts addition
rollupOptions: {
  input: {
    // ... existing
    pinspiration: resolve(__dirname, 'experiments/pinspiration/index.html'),
  },
}
```

### Deployment Strategy

- **Rollout**: Standard build and deploy with existing experiments
- **Rollback Plan**: Revert vite.config entry, redeploy

### Monitoring & Observability

- [ ] Console errors tracked via existing mechanisms
- [ ] Consider adding simple analytics for load times (optional)

### Offline/PWA Considerations

- [ ] Not a PWA priority - requires network for Pinterest data
- [ ] Graceful offline message: "Pinspiration needs internet to fetch pins"

### CORS Proxy Reliability

Consider fallback chain for proxy reliability:

```typescript
const PROXY_ENDPOINTS = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
  // Self-hosted fallback if needed
]

async function fetchWithFallback(url: string): Promise<string> {
  for (const proxy of PROXY_ENDPOINTS) {
    try {
      const response = await fetch(proxy + encodeURIComponent(url))
      if (response.ok) return await response.text()
    } catch {
      continue // Try next proxy
    }
  }
  throw new Error('All proxies failed')
}
```

---

## 11. Action Items

_(Collaborative: All agents)_

### Phase 1: Foundation

- [ ] **SETUP-001**: Create `experiments/pinspiration/` directory structure — @software-developer
- [ ] **SETUP-002**: Create `index.html` with fonts and base structure — @software-developer
- [ ] **SETUP-003**: Add pinspiration to vite.config.ts build inputs — @devops
- [ ] **SETUP-004**: Create base CSS with design tokens — @visual-designer

### Phase 2: Core Implementation

- [ ] **IMPL-001**: Implement `ProxyClient` with fallback chain — @software-developer
- [ ] **IMPL-002**: Implement URL parser and validator — @software-developer
- [ ] **IMPL-003**: Implement `PinterestService` for board fetching — @software-developer
- [ ] **IMPL-004**: Implement `PinStore` for state management — @software-developer
- [ ] **IMPL-005**: Implement URL input component — @software-developer
- [ ] **IMPL-006**: Implement pin display card component — @software-developer
- [ ] **IMPL-007**: Implement loading/error states — @software-developer
- [ ] **IMPL-008**: Wire up main app orchestration — @software-developer

### Phase 3: Polish & Testing

- [ ] **POLISH-001**: Add pin reveal animations — @visual-designer
- [ ] **POLISH-002**: Add button interactions and feedback — @visual-designer
- [ ] **POLISH-003**: Add progress bar and completion celebration — @gamer
- [ ] **TEST-001**: Write unit tests for services and store — @qa-engineer
- [ ] **TEST-002**: Write E2E tests for user flows — @qa-engineer
- [ ] **TEST-003**: Perform accessibility audit — @qa-engineer
- [ ] **SECURITY-001**: Validate input sanitization — @security

### Phase 4: Review & Deploy

- [ ] **REVIEW-001**: Code review for patterns and quality — @tech-lead
- [ ] **REVIEW-002**: Architecture review for extensibility — @architect
- [ ] **DEPLOY-001**: Verify build and deploy — @devops

---

## 12. Risk Register

_(Collaborative: All agents)_

| Risk                             | Probability | Impact | Mitigation                                   | Owner               |
| -------------------------------- | ----------- | ------ | -------------------------------------------- | ------------------- |
| Pinterest changes HTML structure | Medium      | High   | Abstract parsing, monitor for changes        | @architect          |
| CORS proxy becomes unreliable    | Medium      | High   | Multiple proxy fallbacks, consider self-host | @devops             |
| Pinterest rate limits requests   | Medium      | Medium | Client-side rate limiting, caching           | @software-developer |
| Short URL expansion fails        | Low         | Medium | Graceful error, manual URL entry fallback    | @software-developer |
| Large boards cause memory issues | Low         | Medium | Pagination limits, lazy image loading        | @tech-lead          |
| Mobile performance issues        | Low         | Medium | Performance testing, optimize animations     | @visual-designer    |

---

## 13. Open Questions

_(Track decisions needed before/during implementation)_

- [x] **Q1**: Which CORS proxy to use primarily? — **Decision: allorigins.win with fallback chain**
- [x] **Q2**: Should we cache board data in localStorage? — **Decision: No, keep stateless for MVP**
- [x] **Q3**: How to handle boards with 1000+ pins? — **Decision: Progressive loading, no limit**
- [ ] **Q4**: Add to landing page navigation? — Assigned to: @product-manager (decide during execution)

---

## 14. Glossary

_(Define project-specific terms)_

| Term       | Definition                                                       |
| ---------- | ---------------------------------------------------------------- |
| Pin        | A single image/content item saved to a Pinterest board           |
| Board      | A collection of pins organized by theme on Pinterest             |
| Bookmark   | Pinterest's pagination cursor token                              |
| Short URL  | Compressed Pinterest share links (pin.it/xxx)                    |
| CORS Proxy | Intermediary service to bypass browser cross-origin restrictions |

---

## Revision History

| Date       | Author           | Changes                    |
| ---------- | ---------------- | -------------------------- |
| 2025-01-25 | @product-manager | Initial requirements draft |
| 2025-01-25 | @architect       | Technical architecture     |
| 2025-01-25 | @tech-lead       | Implementation specs       |
| 2025-01-25 | @ux-designer     | User flows and wireframes  |
| 2025-01-25 | @visual-designer | Visual design system       |
| 2025-01-25 | @gamer           | Engagement mechanics       |
| 2025-01-25 | @security        | Security considerations    |
| 2025-01-25 | @qa-engineer     | Test strategy              |
| 2025-01-25 | @devops          | Infrastructure plan        |
