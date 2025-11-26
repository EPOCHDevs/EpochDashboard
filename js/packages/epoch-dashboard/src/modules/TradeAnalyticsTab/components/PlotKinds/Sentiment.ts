import { SeriesConfig } from "../../../../types/TradeAnalyticsTypes"
import { DataType, Table } from "apache-arrow"
import { getSharedPlotKindSeriesOptions, PlotElements } from "./EpochPlotKindOptions"
import { SeriesColumnOptions, YAxisPlotLinesOptions } from "highcharts"

export const SENTIMENT_PLOT_KIND_DATA_KEYS = [
  "index",
  "confidence",
  "positive",
  "negative",
  "neutral",
]

interface SentimentStyleOptions {
  positiveColor?: string
  neutralColor?: string
  negativeColor?: string
}

interface generateSentimentPlotKindSeriesOptionsProps {
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: SentimentStyleOptions
}

export const generateSentimentPlotKindSeriesOptions = ({
  data,
  seriesConfig,
  styleOptions,
}: generateSentimentPlotKindSeriesOptionsProps): PlotElements => {
  // Extract columns from Arrow table
  const indexColumn = data?.getChild(seriesConfig.dataMapping["index"] as string)
  const confidenceColumn = data?.getChild(seriesConfig.dataMapping["confidence"] as string)
  const positiveColumn = data?.getChild(seriesConfig.dataMapping["positive"] as string)
  const negativeColumn = data?.getChild(seriesConfig.dataMapping["negative"] as string)
  const neutralColumn = data?.getChild(seriesConfig.dataMapping["neutral"] as string)

  if (!indexColumn || !confidenceColumn || !positiveColumn || !negativeColumn || !neutralColumn) {
    return { series: [] }
  }

  // Color mapping for sentiment
  const positiveColor = styleOptions?.positiveColor || "#10B981" // green
  const neutralColor = styleOptions?.neutralColor || "#D97706" // yellow/amber
  const negativeColor = styleOptions?.negativeColor || "#EF4444" // red

  // Build data array with individual column colors based on dominant sentiment
  const columnData: Array<{
    x: number
    y: number
    color: string
    sentiment: string
  }> = []

  for (let i = 0; i < (data?.numRows ?? 0); i++) {
    const timestamp = indexColumn.get(i)
    const confidence = confidenceColumn.get(i)
    const positive = positiveColumn.get(i)
    const negative = negativeColumn.get(i)
    const neutral = neutralColumn.get(i)

    if (
      timestamp !== null &&
      confidence !== null &&
      !isNaN(confidence) &&
      positive !== null &&
      negative !== null &&
      neutral !== null
    ) {
      // Determine dominant sentiment
      const sentiments = {
        positive: positive,
        negative: negative,
        neutral: neutral,
      }

      const dominantSentiment = Object.entries(sentiments).reduce(
        (max, [key, value]) => (value > max[1] ? [key, value] : max),
        ["neutral", neutral] as [string, number]
      )[0]

      // Determine color based on dominant sentiment
      let columnColor: string
      let sentimentLabel: string
      switch (dominantSentiment) {
        case "positive":
          columnColor = positiveColor
          sentimentLabel = "Positive"
          break
        case "negative":
          columnColor = negativeColor
          sentimentLabel = "Negative"
          break
        default:
          columnColor = neutralColor
          sentimentLabel = "Neutral"
          break
      }

      columnData.push({
        x: timestamp,
        y: confidence * 100, // Convert to percentage
        color: columnColor,
        sentiment: sentimentLabel,
      })
    }
  }

  const columnOptions: SeriesColumnOptions = {
    type: "column",
    borderWidth: 0,
    borderColor: "transparent",
    pointPadding: 0,
    groupPadding: 0,
    tooltip: {
      pointFormat:
        '<span style="color:{point.color}">\u25CF</span> <b>{point.sentiment}</b><br/>' +
        '<b>Confidence</b>: {point.y:.2f}%<br/>',
    },
  }

  // Create horizontal reference lines at 80%, 50%, and 20%
  const plotLines: YAxisPlotLinesOptions[] = [
    {
      value: 80,
      color: "#4B5563", // gray
      width: 1,
      dashStyle: "Dash",
      zIndex: 3,
      label: {
        text: "80%",
        align: "right",
        style: {
          color: "#6B7280",
          fontSize: "10px",
        },
      },
    },
    {
      value: 50,
      color: "#4B5563", // gray
      width: 1,
      dashStyle: "Dash",
      zIndex: 3,
      label: {
        text: "50%",
        align: "right",
        style: {
          color: "#6B7280",
          fontSize: "10px",
        },
      },
    },
    {
      value: 20,
      color: "#4B5563", // gray
      width: 1,
      dashStyle: "Dash",
      zIndex: 3,
      label: {
        text: "20%",
        align: "right",
        style: {
          color: "#6B7280",
          fontSize: "10px",
        },
      },
    },
  ]

  return {
    series: [
      {
        ...getSharedPlotKindSeriesOptions(seriesConfig),
        ...columnOptions,
        data: columnData,
      } as SeriesColumnOptions,
    ],
    plotLines,
  }
}
