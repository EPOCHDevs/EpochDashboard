import { YAxisOptions } from 'highcharts'
import { PaneState } from '../hooks/usePaneManager'
import { GetTradeAnalyticsMetadataResponseType } from '../../../../../types/TradeAnalyticsTypes'
import { tailwindColors, tailwindTypography } from '../../../../../utils/tailwindHelpers'

interface BuildYAxisOptionsParams {
  paneStates: PaneState[]
  highchartsTheme: any
  themeColors: ReturnType<typeof import('../../../../../constants').getChartColors>
  selectedAssetDetails?: GetTradeAnalyticsMetadataResponseType['asset_info'][string]
}

/**
 * Build Y-axis configuration for the chart
 * Includes formatters for labels and crosshair based on asset class
 */
export const buildYAxisOptions = ({
  paneStates,
  highchartsTheme,
  themeColors,
  selectedAssetDetails,
}: BuildYAxisOptionsParams): YAxisOptions[] => {
  return paneStates
    .filter((pane) => pane && typeof pane.top === 'number' && typeof pane.height === 'number')
    .map((pane) => ({
      top: `${Math.max(0, Math.min(100, pane.top))}%`,
      height: `${Math.max(1, Math.min(100, pane.height))}%`,
      offset: 0,
      labels: {
        align: 'left',
        style: {
          ...tailwindTypography.desktopL14Regular.css,
          color: highchartsTheme?.yAxis?.labels?.style?.color || tailwindColors.secondary.cementGrey,
        },
        distance: 10,
        formatter: function () {
          try {
            const formattedAxis = this.axis
            const value = this.value as number

            // Validate value
            if (value === undefined || value === null || isNaN(value) || typeof value !== 'number') {
              return ''
            }

            const isMin = value === formattedAxis.min
            const isMax = value === formattedAxis.max

            // Get axis positions for overlap prevention
            const axisPosition = formattedAxis.pos || 0
            const chart = formattedAxis.chart
            const allYAxisPositions = chart.yAxis
              .map((axis: any) => axis.pos || 0)
              .filter((pos: number) => !isNaN(pos))

            if (allYAxisPositions.length > 0) {
              const minPosition = Math.min(...allYAxisPositions)
              const maxPosition = Math.max(...allYAxisPositions)
              const isTopAxis = axisPosition === minPosition
              const isBottomAxis = axisPosition === maxPosition

              // Hide overlapping labels
              if (isMin && !isTopAxis) return ''
              if (isMax && !isBottomAxis) return ''
            }

            // Check if this is a volume axis
            const seriesForThisAxis = chart.series.filter((s: any) => s.yAxis === formattedAxis)
            const isVolumeAxis = seriesForThisAxis.some((s: any) => s.name && s.name.toLowerCase().includes('volume'))

            // Format volume with K/M/B suffixes
            if (isVolumeAxis) {
              if (value >= 1000000000) return (value / 1000000000).toFixed(1) + 'B'
              if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M'
              if (value >= 1000) return (value / 1000).toFixed(1) + 'K'
              return value.toFixed(0)
            }

            // Format based on asset class
            let decimalPlaces = 2

            if (selectedAssetDetails?.asset?.asset_class) {
              const assetClass = selectedAssetDetails.asset.asset_class
              switch (assetClass) {
                case 'FX':
                  decimalPlaces = 5
                  break
                case 'Crypto':
                  decimalPlaces = value < 1 ? 8 : value < 100 ? 5 : 2
                  break
                case 'Stocks':
                  decimalPlaces = 2
                  break
                case 'Futures':
                  decimalPlaces = value < 10 ? 4 : 2
                  break
                default:
                  decimalPlaces = 2
              }
            }

            return value.toFixed(decimalPlaces)
          } catch (error) {
            return ''
          }
        },
      },
      crosshair: false,
      title: { text: '' },
      lineWidth: 2,
      gridLineWidth: 2,
      gridLineColor: highchartsTheme?.yAxis?.gridLineColor || `${tailwindColors.primary.white}05`,
      gridLineDashStyle: 'Solid',
      opposite: true,
      resize: {
        enabled: true,
      },
    }))
}
