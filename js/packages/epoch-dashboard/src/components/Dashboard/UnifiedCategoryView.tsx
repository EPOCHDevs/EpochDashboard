'use client'

import React from 'react'
import TearsheetCategoryContent from './TearsheetCategoryContent'
import { CategoryData } from '../../utils/tearsheetHelpers'

interface UnifiedCategoryViewProps {
  categories: Array<{
    id: string
    label: string
    value: string
    data: CategoryData
  }>
  layout: string
  debug?: boolean
}

const UnifiedCategoryView: React.FC<UnifiedCategoryViewProps> = ({
  categories,
  layout,
  debug = false
}) => {
  // Debug logging
  if (debug) {
    console.group('🌐 UnifiedCategoryView Debug')
    console.log('📊 Total categories:', categories.length)
    console.log('🔧 Layout:', layout)
    console.groupEnd()
  }

  return (
    <div className="space-y-12">
      {categories.map((category, index) => (
        <div key={category.id} className="space-y-4">
          {/* Category Header with Separator */}
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <h2 className="text-2xl font-bold text-foreground tracking-tight">
                {category.label}
              </h2>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
          </div>

          {/* Category Content */}
          <div className="glass rounded-lg p-6">
            <TearsheetCategoryContent
              categoryData={category.data}
              layout={layout}
              debug={debug}
            />
          </div>

          {/* Add extra spacing between categories, except for the last one */}
          {index < categories.length - 1 && (
            <div className="h-8" />
          )}
        </div>
      ))}

      {/* Empty State */}
      {categories.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-foreground/40 text-lg mb-2">
              No Categories Available
            </div>
            <div className="text-foreground/20 text-sm">
              No data to display
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UnifiedCategoryView