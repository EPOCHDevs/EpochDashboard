import {
  TearSheet,
  Chart,
  CardDef,
  Table,
  ChartList,
  CardDefList,
  TableList
} from '../types/proto'

export interface CategoryData {
  id: string
  label: string
  charts: Chart[]
  cards: CardDef[]
  tables: Table[]
}

/**
 * Extract unique categories from tearsheet data
 */
export function extractCategories(tearsheet: TearSheet): string[] {
  const categories = new Set<string>()

  // Extract from charts
  if (tearsheet.charts?.charts) {
    tearsheet.charts.charts.forEach((chart: Chart) => {
      // Check each chart type for category
      const category =
        chart.linesDef?.chartDef?.category ||
        chart.barDef?.chartDef?.category ||
        chart.areaDef?.chartDef?.category ||
        chart.heatMapDef?.chartDef?.category ||
        chart.histogramDef?.chartDef?.category ||
        chart.boxPlotDef?.chartDef?.category ||
        chart.xRangeDef?.chartDef?.category ||
        chart.pieDef?.chartDef?.category

      if (category) {
        categories.add(category)
      }
    })
  }

  // Extract from cards
  if (tearsheet.cards?.cards) {
    tearsheet.cards.cards.forEach((card: CardDef) => {
      if (card.category) {
        categories.add(card.category)
      }
    })
  }

  // Extract from tables
  if (tearsheet.tables?.tables) {
    tearsheet.tables.tables.forEach((table: Table) => {
      if (table.category) {
        categories.add(table.category)
      }
    })
  }

  // Sort categories with custom order [S, R, T, A] based on first letter
  const categoriesArray = Array.from(categories)
  const statOrder = ['S', 'R', 'T', 'A']

  return categoriesArray.sort((a, b) => {
    // Get first letter (uppercase) of each category
    const firstLetterA = a.charAt(0).toUpperCase()
    const firstLetterB = b.charAt(0).toUpperCase()

    // Find positions in STAT order
    const indexA = statOrder.indexOf(firstLetterA)
    const indexB = statOrder.indexOf(firstLetterB)

    // If both start with STAT letters, sort by STAT order
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB
    }

    // If only A starts with STAT letter, it comes first
    if (indexA !== -1) return -1

    // If only B starts with STAT letter, it comes first
    if (indexB !== -1) return 1

    // Otherwise, alphabetical sort
    return a.localeCompare(b)
  })
}

/**
 * Group tearsheet data by categories
 */
export function groupByCategory(tearsheet: TearSheet): Map<string, CategoryData> {
  const categoryMap = new Map<string, CategoryData>()
  const categories = extractCategories(tearsheet)

  // Initialize categories
  categories.forEach(category => {
    categoryMap.set(category, {
      id: category.toLowerCase().replace(/\s+/g, '-'),
      label: category,
      charts: [],
      cards: [],
      tables: []
    })
  })

  // Add "All" category for uncategorized items
  categoryMap.set('all', {
    id: 'all',
    label: 'All',
    charts: [],
    cards: [],
    tables: []
  })

  // Group charts
  if (tearsheet.charts?.charts) {
    tearsheet.charts.charts.forEach((chart: Chart) => {
      const category = getChartCategory(chart)
      const categoryData = categoryMap.get(category) || categoryMap.get('all')!
      categoryData.charts.push(chart)
    })
  }

  // Group cards
  if (tearsheet.cards?.cards) {
    tearsheet.cards.cards.forEach((card: CardDef) => {
      const category = card.category || 'all'
      const categoryData = categoryMap.get(category) || categoryMap.get('all')!
      categoryData.cards.push(card)
    })
  }

  // Group tables
  if (tearsheet.tables?.tables) {
    tearsheet.tables.tables.forEach((table: Table) => {
      const category = table.category || 'all'
      const categoryData = categoryMap.get(category) || categoryMap.get('all')!
      categoryData.tables.push(table)
    })
  }

  // Remove empty categories
  for (const [key, data] of categoryMap.entries()) {
    if (data.charts.length === 0 && data.cards.length === 0 && data.tables.length === 0) {
      categoryMap.delete(key)
    }
  }

  return categoryMap
}

/**
 * Get category from a chart
 */
function getChartCategory(chart: Chart): string {
  return (
    chart.linesDef?.chartDef?.category ||
    chart.barDef?.chartDef?.category ||
    chart.areaDef?.chartDef?.category ||
    chart.heatMapDef?.chartDef?.category ||
    chart.histogramDef?.chartDef?.category ||
    chart.boxPlotDef?.chartDef?.category ||
    chart.xRangeDef?.chartDef?.category ||
    chart.pieDef?.chartDef?.category ||
    'all'
  )
}

/**
 * Filter tearsheet data by category
 */
export function filterByCategory(
  tearsheet: TearSheet,
  category: string
): {
  charts: Chart[]
  cards: CardDef[]
  tables: Table[]
} {
  const result = {
    charts: [] as Chart[],
    cards: [] as CardDef[],
    tables: [] as Table[]
  }

  // Filter charts
  if (tearsheet.charts?.charts) {
    result.charts = tearsheet.charts.charts.filter((chart: Chart) => {
      const chartCategory = getChartCategory(chart)
      return chartCategory === category || category === 'all'
    })
  }

  // Filter cards
  if (tearsheet.cards?.cards) {
    result.cards = tearsheet.cards.cards.filter((card: CardDef) => {
      return card.category === category || category === 'all' || !card.category
    })
  }

  // Filter tables
  if (tearsheet.tables?.tables) {
    result.tables = tearsheet.tables.tables.filter((table: Table) => {
      return table.category === category || category === 'all' || !table.category
    })
  }

  return result
}

/**
 * Convert category string to display-friendly label
 */
export function formatCategoryLabel(category: string): string {
  if (category === 'all') return 'Overview'

  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Get chart title from Chart proto
 */
export function getChartTitle(chart: Chart): string {
  return (
    chart.linesDef?.chartDef?.title ||
    chart.barDef?.chartDef?.title ||
    chart.areaDef?.chartDef?.title ||
    chart.heatMapDef?.chartDef?.title ||
    chart.histogramDef?.chartDef?.title ||
    chart.boxPlotDef?.chartDef?.title ||
    chart.xRangeDef?.chartDef?.title ||
    chart.pieDef?.chartDef?.title ||
    'Untitled Chart'
  )
}

/**
 * Get chart ID from Chart proto
 */
export function getChartId(chart: Chart): string {
  return (
    chart.linesDef?.chartDef?.id ||
    chart.barDef?.chartDef?.id ||
    chart.areaDef?.chartDef?.id ||
    chart.heatMapDef?.chartDef?.id ||
    chart.histogramDef?.chartDef?.id ||
    chart.boxPlotDef?.chartDef?.id ||
    chart.xRangeDef?.chartDef?.id ||
    chart.pieDef?.chartDef?.id ||
    `chart-${Math.random().toString(36).substr(2, 9)}`
  )
}