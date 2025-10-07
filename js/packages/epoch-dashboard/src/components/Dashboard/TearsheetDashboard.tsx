'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import clsx from 'clsx'
import {
  LayoutGrid,
  Columns3,
  Columns2,
  ChevronDown,
} from 'lucide-react'
import TearsheetCategoryContent from './TearsheetCategoryContent'
import { TearSheet } from '../../types/proto'
import { groupByCategory, formatCategoryLabel } from '../../utils/tearsheetHelpers'

// Dashboard Layout Options
export const DASHBOARD_LAYOUTS = [
  {
    id: 'columns_3',
    title: '3 Columns',
    icon: <Columns3 size={20} />,
    value: 'columns_3',
    gridClass: 'grid-cols-3'
  },
  {
    id: 'columns_2',
    title: '2 Columns',
    icon: <Columns2 size={20} />,
    value: 'columns_2',
    gridClass: 'grid-cols-2'
  },
  {
    id: 'columns_2x2',
    title: 'Grid (2x2)',
    icon: <LayoutGrid size={20} />,
    value: 'columns_2x2',
    gridClass: 'grid-cols-2 grid-rows-2'
  },
  {
    id: 'single',
    title: 'Single Column',
    icon: <Columns2 size={20} className="rotate-90" />,
    value: 'single',
    gridClass: 'grid-cols-1'
  }
]

interface TearsheetDashboardProps {
  tearsheet: TearSheet
  className?: string
  hideLayoutControls?: boolean
  onCategoryChange?: (category: string) => void
  onLayoutChange?: (layout: string) => void
  debug?: boolean
  rightControls?: React.ReactNode
}

