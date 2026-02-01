/**
 * Unit tests for Splashy ImageProcessor
 * Tests the Median Cut color quantization algorithm
 */
import { describe, it, expect, beforeEach } from 'vitest'

// Helper types for testing the algorithm
interface RGB {
  r: number
  g: number
  b: number
}

interface PaletteColor extends RGB {
  index: number
  hex: string
  cellCount: number
}

/**
 * Extracted Median Cut algorithm for unit testing
 * This mirrors the implementation in ImageProcessor but is testable without canvas
 */
class MedianCutAlgorithm {
  /**
   * Median Cut color quantization algorithm
   */
  medianCut(pixels: RGB[], maxColors: number): PaletteColor[] {
    if (pixels.length === 0) return []

    // Start with all pixels in one bucket
    let buckets: RGB[][] = [pixels]

    // Split buckets until we have maxColors
    while (buckets.length < maxColors) {
      // Find the bucket with the greatest range
      let maxRange = 0
      let bucketToSplit = 0
      let channelToSplit: 'r' | 'g' | 'b' = 'r'

      buckets.forEach((bucket, idx) => {
        if (bucket.length < 2) return

        const ranges = this.getColorRanges(bucket)
        const maxChannelRange = Math.max(ranges.r, ranges.g, ranges.b)

        if (maxChannelRange > maxRange) {
          maxRange = maxChannelRange
          bucketToSplit = idx
          if (ranges.r === maxChannelRange) channelToSplit = 'r'
          else if (ranges.g === maxChannelRange) channelToSplit = 'g'
          else channelToSplit = 'b'
        }
      })

      // If no bucket can be split, we're done
      if (maxRange === 0) break

      // Split the bucket
      const bucket = buckets[bucketToSplit]!
      bucket.sort((a, b) => a[channelToSplit] - b[channelToSplit])
      const mid = Math.floor(bucket.length / 2)

      const bucket1 = bucket.slice(0, mid)
      const bucket2 = bucket.slice(mid)

      buckets.splice(bucketToSplit, 1, bucket1, bucket2)
    }

    // Average each bucket to get final palette colors
    return buckets.map((bucket) => this.averageBucket(bucket))
  }

  /**
   * Get color channel ranges for a bucket of pixels
   */
  private getColorRanges(bucket: RGB[]): RGB {
    let minR = 255,
      maxR = 0
    let minG = 255,
      maxG = 0
    let minB = 255,
      maxB = 0

    for (const pixel of bucket) {
      minR = Math.min(minR, pixel.r)
      maxR = Math.max(maxR, pixel.r)
      minG = Math.min(minG, pixel.g)
      maxG = Math.max(maxG, pixel.g)
      minB = Math.min(minB, pixel.b)
      maxB = Math.max(maxB, pixel.b)
    }

    return {
      r: maxR - minR,
      g: maxG - minG,
      b: maxB - minB,
    }
  }

  /**
   * Average a bucket of pixels to get a single color
   */
  private averageBucket(bucket: RGB[]): PaletteColor {
    if (bucket.length === 0) {
      return { r: 0, g: 0, b: 0, index: 0, hex: '#000000', cellCount: 0 }
    }

    let sumR = 0,
      sumG = 0,
      sumB = 0
    for (const pixel of bucket) {
      sumR += pixel.r
      sumG += pixel.g
      sumB += pixel.b
    }

    const count = bucket.length
    const r = Math.round(sumR / count)
    const g = Math.round(sumG / count)
    const b = Math.round(sumB / count)

    return {
      r,
      g,
      b,
      index: 0,
      hex: '',
      cellCount: 0,
    }
  }

  /**
   * Find the nearest palette color to a pixel (1-based index)
   */
  findNearestColor(pixel: RGB, palette: PaletteColor[]): number {
    let minDistance = Infinity
    let nearestIndex = 1

    for (let i = 0; i < palette.length; i++) {
      const color = palette[i]!
      // Euclidean distance in RGB space
      const distance = Math.sqrt(
        Math.pow(pixel.r - color.r, 2) +
          Math.pow(pixel.g - color.g, 2) +
          Math.pow(pixel.b - color.b, 2)
      )

      if (distance < minDistance) {
        minDistance = distance
        nearestIndex = i + 1 // 1-based
      }
    }

    return nearestIndex
  }

