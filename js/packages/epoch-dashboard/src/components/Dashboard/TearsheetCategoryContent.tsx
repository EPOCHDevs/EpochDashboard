'use client'

import React, { Suspense } from 'react'
import {
  LineChart,
  NumericLineChart,
  BarChart,
  AreaChart,
  HeatMap,
  Histogram,
  BoxPlot,
  XRangeChart,
  PieChart
} from '../charts'
import Card from '../Card'
import TearsheetTable from './TearsheetTable'
import { DASHBOARD_LAYOUTS } from './TearsheetDashboard'
import { CategoryData } from '../../utils/tearsheetHelpers'
import { Chart, Table } from '../../types/proto'

// Loading skeletons
const ChartSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-[400px] bg-card/50 rounded-lg">
      <div className="p-4">
        <div className="h-4 bg-foreground/10 rounded w-1/3 mb-4" />
        <div className="h-64 bg-foreground/10 rounded" />
      </div>
    </div>
  </div>
)

const CardSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-[120px] bg-card/50 rounded-lg p-4">
      <div className="h-4 bg-foreground/10 rounded w-2/3 mb-3" />
      <div className="h-8 bg-foreground/10 rounded w-1/3 mb-2" />
      <div className="h-3 bg-foreground/10 rounded w-1/2" />
    </div>
  </div>
)

const TableSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-[300px] bg-card/50 rounded-lg p-4">
      <div className="h-4 bg-foreground/10 rounded w-1/2 mb-4" />
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 bg-foreground/10 rounded" />
        ))}
      </div>
    </div>
  </div>
)

