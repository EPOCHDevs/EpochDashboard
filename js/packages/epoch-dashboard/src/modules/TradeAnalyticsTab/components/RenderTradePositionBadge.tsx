import { TRADE_POSITION } from "../../../types/TradeAnalyticsTypes"
import clsx from "clsx"
import React from "react"

interface RenderTradePositionBadgeProps {
  tradePosition: TRADE_POSITION
}
const RenderTradePositionBadge = ({ tradePosition }: RenderTradePositionBadgeProps) => {
  const POSITION_COLOR_CONFIG = {
    [TRADE_POSITION.LONG]: "border-territory-success text-territory-success",
    [TRADE_POSITION.SHORT]: "border-secondary-red text-secondary-red",
  }

  return (
    <div
      className={clsx(
        "typography-dashboardL12Regular rounded-1 border px-2.5 py-1.25",
        POSITION_COLOR_CONFIG[tradePosition]
      )}>
      {tradePosition}
    </div>
  )
}

export default RenderTradePositionBadge