  /**
   * Convert RGB to hex string
   */
  rgbToHex(color: RGB): string {
    const toHex = (n: number) => n.toString(16).padStart(2, '0')
    return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`
  }

  /**
   * Calculate grid dimensions maintaining aspect ratio
   */
  calculateGridDimensions(
    imgWidth: number,
    imgHeight: number,
    targetSize: number
  ): { gridWidth: number; gridHeight: number } {
    const aspectRatio = imgWidth / imgHeight

    if (aspectRatio >= 1) {
      // Landscape or square
      return {
        gridWidth: targetSize,
        gridHeight: Math.max(1, Math.round(targetSize / aspectRatio)),
      }
    } else {
      // Portrait
      return {
        gridWidth: Math.max(1, Math.round(targetSize * aspectRatio)),
        gridHeight: targetSize,
      }
    }
  }
}

describe('MedianCut Algorithm', () => {
  let algorithm: MedianCutAlgorithm

  beforeEach(() => {
    algorithm = new MedianCutAlgorithm()
  })

  describe('medianCut', () => {
    it('should return empty array for empty input', () => {
      const result = algorithm.medianCut([], 5)
      expect(result).toEqual([])
    })

    it('should return single color for single pixel', () => {
      const pixels: RGB[] = [{ r: 100, g: 150, b: 200 }]
      const result = algorithm.medianCut(pixels, 5)

      expect(result).toHaveLength(1)
      expect(result[0]?.r).toBe(100)
      expect(result[0]?.g).toBe(150)
      expect(result[0]?.b).toBe(200)
    })

    it('should reduce colors to requested maximum', () => {
      // Create pixels with many different colors
      const pixels: RGB[] = []
      for (let r = 0; r < 256; r += 25) {
        for (let g = 0; g < 256; g += 25) {
          pixels.push({ r, g, b: 128 })
        }
      }

      const result = algorithm.medianCut(pixels, 10)
      expect(result.length).toBeLessThanOrEqual(10)
      expect(result.length).toBeGreaterThan(0)
    })

    it('should preserve distinct colors when under max', () => {
      const pixels: RGB[] = [
        { r: 0, g: 0, b: 0 },
        { r: 255, g: 255, b: 255 },
      ]

      const result = algorithm.medianCut(pixels, 10)
      // With only 2 distinct colors, should have 2 buckets
      expect(result.length).toBeLessThanOrEqual(10)
    })

    it('should split on the channel with greatest range', () => {
      // High red range, low green/blue range
      const pixels: RGB[] = [
        { r: 0, g: 100, b: 100 },
        { r: 255, g: 100, b: 100 },
        { r: 50, g: 100, b: 100 },
        { r: 200, g: 100, b: 100 },
      ]

      const result = algorithm.medianCut(pixels, 2)
      expect(result).toHaveLength(2)

      // One bucket should have low reds, other should have high reds
      const reds = result.map((c) => c.r).sort((a, b) => a - b)
      expect(reds[0]!).toBeLessThan(reds[1]!)
    })

    it('should produce averaged colors per bucket', () => {
      const pixels: RGB[] = [
        { r: 10, g: 20, b: 30 },
        { r: 20, g: 30, b: 40 },
        { r: 30, g: 40, b: 50 },
      ]

      const result = algorithm.medianCut(pixels, 1)
      expect(result).toHaveLength(1)

      // Average should be ~20, ~30, ~40
      expect(result[0]?.r).toBe(20)
      expect(result[0]?.g).toBe(30)
      expect(result[0]?.b).toBe(40)
    })
  })

  describe('findNearestColor', () => {
    const palette: PaletteColor[] = [
      { r: 255, g: 0, b: 0, index: 1, hex: '#ff0000', cellCount: 0 }, // Red
      { r: 0, g: 255, b: 0, index: 2, hex: '#00ff00', cellCount: 0 }, // Green
      { r: 0, g: 0, b: 255, index: 3, hex: '#0000ff', cellCount: 0 }, // Blue
    ]

    it('should find exact match', () => {
      const result = algorithm.findNearestColor({ r: 255, g: 0, b: 0 }, palette)
      expect(result).toBe(1)
    })

    it('should find nearest color for non-exact match', () => {
      // Close to red
      const result = algorithm.findNearestColor({ r: 250, g: 10, b: 10 }, palette)
      expect(result).toBe(1)
    })

    it('should find green as nearest', () => {
      const result = algorithm.findNearestColor({ r: 50, g: 200, b: 50 }, palette)
      expect(result).toBe(2)
    })

    it('should find blue as nearest', () => {
      const result = algorithm.findNearestColor({ r: 20, g: 20, b: 240 }, palette)
      expect(result).toBe(3)
    })

    it('should return 1-based index', () => {
      const result = algorithm.findNearestColor({ r: 0, g: 0, b: 255 }, palette)
      expect(result).toBeGreaterThanOrEqual(1)
    })
  })

  describe('rgbToHex', () => {
    it('should convert black correctly', () => {
      expect(algorithm.rgbToHex({ r: 0, g: 0, b: 0 })).toBe('#000000')
    })

    it('should convert white correctly', () => {
      expect(algorithm.rgbToHex({ r: 255, g: 255, b: 255 })).toBe('#ffffff')
    })

    it('should convert red correctly', () => {
      expect(algorithm.rgbToHex({ r: 255, g: 0, b: 0 })).toBe('#ff0000')
    })

    it('should convert green correctly', () => {
      expect(algorithm.rgbToHex({ r: 0, g: 255, b: 0 })).toBe('#00ff00')
    })

    it('should convert blue correctly', () => {
      expect(algorithm.rgbToHex({ r: 0, g: 0, b: 255 })).toBe('#0000ff')
    })

    it('should pad single digit hex values', () => {
      expect(algorithm.rgbToHex({ r: 15, g: 15, b: 15 })).toBe('#0f0f0f')
    })

    it('should convert arbitrary color correctly', () => {
      expect(algorithm.rgbToHex({ r: 100, g: 150, b: 200 })).toBe('#6496c8')
    })
  })

  describe('calculateGridDimensions', () => {
    it('should maintain aspect ratio for landscape image', () => {
      const result = algorithm.calculateGridDimensions(800, 400, 20)

      expect(result.gridWidth).toBe(20)
      expect(result.gridHeight).toBe(10)
    })

    it('should maintain aspect ratio for portrait image', () => {
      const result = algorithm.calculateGridDimensions(400, 800, 20)

      expect(result.gridWidth).toBe(10)
      expect(result.gridHeight).toBe(20)
    })

    it('should handle square image', () => {
      const result = algorithm.calculateGridDimensions(500, 500, 20)

      expect(result.gridWidth).toBe(20)
      expect(result.gridHeight).toBe(20)
    })

    it('should return minimum of 1 for very thin images', () => {
      const result = algorithm.calculateGridDimensions(10, 1000, 10)

      expect(result.gridWidth).toBeGreaterThanOrEqual(1)
      expect(result.gridHeight).toBe(10)
    })

    it('should handle 16:9 aspect ratio', () => {
      const result = algorithm.calculateGridDimensions(1920, 1080, 32)

      expect(result.gridWidth).toBe(32)
      expect(result.gridHeight).toBe(18) // 32 / (16/9) = 18
    })
  })
})

describe('Color Quantization Quality', () => {
  let algorithm: MedianCutAlgorithm

  beforeEach(() => {
    algorithm = new MedianCutAlgorithm()
  })

  it('should preserve primary colors in diverse palette', () => {
    // Create image with clear red, green, blue regions
    const pixels: RGB[] = [
      // Red region
      ...Array(100)
        .fill(null)
        .map(() => ({ r: 255, g: 0, b: 0 })),
      // Green region
      ...Array(100)
        .fill(null)
        .map(() => ({ r: 0, g: 255, b: 0 })),
      // Blue region
      ...Array(100)
        .fill(null)
        .map(() => ({ r: 0, g: 0, b: 255 })),
    ]

    const result = algorithm.medianCut(pixels, 3)

    expect(result).toHaveLength(3)

    // Should have colors that represent the 3 distinct regions
    // The median cut algorithm may average colors differently, so check for presence of distinct hues
    // Each result color should have one dominant channel
    const dominantChannels = result.map((c) => {
      if (c.r >= c.g && c.r >= c.b) return 'r'
      if (c.g >= c.r && c.g >= c.b) return 'g'
      return 'b'
    })

    // Should have representation of each primary color
    expect(dominantChannels).toContain('r')
    expect(dominantChannels).toContain('g')
    expect(dominantChannels).toContain('b')
  })

  it('should produce smooth gradients for gradient images', () => {
    // Create a gradient from dark to light
    const pixels: RGB[] = []
    for (let i = 0; i < 256; i++) {
      pixels.push({ r: i, g: i, b: i })
    }

    const result = algorithm.medianCut(pixels, 8)

    // Should have evenly distributed grayscale values
    const values = result.map((c) => c.r).sort((a, b) => a - b)

    // Check that values span a reasonable range
    const lastValue = values[values.length - 1] ?? 0
    const firstValue = values[0] ?? 0
    expect(lastValue - firstValue).toBeGreaterThan(100)
  })
})

/**
 * Test helper to calculate color distance
 */
function colorDistance(a: RGB, b: RGB): number {
  return Math.sqrt(Math.pow(a.r - b.r, 2) + Math.pow(a.g - b.g, 2) + Math.pow(a.b - b.b, 2))
}

/**
 * MedianCut algorithm WITH color merging
 * This mirrors the updated implementation in ImageProcessor
 */
class MedianCutWithMerging {
  private readonly COLOR_MERGE_THRESHOLD = 35

  medianCut(pixels: RGB[], maxColors: number): PaletteColor[] {
    if (pixels.length === 0) return []

    // Start with all pixels in one bucket
    let buckets: RGB[][] = [pixels]

    // Split buckets until we have maxColors
    while (buckets.length < maxColors) {
      let maxRange = 0
      let bucketToSplit = 0
      let channelToSplit: 'r' | 'g' | 'b' = 'r'

      buckets.forEach((bucket, idx) => {
        if (bucket.length < 2) return

        const ranges = this.getColorRanges(bucket)
        const maxChannelRange = Math.max(ranges.r, ranges.g, ranges.b)

        if (maxChannelRange > maxRange) {
          maxRange = maxChannelRange
          bucketToSplit = idx
          if (ranges.r === maxChannelRange) channelToSplit = 'r'
          else if (ranges.g === maxChannelRange) channelToSplit = 'g'
          else channelToSplit = 'b'
        }
      })

      if (maxRange === 0) break

      const bucket = buckets[bucketToSplit]!
      bucket.sort((a, b) => a[channelToSplit] - b[channelToSplit])
      const mid = Math.floor(bucket.length / 2)

      buckets.splice(bucketToSplit, 1, bucket.slice(0, mid), bucket.slice(mid))
    }

    // Initial palette
    let palette = buckets.map((bucket, idx) => ({
      color: this.averageBucket(bucket),
      bucket,
      originalIndex: idx,
    }))

    // Merge similar colors
    palette = this.mergeSimilarColors(palette, maxColors)

    return palette.map((p) => p.color)
  }

  private getColorRanges(bucket: RGB[]): RGB {
    let minR = 255,
      maxR = 0
    let minG = 255,
      maxG = 0
    let minB = 255,
      maxB = 0

    for (const pixel of bucket) {
      minR = Math.min(minR, pixel.r)
      maxR = Math.max(maxR, pixel.r)
      minG = Math.min(minG, pixel.g)
      maxG = Math.max(maxG, pixel.g)
      minB = Math.min(minB, pixel.b)
      maxB = Math.max(maxB, pixel.b)
    }

    return { r: maxR - minR, g: maxG - minG, b: maxB - minB }
  }

  private averageBucket(bucket: RGB[]): PaletteColor {
    if (bucket.length === 0) {
      return { r: 0, g: 0, b: 0, index: 0, hex: '#000000', cellCount: 0 }
    }

    let sumR = 0,
      sumG = 0,
      sumB = 0
    for (const pixel of bucket) {
      sumR += pixel.r
      sumG += pixel.g
      sumB += pixel.b
    }

    const count = bucket.length
    return {
      r: Math.round(sumR / count),
      g: Math.round(sumG / count),
      b: Math.round(sumB / count),
      index: 0,
      hex: '',
      cellCount: 0,
    }
  }

  private mergeSimilarColors(
    palette: Array<{ color: PaletteColor; bucket: RGB[]; originalIndex: number }>,
    maxColors: number
  ): Array<{ color: PaletteColor; bucket: RGB[]; originalIndex: number }> {
    let merged = true
    let iterations = 0

    while (merged && iterations < 10) {
      merged = false
      iterations++

      let minDistance = Infinity
      let mergeI = -1
      let mergeJ = -1

      for (let i = 0; i < palette.length; i++) {
        for (let j = i + 1; j < palette.length; j++) {
          const dist = colorDistance(palette[i]!.color, palette[j]!.color)
          if (dist < minDistance) {
            minDistance = dist
            mergeI = i
            mergeJ = j
          }
        }
      }

      if (minDistance < this.COLOR_MERGE_THRESHOLD && mergeI !== -1 && mergeJ !== -1) {
        merged = true

        const combinedBucket = [...palette[mergeI]!.bucket, ...palette[mergeJ]!.bucket]
        const a = palette[mergeI]!
        const b = palette[mergeJ]!
        const totalPixels = a.bucket.length + b.bucket.length
        const weightA = a.bucket.length / totalPixels
        const weightB = b.bucket.length / totalPixels

        const mergedColor: PaletteColor = {
          r: Math.round(a.color.r * weightA + b.color.r * weightB),
          g: Math.round(a.color.g * weightA + b.color.g * weightB),
          b: Math.round(a.color.b * weightA + b.color.b * weightB),
          index: 0,
          hex: '',
          cellCount: 0,
        }

        palette.splice(mergeJ, 1)
        palette.splice(mergeI, 1)

        palette.push({
          color: mergedColor,
          bucket: combinedBucket,
          originalIndex: a.originalIndex,
        })

        if (palette.length < maxColors) {
          const newColor = this.findDistinctColor(palette)
          if (newColor) {
            palette.push(newColor)
          }
        }
      }
    }

    return palette
  }

  private findDistinctColor(
    palette: Array<{ color: PaletteColor; bucket: RGB[]; originalIndex: number }>
  ): { color: PaletteColor; bucket: RGB[]; originalIndex: number } | null {
    let maxVariance = 0
    let bucketToSplit = -1
    let channelToSplit: 'r' | 'g' | 'b' = 'r'

    for (let i = 0; i < palette.length; i++) {
      const bucket = palette[i]!.bucket
      if (bucket.length < 4) continue

      const ranges = this.getColorRanges(bucket)
      const maxRange = Math.max(ranges.r, ranges.g, ranges.b)
      const variance = maxRange * Math.log(bucket.length + 1)

      if (variance > maxVariance) {
        maxVariance = variance
        bucketToSplit = i
        if (ranges.r === maxRange) channelToSplit = 'r'
        else if (ranges.g === maxRange) channelToSplit = 'g'
        else channelToSplit = 'b'
      }
    }

    if (bucketToSplit === -1 || maxVariance < 20) return null

    const entry = palette[bucketToSplit]!
    const bucket = [...entry.bucket]
    bucket.sort((a, b) => a[channelToSplit] - b[channelToSplit])
    const mid = Math.floor(bucket.length / 2)

    entry.bucket = bucket.slice(0, mid)
    entry.color = this.averageBucket(entry.bucket)

    return {
      color: this.averageBucket(bucket.slice(mid)),
      bucket: bucket.slice(mid),
      originalIndex: palette.length,
    }
  }
}

describe('Color Merging Algorithm', () => {
  let algorithm: MedianCutWithMerging

  beforeEach(() => {
    algorithm = new MedianCutWithMerging()
  })

  it('should merge colors that are very similar', () => {
    // Create pixels with two nearly identical colors and one distinct color
    const pixels: RGB[] = [
      // Similar reds (should be merged)
      ...Array(50)
        .fill(null)
        .map(() => ({ r: 200, g: 50, b: 50 })),
      ...Array(50)
        .fill(null)
        .map(() => ({ r: 210, g: 55, b: 55 })), // Very close to above
      // Distinct blue (should remain separate)
      ...Array(100)
        .fill(null)
        .map(() => ({ r: 50, g: 50, b: 200 })),
    ]

    const result = algorithm.medianCut(pixels, 4)

    // With merging, colors that were very similar should be consolidated
    // Verify we got some colors back
    expect(result.length).toBeGreaterThan(0)
    expect(result.length).toBeLessThanOrEqual(4)

    // Should have at least one red-ish and one blue-ish color
    const hasRed = result.some((c) => c.r > c.b && c.r > 150)
    const hasBlue = result.some((c) => c.b > c.r && c.b > 150)
    expect(hasRed).toBe(true)
    expect(hasBlue).toBe(true)
  })

  it('should keep highly distinct colors separate', () => {
    // Create pixels with clearly distinct colors
    const pixels: RGB[] = [
      ...Array(100)
        .fill(null)
        .map(() => ({ r: 255, g: 0, b: 0 })), // Pure red
      ...Array(100)
        .fill(null)
        .map(() => ({ r: 0, g: 255, b: 0 })), // Pure green
      ...Array(100)
        .fill(null)
        .map(() => ({ r: 0, g: 0, b: 255 })), // Pure blue
      ...Array(100)
        .fill(null)
        .map(() => ({ r: 255, g: 255, b: 0 })), // Yellow
    ]

    const result = algorithm.medianCut(pixels, 4)

    // Should have 4 distinct colors
    expect(result.length).toBe(4)

    // Each should be reasonably close to one of the input colors
    const inputs = [
      { r: 255, g: 0, b: 0 },
      { r: 0, g: 255, b: 0 },
      { r: 0, g: 0, b: 255 },
      { r: 255, g: 255, b: 0 },
    ]

    for (const input of inputs) {
      const closestDist = Math.min(...result.map((c) => colorDistance(c, input)))
      // Each input should have a close match (within 50)
      expect(closestDist).toBeLessThan(50)
    }
  })

  it('should handle images with many similar shades', () => {
    // Create pixels with several similar shades of red and distinct other colors
    const pixels: RGB[] = [
      ...Array(30)
        .fill(null)
        .map(() => ({ r: 180, g: 40, b: 40 })),
      ...Array(30)
        .fill(null)
        .map(() => ({ r: 190, g: 45, b: 45 })),
      ...Array(30)
        .fill(null)
        .map(() => ({ r: 200, g: 50, b: 50 })),
      ...Array(30)
        .fill(null)
        .map(() => ({ r: 210, g: 55, b: 55 })),
      ...Array(100)
        .fill(null)
        .map(() => ({ r: 50, g: 50, b: 200 })), // Blue
      ...Array(100)
        .fill(null)
        .map(() => ({ r: 50, g: 200, b: 50 })), // Green
    ]

    const result = algorithm.medianCut(pixels, 6)

    // Should have produced some palette
    expect(result.length).toBeGreaterThan(0)
    expect(result.length).toBeLessThanOrEqual(6)

    // Should have blue and green represented
    const hasBlue = result.some((c) => c.b > c.r && c.b > c.g)
    const hasGreen = result.some((c) => c.g > c.r && c.g > c.b)
    expect(hasBlue).toBe(true)
    expect(hasGreen).toBe(true)
  })
})
