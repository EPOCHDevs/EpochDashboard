import { SeriesConfig } from "../../../../types/TradeAnalyticsTypes"
import { DataType, Table } from "apache-arrow"
import { SeriesFlagsOptions, PointOptionsObject } from "highcharts"
import { getTailwindColorHexFromString } from "../../../../constants/colorMapping"
import { getLucideIconNameFromString } from "../../../../constants/iconMapping"
import { generateLucideDataUrl } from "../../../../constants/lucideIconSvgPaths"

export const FLAG_PLOT_KIND_DATA_KEYS = ["index", "value"]

interface generateFlagPlotKindSeriesOptionsProps {
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
}

/**
 * FlagSchema configuration from C++ backend
 */
interface FlagSchemaConfig {
  flagTitle?: string
  flagText?: string
  flagTextIsTemplate?: boolean
  flagIcon?: string
  flagColor?: string
}

/**
 * Flag point data structure
 */
interface FlagPointData extends PointOptionsObject {
  x: number
  title: string  // Short label on the flag marker
  text: string   // Tooltip text shown on hover
}

/**
 * Checks if a value should trigger a flag display
 * - Boolean: only true shows a flag
 * - Other types: any non-null/non-undefined value shows a flag
 */
function shouldShowFlag(value: unknown): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === 'boolean') return value === true
  if (typeof value === 'number') return !isNaN(value)
  if (typeof value === 'string') return value.length > 0
  return true
}

/**
 * Substitutes template placeholders with actual column values
 * Template format: {placeholder_name} where placeholder_name is a key in templateDataMapping
 */
function substituteTemplate(
  template: string,
  data: Table,
  templateDataMapping: Record<string, string>,
  rowIndex: number
): string {
  return template.replace(/\{(\w+)\}/g, (match, placeholderKey) => {
    const columnRef = templateDataMapping[placeholderKey]
    if (!columnRef) return match

    const column = data.getChild(columnRef)
    if (!column) return match

    const value = column.get(rowIndex)
    return value !== null && value !== undefined ? String(value) : ''
  })
}

/**
 * Short labels for Lucide icons that work well in Highcharts flag markers
 * Uses Unicode symbols that approximate the icon appearance
 */
const ICON_SHORT_LABELS: Record<string, string> = {
  // Charts & Analysis
  'bar-chart': '▊',
  'bar-chart-2': '▊',
  'bar-chart-3': '▊',
  'line-chart': '📈',
  'area-chart': '▲',
  'pie-chart': '◐',
  'candlestick-chart': '▌',
  'activity': '~',
  'trending-up': '↗',
  'trending-down': '↘',

  // Financial
  'dollar-sign': '$',
  'euro': '€',
  'pound-sterling': '£',
  'bitcoin': '₿',
  'percent': '%',
  'coins': '●',
  'wallet': '▣',

  // Alerts & Notifications
  'bell': '🔔',
  'bell-ring': '🔔',
  'alert-circle': '⚠',
  'alert-triangle': '⚠',
  'alert-octagon': '⛔',
  'info': 'ℹ',
  'help-circle': '?',

  // Actions & Signals
  'zap': '⚡',
  'play': '▶',
  'pause': '⏸',
  'square': '■',
  'flag': '⚑',
  'bookmark': '▼',
  'target': '◎',

  // Arrows
  'arrow-up': '↑',
  'arrow-down': '↓',
  'arrow-left': '←',
  'arrow-right': '→',
  'arrow-left-right': '↔',
  'arrow-up-down': '↕',
  'chevrons-up': '⇑',
  'chevrons-down': '⇓',
  'move-up': '⬆',
  'move-down': '⬇',

  // Status
  'check-circle': '✓',
  'check': '✓',
  'x': '✕',
  'x-circle': '✕',
  'circle': '○',
  'circle-dot': '◉',
  'minus': '−',
  'plus': '+',

  // Trading
  'layers': '≡',
  'split': '⋮',
  'shuffle': '⤨',
  'repeat': '↻',
  'refresh-cw': '↻',

  // Time
  'calendar': '📅',
  'clock': '⏱',
  'timer': '⏱',
  'hourglass': '⏳',

  // Data
  'database': '▤',
  'table': '▦',
  'filter': '▼',
  'search': '🔍',

  // Settings
  'settings': '⚙',
  'sliders': '☰',

  // Shapes
  'star': '★',
  'heart': '♥',
  'eye': '👁',

  // News & Documents
  'newspaper': '📰',
  'file-text': '📄',

  // Misc
  'globe': '🌐',
  'lock': '🔒',
  'unlock': '🔓',
  'shield': '🛡',
  'sparkles': '✨',
}

/**
 * Get short label for icon display in Highcharts flag markers
 * Uses Lucide icon mapping to find the appropriate symbol
 */
function getIconLabel(iconName: string): string {
  // First, try to get the Lucide icon name
  const lucideIconName = getLucideIconNameFromString(iconName)

  if (lucideIconName && ICON_SHORT_LABELS[lucideIconName]) {
    return ICON_SHORT_LABELS[lucideIconName]
  }

  // Direct lookup in our short labels
  const lowerName = iconName.toLowerCase()
  if (ICON_SHORT_LABELS[lowerName]) {
    return ICON_SHORT_LABELS[lowerName]
  }

  // Fallback to first character
  return iconName.charAt(0).toUpperCase()
}

/**
 * Get the flag shape - either an SVG data URL for Lucide icons or a default shape
 * @param iconName - The icon name from C++ backend (e.g., "TrendingUp", "AlertTriangle")
 * @param color - The color for the icon (hex)
 * @returns Shape string for Highcharts - either a data URL or 'squarepin'
 */
