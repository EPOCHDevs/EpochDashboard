// Define series types locally since they're not in proto yet
export enum ChartDataSeriesType {
  DEFAULT = 0,
  STRATEGY = 1,
  BENCHMARK = 2,
  LONG = 3,
  SHORT = 4,
  CASH = 5
}

// Modern TradingView-inspired dark theme colors
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

// Chart color configuration based on series type
export const CHART_COLOR_CONFIG = {
  [ChartDataSeriesType.STRATEGY]: {
    default: tailwindColors.territory.cyan,
    area: '#00E9FE0D', // Cyan with opacity
    line: tailwindColors.territory.cyan,
    marker: tailwindColors.territory.cyan,
  },
  [ChartDataSeriesType.BENCHMARK]: {
    default: tailwindColors.territory.blue,
    area: '#12222E', // Dark blue area
    line: tailwindColors.territory.blue,
    marker: tailwindColors.territory.blue,
  },
  [ChartDataSeriesType.LONG]: {
    default: tailwindColors.territory.success,
    area: '#0D1E20', // Dark green area
    line: tailwindColors.territory.success,
    marker: tailwindColors.territory.success,
  },
  [ChartDataSeriesType.SHORT]: {
    default: tailwindColors.secondary.red,
    area: '#1A1423', // Dark red area
    line: tailwindColors.secondary.red,
    marker: tailwindColors.secondary.red,
  },
  [ChartDataSeriesType.CASH]: {
    default: tailwindColors.secondary.yellow,
    area: '#FFE5001A', // Yellow with opacity
    line: tailwindColors.secondary.yellow,
    marker: tailwindColors.secondary.yellow,
  },
  [ChartDataSeriesType.DEFAULT]: {
    default: tailwindColors.primary.seaGreen,
    area: '#19B0B10D', // Sea green with opacity
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

// Pie chart color palette
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

// Box plot colors
export const BOXPLOT_COLOR_CONFIG = {
  fillColor: 'rgba(0, 233, 254, 0.1)', // Cyan with low opacity
  lineColor: tailwindColors.territory.cyan,
  whiskerColor: tailwindColors.territory.cyan,
  stemColor: tailwindColors.territory.cyan,
  medianColor: tailwindColors.primary.white,
}

// Histogram colors
export const HISTOGRAM_COLOR_CONFIG = {
  primary: tailwindColors.territory.cyan,
  secondary: tailwindColors.territory.blue,
  border: 'rgba(255, 255, 255, 0.1)',
}

// XRange colors
export const XRANGE_COLOR_PALETTE = [
  tailwindColors.territory.success,
  tailwindColors.secondary.red,
  tailwindColors.territory.cyan,
  tailwindColors.territory.blue,
  tailwindColors.secondary.yellow,
]

// Dashboard theme colors - TradingView style
export const DASHBOARD_THEME = {
  background: {
    primary: tailwindColors.primary.bluishDarkGray, // Main background #131722
    secondary: tailwindColors.secondary.darkGray, // Card background #161a25
    tertiary: tailwindColors.primary.bluishDarkGrayLight, // Panel background #1e222d
    card: 'rgba(30, 34, 45, 0.95)', // Semi-transparent card
    hover: 'rgba(41, 98, 255, 0.08)', // Blue hover state
  },
  text: {
    primary: '#d1d4dc', // Primary text - slightly warm white
    secondary: '#787b86', // Secondary text - muted
    tertiary: '#434651', // Tertiary text - more muted
    disabled: 'rgba(120, 123, 134, 0.5)', // Disabled state
  },
  border: {
    primary: '#2a2e39', // Main borders
    secondary: 'rgba(42, 46, 57, 0.5)', // Subtle borders
    focus: tailwindColors.territory.blue, // Focus state
  },
  status: {
    success: tailwindColors.territory.success,
    warning: tailwindColors.territory.warning,
    error: tailwindColors.territory.alert,
    info: tailwindColors.territory.cyan,
  },
  position: {
    long: '#00FE2A',   // Bright green for long positions
    short: '#F63C6B',  // Bright red for short positions
  },
  gradient: {
    primary: 'linear-gradient(180deg, #131722 0%, #0c0e15 100%)', // Vertical gradient
    secondary: 'linear-gradient(135deg, #1e222d 0%, #131722 100%)', // Panel gradient
    overlay: 'linear-gradient(180deg, transparent 0%, rgba(12, 14, 21, 0.7) 100%)',
  },
}

// Highcharts theme configuration
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
  CHART_COLOR_CONFIG,
  HEATMAP_CHART_COLOR_CONFIG,
  PIE_CHART_COLOR_PALETTE,
  BOXPLOT_COLOR_CONFIG,
  HISTOGRAM_COLOR_CONFIG,
  XRANGE_COLOR_PALETTE,
  DASHBOARD_THEME,
  HIGHCHARTS_THEME,
}