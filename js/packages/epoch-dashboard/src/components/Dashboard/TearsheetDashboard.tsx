'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  LayoutGrid,
  Columns3,
  Columns2,
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
}

const TearsheetDashboard: React.FC<TearsheetDashboardProps> = ({
  tearsheet,
  className = '',
  hideLayoutControls = false,
  onCategoryChange,
  onLayoutChange,
  debug = false
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

  useEffect(() => {
    const checkResponsive = () => {
      setIsResponsive(window.innerWidth < 1280) // xl breakpoint
    }
    checkResponsive()
    window.addEventListener('resize', checkResponsive)
    return () => window.removeEventListener('resize', checkResponsive)
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
      {/* Header with Tabs and Layout Controls */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 flex-1 epoch-scrollbar-horizontal">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.value)}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all duration-200
                flex items-center gap-2 whitespace-nowrap
                ${activeCategory === category.value
                  ? 'bg-territory-cyan/20 text-territory-cyan border border-territory-cyan/30'
                  : 'glass text-primary-white/60 hover:text-primary-white/80'
                }
              `}
            >
              {category.label}
              <span className="text-xs opacity-60">
                ({category.data.charts.length + category.data.cards.length + category.data.tables.length})
              </span>
            </button>
          ))}
        </div>

        {/* Layout Controls */}
        {!isResponsive && !hideLayoutControls && (
          <div className="flex items-center gap-1 ml-4">
            {DASHBOARD_LAYOUTS.filter(layout =>
              layout.value !== 'single' // Hide single column on desktop
            ).map((layout) => (
              <button
                key={layout.id}
                onClick={() => handleLayoutChange(layout.value)}
                className={`
                  p-2 rounded transition-all duration-200
                  ${selectedLayout === layout.value
                    ? 'text-primary-white bg-primary-white/20'
                    : 'text-primary-white/40 hover:text-primary-white/60 hover:bg-primary-white/10'
                  }
                `}
                title={layout.title}
              >
                {layout.icon}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="
          h-full
          glass
          rounded-lg
          p-6
          overflow-y-auto
          scrollbar-hide
        ">
          {activeCategoryData ? (
            <TearsheetCategoryContent
              categoryData={activeCategoryData}
              layout={selectedLayout}
              debug={debug}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-primary-white/40 text-lg mb-2">
                  No Data Available
                </div>
                <div className="text-primary-white/20 text-sm">
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