function getFlagShape(iconName: string | undefined, color: string): string {
  if (!iconName) return 'squarepin'

  // Convert C++ icon name to Lucide kebab-case name
  const lucideIconName = getLucideIconNameFromString(iconName)
  if (!lucideIconName) return 'squarepin'

  // Generate SVG data URL for the icon
  // Use white stroke for visibility on colored background
  const dataUrl = generateLucideDataUrl(lucideIconName, '#FFFFFF', 20)
  if (dataUrl) {
    return dataUrl
  }

  return 'squarepin'
}

export const generateFlagPlotKindSeriesOptions = ({
  data,
  seriesConfig,
}: generateFlagPlotKindSeriesOptionsProps): SeriesFlagsOptions[] => {
  const valueColumnRef = seriesConfig.dataMapping?.value || "value"
  const indexColumnRef = seriesConfig.dataMapping?.index || "index"

  const indexColumn = data?.getChild(indexColumnRef)
  const valueColumn = data?.getChild(valueColumnRef)

  if (!valueColumn || !indexColumn) {
    const availableColumns = data?.schema?.fields?.map(f => f.name) || []
    console.warn(
      `FlagPlotKindHandler [${seriesConfig.id}]: Missing columns.\n` +
      `  - index: "${indexColumnRef}" → ${indexColumn ? 'found' : 'NOT FOUND'}\n` +
      `  - value: "${valueColumnRef}" → ${valueColumn ? 'found' : 'NOT FOUND'}\n` +
      `  - Available columns: [${availableColumns.join(', ')}]`
    )
    return [{
      type: "flags",
      name: seriesConfig.name,
      data: [],
    } as SeriesFlagsOptions]
  }

  // Extract FlagSchema configuration
  const config = (seriesConfig.configOptions || {}) as FlagSchemaConfig
  const isTemplate = config.flagTextIsTemplate === true
  const templateDataMapping = (seriesConfig as any).templateDataMapping as Record<string, string> | undefined

  // Determine flag appearance
  let flagTitle: string
  let flagText: string
  let flagColor: string
  let flagIcon: string | undefined

  if (config.flagTitle || config.flagText || config.flagColor) {
    flagTitle = config.flagTitle || ""
    flagText = config.flagText || ""
    flagIcon = config.flagIcon
    flagColor = config.flagColor
      ? getTailwindColorHexFromString(config.flagColor)
      : "#6B7280"
  } else {
    // Legacy fallback
    const idLower = seriesConfig.id.toLowerCase()
    if (idLower === "long") {
      flagTitle = "LONG"
      flagText = "Long Position"
      flagColor = "#00FE2A"
    } else if (idLower === "short") {
      flagTitle = "SHORT"
      flagText = "Short Position"
      flagColor = "#F63C6B"
    } else {
      flagTitle = seriesConfig.name || "Flag"
      flagText = ""
      flagColor = "#6B7280"
    }
  }

  // Build flag data points
  const flagData: FlagPointData[] = []

  for (let i = 0; i < valueColumn.length; i++) {
    const value = valueColumn.get(i)
    const timestamp = indexColumn.get(i)

    if (!shouldShowFlag(value)) continue

    // Handle template substitution
    let displayText = flagText
    if (isTemplate && flagText && data && templateDataMapping) {
      displayText = substituteTemplate(flagText, data, templateDataMapping, i)
    }

    // Icon label for the flag marker
    const iconLabel = flagIcon ? getIconLabel(flagIcon) : flagTitle.charAt(0).toUpperCase()

    // Build HTML tooltip text
    const tooltipText = `<b>${flagTitle}</b><br/>${displayText}`

    flagData.push({
      x: timestamp,
      title: iconLabel,  // Short icon/label shown on chart
      text: tooltipText, // HTML shown in tooltip on hover
    })
  }

  // Determine flag shape - use SVG icon if available, otherwise squarepin
  const flagShape = getFlagShape(flagIcon, flagColor)
  const useSvgIcon = flagShape.startsWith('url(')

  const seriesOptions: SeriesFlagsOptions = {
    type: "flags",
    name: seriesConfig.name,
    id: seriesConfig.id,
    data: flagData,
    yAxis: seriesConfig.yAxis ?? 0,
    zIndex: seriesConfig.zIndex ?? 10,
    onSeries: seriesConfig.linkedTo || undefined,
    shape: flagShape as any, // Can be 'squarepin' or 'url(data:image/svg+xml;base64,...)'
    color: flagColor,
    fillColor: useSvgIcon ? 'transparent' : flagColor, // Transparent for SVG icons
    lineColor: useSvgIcon ? 'transparent' : flagColor,
    lineWidth: useSvgIcon ? 0 : 1,
    width: useSvgIcon ? 20 : undefined, // Fixed width for SVG icons
    height: useSvgIcon ? 20 : undefined, // Fixed height for SVG icons
    style: {
      color: '#FFFFFF',
    },
    // Flags are display-only markers - no visual interaction feedback
    // but enableMouseTracking is needed for tooltip to show at timestamps with only flags
    allowPointSelect: false,
    cursor: 'default',
    enableMouseTracking: true,
    stickyTracking: true,
    states: {
      hover: {
        enabled: false, // No visual hover effect
      },
      inactive: {
        enabled: false,
      },
    },
    // Note: Tooltip content is handled by the chart-level formatter in tooltipConfig.ts
    // which manually queries flag series to display inline with other indicators
    accessibility: {
      exposeAsGroupOnly: true,
      description: `${seriesConfig.name} flags`,
    },
  }

  return [seriesOptions]
}
