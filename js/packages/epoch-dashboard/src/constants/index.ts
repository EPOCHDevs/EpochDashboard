// Define series types locally since they're not in proto yet
export enum ChartDataSeriesType {
  DEFAULT = 0,
  STRATEGY = 1,
  BENCHMARK = 2,
  LONG = 3,
  SHORT = 4,
  CASH = 5
}

// Helper to get CSS variable value
const getCSSVariable = (name: string): string => {
  if (typeof window === 'undefined') {
    // SSR fallback - return default dark theme colors
    const defaults: Record<string, string> = {
      '--chart-1': '189 100% 42%',  // cyan
      '--chart-2': '207 90% 54%',   // blue
      '--chart-3': '174 42% 47%',   // green
      '--chart-4': '0 84% 60%',     // red
      '--chart-5': '36 100% 50%',   // orange
      '--accent': '189 100% 42%',   // cyan
      '--success': '174 42% 47%',   // green
      '--destructive': '0 84% 60%', // red
      '--warning': '36 100% 50%',   // orange
      '--background': '222 47% 11%', // dark gray
      '--card': '222 47% 13%',      // darker gray
      '--foreground': '0 0% 98%',   // white
      '--muted-foreground': '215 20% 65%', // ash grey
      '--border': '217 33% 18%',    // mild cement grey
    }
    return defaults[name] || '0 0% 0%'
  }
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || '0 0% 0%'
}

