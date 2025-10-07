'use client'

import React from 'react'
import clsx from 'clsx'

export interface SegmentedControlOption {
  value: string
  label: string
  icon?: React.ReactNode
}

export interface SegmentedControlProps {
  options: SegmentedControlOption[]
  value: string
  onChange: (value: string) => void
  className?: string
}

export function SegmentedControl({
  options,
  value,
  onChange,
  className
}: SegmentedControlProps) {
  return (
    <div className={clsx("inline-flex bg-muted/30 rounded-lg p-1 gap-1", className)}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={clsx(
            "relative px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
            "flex items-center gap-2 whitespace-nowrap",
            value === option.value
              ? "bg-card text-foreground shadow-sm ring-1 ring-border/50"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
          )}
        >
          {option.icon}
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  )
}

export default SegmentedControl
