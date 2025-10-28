import React from 'react'
import {
  BarChart3,
  Split,
  Zap,
  ArrowLeftRight,
  Layers,
  Bell,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  CandlestickChart,
  Info as InfoIcon,
  LucideIcon,
} from 'lucide-react'
import { CardIcon } from '../types/SelectorTypes'

// Map CardIcon enum to Lucide React components
const iconMap: Record<CardIcon, LucideIcon> = {
  [CardIcon.Chart]: BarChart3,
  [CardIcon.Gap]: Split,
  [CardIcon.Signal]: Zap,
  [CardIcon.Trade]: ArrowLeftRight,
  [CardIcon.Position]: Layers,
  [CardIcon.Alert]: Bell,
  [CardIcon.TrendUp]: TrendingUp,
  [CardIcon.TrendDown]: TrendingDown,
  [CardIcon.Calendar]: Calendar,
  [CardIcon.Dollar]: DollarSign,
  [CardIcon.Candle]: CandlestickChart,
  [CardIcon.Info]: InfoIcon,
}

interface SelectorIconProps {
  icon: CardIcon
  count?: number
  size?: number
}

/**
 * Renders a selector icon with optional count badge
 * Icons are displayed in dark gray (muted) color
 * Count is overlayed on top of the icon
 */
export const SelectorIcon: React.FC<SelectorIconProps> = ({ icon, count, size = 20 }) => {
  const IconComponent = iconMap[icon] || InfoIcon

  // If count is provided, show it as a small badge overlaying the top-right corner
  if (count !== undefined) {
    // Show "99+" for large numbers to keep badge compact
    const displayCount = count > 99 ? '99+' : count.toString()

    return (
      <div className="relative inline-flex items-center justify-center">
        {/* Icon */}
        <IconComponent
          size={size}
          className="text-muted-foreground"
          strokeWidth={1.5}
        />
        {/* Small badge at top-right corner */}
        <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-0.5 flex items-center justify-center text-[7px] font-bold text-black bg-white rounded-full border border-gray-300 shadow-sm">
          {displayCount}
        </span>
      </div>
    )
  }

  // Just the icon without count
  return (
    <IconComponent
      size={size}
      className="text-muted-foreground"
      strokeWidth={1.5}
    />
  )
}

/**
 * Get the Lucide icon component for a CardIcon enum value
 */
export function getIconComponent(icon: CardIcon): LucideIcon {
  return iconMap[icon] || InfoIcon
}
