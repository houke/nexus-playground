// Splashy - Image Processor with Median Cut Color Quantization
import type { ImageConfig, PuzzleData, PaletteColor, Cell, RGB } from './types'

/**
 * Process an image into a paint-by-numbers puzzle using Median Cut quantization
 */
export class ImageProcessor {
  private canvas: OffscreenCanvas | HTMLCanvasElement
  private ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D

  constructor() {
    // Use OffscreenCanvas if available, fallback to regular canvas
    if (typeof OffscreenCanvas !== 'undefined') {
      this.canvas = new OffscreenCanvas(1, 1)
      this.ctx = this.canvas.getContext('2d')!
    } else {
      this.canvas = document.createElement('canvas')
      this.ctx = this.canvas.getContext('2d')!
    }
  }

  /**
   * Load and process an image into PuzzleData
   */
  async process(config: ImageConfig, basePath: string): Promise<PuzzleData> {
    // Load the image
    const img = await this.loadImage(`${basePath}/${config.file}`)

    // Calculate grid dimensions maintaining aspect ratio
    const { gridWidth, gridHeight } = this.calculateGridDimensions(
      img.width,
      img.height,
      config.gridSize
    )

    // Resize image to grid dimensions
    this.canvas.width = gridWidth
    this.canvas.height = gridHeight
    this.ctx.imageSmoothingEnabled = false // Nearest neighbor for sharp pixels
    this.ctx.drawImage(img, 0, 0, gridWidth, gridHeight)

    // Extract pixel data
    const imageData = this.ctx.getImageData(0, 0, gridWidth, gridHeight)
    const pixels = this.extractPixels(imageData)

    // Quantize colors using Median Cut
    const palette = this.medianCut(pixels, config.maxColors)

    // Assign palette indices (1-based for display)
    palette.forEach((color, idx) => {
      color.index = idx + 1
      color.hex = this.rgbToHex(color)
    })

    // Generate cell grid mapping each pixel to nearest palette color
    const cells = this.generateCells(imageData, palette, gridWidth, gridHeight)

    // Count cells per color
    cells.flat().forEach((cell) => {
      const color = palette[cell.targetColorIndex - 1]
      if (color) {
        color.cellCount++
      }
    })

    return {
      id: config.id,
      name: config.name,
      sourceImageUrl: `${basePath}/${config.file}`,
      gridWidth,
      gridHeight,
      palette,
      cells,
      totalCells: gridWidth * gridHeight,
    }
  }

