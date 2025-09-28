'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  LayoutGrid,
  Columns3,
  Columns2,
  Info
} from 'lucide-react'
import CategoryContent from './CategoryContent'
import { Chart, CardDef } from '../../types/proto'

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

export interface DashboardCategory {
  id: string
  label: string
  value: string
  description?: string
  charts?: Chart[]
  tables?: any[]
  cards?: CardDef[]
}

export interface DashboardMetadata {
  categories: DashboardCategory[]
  defaultCategory?: string
  defaultLayout?: string
}

interface DashboardProps {
  metadata: DashboardMetadata
  className?: string
  hideLayoutControls?: boolean
  onCategoryChange?: (category: string) => void
  onLayoutChange?: (layout: string) => void
}

const Dashboard: React.FC<DashboardProps> = ({
  metadata,
  className = '',
  hideLayoutControls = false,
  onCategoryChange,
  onLayoutChange
}) => {
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
    metadata.defaultCategory || metadata.categories[0]?.value || ''
  )

  const [selectedLayout, setSelectedLayout] = useState<string>(
    metadata.defaultLayout || (isResponsive ? 'single' : 'columns_2')
  )

  // Update layout based on responsive state
  useEffect(() => {
    if (!metadata.defaultLayout) {
      setSelectedLayout(isResponsive ? 'single' : 'columns_2')
    }
  }, [isResponsive, metadata.defaultLayout])

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category)
    onCategoryChange?.(category)
  }

  // Handle layout change
  const handleLayoutChange = (layout: string) => {
    setSelectedLayout(layout)
    onLayoutChange?.(layout)
  }

  // Get active category data
  const activeCategoryData = useMemo(() => {
    return metadata.categories.find(cat => cat.value === activeCategory)
  }, [metadata.categories, activeCategory])

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header with Tabs and Layout Controls */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 flex-1 overflow-x-auto scrollbar-hide">
          {metadata.categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.value)}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all duration-200
                flex items-center gap-2 whitespace-nowrap
                ${activeCategory === category.value
                  ? 'bg-primary-white/20 text-primary-white'
                  : 'bg-primary-white/5 text-primary-white/60 hover:bg-primary-white/10 hover:text-primary-white/80'
                }
              `}
            >
              {category.label}
              {category.description && (
                <div className="group relative">
                  <Info size={14} className="opacity-60" />
                  <div className="
                    absolute left-1/2 -translate-x-1/2 bottom-full mb-2
                    bg-black/90 text-white text-xs px-2 py-1 rounded
                    whitespace-nowrap opacity-0 group-hover:opacity-100
                    pointer-events-none transition-opacity z-50
                  ">
                    {category.description}
                  </div>
                </div>
              )}
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
          bg-primary-white/2
          border border-primary-white/10
          rounded-lg
          p-6
          overflow-y-auto
          scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent
        ">
          {activeCategoryData ? (
            <CategoryContent
              category={activeCategoryData}
              layout={selectedLayout}
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

export default Dashboard