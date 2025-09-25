// Import using default exports as shown in debug
import commonModule from "@epochlab/epoch-protos/common"
import tearsheetModule from "@epochlab/epoch-protos/tearsheet"
import chartModule from "@epochlab/epoch-protos/chart_def"
import tableModule from "@epochlab/epoch-protos/table_def"

// Access epoch_proto namespace from default exports
const common_proto = commonModule.epoch_proto
const tearsheet_proto = tearsheetModule.epoch_proto
const chart_proto = chartModule.epoch_proto
const table_proto = tableModule.epoch_proto

// Export real protobuf types
export type CardData = table_proto.ICardData
export type ICardData = table_proto.ICardData
export type CardDef = table_proto.ICardDef
export type Scalar = common_proto.IScalar
export type IScalar = common_proto.IScalar

// Export enums from protobuf package
export const EpochFolioType = common_proto.EpochFolioType
export const EpochFolioDashboardWidget = common_proto.EpochFolioDashboardWidget
export const AxisType = common_proto.AxisType
export const DashStyle = common_proto.DashStyle