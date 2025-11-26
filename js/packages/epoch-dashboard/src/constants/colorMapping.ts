import { TailwindColor } from '../types/TailwindColors'

/**
 * Maps TailwindColor enum values to hex color codes
 * Uses Tailwind CSS color palette (500-weight as default)
 * Reference: https://tailwindcss.com/docs/customizing-colors
 */
export const TAILWIND_COLOR_HEX_MAP: Record<TailwindColor, string> = {
  // Semantic Colors
  [TailwindColor.Default]: '#6B7280', // gray-500
  [TailwindColor.Primary]: '#3B82F6', // blue-500
  [TailwindColor.Secondary]: '#8B5CF6', // violet-500
  [TailwindColor.Success]: '#10B981', // green-500
  [TailwindColor.Warning]: '#F59E0B', // amber-500
  [TailwindColor.Error]: '#EF4444', // red-500
  [TailwindColor.Info]: '#3B82F6', // blue-500
  [TailwindColor.Muted]: '#9CA3AF', // gray-400
  [TailwindColor.Accent]: '#F59E0B', // amber-500

  // Grayscale Spectrum
  [TailwindColor.Slate]: '#64748B', // slate-500
  [TailwindColor.Gray]: '#6B7280', // gray-500
  [TailwindColor.Zinc]: '#71717A', // zinc-500
  [TailwindColor.Neutral]: '#737373', // neutral-500
  [TailwindColor.Stone]: '#78716C', // stone-500
  [TailwindColor.Black]: '#000000', // pure black
  [TailwindColor.White]: '#FFFFFF', // pure white

  // Cool Colors
  [TailwindColor.Blue]: '#3B82F6', // blue-500
  [TailwindColor.Sky]: '#0EA5E9', // sky-500
  [TailwindColor.Cyan]: '#06B6D4', // cyan-500
  [TailwindColor.Teal]: '#14B8A6', // teal-500
  [TailwindColor.Indigo]: '#6366F1', // indigo-500
  [TailwindColor.Violet]: '#8B5CF6', // violet-500
  [TailwindColor.Purple]: '#A855F7', // purple-500

  // Warm Colors
  [TailwindColor.Red]: '#EF4444', // red-500
  [TailwindColor.Rose]: '#F43F5E', // rose-500
  [TailwindColor.Pink]: '#EC4899', // pink-500
  [TailwindColor.Fuchsia]: '#D946EF', // fuchsia-500
  [TailwindColor.Orange]: '#F97316', // orange-500
  [TailwindColor.Amber]: '#F59E0B', // amber-500
  [TailwindColor.Yellow]: '#EAB308', // yellow-500
  [TailwindColor.Lime]: '#84CC16', // lime-500

  // Green Spectrum
  [TailwindColor.Green]: '#10B981', // green-500
  [TailwindColor.Emerald]: '#10B981', // emerald-500

  // Metallic/Special
  [TailwindColor.Gold]: '#F59E0B', // amber-500 (closest to gold)
  [TailwindColor.Silver]: '#94A3B8', // slate-400 (closest to silver)
  [TailwindColor.Bronze]: '#92400E', // amber-900 (closest to bronze)
}

/**
 * Get hex color from TailwindColor enum
 * @param color - TailwindColor enum value
 * @returns Hex color code
 */
export function getTailwindColorHex(color: TailwindColor): string {
  return TAILWIND_COLOR_HEX_MAP[color]
}

/**
 * Get hex color from string (case-insensitive)
 * Handles both C++ enum string and TypeScript enum
 * @param colorStr - Color name as string (e.g., "Blue", "Success", "Amber")
 * @returns Hex color code, or default gray if not found
 */
export function getTailwindColorHexFromString(colorStr: string): string {
  // Try direct enum lookup first
  const enumValue = colorStr as TailwindColor
  if (enumValue in TAILWIND_COLOR_HEX_MAP) {
    return TAILWIND_COLOR_HEX_MAP[enumValue]
  }

  // Try case-insensitive lookup
  const upperStr = colorStr.toUpperCase()
  for (const [key, value] of Object.entries(TAILWIND_COLOR_HEX_MAP)) {
    if (key.toUpperCase() === upperStr) {
      return value
    }
  }

  // Default to gray if not found
  return '#6B7280'
}

/**
 * Get semi-transparent color for zone/background highlighting
 * @param color - TailwindColor enum value
 * @param alpha - Alpha transparency (0.0 to 1.0), default 0.1
 * @returns RGBA color string
 */
export function getTailwindColorRgba(color: TailwindColor, alpha: number = 0.1): string {
  const hex = getTailwindColorHex(color)
  return hexToRgba(hex, alpha)
}

/**
 * Get semi-transparent color from string
 * @param colorStr - Color name as string
 * @param alpha - Alpha transparency (0.0 to 1.0), default 0.1
 * @returns RGBA color string
 */
export function getTailwindColorRgbaFromString(colorStr: string, alpha: number = 0.1): string {
  const hex = getTailwindColorHexFromString(colorStr)
  return hexToRgba(hex, alpha)
}

/**
 * Convert hex color to RGBA
 * @param hex - Hex color code (e.g., "#3B82F6")
 * @param alpha - Alpha transparency (0.0 to 1.0)
 * @returns RGBA color string (e.g., "rgba(59, 130, 246, 0.1)")
 */
function hexToRgba(hex: string, alpha: number): string {
  // Remove # if present
  const cleanHex = hex.replace('#', '')

  // Parse RGB components
  const r = parseInt(cleanHex.substring(0, 2), 16)
  const g = parseInt(cleanHex.substring(2, 4), 16)
  const b = parseInt(cleanHex.substring(4, 6), 16)

  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
