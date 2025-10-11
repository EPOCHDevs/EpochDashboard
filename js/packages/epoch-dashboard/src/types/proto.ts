// Import using default exports as shown in debug
import commonModule from "@epochlab/epoch-protos/common"
import tearsheetModule from "@epochlab/epoch-protos/tearsheet"
import chartModule from "@epochlab/epoch-protos/chart_def"
import tableModule from "@epochlab/epoch-protos/table_def"

// Access epoch_proto namespace from default exports
// const common_proto = commonModule.epoch_proto
// const tearsheet_proto = tearsheetModule.epoch_proto
// const chart_proto = chartModule.epoch_proto
// const table_proto = tableModule.epoch_proto

// Export table/common proto types (interfaces)
export type Scalar = commonModule.epoch_proto.IScalar
export type IScalar = Scalar
export type CardData = tableModule.epoch_proto.ICardData
export type ICardData = CardData
export type CardDef = tableModule.epoch_proto.ICardDef

// Export proto interface types (plain objects)
export type ChartDef = chartModule.epoch_proto.IChartDef
export type AxisDef = chartModule.epoch_proto.IAxisDef
export type StraightLineDef = chartModule.epoch_proto.IStraightLineDef
export type Band = chartModule.epoch_proto.IBand
export type Point = chartModule.epoch_proto.IPoint
export type Line = chartModule.epoch_proto.ILine
export type LinesDef = chartModule.epoch_proto.ILinesDef
export type NumericPoint = chartModule.epoch_proto.INumericPoint
export type NumericLine = chartModule.epoch_proto.INumericLine
export type NumericLinesDef = chartModule.epoch_proto.INumericLinesDef
export type HeatMapPoint = chartModule.epoch_proto.IHeatMapPoint
export type HeatMapDef = chartModule.epoch_proto.IHeatMapDef

// ProtoArray type for Histogram
export type ProtoArray = chartModule.epoch_proto.IArray
export type BarDef = chartModule.epoch_proto.IBarDef
export type AreaDef = chartModule.epoch_proto.IAreaDef
export type BarData = chartModule.epoch_proto.IBarData
export type HistogramDef = chartModule.epoch_proto.IHistogramDef
export type BoxPlotDataPoint = chartModule.epoch_proto.IBoxPlotDataPoint
export type BoxPlotOutlier = chartModule.epoch_proto.IBoxPlotOutlier
export type BoxPlotDataPointDef = chartModule.epoch_proto.IBoxPlotDataPointDef
export type BoxPlotDef = chartModule.epoch_proto.IBoxPlotDef
export type XRangePoint = chartModule.epoch_proto.IXRangePoint
export type XRangeDef = chartModule.epoch_proto.IXRangeDef
export type PieData = chartModule.epoch_proto.IPieData
export type PieDataDef = chartModule.epoch_proto.IPieDataDef
export type PieDef = chartModule.epoch_proto.IPieDef
export type Chart = chartModule.epoch_proto.IChart

// Export tearsheet types
export type TearSheet = tearsheetModule.epoch_proto.ITearSheet
export type CardDefList = tearsheetModule.epoch_proto.ICardDefList
export type ChartList = tearsheetModule.epoch_proto.IChartList
export type TableList = tearsheetModule.epoch_proto.ITableList
export type Table = tearsheetModule.epoch_proto.ITable
export type TableData = tearsheetModule.epoch_proto.ITableData
export type TableRow = tearsheetModule.epoch_proto.ITableRow
export type ColumnDef = tearsheetModule.epoch_proto.IColumnDef

// Export Tearsheet class for encoding/decoding
export const TearSheetClass = tearsheetModule.epoch_proto.TearSheet

// Export enums from protobuf package (as both values and types)
export const EpochFolioType = commonModule.epoch_proto.EpochFolioType
export type EpochFolioType = commonModule.epoch_proto.EpochFolioType
export const EpochFolioDashboardWidget = commonModule.epoch_proto.EpochFolioDashboardWidget
export type EpochFolioDashboardWidget = commonModule.epoch_proto.EpochFolioDashboardWidget
export const AxisType = commonModule.epoch_proto.AxisType
export type AxisType = commonModule.epoch_proto.AxisType
export const DashStyle = commonModule.epoch_proto.DashStyle
export type DashStyle = commonModule.epoch_proto.DashStyle
export const StackType = chartModule.epoch_proto.StackType
export type StackType = chartModule.epoch_proto.StackType