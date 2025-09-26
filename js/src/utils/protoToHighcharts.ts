import {
  ChartDef,
  AxisDef,
  Band,
  StraightLineDef,
  Point,
  Line,
  AxisType,
  StackType
} from '../types/proto'
import { getScalarNumericValue } from './protoHelpers'
import { mapAxisTypeToHighcharts, mapDashStyleToHighcharts, CHART_COLORS } from './chartHelpers'

// Constants
export const PLOT_BAND_COLORS = {
  x: 'rgba(30, 136, 229, 0.1)',  // Light blue
  y: 'rgba(76, 175, 80, 0.1)'     // Light green
}

export const PLOT_LINE_COLOR = 'rgba(255, 255, 255, 0.3)'
export const CROSSHAIR_COLOR = 'rgba(255, 255, 255, 0.3)'
export const TOOLTIP_BG_COLOR = 'rgba(0, 0, 0, 0.85)'
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
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: '14px',
        fontWeight: '500'
      },
      margin: 25
    },
    categories: axisDef?.categories,
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
        color: 'rgba(255, 255, 255, 0.3)',
        fontSize: '12px',
        fontWeight: '500'
      }
    },
    opposite: axisDef?.opposite || false,
    min: axisDef?.min,
    max: axisDef?.max,
    logarithmBase: axisType === AxisType.AxisLogarithmic ? 10 : undefined
  }
}

// Convert Band array to Highcharts plot bands
export const convertBandsToHighcharts = (bands: Band[] | undefined, isXAxis: boolean = true): any[] => {
  if (!bands || bands.length === 0) return []

  return bands.map(band => ({
    from: band.from,
    to: band.to,
    color: isXAxis ? PLOT_BAND_COLORS.x : PLOT_BAND_COLORS.y,
    label: band.label ? {
      text: band.label,
      style: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '11px'
      }
    } : undefined
  }))
}

// Convert StraightLineDef array to Highcharts plot lines
export const convertStraightLinesToHighcharts = (lines: StraightLineDef[] | undefined, isXAxis: boolean = true): any[] => {
  if (!lines || lines.length === 0) return []

  return lines
    .filter(line => isXAxis ? line.vertical : !line.vertical)
    .map(line => ({
      value: line.value,
      color: PLOT_LINE_COLOR,
      width: 1,
      dashStyle: 'LongDash',
      label: {
        text: line.title || '',
        style: {
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '11px'
        },
        align: isXAxis ? 'center' : 'right'
      },
      zIndex: 5
    }))
}

// Convert Points to Highcharts data format
export const convertPointsToHighcharts = (
  points: Point[] | undefined,
  xAxisType: AxisType | undefined
): any[] => {
  if (!points || points.length === 0) return []

  return points.map(point => {
    const x = getScalarNumericValue(point.x)
    const y = getScalarNumericValue(point.y)

    // Handle different axis types
    switch (xAxisType) {
      case AxisType.AxisCategory:
        // For category axis, return just y value or [index, y]
        return typeof x === 'number' ? [x, y] : y
      case AxisType.AxisDateTime: {
        // Ensure timestamp is in milliseconds
        let xValue = x
        if (xValue > 0 && xValue < 32503680000) {
          xValue = xValue * 1000  // Convert seconds to ms
        }
        return [xValue, y]
      }
      case AxisType.AxisLinear:
      case AxisType.AxisLogarithmic:
      default:
        return [x, y]
    }
  })
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
export const convertLineToSeries = (
  line: Line,
  index: number,
  xAxisType: AxisType | undefined,
  name?: string
): any => {
  return {
    type: 'line',
    name: line.name || name || `Series ${index + 1}`,
    data: convertPointsToHighcharts(line.data, xAxisType),
    color: getChartColor(index),
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
export interface AreaData {
  name?: string
  data?: any[]
  fillOpacity?: number
  lineWidth?: number
  dashStyle?: any
}

export const convertAreaToSeries = (
  area: AreaData,
  index: number,
  _xAxisType: AxisType | undefined
): any => {
  return {
    type: 'area',
    name: area.name || `Series ${index + 1}`,
    data: area.data || [],
    color: getChartColor(index),
    fillOpacity: area.fillOpacity || 0.3,
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
export interface BarDataset {
  name?: string
  values?: number[]
  stack?: string
}

export const convertBarDataToSeries = (
  dataset: BarDataset,
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

// Convert pie data to series
export interface PieDataDefType {
  name?: string
  points?: Array<{ name?: string; y?: number }>
  size?: string
  innerSize?: string
}

export const convertPieDataToSeries = (
  pieDataDef: PieDataDefType,
  _seriesIndex: number
): any => {
  const pieData = (pieDataDef.points || []).map((point, pointIndex) => ({
    name: point.name || `Slice ${pointIndex + 1}`,
    y: point.y || 0,
    color: getChartColor(pointIndex)
  }))

  const isDonut = pieDataDef.innerSize && pieDataDef.innerSize !== '0%'

  return {
    type: 'pie',
    name: pieDataDef.name || 'Data',
    data: pieData,
    size: pieDataDef.size || '60%',
    innerSize: pieDataDef.innerSize || '0%',
    dataLabels: {
      enabled: true,
      format: '{point.name}: {point.percentage:.1f}%',
      distance: isDonut ? -30 : 30,
      style: {
        color: '#FFFFFF',
        fontSize: '12px',
        textOutline: '1px contrast'
      },
      connectorColor: '#FFFFFF',
      connectorWidth: 1
    }
  }
}