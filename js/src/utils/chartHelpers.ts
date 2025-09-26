import { AxisType, DashStyle } from '../types/proto'

// Map DashStyle enum to Highcharts string values
export const mapDashStyleToHighcharts = (dashStyle: DashStyle | undefined): string => {
  switch (dashStyle) {
    case DashStyle.Solid:
      return 'Solid'
    case DashStyle.ShortDash:
      return 'ShortDash'
    case DashStyle.ShortDot:
      return 'ShortDot'
    case DashStyle.ShortDashDot:
      return 'ShortDashDot'
    case DashStyle.ShortDashDotDot:
      return 'ShortDashDotDot'
    case DashStyle.Dot:
      return 'Dot'
    case DashStyle.Dash:
      return 'Dash'
    case DashStyle.LongDash:
      return 'LongDash'
    case DashStyle.DashDot:
      return 'DashDot'
    case DashStyle.LongDashDot:
      return 'LongDashDot'
    case DashStyle.LongDashDotDot:
      return 'LongDashDotDot'
    case DashStyle.DashStyleUnspecified:
    default:
      return 'Solid'
  }
}

// Map AxisType enum to Highcharts axis type
export const mapAxisTypeToHighcharts = (
  axisType: AxisType | undefined,
  isXAxis = false
): string => {
  switch (axisType) {
    case AxisType.AxisLinear:
      return 'linear'
    case AxisType.AxisLogarithmic:
      return 'logarithmic'
    case AxisType.AxisDateTime:
      return 'datetime'
    case AxisType.AxisCategory:
      return 'category'
    case AxisType.AxisUnspecified:
    default:
      // Default to datetime for x-axis, linear for y-axis
      return isXAxis ? 'datetime' : 'linear'
  }
}

// DEPRECATED: Use protoToHighcharts.ts functions instead
// Kept for backward compatibility only
export const getDefaultEpochChartOptions = (): any => {
  return {
    chart: {
      backgroundColor: 'transparent',
      spacing: [10, 10, 8, 10],
      animation: false,
      height: 500,
      style: {
        fontFamily: 'system-ui, -apple-system, sans-serif'
      },
      zoomType: 'x',
      panning: {
        enabled: true,
        type: 'x'
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
    },
    boost: {
      useGPUTranslations: true,
      usePreallocated: true
    },
    accessibility: {
      enabled: false
    },
    credits: {
      enabled: false
    },
    title: {
      align: 'left',
      margin: 17,
      style: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: '18px',
        fontWeight: '400'
      }
    },
    legend: {
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
    },
    plotOptions: {
      series: {
        marker: {
          enabled: false
        },
        animation: false
      },
      line: {
        animation: false,
        crisp: true
      }
    },
    xAxis: {
      gridLineWidth: 1,
      gridLineColor: 'rgba(255, 255, 255, 0.05)',
      gridLineDashStyle: 'LongDash',
      lineColor: 'rgba(255, 255, 255, 0.1)',
      tickColor: 'rgba(255, 255, 255, 0.1)',
      title: {
        style: {
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '14px',
          fontWeight: '500'
        },
        margin: 25
      },
      labels: {
        overflow: 'justify',
        allowOverlap: false,
        style: {
          color: 'rgba(255, 255, 255, 0.3)',
          fontSize: '12px',
          fontWeight: '500'
        }
      }
    },
    yAxis: {
      gridLineWidth: 1,
      gridLineColor: 'rgba(255, 255, 255, 0.05)',
      gridLineDashStyle: 'LongDash',
      lineWidth: 0,
      opposite: false,
      title: {
        style: {
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '14px',
          fontWeight: '500'
        },
        margin: 25
      },
      labels: {
        overflow: 'justify',
        allowOverlap: false,
        style: {
          color: 'rgba(255, 255, 255, 0.3)',
          fontSize: '12px',
          fontWeight: '500'
        }
      }
    },
    tooltip: {
      enabled: true,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      borderColor: '#1E88E5',
      borderRadius: 4,
      borderWidth: 1,
      style: {
        color: '#FFFFFF',
        fontSize: '12px'
      }
    }
  }
}

// Color palette for charts
export const CHART_COLORS = {
  primary: '#00D9FF',    // Cyan
  secondary: '#FF6B6B',  // Red
  tertiary: '#4ECDC4',   // Teal
  quaternary: '#FFD93D', // Yellow
  quinary: '#A8E6CF',    // Light green
  senary: '#C7B3FF',     // Light purple
  septenary: '#FF8CC6',  // Pink
  octonary: '#FFB347',   // Orange
  nonary: '#B4E7CE',     // Mint
  denary: '#95E1D3'      // Aqua
}

// Epoch-style heatmap color configuration (red to green gradient)
export const HEATMAP_COLOR_CONFIG = [
  [0.0, '#F63C6B'],  // Bright red
  [0.1, '#C9355D'],  // Red
  [0.2, '#9C2E4E'],  // Dark red
  [0.3, '#702740'],  // Darker red
  [0.4, '#432031'],  // Very dark red
  [0.5, '#161923'],  // Dark neutral
  [0.6, '#124724'],  // Dark green
  [0.7, '#0D7526'],  // Green
  [0.8, '#09A227'],  // Bright green
  [0.9, '#04D029'],  // Brighter green
  [1.0, '#00FE2A']   // Brightest green
]

export const getChartColor = (index: number): string => {
  const colors = Object.values(CHART_COLORS)
  return colors[index % colors.length]
}

// Format point data based on axis type
export const formatChartPoint = (
  x: any,
  y: any,
  xAxisType: typeof AxisType[keyof typeof AxisType] | undefined
): [number | string, number] | number => {
  const yValue = typeof y === 'number' ? y : Number(y) || 0

  switch (xAxisType) {
    case AxisType.AxisCategory:
      // For category axis in line charts, return just the y value
      // The x position is determined by the order in the data array
      // If we have a category index from the x value, use it
      if (typeof x === 'number') {
        return [x, yValue]  // x is the category index
      }
      // Otherwise return just y value (position determined by array order)
      return yValue
    case AxisType.AxisDateTime: {
      // Ensure timestamp is in milliseconds
      let xValue = typeof x === 'number' ? x : Number(x) || 0
      // If value looks like seconds (less than year 3000 in ms), convert to ms
      if (xValue > 0 && xValue < 32503680000) {
        xValue = xValue * 1000
      }
      return [xValue, yValue]
    }
    case AxisType.AxisLinear:
    case AxisType.AxisLogarithmic:
    default:
      return [typeof x === 'number' ? x : Number(x) || 0, yValue]
  }
}