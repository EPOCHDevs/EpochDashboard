'use client'

import React, { useState, useEffect, useMemo, useRef, useTransition, useDeferredValue, lazy, Suspense } from 'react'
import clsx from 'clsx'
import {
  LayoutGrid,
  Columns3,
  Columns2,
  ChevronDown,
} from 'lucide-react'
import { TearSheet } from '../../types/proto'
import { groupByCategory, formatCategoryLabel } from '../../utils/tearsheetHelpers'

// Lazy load heavy components to reduce initial bundle and enable code splitting
const TearsheetCategoryContent = lazy(() => import('./TearsheetCategoryContent'))
const UnifiedCategoryView = lazy(() => import('./UnifiedCategoryView'))

// Loading skeleton for Suspense boundary
const ContentLoadingSkeleton = () => (
  <div className="glass rounded-lg p-6">
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-[400px] bg-card/50 rounded-lg p-4">
            <div className="h-4 bg-foreground/10 rounded w-1/3 mb-4" />
            <div className="h-64 bg-foreground/10 rounded" />
          </div>
        ))}
      </div>
    </div>
  </div>
)

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

// View Mode Types
export type ViewMode = 'tabs' | 'unified'

interface TearsheetDashboardProps {
  tearsheet: TearSheet
  className?: string
  hideLayoutControls?: boolean
  onCategoryChange?: (category: string) => void
  onLayoutChange?: (layout: string) => void
  onViewModeChange?: (viewMode: ViewMode) => void
  defaultViewMode?: ViewMode
  debug?: boolean
  rightControls?: React.ReactNode
  highLevelCategory?: string // The high-level filter used to fetch this data (e.g., "ALL", "AAPL-Stocks")
}