// Component mapper for chart types
const ChartComponent = ({ chart, debug }: { chart: Chart, debug?: boolean }) => {
  // Debug logging for individual charts
  if (debug) {
    const chartType = chart.areaDef ? 'Area' :
                     chart.barDef ? 'Bar' :
                     chart.linesDef ? 'Line' :
                     chart.numericLinesDef ? 'NumericLine' :
                     chart.heatMapDef ? 'HeatMap' :
                     chart.histogramDef ? 'Histogram' :
                     chart.boxPlotDef ? 'BoxPlot' :
                     chart.xRangeDef ? 'XRange' :
                     chart.pieDef ? 'Pie' : 'Unknown'

    console.group(`📊 ${chartType} Chart Debug`)
    console.log('Chart data:', chart)
    console.log('Chart definition:',
      chart.areaDef || chart.barDef || chart.linesDef || chart.numericLinesDef ||
      chart.heatMapDef || chart.histogramDef || chart.boxPlotDef || chart.xRangeDef || chart.pieDef)
    console.groupEnd()
  }

  // Determine which chart type to render based on the populated field
  if (chart.areaDef) {
    return <AreaChart data={chart.areaDef} height={400} />
  } else if (chart.barDef) {
    return <BarChart data={chart.barDef} height={400} />
  } else if (chart.linesDef) {
    return <LineChart data={chart.linesDef} height={400} />
  } else if (chart.numericLinesDef) {
    return <NumericLineChart data={chart.numericLinesDef} height={400} />
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
  if (debug) {
    console.warn('⚠️ Unsupported chart type:', chart)
  }

  return (
    <div className="h-[400px] flex items-center justify-center bg-card/50 rounded-lg">
      <div className="text-muted-foreground">
        Unsupported chart type
      </div>
    </div>
  )
}

interface TearsheetCategoryContentProps {
  categoryData: CategoryData
  layout: string
  debug?: boolean
}

const TearsheetCategoryContent: React.FC<TearsheetCategoryContentProps> = ({
  categoryData,
  layout,
  debug = false
}) => {
  const layoutConfig = DASHBOARD_LAYOUTS.find(l => l.value === layout)
  const gridClass = layoutConfig?.gridClass || 'grid-cols-2'

  // Determine if we should use full width for tables
  const isCompactLayout = layout === 'columns_3' || layout === 'columns_2x2'

  // Helper to get title from chart/table/card
  const getTitle = (item: Chart | Table | any): string => {
    if ('chartDef' in item) {
      // It's a Chart - check all possible chart types
      return item.linesDef?.chartDef?.title ||
             item.barDef?.chartDef?.title ||
             item.areaDef?.chartDef?.title ||
             item.heatMapDef?.chartDef?.title ||
             item.histogramDef?.chartDef?.title ||
             item.boxPlotDef?.chartDef?.title ||
             item.xRangeDef?.chartDef?.title ||
             item.pieDef?.chartDef?.title || ''
    }
    return item.title || ''
  }

  // Sort function for STAT category items - sort by title prefix [S, R, T, A]
  const sortStatItems = <T,>(items: T[]): T[] => {
    if (categoryData.label !== 'STAT') return items

    const statOrder = ['S', 'R', 'T', 'A']
    return [...items].sort((a, b) => {
      const titleA = getTitle(a)
      const titleB = getTitle(b)

      // Extract first letter
      const prefixA = titleA.charAt(0).toUpperCase()
      const prefixB = titleB.charAt(0).toUpperCase()

      const indexA = statOrder.indexOf(prefixA)
      const indexB = statOrder.indexOf(prefixB)

      // If both have STAT prefixes, sort by order
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB
      }

      // If only one has STAT prefix, it comes first
      if (indexA !== -1) return -1
      if (indexB !== -1) return 1

      // Otherwise, alphabetical
      return titleA.localeCompare(titleB)
    })
  }

  // Sort charts, tables, and cards based on category
  const sortedCharts = sortStatItems(categoryData.charts)
  const sortedTables = sortStatItems(categoryData.tables)
  const sortedCards = sortStatItems(categoryData.cards)

  // Helper to determine if chart should span full width
  const isFullWidthChart = (chart: Chart): boolean => {
    // For now, make heatmaps and xrange charts full width
    return !!(chart.heatMapDef || chart.xRangeDef)
  }

  // Helper to determine if table should span full width
  const isFullWidthTable = (): boolean => {
    return !isCompactLayout
  }

  // Debug logging
  if (debug) {
    console.group('📋 TearsheetCategoryContent Debug')
    console.log('🏷️ Category:', categoryData.label)
    console.log('📊 Charts count:', categoryData.charts.length)
    console.log('🃏 Cards count:', categoryData.cards.length)
    console.log('📋 Tables count:', categoryData.tables.length)
    console.log('🔧 Layout:', layout)
    console.log('📐 Grid class:', gridClass)
    console.groupEnd()
  }

  return (
    <div className={`grid gap-6 ${gridClass}`}>
      {/* Render Cards */}
      {sortedCards.map((card, index) => {
        if (debug) {
          console.group(`🃏 Card ${index + 1} Debug`)
          console.log('Card definition:', card)
          console.log('Card data count:', card.data?.length || 0)
          console.groupEnd()
        }
        return (
          <Suspense key={`card-${categoryData.id}-${index}`} fallback={<CardSkeleton />}>
            <div className="h-fit">
              <Card key={`card-instance-${categoryData.id}-${index}`} cardDef={card} />
            </div>
          </Suspense>
        )
      })}

      {/* Render Tables */}
      {sortedTables.map((table, index) => {
        if (debug) {
          console.group(`📋 Table ${index + 1} Debug`)
          console.log('Table definition:', table)
          console.log('Table rows count:', table.data?.rows?.length || 0)
          console.log('Table columns count:', table.columns?.length || 0)
          console.groupEnd()
        }
        return (
          <Suspense key={`table-${categoryData.id}-${index}`} fallback={<TableSkeleton />}>
            <div className={isFullWidthTable() ? 'col-span-full' : ''}>
              <TearsheetTable key={`table-instance-${categoryData.id}-${index}`} table={table} />
            </div>
          </Suspense>
        )
      })}

      {/* Render Charts */}
      {sortedCharts.map((chart, index) => (
        <Suspense key={`chart-${categoryData.id}-${index}`} fallback={<ChartSkeleton />}>
          <div className={
            isFullWidthChart(chart) ? 'col-span-full' : ''
          }>
            <ChartComponent key={`chart-instance-${categoryData.id}-${index}`} chart={chart} debug={debug} />
          </div>
        </Suspense>
      ))}

      {/* Empty State */}
      {categoryData.charts.length === 0 &&
       categoryData.cards.length === 0 &&
       categoryData.tables.length === 0 && (
        <div className="col-span-full flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-muted-foreground text-lg mb-2">
              No Content Available
            </div>
            <div className="text-muted-foreground/60 text-sm">
              This category doesn't have any data to display
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TearsheetCategoryContent