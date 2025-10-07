import { DASHBOARD_THEME, CHART_COLOR_CONFIG, ChartDataSeriesType } from '../constants'

export { DASHBOARD_THEME }

// Get series color based on series type or index
export function getSeriesColor(seriesType: ChartDataSeriesType | number): string {
  if (typeof seriesType === 'number' && seriesType in ChartDataSeriesType) {
    return CHART_COLOR_CONFIG[seriesType as ChartDataSeriesType]?.default || CHART_COLOR_CONFIG[ChartDataSeriesType.DEFAULT].default
  }

  // Fallback to default colors if index is provided
  const colors = [
    CHART_COLOR_CONFIG[ChartDataSeriesType.DEFAULT].default,
    CHART_COLOR_CONFIG[ChartDataSeriesType.STRATEGY].default,
    CHART_COLOR_CONFIG[ChartDataSeriesType.BENCHMARK].default,
    CHART_COLOR_CONFIG[ChartDataSeriesType.LONG].default,
    CHART_COLOR_CONFIG[ChartDataSeriesType.SHORT].default,
    CHART_COLOR_CONFIG[ChartDataSeriesType.CASH].default,
  ]

  return colors[seriesType % colors.length]
}

// Get line color for series
export function getSeriesLineColor(seriesType: ChartDataSeriesType | number): string {
  if (typeof seriesType === 'number' && seriesType in ChartDataSeriesType) {
    return CHART_COLOR_CONFIG[seriesType as ChartDataSeriesType]?.line || CHART_COLOR_CONFIG[ChartDataSeriesType.DEFAULT].line
  }
  return getSeriesColor(seriesType)
}

// Apply Highcharts theme
export function applyHighchartsTheme(options: any): any {
  return {
    ...options,
    chart: {
      ...options.chart,
      backgroundColor: DASHBOARD_THEME.background,
      style: {
        fontFamily: 'system-ui, -apple-system, sans-serif',
      },
    },
    title: {
      ...options.title,
      style: {
        color: DASHBOARD_THEME.text.primary,
      },
    },
    xAxis: {
      ...options.xAxis,
      gridLineColor: DASHBOARD_THEME.gridLine,
      labels: {
        style: {
          color: DASHBOARD_THEME.text.secondary,
        },
      },
      lineColor: DASHBOARD_THEME.border,
      tickColor: DASHBOARD_THEME.border,
    },
    yAxis: {
      ...options.yAxis,
      gridLineColor: DASHBOARD_THEME.gridLine,
      labels: {
        style: {
          color: DASHBOARD_THEME.text.secondary,
        },
      },
      title: {
        style: {
          color: DASHBOARD_THEME.text.secondary,
        },
      },
    },
    legend: {
      ...options.legend,
      itemStyle: {
        color: DASHBOARD_THEME.text.secondary,
      },
      itemHoverStyle: {
        color: DASHBOARD_THEME.text.primary,
      },
    },
    tooltip: {
      ...options.tooltip,
      backgroundColor: DASHBOARD_THEME.tooltip.background,
      style: {
        color: DASHBOARD_THEME.tooltip.text,
      },
    },
  }
}

// Create themed chart options
export function createThemedChartOptions(baseOptions: any): any {
  return applyHighchartsTheme(baseOptions)
}