'use client'

import React, { Suspense } from 'react'
import {
  LineChart,
  BarChart,
  AreaChart,
  HeatMap,
  Histogram,
  BoxPlot,
  XRangeChart,
  PieChart
} from '../charts'
import Card from '../Card'
import Table from '../Table'
import { DASHBOARD_LAYOUTS } from './index'
import type { DashboardCategory } from './index'
import { Chart } from '../../types/proto'

// Loading skeletons
const ChartSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-[400px] bg-primary-white/5 rounded-lg">
      <div className="p-4">
        <div className="h-4 bg-primary-white/10 rounded w-1/3 mb-4" />
        <div className="h-64 bg-primary-white/10 rounded" />
      </div>
    </div>
  </div>
)

const CardSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-[120px] bg-primary-white/5 rounded-lg p-4">
      <div className="h-4 bg-primary-white/10 rounded w-2/3 mb-3" />
      <div className="h-8 bg-primary-white/10 rounded w-1/3 mb-2" />
      <div className="h-3 bg-primary-white/10 rounded w-1/2" />
    </div>
  </div>
)

const TableSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-[300px] bg-primary-white/5 rounded-lg p-4">
      <div className="h-4 bg-primary-white/10 rounded w-1/2 mb-4" />
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 bg-primary-white/10 rounded" />
        ))}
      </div>
    </div>
  </div>
)

// Component mapper for chart types
const ChartComponent = ({ chart }: { chart: Chart }) => {
  // Determine which chart type to render based on the populated field
  if (chart.areaDef) {
    return <AreaChart data={chart.areaDef} height={400} />
  } else if (chart.barDef) {
    return <BarChart data={chart.barDef} height={400} />
  } else if (chart.linesDef) {
    return <LineChart data={chart.linesDef} height={400} />
  } else if (chart.heatMapDef) {
    return <HeatMap data={chart.heatMapDef} height={400} />
  } else if (chart.histogramDef) {
    return <Histogram data={chart.histogramDef} height={400} />
  } else if (chart.boxPlotDef) {
    return <BoxPlot data={chart.boxPlotDef} height={400} />
  } else if (chart.xRangeDef) {
    return <XRangeChart data={chart.xRangeDef} height={400} />
  } else if (chart.pieDef) {
    return <PieChart data={chart.pieDef} height={400} />
  }

  // Fallback for unsupported chart types
  return (
    <div className="h-[400px] flex items-center justify-center bg-primary-white/5 rounded-lg">
      <div className="text-primary-white/40">
        Unsupported chart type
      </div>
    </div>
  )
}

interface CategoryContentProps {
  category: DashboardCategory
  layout: string
}

const CategoryContent: React.FC<CategoryContentProps> = ({
  category,
  layout
}) => {
  const layoutConfig = DASHBOARD_LAYOUTS.find(l => l.value === layout)
  const gridClass = layoutConfig?.gridClass || 'grid-cols-2'

  // Determine if we should use full width for tables
  const isCompactLayout = layout === 'columns_3' || layout === 'columns_2x2'

  // Helper to determine if chart should span full width
  const isFullWidthChart = (chart: Chart): boolean => {
    // For now, make heatmaps and xrange charts full width
    return !!(chart.heatMapDef || chart.xRangeDef)
  }

  return (
    <div className={`grid gap-6 ${gridClass}`}>
      {/* Render Cards */}
      {category.cards?.map((card, index) => (
        <Suspense key={`card-${index}`} fallback={<CardSkeleton />}>
          <div className="h-fit">
            <Card cardDef={card} />
          </div>
        </Suspense>
      ))}

      {/* Render Tables */}
      {category.tables?.map((table, index) => (
        <Suspense key={`table-${index}`} fallback={<TableSkeleton />}>
          <div className={isCompactLayout ? '' : 'col-span-full'}>
            <Table
              headers={table.headers || []}
              rows={table.rows || []}
              columnTypes={table.columnTypes || []}
            />
          </div>
        </Suspense>
      ))}

      {/* Render Charts */}
      {category.charts?.map((chart, index) => (
        <Suspense key={`chart-${index}`} fallback={<ChartSkeleton />}>
          <div className={
            // Determine if chart should span multiple columns
            isFullWidthChart(chart) ? 'col-span-full' : ''
          }>
            <ChartComponent chart={chart} />
          </div>
        </Suspense>
      ))}

      {/* Empty State */}
      {!category.cards?.length && !category.tables?.length && !category.charts?.length && (
        <div className="col-span-full flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-primary-white/40 text-lg mb-2">
              No Content Available
            </div>
            <div className="text-primary-white/20 text-sm">
              This category doesn't have any data to display
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoryContent