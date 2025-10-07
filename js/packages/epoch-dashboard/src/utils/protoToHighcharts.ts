import {
  ChartDef,
  AxisDef,
  Band,
  StraightLineDef,
  Point,
  Line,
  BarData,
  PieData,
  PieDataDef,
  Scalar,
  AxisType,
  StackType
} from '../types/proto'
import { mapAxisTypeToHighcharts, mapDashStyleToHighcharts, CHART_COLORS } from './chartHelpers'
import { getSeriesColor, getSeriesLineColor, DASHBOARD_THEME } from './chartTheme'

// Scalar to number conversion
// Proto: Scalar is oneof { string_value, integer_value, decimal_value, percent_value, etc. }
const scalarToNumber = (scalar: Scalar, defaultValue: number = 0): number => {
  // Check oneof fields in proto order
  if (scalar.integerValue !== undefined && scalar.integerValue !== null) {
    return typeof scalar.integerValue === 'number' ? scalar.integerValue : Number(scalar.integerValue)
  }
  if (scalar.decimalValue !== undefined && scalar.decimalValue !== null) {
    return scalar.decimalValue
  }
  if (scalar.percentValue !== undefined && scalar.percentValue !== null) {
    return scalar.percentValue
  }
  if (scalar.monetaryValue !== undefined && scalar.monetaryValue !== null) {
    return scalar.monetaryValue
  }
  if (scalar.timestampMs !== undefined && scalar.timestampMs !== null) {
    return typeof scalar.timestampMs === 'number' ? scalar.timestampMs : Number(scalar.timestampMs)
  }
  if (scalar.durationMs !== undefined && scalar.durationMs !== null) {
    return typeof scalar.durationMs === 'number' ? scalar.durationMs : Number(scalar.durationMs)
  }
  // null_value or string_value/boolean_value return default
  return defaultValue
}

// Constants using theme colors
export const PLOT_BAND_COLORS = {
  x: 'rgba(0, 233, 254, 0.1)',  // Cyan with opacity
  y: 'rgba(0, 254, 42, 0.1)'     // Success green with opacity
}

export const PLOT_LINE_COLOR = DASHBOARD_THEME.border.primary
export const CROSSHAIR_COLOR = DASHBOARD_THEME.border.primary
export const TOOLTIP_BG_COLOR = 'rgba(14, 18, 31, 0.95)'
export const TOOLTIP_BORDER_COLOR = '#1E88E5'

// Convert ChartDef to base Highcharts options
export const convertChartDefToHighcharts = (chartDef: ChartDef | undefined, chartType: string, height: number = 500): any => {
  return {
    chart: {
      backgroundColor: 'transparent',
      spacing: [10, 10, 8, 10],
      animation: false,
      height,
      type: chartType,
      style: {
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }
    },
    title: {
      text: chartDef?.title || '',
      align: 'left',
      margin: 17,
      style: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: '18px',
        fontWeight: '400'
      }
    },
    credits: {
      enabled: false
    },
    accessibility: {
      enabled: false
    }
  }
}

// Convert AxisDef to Highcharts axis options
export const convertAxisDefToHighcharts = (
  axisDef: AxisDef | undefined,
  isXAxis: boolean = true,
  defaultType: AxisType = AxisType.AxisLinear
): any => {
  const axisType = axisDef?.type || defaultType
  const highchartsType = mapAxisTypeToHighcharts(axisType, isXAxis)

  return {
    type: highchartsType,
    title: {
      text: axisDef?.label || '',
      style: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: '14px',
        fontWeight: '500'
      },
      margin: 25
    },
    // Only set categories for category axis type, not for datetime/linear/log axes
    ...(axisType === AxisType.AxisCategory && axisDef?.categories ? { categories: axisDef.categories } : {}),
    gridLineWidth: 1,
    gridLineColor: 'rgba(255, 255, 255, 0.05)',
    gridLineDashStyle: 'LongDash',
    lineColor: isXAxis ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
    lineWidth: isXAxis ? 1 : 0,
    tickColor: 'rgba(255, 255, 255, 0.1)',
    labels: {
      overflow: 'justify',
      allowOverlap: false,
      style: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: '12px',
        fontWeight: '500'
      }
    },
    opposite: false,
    logarithmBase: axisType === AxisType.AxisLogarithmic ? 10 : undefined
  }
}

// Convert Band array to Highcharts plot bands
// Proto: Band { from: Scalar, to: Scalar }
export const convertBandsToHighcharts = (bands: Band[] | undefined | null, isXAxis: boolean = true): any[] => {
  if (!bands) return []

  const convertedBands = bands.map(band => ({
    from: band.from ? scalarToNumber(band.from) : 0,
    to: band.to ? scalarToNumber(band.to) : 0,
    color: isXAxis ? PLOT_BAND_COLORS.x : PLOT_BAND_COLORS.y
  }))

  return convertedBands
}

