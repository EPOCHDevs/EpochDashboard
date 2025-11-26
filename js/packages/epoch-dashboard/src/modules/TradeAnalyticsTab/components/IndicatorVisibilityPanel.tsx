import * as Popover from '@radix-ui/react-popover'
import { Layers, Check, EyeOff } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import type { ChartInfoType } from '../../../types/TradeAnalyticsTypes'
import clsx from 'clsx'

interface IndicatorVisibilityPanelProps {
  timeframeConfig: ChartInfoType | undefined
  visibilityState: Record<string, boolean>
  onToggleIndicator: (seriesId: string) => boolean
  getVisibleCount: () => { visible: number; total: number }
  canShowMore: () => boolean
}

interface IndicatorCardData {
  id: string
  name: string
  type: string
  yAxis: number
  isVisible: boolean
}

export const IndicatorVisibilityPanel = ({
  timeframeConfig,
  visibilityState,
  onToggleIndicator,
  getVisibleCount,
}: IndicatorVisibilityPanelProps) => {
  // Prepare indicator data for display
  const indicators = useMemo<IndicatorCardData[]>(() => {
    if (!timeframeConfig?.series) return []

    return timeframeConfig.series
      .filter((seriesConfig) => {
        // Exclude candlestick (it's the main price chart and should always be visible)
        if (seriesConfig.type === 'candlestick') return false

        // Only include series with IDs
        return !!seriesConfig.id
      })
      .map((seriesConfig) => ({
        id: seriesConfig.id,
        name: seriesConfig.name || seriesConfig.id,
        type: seriesConfig.type || 'unknown',
        yAxis: seriesConfig.yAxis ?? 0,
        isVisible: visibilityState[seriesConfig.id] ?? false, // Default to hidden
      }))
  }, [timeframeConfig, visibilityState])

  const handleToggle = useCallback(
    (seriesId: string) => {
      onToggleIndicator(seriesId)
    },
    [onToggleIndicator]
  )

  const { visible, total } = getVisibleCount()

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-border rounded bg-card hover:bg-muted transition-colors">
          <Layers className="h-4 w-4" />
          <span className="text-sm">
            Indicators {visible}/{total}
          </span>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="w-96 bg-card border border-border rounded-lg shadow-lg z-50"
          align="start"
          sideOffset={5}
        >
          <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
            <div>
              <h3 className="font-semibold text-sm">Technical Indicators</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Click to toggle visibility
              </p>
            </div>
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-cyan-500/15 text-cyan-400">
              {visible}/{total}
            </span>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            <div className="p-3 space-y-2">
              {indicators.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No indicators configured for this timeframe
                </div>
              ) : (
                indicators.map((indicator) => (
                  <div
                    key={indicator.id}
                    className={clsx(
                      'group relative rounded-lg px-3 py-2.5 transition-all select-none cursor-pointer',
                      indicator.isVisible
                        ? 'bg-cyan-500/10 ring-1 ring-cyan-500/30'
                        : 'bg-muted/30 hover:bg-muted/50'
                    )}
                    onClick={() => handleToggle(indicator.id)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {indicator.name}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={clsx(
                            'px-1.5 py-0.5 text-[10px] font-medium rounded',
                            indicator.isVisible
                              ? 'bg-cyan-500/20 text-cyan-400'
                              : 'bg-muted text-muted-foreground'
                          )}>
                            {indicator.type}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            Pane {indicator.yAxis}
                          </span>
                        </div>
                      </div>
                      <div className={clsx(
                        'flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all',
                        indicator.isVisible
                          ? 'bg-cyan-500 text-white'
                          : 'bg-muted/50 text-muted-foreground group-hover:bg-muted'
                      )}>
                        {indicator.isVisible ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <EyeOff className="w-3 h-3 opacity-50" />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
