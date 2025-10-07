import { getChartColors } from './index'

// Theme-aware Trade Analytics Plot Kind Color Palette
export const getTradeAnalyticsPlotKindColorPalette = () => {
  const colors = getChartColors()
  return [
    colors.benchmark,    // Blue
    colors.short,        // Red
    colors.long,         // Green
    colors.warning,      // Yellow/Orange
    "#9333ea",          // Purple (keep as is)
    "#db2777",          // Pink (keep as is)
    colors.accent,      // Cyan
    colors.warning,     // Orange
    "#0d9488",          // Teal (keep as is)
    "#7c2d12",          // Brown (keep as is)
  ]
}

// Legacy export for backward compatibility
export const TRADE_ANALYTICS_PLOT_KIND_COLOR_PALETTE = [
  "#2563eb", // Blue
  "#dc2626", // Red
  "#16a34a", // Green
  "#ca8a04", // Yellow
  "#9333ea", // Purple
  "#db2777", // Pink
  "#0891b2", // Cyan
  "#ea580c", // Orange
  "#0d9488", // Teal
  "#7c2d12", // Brown
]

// Theme-aware plot styles
export const getTradeAnalyticsPlotStyles = () => {
  const colors = getChartColors()
  return {
    flag: {
      shape: "squarepin" as const,
      width: 16,
      fillColor: colors.accent,
      color: colors.accent,
      lineWidth: 1,
      textColor: colors.foreground,
      hoverColor: colors.accent,
    },
  }
}

// Legacy export for backward compatibility
export const TRADE_ANALYTICS_PLOT_STYLES = {
  flag: {
    shape: "squarepin" as const,
    width: 16,
    fillColor: "#2196F3",
    color: "#2196F3",
    lineWidth: 1,
    textColor: "#FFFFFF",
    hoverColor: "#1976D2",
  },
}