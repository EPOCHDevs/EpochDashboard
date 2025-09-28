// Note: FullTearSheet and TearSheet types are not yet defined in proto
// import { FullTearSheet, TearSheet } from './proto'

export enum DashboardLayout {
  COLUMNS_3 = 'columns_3',
  COLUMNS_2 = 'columns_2',
  GRID_2X2 = 'columns_2x2',
  SINGLE = 'single'
}

export interface DashboardProps {
  data: any // FullTearSheet - to be defined
  category?: string
  layout?: DashboardLayout
  className?: string
  onCategoryChange?: (category: string) => void
}

export interface CategoryContentProps {
  data: any // TearSheet - to be defined
  layout?: DashboardLayout
  className?: string
}

export interface DashboardTheme {
  colors: {
    primary: string
    secondary: string
    background: string
    surface: string
    text: string
    textSecondary: string
    border: string
    error: string
    success: string
    warning: string
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
  }
  typography: {
    fontFamily: string
    fontSize: {
      xs: string
      sm: string
      md: string
      lg: string
      xl: string
    }
    fontWeight: {
      normal: number
      medium: number
      semibold: number
      bold: number
    }
  }
  borderRadius: {
    sm: string
    md: string
    lg: string
  }
}

export interface ChartOptions {
  height?: number | string
  width?: number | string
  responsive?: boolean
  animation?: boolean
}

export interface TableOptions {
  sortable?: boolean
  paginated?: boolean
  pageSize?: number
  striped?: boolean
}

export interface CardOptions {
  variant?: 'default' | 'compact' | 'detailed'
  showTrend?: boolean
}