// Convert StraightLineDef array to Highcharts plot lines
export const convertStraightLinesToHighcharts = (lines: StraightLineDef[] | undefined, isXAxis: boolean = true): any[] => {
  if (!lines || lines.length === 0) return []

  return lines
    .filter(line => isXAxis ? line.vertical : !line.vertical)
    .map(line => ({
      value: line.value,
      color: '#FF6B6B', // Red color for better visibility
      width: 2, // Thicker line
      dashStyle: 'Dash',
      label: {
        text: line.title || '',
        style: {
          color: '#FF6B6B',
          fontSize: '11px',
          fontWeight: 'bold'
        },
        align: isXAxis ? 'center' : 'right',
        verticalAlign: 'top',
        y: -5
      },
      zIndex: 10 // Higher z-index to ensure it's on top
    }))
}

// Convert Points to Highcharts data format
// Proto: Point { x: int64 (timestamp ms), y: double }
// Output: [timestamp, value] - ALWAYS
export const convertPointsToHighcharts = (
  points: Point[] | undefined | null,
  xAxisType?: AxisType
): [number, number][] => {
  if (!points) return []

  return points.map(point => [
    // x: int64 timestamp in milliseconds (may be Long object from protobufjs)
    typeof point.x === 'number' ? point.x : Number(point.x),
    // y: double numeric value
    point.y || 0
  ])
}

// Get crosshair configuration
export const getCrosshairConfig = (axisType: AxisType | undefined, isXAxis: boolean = true): any => {
  return {
    width: 1,
    color: CROSSHAIR_COLOR,
    dashStyle: 'Solid',
    snap: isXAxis,
    label: {
      enabled: true,
      backgroundColor: TOOLTIP_BORDER_COLOR,
      borderColor: TOOLTIP_BORDER_COLOR,
      borderRadius: 3,
      borderWidth: 0,
      padding: 5,
      style: {
        color: '#FFFFFF',
        fontSize: '12px',
        fontWeight: 'normal'
      },
      formatter: function(value: any) {
        if (axisType === AxisType.AxisDateTime && typeof value === 'number') {
          const date = new Date(value)
          return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })
        } else if (axisType === AxisType.AxisCategory) {
          return String(value)
        } else if (typeof value === 'number') {
          return isXAxis ? value.toFixed(2) : formatYAxisValue(value)
        }
        return String(value)
      }
    }
  }
}

// Format Y-axis values
export const formatYAxisValue = (value: number): string => {
  if (Math.abs(value) < 1) {
    return value.toFixed(4)
  } else if (Math.abs(value) < 100) {
    return value.toFixed(2)
  } else if (Math.abs(value) < 10000) {
    return value.toFixed(1)
  } else {
    return value.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }
}

// Get default tooltip configuration
export const getTooltipConfig = (enabled: boolean = true): any => {
  return {
    enabled,
    backgroundColor: TOOLTIP_BG_COLOR,
    borderColor: TOOLTIP_BORDER_COLOR,
    borderRadius: 4,
    borderWidth: 1,
    style: {
      color: '#FFFFFF',
      fontSize: '12px'
    },
    shared: true,
    useHTML: true
  }
}

// Get legend configuration
export const getLegendConfig = (seriesCount: number): any => {
  return {
    enabled: seriesCount > 1,
    align: 'left',
    verticalAlign: 'bottom',
    layout: 'horizontal',
    itemDistance: 15,
    itemMarginTop: 0,
    margin: 31,
    symbolWidth: 0,
    itemStyle: {
      color: 'rgba(255, 255, 255, 0.9)',
      fontSize: '12px',
      fontWeight: '400',
      textTransform: 'capitalize'
    },
    itemHoverStyle: {
      color: 'rgba(255, 255, 255, 1)',
      textDecoration: 'underline'
    },
    useHTML: true,
    labelFormatter: function(this: any) {
      return `<span class="inline-block w-2 h-2 mr-2" style="background-color: ${this.color};"></span> ${this.name}`
    }
  }
}

