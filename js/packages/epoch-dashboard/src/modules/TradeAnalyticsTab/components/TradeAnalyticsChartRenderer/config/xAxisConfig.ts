import { XAxisOptions, XAxisPlotLinesOptions } from 'highcharts'
import { XAxisPlotBandsOptions } from 'highcharts'
import { tailwindColors, tailwindTypography } from '../../../../../utils/tailwindHelpers'

interface BuildXAxisOptionsParams {
  highchartsTheme: any
  themeColors: ReturnType<typeof import('../../../../../constants').getChartColors>
  plotBands?: XAxisPlotBandsOptions[]
  plotLines?: XAxisPlotLinesOptions[]
  selectedTimestamp?: number | null
  barWidthMs?: number // Milliseconds per bar for highlight band width
  afterSetExtremesHandler: (this: Highcharts.Axis, e: Highcharts.AxisSetExtremesEventObject) => void
}

/**
 * Build X-axis configuration for the chart
 * Includes ordinal: true to hide weekend/market closed gaps
 * Includes afterSetExtremes handler for lazy loading
 */
export const buildXAxisOptions = ({
  highchartsTheme,
  themeColors,
  plotBands,
  plotLines,
  selectedTimestamp,
  barWidthMs,
  afterSetExtremesHandler,
}: BuildXAxisOptionsParams): XAxisOptions => {
  // Build plotLines array - include selectedTimestamp indicator if present
  const allPlotLines: XAxisPlotLinesOptions[] = [
    ...(plotLines || []),
  ]

  // Build plotBands array - include existing plus selected timestamp highlight
  const allPlotBands: XAxisPlotBandsOptions[] = [
    ...(plotBands || []).map((band) => ({
      ...band,
      color: band.color ? band.color : `${themeColors.foreground}0D`,
    })),
  ]

  // Add selected timestamp indicator line and highlight band
  if (selectedTimestamp) {
    // Vertical line at the selected timestamp
    allPlotLines.push({
      value: selectedTimestamp,
      color: '#22D3EE', // Cyan-400 - matches the accent color used elsewhere
      width: 2,
      zIndex: 10,
      dashStyle: 'Solid',
      label: {
        text: '▼',
        align: 'center',
        verticalAlign: 'top',
        y: -5,
        style: {
          color: '#22D3EE',
          fontSize: '14px',
          fontWeight: 'bold',
        },
      },
    })

    // Highlight band around the selected candlestick
    // Use barWidthMs or default to 5 minutes (300000ms)
    const halfBarWidth = (barWidthMs || 300000) / 2
    allPlotBands.push({
      from: selectedTimestamp - halfBarWidth,
      to: selectedTimestamp + halfBarWidth,
      color: 'rgba(255, 255, 255, 0.08)', // Subtle gray/white highlight
      zIndex: 2,
    })
  }

  return {
    type: 'datetime',
    gridLineWidth: 2,
    ordinal: true, // CRITICAL: Hide weekend/market closed gaps
    gridLineColor: highchartsTheme?.xAxis?.gridLineColor || `${tailwindColors.primary.white}05`,
    gridLineDashStyle: 'Solid',
    labels: {
      style: {
        ...tailwindTypography.desktopL14Regular.css,
        color: highchartsTheme?.xAxis?.labels?.style?.color || tailwindColors.secondary.cementGrey,
      },
    },
    crosshair: {
      dashStyle: 'Dash',
      color: themeColors.foreground,
      width: 1,
      zIndex: 5,
      label: {
        enabled: true,
        format: '{value:%Y-%m-%d %H:%M}',
        backgroundColor: `${themeColors.foreground}E6`,
        borderColor: themeColors.foreground,
        borderWidth: 1,
        borderRadius: 4,
        padding: 6,
        style: {
          color: themeColors.background,
          fontWeight: 'bold',
          fontSize: '11px',
        },
      },
    } as any,
    plotBands: allPlotBands.length > 0 ? allPlotBands : undefined,
    plotLines: allPlotLines.length > 0 ? allPlotLines : undefined,
    events: {
      afterSetExtremes: afterSetExtremesHandler,
    },
  }
}
