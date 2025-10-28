import { CardColor, CardRenderType, ColorMap } from '../types/SelectorTypes'
import ms from 'ms'

// Map CardColor enum to Tailwind CSS classes
export function getColorClasses(color: CardColor): { bg: string; text: string } {
  switch (color) {
    case CardColor.Success:
      return { bg: 'bg-territory-success/20', text: 'text-territory-success' }
    case CardColor.Error:
      return { bg: 'bg-territory-alert/20', text: 'text-territory-alert' }
    case CardColor.Warning:
      return { bg: 'bg-territory-warning/20', text: 'text-territory-warning' }
    case CardColor.Info:
      return { bg: 'bg-accent/20', text: 'text-accent' }
    case CardColor.Primary:
      return { bg: 'bg-primary/20', text: 'text-primary' }
    case CardColor.Default:
    default:
      return { bg: 'bg-muted/30', text: 'text-muted-foreground' }
  }
}

// Determine the color for a badge based on color_map and value
export function getBadgeColor(value: any, colorMap?: ColorMap): CardColor {
  if (!colorMap) return CardColor.Default

  const valueStr = String(value).toLowerCase()

  // Check each color mapping
  for (const [color, values] of Object.entries(colorMap)) {
    if (values && Array.isArray(values)) {
      // Case-insensitive comparison
      if (values.some(v => String(v).toLowerCase() === valueStr)) {
        return color as CardColor
      }
    }
  }

  return CardColor.Default
}

// Format a value based on its render type
export function formatCardValue(value: any, renderType: CardRenderType): string {
  if (value === null || value === undefined) {
    return '-'
  }

  switch (renderType) {
    case CardRenderType.Integer:
      // Integer formatting (no decimal places)
      return value.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      })

    case CardRenderType.Decimal:
      // Decimal formatting (2 decimal places)
      return value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })

    case CardRenderType.Monetary:
      return formatCurrency(value)

    case CardRenderType.Percent:
      return formatPercentage(value)

    case CardRenderType.Duration:
      // Convert nanoseconds to milliseconds, then format with ms library
      try {
        const milliseconds = value / 1_000_000
        return ms(milliseconds, { long: false }) // Compact format: "2d 5h 30m"
      } catch {
        return String(value)
      }

    case CardRenderType.Timestamp:
      try {
        // Backend sends timestamps as ISO 8601 strings with nanosecond precision
        // e.g., "2023-12-29 19:40:00.000000000Z"
        // JavaScript Date can parse this directly (ignores extra precision beyond milliseconds)
        const date = new Date(value)

        // Validate the date is valid
        if (isNaN(date.getTime())) {
          return String(value)
        }

        return date.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      } catch {
        return String(value)
      }

    case CardRenderType.Boolean:
      if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No'
      }
      return String(value)

    case CardRenderType.Badge:
    case CardRenderType.Text:
    default:
      return String(value)
  }
}

// Get display text for badges (uppercase, etc.)
export function getBadgeDisplayText(value: any): string {
  return String(value).toUpperCase()
}

// Format number values with currency symbol
export function formatCurrency(value: number): string {
  const abs = Math.abs(value)
  const formatted = `$${abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  return value >= 0 ? formatted : `-${formatted}`
}

// Format percentage values
export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`
}

// Check if a value is numeric
export function isNumeric(value: any): boolean {
  return typeof value === 'number' && !isNaN(value)
}

// Get icon class based on icon name (for future Icon render type support)
export function getIconClass(iconName: string): string {
  // Placeholder for icon mapping
  return iconName
}