// Get zoom configuration
export const getZoomConfig = (enableZoom: boolean = true, zoomType: 'x' | 'y' | 'xy' = 'x'): any => {
  if (!enableZoom) return {}

  return {
    zoomType,
    panning: {
      enabled: true,
      type: zoomType
    },
    panKey: 'shift',
    resetZoomButton: {
      theme: {
        fill: 'rgba(255, 255, 255, 0.1)',
        stroke: 'rgba(255, 255, 255, 0.3)',
        style: {
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '10px'
        },
        states: {
          hover: {
            fill: 'rgba(255, 255, 255, 0.2)',
            stroke: 'rgba(255, 255, 255, 0.5)',
            style: {
              color: 'rgba(255, 255, 255, 0.9)'
            }
          }
        }
      },
      position: {
        align: 'right',
        x: -10,
        y: 10
      },
      relativeTo: 'plot'
    }
  }
}

// Convert Line proto to series
// Proto: Line { data: Point[], name: string, dash_style?: DashStyle, line_width?: uint32 }
export const convertLineToSeries = (
  line: Line,
  index: number,
  xAxisType?: AxisType
): any => {
  // Use series name to detect type and get appropriate color
  const color = getChartColor(index)

  return {
    type: 'line',
    name: line.name || `Series ${index + 1}`,
    data: convertPointsToHighcharts(line.data, xAxisType),
    color: color,
    lineWidth: line.lineWidth || 2,
    dashStyle: mapDashStyleToHighcharts(line.dashStyle),
    marker: {
      enabled: false,
      radius: 4,
      states: {
        hover: {
          enabled: true,
          radius: 5
        }
      }
    }
  }
}

// Get chart color by index
export const getChartColor = (index: number): string => {
  const colors = Object.values(CHART_COLORS)
  return colors[index % colors.length]
}

// Convert stacking configuration
export const getStackingConfig = (stacked: boolean | undefined, stackType: StackType | undefined): string | undefined => {
  if (!stacked) return undefined

  switch (stackType) {
    case StackType.StackTypePercent:
      return 'percent'
    case StackType.StackTypeNormal:
    default:
      return 'normal'
  }
}

// Get boost configuration for performance
export const getBoostConfig = (): any => {
  return {
    useGPUTranslations: true,
    usePreallocated: true
  }
}

// Convert area data to series
// Proto: AreaDef uses Line[] for areas field
export const convertAreaToSeries = (
  area: Line,
  index: number,
  xAxisType?: AxisType
): any => {
  return {
    type: 'area',
    name: area.name || `Series ${index + 1}`,
    data: convertPointsToHighcharts(area.data, xAxisType),
    color: getChartColor(index),
    fillOpacity: 0.3, // Lower opacity for better visibility
    lineWidth: area.lineWidth || 2,
    dashStyle: mapDashStyleToHighcharts(area.dashStyle),
    marker: {
      enabled: false,
      radius: 3,
      states: {
        hover: {
          enabled: true,
          radius: 5
        }
      }
    }
  }
}

// Convert bar data to series
export const convertBarDataToSeries = (
  dataset: BarData,
  index: number,
  chartType: 'column' | 'bar'
): any => {
  return {
    type: chartType,
    name: dataset.name || `Series ${index + 1}`,
    data: dataset.values || [],
    color: getChartColor(index),
    ...(dataset.stack ? { stack: dataset.stack } : {})
  }
}

// Professional muted colors for pie charts
const PIE_COLORS = [
  '#5B8DB8',  // Muted blue
  '#7BA7BC',  // Muted teal
  '#9BC1C5',  // Soft cyan
  '#98A4B3',  // Blue gray
  '#B5B8C2',  // Light gray blue
  '#8B95A7',  // Steel blue
  '#6D89A1',  // Slate blue
  '#A7B8C4',  // Pale blue gray
  '#8FA1B3',  // Dusty blue
  '#7A8FA5'   // Stone blue
]

// Convert pie data to series
export const convertPieDataToSeries = (
  pieDataDef: PieDataDef,
  _seriesIndex: number
): any => {
  const pieData = (pieDataDef.points || []).map((point: PieData, pointIndex: number) => ({
    name: point.name || `Slice ${pointIndex + 1}`,
    y: point.y || 0,
    color: PIE_COLORS[pointIndex % PIE_COLORS.length]
  }))

  const isDonut = pieDataDef.innerSize && pieDataDef.innerSize !== '0%'

  return {
    type: 'pie',
    name: pieDataDef.name || 'Data',
    data: pieData,
    size: pieDataDef.size || '75%',  // Increased from 60% to 75%
    innerSize: pieDataDef.innerSize || '0%',
    dataLabels: {
      enabled: true,
      format: '{point.name}: {point.percentage:.1f}%',
      distance: isDonut ? -30 : 25,
      style: {
        color: '#FFFFFF',  // Full opacity white
        fontSize: '12px',  // Slightly larger
        fontWeight: '400',
        textOutline: '1px contrast'
      },
      connectorColor: '#FFFFFF',  // Full opacity white
      connectorWidth: 1
    }
  }
}