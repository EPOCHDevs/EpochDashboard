// Import using default exports as shown in debug
import commonModule from "@epochlab/epoch-protos/common"
// import tearsheetModule from "@epochlab/epoch-protos/tearsheet"
import chartModule from "@epochlab/epoch-protos/chart_def"
import tableModule from "@epochlab/epoch-protos/table_def"

// Access epoch_proto namespace from default exports
// const common_proto = commonModule.epoch_proto
// const tearsheet_proto = tearsheetModule.epoch_proto
// const chart_proto = chartModule.epoch_proto
// const table_proto = tableModule.epoch_proto

// Export real protobuf types (using instance types of the classes)
export type CardData = InstanceType<typeof tableModule.epoch_proto.CardData>
export type ICardData = InstanceType<typeof tableModule.epoch_proto.CardData>
export type CardDef = InstanceType<typeof tableModule.epoch_proto.CardDef>
export type Scalar = InstanceType<typeof commonModule.epoch_proto.Scalar>
export type IScalar = InstanceType<typeof commonModule.epoch_proto.Scalar>

// Chart types
export type ChartDef = InstanceType<typeof chartModule.epoch_proto.ChartDef>
export type AxisDef = InstanceType<typeof chartModule.epoch_proto.AxisDef>
export type StraightLineDef = InstanceType<typeof chartModule.epoch_proto.StraightLineDef>
export type Band = InstanceType<typeof chartModule.epoch_proto.Band>
export type Point = InstanceType<typeof chartModule.epoch_proto.Point>
export type Line = InstanceType<typeof chartModule.epoch_proto.Line>
export type LinesDef = InstanceType<typeof chartModule.epoch_proto.LinesDef>
export type HeatMapPoint = InstanceType<typeof chartModule.epoch_proto.HeatMapPoint>
export type HeatMapDef = InstanceType<typeof chartModule.epoch_proto.HeatMapDef>
export type BarDef = InstanceType<typeof chartModule.epoch_proto.BarDef>
export type BarData = InstanceType<typeof chartModule.epoch_proto.BarData>
export type AreaDef = InstanceType<typeof chartModule.epoch_proto.AreaDef>
export type HistogramDef = InstanceType<typeof chartModule.epoch_proto.HistogramDef>
export type BoxPlotDataPoint = InstanceType<typeof chartModule.epoch_proto.BoxPlotDataPoint>
export type BoxPlotOutlier = InstanceType<typeof chartModule.epoch_proto.BoxPlotOutlier>
export type BoxPlotDataPointDef = InstanceType<typeof chartModule.epoch_proto.BoxPlotDataPointDef>
export type BoxPlotDef = InstanceType<typeof chartModule.epoch_proto.BoxPlotDef>
export type XRangePoint = InstanceType<typeof chartModule.epoch_proto.XRangePoint>
export type XRangeDef = InstanceType<typeof chartModule.epoch_proto.XRangeDef>
export type PieData = InstanceType<typeof chartModule.epoch_proto.PieData>
export type PieDataDef = InstanceType<typeof chartModule.epoch_proto.PieDataDef>
export type PieDef = InstanceType<typeof chartModule.epoch_proto.PieDef>
export type Chart = InstanceType<typeof chartModule.epoch_proto.Chart>

// Export enums from protobuf package
export const EpochFolioType = commonModule.epoch_proto.EpochFolioType
export const EpochFolioDashboardWidget = commonModule.epoch_proto.EpochFolioDashboardWidget
export const AxisType = commonModule.epoch_proto.AxisType
export const DashStyle = commonModule.epoch_proto.DashStyle
export const StackType = chartModule.epoch_proto.StackType