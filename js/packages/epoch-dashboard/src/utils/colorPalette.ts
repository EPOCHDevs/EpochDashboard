/**
 * Color Palette Utility
 * Generates beautiful, distinguishable colors for large datasets (500+ items)
 */

// Curated palette of 50 beautiful, distinct colors optimized for dark backgrounds
// MAXIMUM saturation and brightness - pure, vivid colors with NO opacity reduction
const CURATED_COLORS = [
  // Pure Electric Blues
  '#5599FF', '#3388FF', '#0099FF', '#00DDFF', '#00EEFF',
  // Pure Neon Cyans
  '#00FFFF', '#11FFFF', '#22FFEE', '#33FFDD', '#44FFCC',
  // Pure Neon Greens & Limes
  '#88FF00', '#99FF11', '#AAFF22', '#BBFF33', '#CCFF44',
  // Pure Bright Yellows
  '#FFFF00', '#FFEE00', '#FFDD00', '#FFCC00', '#FFBB00',
  // Pure Golds & Oranges
  '#FFAA00', '#FF9900', '#FF8800', '#FF7700', '#FF6600',
  // Pure Hot Oranges & Reds
  '#FF5500', '#FF4400', '#FF3300', '#FF2200', '#FF1100',
  // Pure Vivid Reds & Pinks
  '#FF0044', '#FF0066', '#FF0088', '#FF00AA', '#FF00CC',
  // Pure Electric Magentas & Purples
  '#FF00FF', '#EE00FF', '#DD00FF', '#CC00FF', '#BB00FF',
  // Pure Indigos & Violets
  '#AA00FF', '#9900FF', '#8800FF', '#7700FF', '#6600FF',
  // Pure Blues & Cyans
  '#5500FF', '#4400FF', '#3300FF', '#2200FF', '#1100FF',
  // Additional Pure Bright Colors
  '#00FF88', '#00FF66', '#00FF44', '#00FF22', '#00FF00'
]

/**
 * Generates a color using HSL (Hue, Saturation, Lightness)
 * for indices beyond the curated palette
 * PURE, VIVID colors - 100% saturation, maximum brightness
 */
function generateHSLColor(index: number, total: number): string {
  // Use golden ratio for optimal hue distribution
  const goldenRatio = 0.618033988749895

  // Calculate hue with golden ratio distribution
  const hue = (index * goldenRatio * 360) % 360

  // MAXIMUM saturation - always 100% for pure, vivid colors
  const saturation = 100

  // Maximum lightness 60-75% for pure bright colors on dark backgrounds
  const lightness = 60 + ((index * 5) % 16)

  return `hsl(${hue.toFixed(0)}, ${saturation}%, ${lightness}%)`
}

/**
 * Generates an array of N distinct, beautiful colors
 * Handles up to 1000+ colors with good visual distinction
 */
export function generateColorPalette(count: number): string[] {
  const colors: string[] = []

  for (let i = 0; i < count; i++) {
    if (i < CURATED_COLORS.length) {
      // Use curated colors first
      colors.push(CURATED_COLORS[i])
    } else {
      // Generate additional colors using HSL
      colors.push(generateHSLColor(i - CURATED_COLORS.length, count - CURATED_COLORS.length))
    }
  }

  return colors
}

/**
 * Gets a single color for a given index
 * Optimized for performance when you don't need the full palette
 */
export function getColorAtIndex(index: number): string {
  if (index < CURATED_COLORS.length) {
    return CURATED_COLORS[index]
  }
  return generateHSLColor(index - CURATED_COLORS.length, 1000)
}

/**
 * Generates a gradient between two colors
 * Useful for sequential data visualization
 */
export function generateGradientPalette(
  startColor: string,
  endColor: string,
  steps: number
): string[] {
  // Parse hex colors to RGB
  const parseHex = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 }
  }

  const start = parseHex(startColor)
  const end = parseHex(endColor)

  const colors: string[] = []
  for (let i = 0; i < steps; i++) {
    const ratio = i / (steps - 1)
    const r = Math.round(start.r + ratio * (end.r - start.r))
    const g = Math.round(start.g + ratio * (end.g - start.g))
    const b = Math.round(start.b + ratio * (end.b - start.b))
    colors.push(`rgb(${r}, ${g}, ${b})`)
  }

  return colors
}

/**
 * Default color palette for pie charts (optimized for readability)
 */
export const PIE_CHART_COLORS = CURATED_COLORS

/**
 * Categorical color palette (high contrast, distinct colors)
 */
export const CATEGORICAL_COLORS = [
  '#1E88E5', '#66BB6A', '#FFA726', '#EF5350', '#AB47BC',
  '#42A5F5', '#81C784', '#FFB300', '#F44336', '#9C27B0',
  '#29B6F6', '#8BC34A', '#FF9800', '#E91E63', '#7E57C2',
  '#4FC3F7', '#C0CA33', '#FB8C00', '#EC407A', '#673AB7',
]
