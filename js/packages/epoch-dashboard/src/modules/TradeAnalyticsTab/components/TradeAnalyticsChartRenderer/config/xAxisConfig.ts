import { XAxisOptions } from 'highcharts'
import { XAxisPlotBandsOptions } from 'highcharts'
import { tailwindColors, tailwindTypography } from '../../../../../utils/tailwindHelpers'

interface BuildXAxisOptionsParams {
  highchartsTheme: any
  themeColors: ReturnType<typeof import('../../../../../constants').getChartColors>
  plotBands?: XAxisPlotBandsOptions[]
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
  afterSetExtremesHandler,
}: BuildXAxisOptionsParams): XAxisOptions => {
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
    plotBands: plotBands?.map((band) => ({
      ...band,
      color: band.color ? band.color : `${themeColors.foreground}0D`,
    })),
    events: {
      afterSetExtremes: afterSetExtremesHandler,
    },
  }
}