// Memoized dropdown menu item to prevent re-renders
const DropdownMenuItem = React.memo(({
  category,
  isActive,
  onClick
}: {
  category: { id: string; label: string; value: string };
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={clsx(
      "w-full text-left px-3 py-2 text-sm transition-colors",
      isActive
        ? "bg-muted text-foreground"
        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
    )}
  >
    {category.label}
  </button>
))
DropdownMenuItem.displayName = 'DropdownMenuItem'

const TearsheetDashboard: React.FC<TearsheetDashboardProps> = ({
  tearsheet,
  className = '',
  hideLayoutControls = false,
  onCategoryChange,
  onLayoutChange,
  onViewModeChange,
  defaultViewMode = 'tabs',
  debug = false,
  rightControls,
  highLevelCategory,
}) => {
  // Auto-determine view mode based on high-level category
  // ALL → Tab View (show sub-category tabs)
  // Asset-specific → Unified View (show all assets together)
  const autoViewMode: ViewMode = useMemo(() => {
    return highLevelCategory === 'ALL' ? 'tabs' : 'unified'
  }, [highLevelCategory])

  // Compute categories from tearsheet
  // Always group by sub-categories for both ALL and asset-specific data
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
  // Responsive layout detection and dynamic tab calculation
  const [isResponsive, setIsResponsive] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [visibleTabCount, setVisibleTabCount] = useState(3)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const [isPending, startTransition] = useTransition()

  // Calculate how many tabs can fit based on available space
  useEffect(() => {
    const checkResponsive = () => {
      const width = window.innerWidth
      setIsResponsive(width < 1280) // xl breakpoint

      if (width < 1280) {
        setVisibleTabCount(0) // Use dropdown on mobile
      } else {
        // Estimate available space for tabs
        // Rough calculation: total width - controls - margins - more button space
        const availableWidth = width - 600 // Reserve space for controls
        const estimatedTabWidth = 150 // Average tab width with padding
        const maxVisibleTabs = Math.max(2, Math.floor(availableWidth / estimatedTabWidth))

        // Show all tabs if they fit, otherwise leave room for "More" dropdown
        if (categories.length <= maxVisibleTabs) {
          setVisibleTabCount(categories.length)
        } else {
          setVisibleTabCount(Math.min(maxVisibleTabs - 1, categories.length - 1))
        }
      }
    }

    checkResponsive()

    // Use ResizeObserver for more accurate monitoring
    let resizeObserver: ResizeObserver | null = null
    if (toolbarRef.current) {
      resizeObserver = new ResizeObserver(() => {
        checkResponsive()
      })
      resizeObserver.observe(toolbarRef.current)
    }

    window.addEventListener('resize', checkResponsive)
    return () => {
      window.removeEventListener('resize', checkResponsive)
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
    }
  }, [categories.length])

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

  // State for active category, layout, and view mode
  const [activeCategory, setActiveCategory] = useState<string>(
    categories[0]?.value || ''
  )

  const [selectedLayout, setSelectedLayout] = useState<string>(
    isResponsive ? 'single' : 'columns_3'
  )

  // Update layout based on responsive state
  useEffect(() => {
    setSelectedLayout(isResponsive ? 'single' : 'columns_3')
  }, [isResponsive])

  // Notify parent of view mode changes
  useEffect(() => {
    onViewModeChange?.(autoViewMode)
  }, [autoViewMode, onViewModeChange])

  // Handle category change with transition to reduce blocking
  const handleCategoryChange = (categoryValue: string) => {
    startTransition(() => {
      setActiveCategory(categoryValue)
      onCategoryChange?.(categoryValue)
    })
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

  // Defer the heavy category data to allow UI to remain responsive
  // This allows React to prioritize user interactions over rendering heavy content
  const deferredCategoryData = useDeferredValue(activeCategoryData)

  // Memoize dropdown categories check to avoid expensive .some() on every render
  const isDropdownCategoryActive = useMemo(() => {
    return categories.slice(visibleTabCount).some(c => c.value === activeCategory)
  }, [categories, activeCategory, visibleTabCount])

  // Memoize visible and dropdown categories
  const visibleCategories = useMemo(() => {
    return categories.slice(0, visibleTabCount)
  }, [categories, visibleTabCount])

  const dropdownCategories = useMemo(() => {
    return categories.slice(visibleTabCount)
  }, [categories, visibleTabCount])

  // Check if we're showing stale data (deferred value differs from current)
  const isStale = deferredCategoryData !== activeCategoryData

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
    console.log('⏳ Is stale (deferred):', isStale)
    console.groupEnd()
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Unified Toolbar - matches Charts toolbar structure */}
      <div className="sticky top-0 z-10 w-full bg-card border-b border-border" ref={toolbarRef}>
        <div className="flex items-center gap-2 px-4 py-2">
          {/* Category Tabs - Desktop: show dynamically calculated tabs, rest in dropdown */}
          {/* Mobile: show dropdown */}
          {/* Only show category tabs in tab view mode */}
          {autoViewMode === 'tabs' && categories.length > 0 && (
            <>
              {/* Show visible tabs on desktop, or use dropdown on mobile */}
              {!isResponsive ? (
                <>
                  {visibleCategories.map((category) => (
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

                  {/* Dropdown for remaining categories - only show if there are dropdown categories */}
                  {dropdownCategories.length > 0 && (
                    <div className="relative" ref={dropdownRef}>
                      <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className={clsx(
                          "px-3 py-1.5 rounded text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1",
                          isDropdownCategoryActive
                            ? "bg-muted text-foreground"
                            : "bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                      >
                        More
                        <ChevronDown size={16} className={clsx("transition-transform", showDropdown && "rotate-180")} />
                      </button>

                      {showDropdown && (
                        <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[150px] max-h-[400px] overflow-y-auto z-20">
                          {dropdownCategories.map((category) => (
                            <DropdownMenuItem
                              key={category.id}
                              category={category}
                              isActive={activeCategory === category.value}
                              onClick={() => {
                                handleCategoryChange(category.value)
                                setShowDropdown(false)
                              }}
                            />
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
                    <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[200px] max-w-[300px] max-h-[400px] overflow-y-auto z-20">
                      {categories.map((category) => (
                        <DropdownMenuItem
                          key={category.id}
                          category={category}
                          isActive={activeCategory === category.value}
                          onClick={() => {
                            handleCategoryChange(category.value)
                            setShowDropdown(false)
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Divider */}
          {!isResponsive && !hideLayoutControls && autoViewMode === 'tabs' && categories.length > 0 && (
            <div className="w-px h-6 bg-border" />
          )}

          {/* Layout Controls - Only show in tab view mode */}
          {!isResponsive && !hideLayoutControls && autoViewMode === 'tabs' && (
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
      <div className={clsx(
        "flex-1 overflow-y-auto p-6 transition-opacity duration-200",
        (isPending || isStale) && "opacity-60"
      )}>
        <Suspense fallback={<ContentLoadingSkeleton />}>
          {autoViewMode === 'tabs' ? (
            // Tab View - Show single category (for ALL)
            <div className="glass rounded-lg p-6">
              {deferredCategoryData ? (
                <TearsheetCategoryContent
                  categoryData={deferredCategoryData}
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
          ) : (
            // Unified View - Show all categories (for asset-specific)
            <UnifiedCategoryView
              categories={categories}
              layout={selectedLayout}
              debug={debug}
            />
          )}
        </Suspense>
      </div>
    </div>
  )
}

export default TearsheetDashboard