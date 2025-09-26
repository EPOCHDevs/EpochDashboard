import { useMemo } from 'react'
import {
  ChartDef,
  Band,
  StraightLineDef,
  AxisType
} from '../types/proto'
import {
  convertChartDefToHighcharts,
  convertAxisDefToHighcharts,
  convertBandsToHighcharts,
  convertStraightLinesToHighcharts,
  getCrosshairConfig,
  getTooltipConfig,
  getLegendConfig,
  getZoomConfig,
  getBoostConfig
} from '../utils/protoToHighcharts'

interface UseChartOptionsProps {
  chartDef: ChartDef | undefined
  chartType: string
  height?: number
  enableZoom?: boolean
  zoomType?: 'x' | 'y' | 'xy'
  enableTooltip?: boolean
  seriesCount?: number
  xPlotBands?: Band[]
  yPlotBands?: Band[]
  straightLines?: StraightLineDef[]
  customOptions?: any
}

export const useChartOptions = ({
  chartDef,
  chartType,
  height = 500,
  enableZoom = true,
  zoomType = 'x',
  enableTooltip = true,
  seriesCount = 1,
  xPlotBands,
  yPlotBands,
  straightLines,
  customOptions = {}
}: UseChartOptionsProps) => {
  return useMemo(() => {
    // Base chart configuration from proto
    const baseChart = convertChartDefToHighcharts(chartDef, chartType, height)

    // Axis configurations from proto
    const xAxis = {
      ...convertAxisDefToHighcharts(chartDef?.xAxis, true, AxisType.AxisLinear),
      plotBands: convertBandsToHighcharts(xPlotBands, true),
      plotLines: convertStraightLinesToHighcharts(straightLines, true),
      crosshair: getCrosshairConfig(chartDef?.xAxis?.type, true)
    }

    const yAxis = {
      ...convertAxisDefToHighcharts(chartDef?.yAxis, false, AxisType.AxisLinear),
      plotBands: convertBandsToHighcharts(yPlotBands, false),
      plotLines: convertStraightLinesToHighcharts(straightLines, false),
      crosshair: getCrosshairConfig(chartDef?.yAxis?.type, false)
    }

    // Zoom configuration
    const zoomConfig = enableZoom ? getZoomConfig(true, zoomType) : {}

    // Merge all configurations
    return {
      ...baseChart,
      chart: {
        ...baseChart.chart,
        ...zoomConfig
      },
      xAxis,
      yAxis,
      tooltip: getTooltipConfig(enableTooltip),
      legend: getLegendConfig(seriesCount),
      boost: getBoostConfig(),
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
        },
        ...customOptions.plotOptions
      },
      ...customOptions
    }
  }, [
    chartDef,
    chartType,
    height,
    enableZoom,
    zoomType,
    enableTooltip,
    seriesCount,
    xPlotBands,
    yPlotBands,
    straightLines,
    customOptions
  ])
}

export default useChartOptions