const TearsheetDashboard: React.FC<TearsheetDashboardProps> = ({
  tearsheet,
  className = '',
  hideLayoutControls = false,
  onCategoryChange,
  onLayoutChange,
  debug = false,
  rightControls,
}) => {
  // Compute categories from tearsheet
  const categories = useMemo(() => {
    if (!tearsheet) return []

    const categoryMap = groupByCategory(tearsheet)
    return Array.from(categoryMap.entries()).map(([key, data]) => ({
      id: data.id,
      label: formatCategoryLabel(data.label),
      value: key,
      data
    }))
  }, [tearsheet])
  // Responsive layout detection
  const [isResponsive, setIsResponsive] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkResponsive = () => {
      setIsResponsive(window.innerWidth < 1280) // xl breakpoint
    }
    checkResponsive()
    window.addEventListener('resize', checkResponsive)
    return () => window.removeEventListener('resize', checkResponsive)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // State for active category and layout
  const [activeCategory, setActiveCategory] = useState<string>(
    categories[0]?.value || ''
  )

  const [selectedLayout, setSelectedLayout] = useState<string>(
    isResponsive ? 'single' : 'columns_2'
  )

  // Update layout based on responsive state
  useEffect(() => {
    setSelectedLayout(isResponsive ? 'single' : 'columns_2')
  }, [isResponsive])

  // Handle category change
  const handleCategoryChange = (categoryValue: string) => {
    setActiveCategory(categoryValue)
    onCategoryChange?.(categoryValue)
  }

  // Handle layout change
  const handleLayoutChange = (layout: string) => {
    setSelectedLayout(layout)
    onLayoutChange?.(layout)
  }

  // Get active category data
  const activeCategoryData = useMemo(() => {
    return categories.find(cat => cat.value === activeCategory)?.data
  }, [categories, activeCategory])

  // Debug logging
  if (debug) {
    console.group('🔍 TearsheetDashboard Debug')
    console.log('📊 Total categories:', categories.length)
    console.log('📂 Categories:', categories.map(c => ({
      id: c.id,
      label: c.label,
      charts: c.data.charts.length,
      cards: c.data.cards.length,
      tables: c.data.tables.length
    })))
    console.log('🎯 Active category:', activeCategory)
    console.log('📈 Active category data:', activeCategoryData)
    console.groupEnd()
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Unified Toolbar - matches Charts toolbar structure */}
      <div className="sticky top-0 z-10 w-full bg-card border-b border-border">
        <div className="flex items-center gap-2 px-4 py-2">
          {/* Category Tabs - Desktop: show first 3, rest in dropdown */}
          {/* Mobile: show dropdown */}
          {categories.length > 0 && (
            <>
              {/* Show first 2-3 tabs on desktop, or use dropdown on mobile */}
              {!isResponsive ? (
                <>
                  {categories.slice(0, 3).map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.value)}
                      className={clsx(
                        "px-3 py-1.5 rounded text-sm font-medium transition-all whitespace-nowrap",
                        activeCategory === category.value
                          ? "bg-muted text-foreground"
                          : "bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      )}
                    >
                      {category.label}
                    </button>
                  ))}

                  {/* Dropdown for remaining categories */}
                  {categories.length > 3 && (
                    <div className="relative" ref={dropdownRef}>
                      <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className={clsx(
                          "px-3 py-1.5 rounded text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1",
                          categories.slice(3).some(c => c.value === activeCategory)
                            ? "bg-muted text-foreground"
                            : "bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                      >
                        More
                        <ChevronDown size={16} className={clsx("transition-transform", showDropdown && "rotate-180")} />
                      </button>

                      {showDropdown && (
                        <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[150px] z-20">
                          {categories.slice(3).map((category) => (
                            <button
                              key={category.id}
                              onClick={() => {
                                handleCategoryChange(category.value)
                                setShowDropdown(false)
                              }}
                              className={clsx(
                                "w-full text-left px-3 py-2 text-sm transition-colors",
                                activeCategory === category.value
                                  ? "bg-muted text-foreground"
                                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                              )}
                            >
                              {category.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                /* Mobile: Single dropdown with all categories */
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="px-3 py-1.5 rounded text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 bg-muted text-foreground min-w-[120px] justify-between"
                  >
                    <span className="truncate">
                      {categories.find(c => c.value === activeCategory)?.label || 'Select'}
                    </span>
                    <ChevronDown size={16} className={clsx("transition-transform flex-shrink-0", showDropdown && "rotate-180")} />
                  </button>

                  {showDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[200px] max-w-[300px] z-20">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => {
                            handleCategoryChange(category.value)
                            setShowDropdown(false)
                          }}
                          className={clsx(
                            "w-full text-left px-3 py-2 text-sm transition-colors",
                            activeCategory === category.value
                              ? "bg-muted text-foreground"
                              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                          )}
                        >
                          {category.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Divider */}
          {!isResponsive && !hideLayoutControls && categories.length > 0 && (
            <div className="w-px h-6 bg-border" />
          )}

          {/* Layout Controls */}
          {!isResponsive && !hideLayoutControls && (
            <div className="flex items-center gap-1">
              {DASHBOARD_LAYOUTS.filter(layout =>
                layout.value !== 'single' // Hide single column on desktop
              ).map((layout) => (
                <button
                  key={layout.id}
                  onClick={() => handleLayoutChange(layout.value)}
                  className={`
                    p-2 rounded transition-all duration-200
                    ${selectedLayout === layout.value
                      ? 'text-foreground bg-foreground/20'
                      : 'text-foreground/40 hover:text-foreground/60 hover:bg-foreground/10'
                    }
                  `}
                  title={layout.title}
                >
                  {layout.icon}
                </button>
              ))}
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right Controls (e.g., view switcher) */}
          {rightControls && (
            <>
              <div className="w-px h-6 bg-border" />
              {rightControls}
            </>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="glass rounded-lg p-6">
          {activeCategoryData ? (
            <TearsheetCategoryContent
              categoryData={activeCategoryData}
              layout={selectedLayout}
              debug={debug}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-foreground/40 text-lg mb-2">
                  No Data Available
                </div>
                <div className="text-foreground/20 text-sm">
                  Select a category to view dashboard content
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TearsheetDashboard