  /**
   * Load an image and return a promise
   */
  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
      img.src = src
    })
  }

  /**
   * Calculate grid dimensions maintaining aspect ratio
   */
  private calculateGridDimensions(
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

  /**
   * Extract RGB pixels from ImageData
   */
  private extractPixels(imageData: ImageData): RGB[] {
    const pixels: RGB[] = []
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      pixels.push({
        r: data[i]!,
        g: data[i + 1]!,
        b: data[i + 2]!,
      })
    }

    return pixels
  }

  /**
   * Median Cut color quantization algorithm with similar color merging
   */
  private medianCut(pixels: RGB[], maxColors: number): PaletteColor[] {
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

    // Average each bucket to get initial palette colors
    let palette = buckets.map((bucket, idx) => ({
      color: this.averageBucket(bucket),
      bucket,
      originalIndex: idx,
    }))

    // Merge similar colors and re-split to find more distinct colors
    palette = this.mergeSimilarColors(palette, maxColors)

    return palette.map((p) => p.color)
  }

  /**
   * Color distance threshold for merging (in RGB space)
   * Colors closer than this are considered "too similar"
   * ~30-40 is a good threshold (human perception threshold is around 2-3 JND)
   */
  private readonly COLOR_MERGE_THRESHOLD = 35

  /**
   * Calculate Euclidean distance between two colors in RGB space
   */
  private colorDistance(a: RGB, b: RGB): number {
    return Math.sqrt(Math.pow(a.r - b.r, 2) + Math.pow(a.g - b.g, 2) + Math.pow(a.b - b.b, 2))
  }

  /**
   * Merge similar colors and re-split their buckets to find more distinct colors
   */
  private mergeSimilarColors(
    palette: Array<{ color: PaletteColor; bucket: RGB[]; originalIndex: number }>,
    maxColors: number
  ): Array<{ color: PaletteColor; bucket: RGB[]; originalIndex: number }> {
    let merged = true
    let iterations = 0
    const maxIterations = 10 // Prevent infinite loops

    while (merged && iterations < maxIterations) {
      merged = false
      iterations++

      // Find the pair of colors with smallest distance
      let minDistance = Infinity
      let mergeI = -1
      let mergeJ = -1

      for (let i = 0; i < palette.length; i++) {
        for (let j = i + 1; j < palette.length; j++) {
          const dist = this.colorDistance(palette[i]!.color, palette[j]!.color)
          if (dist < minDistance) {
            minDistance = dist
            mergeI = i
            mergeJ = j
          }
        }
      }

      // If closest pair is below threshold, merge them
      if (minDistance < this.COLOR_MERGE_THRESHOLD && mergeI !== -1 && mergeJ !== -1) {
        merged = true

        // Combine buckets
        const combinedBucket = [...palette[mergeI]!.bucket, ...palette[mergeJ]!.bucket]

        // Calculate weighted average color based on bucket sizes
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

        // Remove the two merged entries (remove higher index first to preserve indices)
        palette.splice(mergeJ, 1)
        palette.splice(mergeI, 1)

        // Add the merged entry
        palette.push({
          color: mergedColor,
          bucket: combinedBucket,
          originalIndex: a.originalIndex,
        })

        // Now we have a free slot - find a new distinct color
        // Re-split the largest bucket that has good color range
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

  /**
   * Find a new distinct color by splitting the bucket with greatest color variance
   */
  private findDistinctColor(
    palette: Array<{ color: PaletteColor; bucket: RGB[]; originalIndex: number }>
  ): { color: PaletteColor; bucket: RGB[]; originalIndex: number } | null {
    // Find bucket with greatest internal variance that can be split
    let maxVariance = 0
    let bucketToSplit = -1
    let channelToSplit: 'r' | 'g' | 'b' = 'r'

    for (let i = 0; i < palette.length; i++) {
      const bucket = palette[i]!.bucket
      if (bucket.length < 4) continue // Need enough pixels to split meaningfully

      const ranges = this.getColorRanges(bucket)
      const maxRange = Math.max(ranges.r, ranges.g, ranges.b)

      // Weight by bucket size - prefer splitting larger buckets
      const variance = maxRange * Math.log(bucket.length + 1)

      if (variance > maxVariance) {
        maxVariance = variance
        bucketToSplit = i
        if (ranges.r === maxRange) channelToSplit = 'r'
        else if (ranges.g === maxRange) channelToSplit = 'g'
        else channelToSplit = 'b'
      }
    }

    if (bucketToSplit === -1 || maxVariance < 20) {
      return null // No bucket worth splitting
    }

    // Split the bucket
    const entry = palette[bucketToSplit]!
    const bucket = [...entry.bucket]
    bucket.sort((a, b) => a[channelToSplit] - b[channelToSplit])
    const mid = Math.floor(bucket.length / 2)

    const bucket1 = bucket.slice(0, mid)
    const bucket2 = bucket.slice(mid)

    // Update the original entry with one half
    entry.bucket = bucket1
    entry.color = this.averageBucket(bucket1)

    // Return the other half as a new color
    return {
      color: this.averageBucket(bucket2),
      bucket: bucket2,
      originalIndex: palette.length,
    }
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
    return {
      r: Math.round(sumR / count),
      g: Math.round(sumG / count),
      b: Math.round(sumB / count),
      index: 0, // Will be set later
      hex: '', // Will be set later
      cellCount: 0,
    }
  }

  /**
   * Convert RGB to hex string
   */
  private rgbToHex(color: RGB): string {
    const toHex = (n: number) => n.toString(16).padStart(2, '0')
    return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`
  }

  /**
   * Generate cell grid mapping each pixel to nearest palette color
   */
  private generateCells(
    imageData: ImageData,
    palette: PaletteColor[],
    width: number,
    height: number
  ): Cell[][] {
    const cells: Cell[][] = []
    const data = imageData.data

    for (let y = 0; y < height; y++) {
      const row: Cell[] = []
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4
        const pixel: RGB = {
          r: data[idx]!,
          g: data[idx + 1]!,
          b: data[idx + 2]!,
        }

        const nearestColorIndex = this.findNearestColor(pixel, palette)

        row.push({
          x,
          y,
          targetColorIndex: nearestColorIndex,
          paintedColorIndex: null,
          isCorrect: false,
        })
      }
      cells.push(row)
    }

    return cells
  }

  /**
   * Find the nearest palette color to a pixel (1-based index)
   */
  private findNearestColor(pixel: RGB, palette: PaletteColor[]): number {
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
}
