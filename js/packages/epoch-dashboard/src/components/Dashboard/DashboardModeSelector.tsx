'use client'

import React from 'react'
import clsx from 'clsx'

export type DashboardViewMode = 'overview' | 'by_asset'

interface DashboardModeSelectorProps {
  mode: DashboardViewMode
  onModeChange: (mode: DashboardViewMode) => void
  disabled?: boolean
  /** Whether Overview mode is available (ALL category exists) */
  hasOverview?: boolean
  /** Whether By Asset mode is available (asset categories exist) */
  hasByAsset?: boolean
}

export function DashboardModeSelector({
  mode,
  onModeChange,
  disabled = false,
  hasOverview = true,
  hasByAsset = true
}: DashboardModeSelectorProps) {
  // If only one mode is available, don't show the selector at all
  // The parent component will auto-select the available mode
  if (!hasOverview && !hasByAsset) {
    return null
  }

  if (!hasOverview || !hasByAsset) {
    // Only one mode available - don't show selector, parent handles auto-selection
    return null
  }

  return (
    <div className="inline-flex items-center border border-border rounded-lg p-0.5 gap-0.5">
      <button
        onClick={() => onModeChange('overview')}
        disabled={disabled}
        className={clsx(
          "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
          "focus:outline-none focus:ring-2 focus:ring-cyan-500/50",
          mode === 'overview'
            ? "bg-cyan-500/15 text-cyan-400 shadow-sm border border-cyan-500/40"
            : "text-foreground/60 hover:text-cyan-400 hover:bg-cyan-500/5",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        Overview
      </button>
      <button
        onClick={() => onModeChange('by_asset')}
        disabled={disabled}
        className={clsx(
          "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
          "focus:outline-none focus:ring-2 focus:ring-cyan-500/50",
          mode === 'by_asset'
            ? "bg-cyan-500/15 text-cyan-400 shadow-sm border border-cyan-500/40"
            : "text-foreground/60 hover:text-cyan-400 hover:bg-cyan-500/5",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        By Asset
      </button>
    </div>
  )
}

export default DashboardModeSelector
