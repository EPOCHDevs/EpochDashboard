/**
 * TailwindColor enum - matches C++ Color enum from constants.h
 * Maps to frontend color schemes (Tailwind, shadcn/ui)
 * Total: 42 colors organized by category
 */
export enum TailwindColor {
  // ============================================================================
  // SEMANTIC COLORS (context-aware)
  // ============================================================================
  Default = 'Default', // Neutral/gray - default UI color
  Primary = 'Primary', // Brand/primary color
  Secondary = 'Secondary', // Secondary brand color
  Success = 'Success', // Green - success states
  Warning = 'Warning', // Yellow/orange - warning states
  Error = 'Error', // Red - error/danger states
  Info = 'Info', // Blue - informational states
  Muted = 'Muted', // Muted/subdued color
  Accent = 'Accent', // Accent color for highlights

  // ============================================================================
  // GRAYSCALE SPECTRUM
  // ============================================================================
  Slate = 'Slate', // Cool gray (Tailwind: slate)
  Gray = 'Gray', // Neutral gray (Tailwind: gray)
  Zinc = 'Zinc', // Warm gray (Tailwind: zinc)
  Neutral = 'Neutral', // True gray (Tailwind: neutral)
  Stone = 'Stone', // Warm beige-gray (Tailwind: stone)
  Black = 'Black', // Pure black
  White = 'White', // Pure white

  // ============================================================================
  // COOL COLORS
  // ============================================================================
  Blue = 'Blue', // Standard blue
  Sky = 'Sky', // Light blue (Tailwind: sky)
  Cyan = 'Cyan', // Cyan/aqua
  Teal = 'Teal', // Teal (blue-green)
  Indigo = 'Indigo', // Indigo (deep blue)
  Violet = 'Violet', // Violet (blue-purple)
  Purple = 'Purple', // Purple

  // ============================================================================
  // WARM COLORS
  // ============================================================================
  Red = 'Red', // Standard red
  Rose = 'Rose', // Pink-red (Tailwind: rose)
  Pink = 'Pink', // Pink
  Fuchsia = 'Fuchsia', // Magenta-pink (Tailwind: fuchsia)
  Orange = 'Orange', // Orange
  Amber = 'Amber', // Amber (orange-yellow, Tailwind: amber)
  Yellow = 'Yellow', // Yellow
  Lime = 'Lime', // Lime green (Tailwind: lime)

  // ============================================================================
  // GREEN SPECTRUM
  // ============================================================================
  Green = 'Green', // Standard green
  Emerald = 'Emerald', // Emerald green (Tailwind: emerald)

  // ============================================================================
  // METALLIC/SPECIAL
  // ============================================================================
  Gold = 'Gold', // Gold
  Silver = 'Silver', // Silver
  Bronze = 'Bronze', // Bronze
}

/**
 * Utility function to convert TailwindColor enum to string
 */
export function tailwindColorToString(color: TailwindColor): string {
  return color.toString()
}

/**
 * Utility function to parse string to TailwindColor enum
 * Returns undefined if string doesn't match any color
 */
export function stringToTailwindColor(str: string): TailwindColor | undefined {
  if (Object.values(TailwindColor).includes(str as TailwindColor)) {
    return str as TailwindColor
  }
  return undefined
}
