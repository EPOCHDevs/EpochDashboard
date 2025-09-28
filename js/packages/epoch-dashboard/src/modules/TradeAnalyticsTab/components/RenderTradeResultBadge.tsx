import { TRADE_RESULT } from "../../../types/TradeAnalyticsTypes"
import clsx from "clsx"
import React from "react"

interface RenderTradeResultBadgeProps {
  tradeResult: TRADE_RESULT
}
const RenderTradePositionResult = ({ tradeResult }: RenderTradeResultBadgeProps) => {
  const RESULT_COLOR_CONFIG = {
    [TRADE_RESULT.WIN]: "border-territory-success text-territory-success",
    [TRADE_RESULT.LOSS]: "border-secondary-red text-secondary-red",
    [TRADE_RESULT.OPEN]: "border-territory-warning text-territory-warning",
    [TRADE_RESULT.BREAK_EVEN]: "border-secondary-cementGrey text-secondary-cementGrey",
  }

  return (
    <div
      className={clsx(
        "typography-dashboardL12Regular rounded-1 border px-2.5 py-1.25",
        RESULT_COLOR_CONFIG[tradeResult]
      )}>
      {tradeResult}
    </div>
  )
}

export default RenderTradePositionResult