// Convert HSL CSS variable to hex color
const hslToHex = (h: number, s: number, l: number): string => {
  l /= 100
  const a = s * Math.min(l, 1 - l) / 100
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

// Get theme-aware color from CSS variable
const getThemeColor = (varName: string, fallback: string = '#000000'): string => {
  const hslValue = getCSSVariable(varName)
  if (!hslValue || hslValue === '0 0% 0%') return fallback

  const [h, s, l] = hslValue.split(' ').map(v => parseFloat(v.replace('%', '')))
  if (isNaN(h) || isNaN(s) || isNaN(l)) return fallback

  return hslToHex(h, s, l)
}

// Modern TradingView-inspired dark theme colors (kept for backward compatibility)
const tailwindColors = {
  primary: {
    jetBlack: '#000000',
    white: '#FFFFFF',
    seaGreen: '#26a69a', // More muted teal
    royalBlue: '#2962ff', // Vibrant blue
    bluishDarkGray: '#131722', // TradingView dark background
    bluishDarkGrayLight: '#1e222d', // Slightly lighter panel
  },
  secondary: {
    black: '#0c0e15', // Ultra dark
    darkGray: '#161a25', // Card background
    ashGrey: '#787b86', // Muted text
    mildAshGrey: '#434651', // Secondary text
    cementGrey: '#F7F7F7',
    mildCementGrey: '#2a2e39', // Border/divider
    red: '#f23645', // TradingView red
    mildBlack: '#080808',
    purple: '#9c27b0', // Material purple
    pink: '#e91e63', // Material pink
    yellow: '#ff9800', // Material orange
  },
  territory: {
    success: '#26a69a', // TradingView green
    warning: '#ff9800', // Warning orange
    alert: '#f23645', // Alert red
    cyan: '#00bcd4', // Cyan accent
    blue: '#2196f3', // Material blue
  },
}

// Theme-aware colors that read from CSS variables
export const getChartColors = () => ({
  strategy: getThemeColor('--chart-1', tailwindColors.territory.cyan),
  benchmark: getThemeColor('--chart-2', tailwindColors.territory.blue),
  long: getThemeColor('--chart-3', tailwindColors.territory.success),
  short: getThemeColor('--chart-4', tailwindColors.secondary.red),
  cash: getThemeColor('--chart-5', tailwindColors.secondary.yellow),
  accent: getThemeColor('--accent', tailwindColors.territory.cyan),
  success: getThemeColor('--success', tailwindColors.territory.success),
  destructive: getThemeColor('--destructive', tailwindColors.secondary.red),
  warning: getThemeColor('--warning', tailwindColors.secondary.yellow),
  foreground: getThemeColor('--foreground', tailwindColors.primary.white),
  background: getThemeColor('--background', tailwindColors.primary.bluishDarkGray),
  card: getThemeColor('--card', tailwindColors.secondary.darkGray),
  mutedForeground: getThemeColor('--muted-foreground', tailwindColors.secondary.ashGrey),
  border: getThemeColor('--border', tailwindColors.secondary.mildCementGrey),
})

// Map series names to types for auto-detection
export const SERIES_NAME_MAPPING: { [key: string]: ChartDataSeriesType } = {
  'strategy': ChartDataSeriesType.STRATEGY,
  'benchmark': ChartDataSeriesType.BENCHMARK,
  'long': ChartDataSeriesType.LONG,
  'short': ChartDataSeriesType.SHORT,
  'cash': ChartDataSeriesType.CASH,
  'spy': ChartDataSeriesType.BENCHMARK,
  'portfolio': ChartDataSeriesType.STRATEGY,
}

// Chart color configuration based on series type (theme-aware)
export const getChartColorConfig = () => {
  const colors = getChartColors()
  return {
    [ChartDataSeriesType.STRATEGY]: {
      default: colors.strategy,
      area: `${colors.strategy}0D`, // With opacity
      line: colors.strategy,
      marker: colors.strategy,
    },
    [ChartDataSeriesType.BENCHMARK]: {
      default: colors.benchmark,
      area: `${colors.benchmark}1A`, // With opacity
      line: colors.benchmark,
      marker: colors.benchmark,
    },
    [ChartDataSeriesType.LONG]: {
      default: colors.long,
      area: `${colors.long}1A`, // With opacity
      line: colors.long,
      marker: colors.long,
    },
    [ChartDataSeriesType.SHORT]: {
      default: colors.short,
      area: `${colors.short}1A`, // With opacity
      line: colors.short,
      marker: colors.short,
    },
    [ChartDataSeriesType.CASH]: {
      default: colors.cash,
      area: `${colors.cash}1A`, // With opacity
      line: colors.cash,
      marker: colors.cash,
    },
    [ChartDataSeriesType.DEFAULT]: {
      default: colors.accent,
      area: `${colors.accent}0D`, // With opacity
      line: colors.accent,
      marker: colors.accent,
    },
  }
}

// Legacy export for backward compatibility
export const CHART_COLOR_CONFIG = {
  [ChartDataSeriesType.STRATEGY]: {
    default: tailwindColors.territory.cyan,
    area: '#00E9FE0D',
    line: tailwindColors.territory.cyan,
    marker: tailwindColors.territory.cyan,
  },
  [ChartDataSeriesType.BENCHMARK]: {
    default: tailwindColors.territory.blue,
    area: '#12222E',
    line: tailwindColors.territory.blue,
    marker: tailwindColors.territory.blue,
  },
  [ChartDataSeriesType.LONG]: {
    default: tailwindColors.territory.success,
    area: '#0D1E20',
    line: tailwindColors.territory.success,
    marker: tailwindColors.territory.success,
  },
  [ChartDataSeriesType.SHORT]: {
    default: tailwindColors.secondary.red,
    area: '#1A1423',
    line: tailwindColors.secondary.red,
    marker: tailwindColors.secondary.red,
  },
  [ChartDataSeriesType.CASH]: {
    default: tailwindColors.secondary.yellow,
    area: '#FFE5001A',
    line: tailwindColors.secondary.yellow,
    marker: tailwindColors.secondary.yellow,
  },
  [ChartDataSeriesType.DEFAULT]: {
    default: tailwindColors.primary.seaGreen,
    area: '#19B0B10D',
    line: tailwindColors.primary.seaGreen,
    marker: tailwindColors.primary.seaGreen,
  },
}

// Heatmap color gradient configuration
export const HEATMAP_CHART_COLOR_CONFIG = [
  [0.0, '#F63C6B'], // Red for negative/low values
  [0.1, '#C9355D'], // Dark red
  [0.2, '#9C2E4F'], // Darker red
  [0.3, '#6F2741'], // Even darker red
  [0.4, '#422033'], // Near black red
  [0.5, '#161923'], // Dark neutral
  [0.6, '#0D2E30'], // Dark green tint
  [0.7, '#0A4A4D'], // Dark green
  [0.8, '#06666A'], // Medium green
  [0.9, '#038287'], // Light green
  [1.0, '#00FE2A'], // Success green for positive/high values
]

// Pie chart color palette (theme-aware)
export const getPieChartColorPalette = () => {
  const colors = getChartColors()
  return [
    colors.accent,
    colors.benchmark,
    colors.long,
    colors.short,
    colors.cash,
    tailwindColors.secondary.purple,
    tailwindColors.secondary.pink,
    colors.success,
    tailwindColors.primary.royalBlue,
    colors.warning,
  ]
}

// Legacy export for backward compatibility
export const PIE_CHART_COLOR_PALETTE = [
  tailwindColors.territory.cyan,
  tailwindColors.territory.blue,
  tailwindColors.territory.success,
  tailwindColors.secondary.red,
  tailwindColors.secondary.yellow,
  tailwindColors.secondary.purple,
  tailwindColors.secondary.pink,
  tailwindColors.primary.seaGreen,
  tailwindColors.primary.royalBlue,
  tailwindColors.territory.warning,
]

// Box plot colors (theme-aware)
export const getBoxplotColorConfig = () => {
  const colors = getChartColors()
  return {
    fillColor: `${colors.accent}1A`, // With low opacity
    lineColor: colors.accent,
    whiskerColor: colors.accent,
    stemColor: colors.accent,
    medianColor: colors.foreground,
  }
}

// Legacy export for backward compatibility
export const BOXPLOT_COLOR_CONFIG = {
  fillColor: 'rgba(0, 233, 254, 0.1)',
  lineColor: tailwindColors.territory.cyan,
  whiskerColor: tailwindColors.territory.cyan,
  stemColor: tailwindColors.territory.cyan,
  medianColor: tailwindColors.primary.white,
}

// Histogram colors (theme-aware)
export const getHistogramColorConfig = () => {
  const colors = getChartColors()
  return {
    primary: colors.accent,
    secondary: colors.benchmark,
    border: `${colors.border}33`, // With opacity
  }
}

// Legacy export for backward compatibility
export const HISTOGRAM_COLOR_CONFIG = {
  primary: tailwindColors.territory.cyan,
  secondary: tailwindColors.territory.blue,
  border: 'rgba(255, 255, 255, 0.1)',
}

// XRange colors (theme-aware)
export const getXRangeColorPalette = () => {
  const colors = getChartColors()
  return [
    colors.long,
    colors.short,
    colors.accent,
    colors.benchmark,
    colors.cash,
  ]
}

// Legacy export for backward compatibility
export const XRANGE_COLOR_PALETTE = [
  tailwindColors.territory.success,
  tailwindColors.secondary.red,
  tailwindColors.territory.cyan,
  tailwindColors.territory.blue,
  tailwindColors.secondary.yellow,
]

// Dashboard theme colors (theme-aware)
export const getDashboardTheme = () => {
  const colors = getChartColors()
  return {
    background: {
      primary: colors.background,
      secondary: colors.card,
      tertiary: colors.card,
      card: `${colors.card}F2`, // With opacity
      hover: `${colors.accent}14`, // With opacity
    },
    text: {
      primary: colors.foreground,
      secondary: colors.mutedForeground,
      tertiary: colors.mutedForeground,
      disabled: `${colors.mutedForeground}80`, // With opacity
    },
    border: {
      primary: colors.border,
      secondary: `${colors.border}80`, // With opacity
      focus: colors.accent,
    },
    status: {
      success: colors.success,
      warning: colors.warning,
      error: colors.destructive,
      info: colors.accent,
    },
    position: {
      long: colors.long,
      short: colors.short,
    },
    gradient: {
      primary: `linear-gradient(180deg, ${colors.background} 0%, ${colors.card} 100%)`,
      secondary: `linear-gradient(135deg, ${colors.card} 0%, ${colors.background} 100%)`,
      overlay: `linear-gradient(180deg, transparent 0%, ${colors.background}B3 100%)`,
    },
  }
}

// Legacy export for backward compatibility
export const DASHBOARD_THEME = {
  background: {
    primary: tailwindColors.primary.bluishDarkGray,
    secondary: tailwindColors.secondary.darkGray,
    tertiary: tailwindColors.primary.bluishDarkGrayLight,
    card: 'rgba(30, 34, 45, 0.95)',
    hover: 'rgba(41, 98, 255, 0.08)',
  },
  text: {
    primary: '#d1d4dc',
    secondary: '#787b86',
    tertiary: '#434651',
    disabled: 'rgba(120, 123, 134, 0.5)',
  },
  border: {
    primary: '#2a2e39',
    secondary: 'rgba(42, 46, 57, 0.5)',
    focus: tailwindColors.territory.blue,
  },
  status: {
    success: tailwindColors.territory.success,
    warning: tailwindColors.territory.warning,
    error: tailwindColors.territory.alert,
    info: tailwindColors.territory.cyan,
  },
  position: {
    long: '#00FE2A',
    short: '#F63C6B',
  },
  gradient: {
    primary: 'linear-gradient(180deg, #131722 0%, #0c0e15 100%)',
    secondary: 'linear-gradient(135deg, #1e222d 0%, #131722 100%)',
    overlay: 'linear-gradient(180deg, transparent 0%, rgba(12, 14, 21, 0.7) 100%)',
  },
  gridLine: 'rgba(42, 46, 57, 0.3)',
  tooltip: {
    background: 'rgba(30, 34, 45, 0.95)',
    text: '#d1d4dc',
  },
}

// Highcharts theme configuration (theme-aware)
export const getHighchartsTheme = () => {
  const colors = getChartColors()
  const palette = getPieChartColorPalette()

  return {
    colors: palette,
    chart: {
      backgroundColor: 'transparent',
      style: {
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      },
    },
    title: {
      style: {
        color: colors.foreground,
        fontSize: '16px',
        fontWeight: '600',
      },
    },
    subtitle: {
      style: {
        color: colors.mutedForeground,
        fontSize: '14px',
      },
    },
    xAxis: {
      gridLineColor: `${colors.border}33`, // With opacity
      labels: {
        style: {
          color: colors.mutedForeground,
          fontSize: '12px',
        },
      },
      lineColor: colors.border,
      tickColor: colors.border,
      title: {
        style: {
          color: colors.mutedForeground,
          fontSize: '12px',
        },
      },
    },
    yAxis: {
      gridLineColor: `${colors.border}33`, // With opacity
      labels: {
        style: {
          color: colors.mutedForeground,
          fontSize: '12px',
        },
      },
      lineColor: colors.border,
      tickColor: colors.border,
      title: {
        style: {
          color: colors.mutedForeground,
          fontSize: '12px',
        },
      },
    },
    tooltip: {
      backgroundColor: `${colors.card}F2`, // With opacity
      borderColor: colors.accent,
      borderRadius: 8,
      style: {
        color: colors.foreground,
        fontSize: '12px',
      },
    },
    legend: {
      itemStyle: {
        color: colors.mutedForeground,
        fontSize: '12px',
      },
      itemHoverStyle: {
        color: colors.foreground,
      },
      itemHiddenStyle: {
        color: `${colors.mutedForeground}4D`, // With opacity
      },
    },
    plotOptions: {
      series: {
        borderWidth: 0,
        dataLabels: {
          color: colors.foreground,
          style: {
            fontSize: '11px',
            fontWeight: '500',
          },
        },
        marker: {
          lineColor: null,
        },
      },
    },
    credits: {
      enabled: false,
    },
    drilldown: {
      activeAxisLabelStyle: {
        color: colors.foreground,
      },
      activeDataLabelStyle: {
        color: colors.foreground,
      },
    },
  }
}

// Legacy export for backward compatibility
export const HIGHCHARTS_THEME = {
  colors: PIE_CHART_COLOR_PALETTE,
  chart: {
    backgroundColor: 'transparent',
    style: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
  },
  title: {
    style: {
      color: tailwindColors.primary.white,
      fontSize: '16px',
      fontWeight: '600',
    },
  },
  subtitle: {
    style: {
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: '14px',
    },
  },
  xAxis: {
    gridLineColor: 'rgba(255, 255, 255, 0.05)',
    labels: {
      style: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '12px',
      },
    },
    lineColor: 'rgba(255, 255, 255, 0.1)',
    tickColor: 'rgba(255, 255, 255, 0.1)',
    title: {
      style: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: '12px',
      },
    },
  },
  yAxis: {
    gridLineColor: 'rgba(255, 255, 255, 0.05)',
    labels: {
      style: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '12px',
      },
    },
    lineColor: 'rgba(255, 255, 255, 0.1)',
    tickColor: 'rgba(255, 255, 255, 0.1)',
    title: {
      style: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: '12px',
      },
    },
  },
  tooltip: {
    backgroundColor: 'rgba(14, 18, 31, 0.95)',
    borderColor: tailwindColors.territory.cyan,
    borderRadius: 8,
    style: {
      color: tailwindColors.primary.white,
      fontSize: '12px',
    },
  },
  legend: {
    itemStyle: {
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: '12px',
    },
    itemHoverStyle: {
      color: tailwindColors.primary.white,
    },
    itemHiddenStyle: {
      color: 'rgba(255, 255, 255, 0.3)',
    },
  },
  plotOptions: {
    series: {
      borderWidth: 0,
      dataLabels: {
        color: tailwindColors.primary.white,
        style: {
          fontSize: '11px',
          fontWeight: '500',
        },
      },
      marker: {
        lineColor: null,
      },
    },
  },
  credits: {
    enabled: false,
  },
  drilldown: {
    activeAxisLabelStyle: {
      color: tailwindColors.primary.white,
    },
    activeDataLabelStyle: {
      color: tailwindColors.primary.white,
    },
  },
}

export default {
  // Legacy exports (backward compatibility)
  CHART_COLOR_CONFIG,
  HEATMAP_CHART_COLOR_CONFIG,
  PIE_CHART_COLOR_PALETTE,
  BOXPLOT_COLOR_CONFIG,
  HISTOGRAM_COLOR_CONFIG,
  XRANGE_COLOR_PALETTE,
  DASHBOARD_THEME,
  HIGHCHARTS_THEME,
  // Theme-aware exports (recommended)
  getChartColors,
  getChartColorConfig,
  getPieChartColorPalette,
  getBoxplotColorConfig,
  getHistogramColorConfig,
  getXRangeColorPalette,
  getDashboardTheme,
  getHighchartsTheme,
}