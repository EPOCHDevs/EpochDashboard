import { TooltipOptions, TooltipPositionerCallbackFunction, TooltipFormatterCallbackFunction } from 'highcharts'
import { GetTradeAnalyticsMetadataResponseType } from '../../../../../types/TradeAnalyticsTypes'

interface BuildTooltipOptionsParams {
  sidebarWidth: number
  selectedAssetDetails?: GetTradeAnalyticsMetadataResponseType['asset_info'][string]
  assetId: string
}

/**
 * Build tooltip configuration for the chart
 * TradingView-style inline format with blue OHLCV values
 */
export const buildTooltipOptions = ({
  sidebarWidth,
  selectedAssetDetails,
  assetId,
}: BuildTooltipOptionsParams): TooltipOptions => {
  return {
    shared: true,
    split: true,
    enabled: true,
    outside: true,
    padding: 0,
    backgroundColor: 'transparent',
    borderRadius: 0,
    borderWidth: 0,
    useHTML: true,
    style: {
      pointerEvents: 'none',
      zIndex: '20',
    },
    positioner: function positioner() {
      return {
        x: sidebarWidth + 10,
        y: 10,
      }
    } as unknown as TooltipPositionerCallbackFunction,
    formatter: function tooltipFormatter(this) {
      // Group series by Y-axis position for proper vertical stacking
      const orderedPointsBasedOnPositionY = Object.values(
        (this.points ?? [])?.reduce(
          (acc, item) => {
            const key = item.series.yAxis.pos
            if (!acc[key]) {
              acc[key] = []
            }
            acc[key].push(item)
            return acc
          },
          {} as Record<string, typeof this.points>
        )
      )

      return `
        ${orderedPointsBasedOnPositionY
          ?.map((points) => {
            return points
              ?.map((point, index) => {
                // TradingView-style inline format
                const containerStyle = `
                  background: transparent;
                  padding: 2px 4px;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  font-size: 11px;
                  line-height: 1.2;
                  color: #D1D4DC;
                  white-space: nowrap;
                  position: absolute;
                  top: ${
                    point.series.type === 'candlestick'
                      ? -25
                      : points.length > 1
                        ? point.series.yAxis.pos + index * 20
                        : point.series.yAxis.pos
                  }px;
                `

                // Check if this is a candlestick series (main price pane)
                if (point.series.type === 'candlestick') {
                  // Get OHLC values
                  const open = (point.point as any).open || 0
                  const high = (point.point as any).high || 0
                  const low = (point.point as any).low || 0
                  const close = (point.point as any).close || 0

                  // Format based on asset class
                  const formatValue = (val: number) => {
                    let decimalPlaces = 2

                    if (selectedAssetDetails?.asset?.asset_class) {
                      const assetClass = selectedAssetDetails.asset.asset_class
                      switch (assetClass) {
                        case 'FX':
                          decimalPlaces = 5
                          break
                        case 'Crypto':
                          decimalPlaces = val < 1 ? 8 : val < 100 ? 5 : 2
                          break
                        case 'Stocks':
                          decimalPlaces = 2
                          break
                        case 'Futures':
                          decimalPlaces = val < 10 ? 4 : 2
                          break
                      }
                    }

                    return val.toFixed(decimalPlaces)
                  }

                  // Get asset info from metadata
                  let displayName = ''
                  let exchange = ''

                  if (selectedAssetDetails?.asset) {
                    displayName = selectedAssetDetails.asset.ticker || assetId || ''
                    displayName = displayName.replace(/^\^/, '')
                    exchange = selectedAssetDetails.asset.exchange || ''
                  } else {
                    displayName = assetId || ''
                    displayName = displayName.replace(/^\^/, '')
                  }

                  // TradingView inline format: Ticker • Exchange O H L C
                  return `
                    <div style="${containerStyle}">
                      <span style="color: #D1D4DC; font-weight: 600;">${displayName}</span>
                      ${exchange ? `<span style="color: #787B86; margin: 0 4px;">•</span><span style="color: #787B86; font-size: 10px;">${exchange}</span>` : ''}
                      <span style="color: #787B86; margin-left: 8px;">O</span>
                      <span style="color: #3896D4; margin-left: 4px;">${formatValue(open)}</span>
                      <span style="color: #787B86; margin-left: 8px;">H</span>
                      <span style="color: #3896D4; margin-left: 4px;">${formatValue(high)}</span>
                      <span style="color: #787B86; margin-left: 8px;">L</span>
                      <span style="color: #3896D4; margin-left: 4px;">${formatValue(low)}</span>
                      <span style="color: #787B86; margin-left: 8px;">C</span>
                      <span style="color: #3896D4; margin-left: 4px;">${formatValue(close)}</span>
                    </div>
                  `
                } else {
                  // All other series (Volume, MACD, RSI, etc.)
                  const value = point.point.y || 0
                  const seriesName = point.series.name || 'Value'

                  // Format value based on series type
                  let formattedValue = ''
                  if (seriesName.toLowerCase().includes('volume')) {
                    // Format volume with K/M/B suffixes
                    if (value >= 1000000000) {
                      formattedValue = (value / 1000000000).toFixed(1) + 'B'
                    } else if (value >= 1000000) {
                      formattedValue = (value / 1000000).toFixed(1) + 'M'
                    } else if (value >= 1000) {
                      formattedValue = (value / 1000).toFixed(1) + 'K'
                    } else {
                      formattedValue = value.toFixed(0)
                    }
                  } else {
                    formattedValue = value.toFixed(Math.abs(value) < 1 ? 5 : 2)
                  }

                  return `
                    <div style="${containerStyle}">
                      <span style="color: #787B86;">${seriesName}</span>
                      <span style="color: #3896D4; font-weight: 600; margin-left: 8px;">${formattedValue}</span>
                    </div>
                  `
                }
              })
              ?.join('')
          })
          ?.join('')}
      `
    } as TooltipFormatterCallbackFunction,
  }
}
