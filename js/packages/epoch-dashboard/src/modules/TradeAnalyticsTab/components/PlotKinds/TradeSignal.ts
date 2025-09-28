import { SeriesConfig } from "../../../../types/TradeAnalyticsTypes"
import { DataType, Table } from "apache-arrow"
import { SeriesFlagsOptions } from "highcharts"
import { TRADE_ANALYTICS_PLOT_STYLES } from "../../../../constants/tradeAnalytics"

export const TRADE_SIGNAL_PLOT_KIND_DATA_KEYS = [
  "index",
  "enter_long",
  "enter_short",
  "exit_long",
  "exit_short",
]

interface generateTradeSignalPlotKindSeriesOptionsProps {
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
}

export const generateTradeSignalPlotKindSeriesOptions = ({
  data,
  seriesConfig,
}: generateTradeSignalPlotKindSeriesOptionsProps): SeriesFlagsOptions[] => {
  // Get the boolean values and timestamps from data
  const enterLongColumn = data?.getChild(seriesConfig.dataMapping.enter_long || "enter_long")
  const enterShortColumn = data?.getChild(seriesConfig.dataMapping.enter_short || "enter_short")
  const exitLongColumn = data?.getChild(seriesConfig.dataMapping.exit_long || "exit_long")
  const exitShortColumn = data?.getChild(seriesConfig.dataMapping.exit_short || "exit_short")
  const indexColumn = data?.getChild(seriesConfig.dataMapping.index || "index")

  if (!indexColumn) {
    console.warn("TradeSignalPlotKindHandler: Missing index column")
    return []
  }

  // Check if we have at least one of the columns
  if (!enterLongColumn && !enterShortColumn && !exitLongColumn && !exitShortColumn) {
    console.warn(
      "TradeSignalPlotKindHandler: Missing required trade signal columns (enter_long/enter_short/exit_long/exit_short)"
    )
    return []
  }

  const seriesOptions: SeriesFlagsOptions[] = []
  const styles = TRADE_ANALYTICS_PLOT_STYLES.trade_signal

  // Enter Long
  if (enterLongColumn) {
    const longFlagData: SeriesFlagsOptions["data"] = []
    let lastLongFlag = null

    for (let i = 0; i < enterLongColumn.length; i++) {
      const value = enterLongColumn.get(i)
      const timestamp = indexColumn.get(i)

      // Add a flag where value is true (signal is active)
      if (value === true && lastLongFlag !== true) {
        longFlagData.push({
          x: timestamp,
          title: "L",
          text: "ENTER LONG",
        })
      }
      lastLongFlag = value
    }

    if (longFlagData.length > 0) {
      seriesOptions.push({
        type: "flags",
        name: `${seriesConfig.name} - Enter Long`,
        id: `${seriesConfig.id}_enter_long`,
        data: longFlagData,
        yAxis: seriesConfig.yAxis,
        zIndex: seriesConfig.zIndex,
        shape: styles.shape,
        width: styles.width,
        fillColor: styles.long.fillColor,
        color: styles.long.color,
        lineWidth: styles.lineWidth,
        style: {
          color: styles.long.textColor,
          fontSize: "10px",
          fontWeight: "bold",
        },
        states: {
          hover: {
            fillColor: styles.long.hoverColor,
            brightness: 0.2,
          },
        },
        accessibility: {
          exposeAsGroupOnly: true,
          description: `${seriesConfig.name} enter long signals`,
        },
        tooltip: {
          pointFormat: `<span style="color:{point.color}">●</span> {series.name}: <b>{point.text}</b><br/>`,
        },
      })
    }
  }

  // Enter Short
  if (enterShortColumn) {
    const shortFlagData: SeriesFlagsOptions["data"] = []
    let lastShortFlag = null

    for (let i = 0; i < enterShortColumn.length; i++) {
      const value = enterShortColumn.get(i)
      const timestamp = indexColumn.get(i)

      // Add a flag where value is true (signal is active)
      if (value === true && lastShortFlag !== true) {
        shortFlagData.push({
          x: timestamp,
          title: "S",
          text: "ENTER SHORT",
        })
      }
      lastShortFlag = value
    }

    if (shortFlagData.length > 0) {
      seriesOptions.push({
        type: "flags",
        name: `${seriesConfig.name} - Enter Short`,
        id: `${seriesConfig.id}_enter_short`,
        data: shortFlagData,
        yAxis: seriesConfig.yAxis,
        zIndex: seriesConfig.zIndex,
        shape: styles.shape,
        width: styles.width,
        fillColor: styles.short.fillColor,
        color: styles.short.color,
        lineWidth: styles.lineWidth,
        style: {
          color: styles.short.textColor,
          fontSize: "10px",
          fontWeight: "bold",
        },
        states: {
          hover: {
            fillColor: styles.short.hoverColor,
            brightness: 0.2,
          },
        },
        accessibility: {
          exposeAsGroupOnly: true,
          description: `${seriesConfig.name} enter short signals`,
        },
        tooltip: {
          pointFormat: `<span style="color:{point.color}">●</span> {series.name}: <b>{point.text}</b><br/>`,
        },
      })
    }
  }

  // Exit Long
  if (exitLongColumn) {
    const exitLongFlagData: SeriesFlagsOptions["data"] = []
    let lastExitLongFlag = null

    for (let i = 0; i < exitLongColumn.length; i++) {
      const value = exitLongColumn.get(i)
      const timestamp = indexColumn.get(i)

      // Add a flag where value is true (signal is active)
      if (value === true && lastExitLongFlag !== true) {
        exitLongFlagData.push({
          x: timestamp,
          title: "XL",
          text: "EXIT LONG",
        })
      }
      lastExitLongFlag = value
    }

    if (exitLongFlagData.length > 0) {
      seriesOptions.push({
        type: "flags",
        name: `${seriesConfig.name} - Exit Long`,
        id: `${seriesConfig.id}_exit_long`,
        data: exitLongFlagData,
        yAxis: seriesConfig.yAxis,
        zIndex: seriesConfig.zIndex,
        shape: styles.shape,
        width: styles.width,
        fillColor: styles.close.fillColor,
        color: styles.close.color,
        lineWidth: styles.lineWidth,
        style: {
          color: styles.close.textColor,
          fontSize: "10px",
          fontWeight: "bold",
        },
        states: {
          hover: {
            fillColor: styles.close.hoverColor,
            brightness: 0.2,
          },
        },
        accessibility: {
          exposeAsGroupOnly: true,
          description: `${seriesConfig.name} exit long signals`,
        },
        tooltip: {
          pointFormat: `<span style="color:{point.color}">●</span> {series.name}: <b>{point.text}</b><br/>`,
        },
      })
    }
  }

  // Exit Short
  if (exitShortColumn) {
    const exitShortFlagData: SeriesFlagsOptions["data"] = []
    let lastExitShortFlag = null

    for (let i = 0; i < exitShortColumn.length; i++) {
      const value = exitShortColumn.get(i)
      const timestamp = indexColumn.get(i)

      if (value === true && lastExitShortFlag !== true) {
        exitShortFlagData.push({
          x: timestamp,
          title: "XS",
          text: "EXIT SHORT",
        })
      }
      lastExitShortFlag = value
    }

    if (exitShortFlagData.length > 0) {
      seriesOptions.push({
        type: "flags",
        name: `${seriesConfig.name} - Exit Short`,
        id: `${seriesConfig.id}_exit_short`,
        data: exitShortFlagData,
        yAxis: seriesConfig.yAxis,
        zIndex: seriesConfig.zIndex,
        shape: styles.shape,
        width: styles.width,
        fillColor: styles.close.fillColor,
        color: styles.close.color,
        lineWidth: styles.lineWidth,
        style: {
          color: styles.close.textColor,
          fontSize: "10px",
          fontWeight: "bold",
        },
        states: {
          hover: {
            fillColor: styles.close.hoverColor,
            brightness: 0.2,
          },
        },
        accessibility: {
          exposeAsGroupOnly: true,
          description: `${seriesConfig.name} exit short signals`,
        },
        tooltip: {
          pointFormat: `<span style="color:{point.color}">●</span> {series.name}: <b>{point.text}</b><br/>`,
        },
      })
    }
  }

  return seriesOptions
}
