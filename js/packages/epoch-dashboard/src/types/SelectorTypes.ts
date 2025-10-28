// Selector Card Types - matching backend CardColumnSchema structure

export enum CardSlot {
  PrimaryBadge = 'PrimaryBadge',
  SecondaryBadge = 'SecondaryBadge',
  Hero = 'Hero',
  Subtitle = 'Subtitle',
  Footer = 'Footer',
  Details = 'Details',
}

export enum CardRenderType {
  Text = 'Text',
  Integer = 'Integer',
  Decimal = 'Decimal',
  Percent = 'Percent',
  Monetary = 'Monetary',
  Duration = 'Duration',
  Badge = 'Badge',
  Timestamp = 'Timestamp',
  Boolean = 'Boolean',
}

export enum CardColor {
  Success = 'Success',
  Error = 'Error',
  Warning = 'Warning',
  Info = 'Info',
  Primary = 'Primary',
  Default = 'Default',
}

export enum CardIcon {
  Chart = 'Chart',
  Gap = 'Gap',
  Signal = 'Signal',
  Trade = 'Trade',
  Position = 'Position',
  Alert = 'Alert',
  TrendUp = 'TrendUp',
  TrendDown = 'TrendDown',
  Calendar = 'Calendar',
  Dollar = 'Dollar',
  Candle = 'Candle',
  Info = 'Info',
}

// Maps card colors to lists of column values that trigger that color
export type ColorMap = Partial<Record<CardColor, string[]>>

export interface CardColumnSchema {
  column_id: string // ID of the DataFrame column to display in this card slot
  slot: CardSlot // Card slot position where this column will be rendered
  render_type: CardRenderType // How to render this column's value
  color_map?: ColorMap // Optional color mapping for badge rendering
  label?: string // Optional display label (overrides column_id for display)
}

export interface SelectorMetadata {
  title: string
  icon: CardIcon
  pivot_index: number // Index of the pivot column in the DataFrame
  schemas: CardColumnSchema[]
}

// Paginated selector data response from backend
export interface SelectorDataResponse {
  items: CardRowData[] // Array of row objects
  page: number // Current page number
  total: number // Total number of items across all pages
}

// Extended metadata response that includes selector metadata
export interface SelectorMetadataByAsset {
  [assetId: string]: SelectorMetadata[]
}

// Card row data - single row from selector data
export interface CardRowData {
  [columnId: string]: any
  index?: number // Optional row index for navigation
}
