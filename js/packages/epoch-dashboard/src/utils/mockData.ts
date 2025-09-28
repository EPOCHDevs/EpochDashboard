import { CardDef, CardData, EpochFolioType, Scalar } from '../types/proto'

export const createMockCardDef = (): CardDef => {
  const cardDataGroup1: CardData[] = [
    {
      title: 'Total Return',
      value: {
        percentValue: 15.42
      } as Scalar,
      type: EpochFolioType.TypePercent,
      group: 0
    },
    {
      title: 'Sharpe Ratio',
      value: {
        decimalValue: 1.85
      } as Scalar,
      type: EpochFolioType.TypeDecimal,
      group: 0
    },
    {
      title: 'Max Drawdown',
      value: {
        percentValue: -8.23
      } as Scalar,
      type: EpochFolioType.TypePercent,
      group: 0
    },
    {
      title: 'Win Rate',
      value: {
        percentValue: 62.34
      } as Scalar,
      type: EpochFolioType.TypePercent,
      group: 0
    }
  ]

  const cardDataGroup2: CardData[] = [
    {
      title: 'Total Trades',
      value: {
        integerValue: 1245
      } as Scalar,
      type: EpochFolioType.TypeInteger,
      group: 1
    },
    {
      title: 'Avg Trade Duration',
      value: {
        durationMs: 3600000 * 48 + 1800000 // 48.5 hours
      } as Scalar,
      type: EpochFolioType.TypeDuration,
      group: 1
    },
    {
      title: 'Capital Deployed',
      value: {
        monetaryValue: 250000
      } as Scalar,
      type: EpochFolioType.TypeMonetary,
      group: 1
    },
    {
      title: 'Active Since',
      value: {
        dateValue: 1640995200000
      } as Scalar,
      type: EpochFolioType.TypeDate,
      group: 1
    }
  ]

  // Add a third group with some null values to demonstrate proper handling
  const cardDataGroup3: CardData[] = [
    {
      title: 'Pending Orders',
      value: {
        nullValue: 0  // Using epoch-proto null representation
      } as Scalar,
      type: EpochFolioType.TypeInteger,
      group: 2
    },
    {
      title: 'Next Rebalance',
      value: {
        nullValue: 0  // Using epoch-proto null representation
      } as Scalar,
      type: EpochFolioType.TypeDate,
      group: 2
    },
    {
      title: 'Volatility',
      value: {
        percentValue: 18.75
      } as Scalar,
      type: EpochFolioType.TypePercent,
      group: 2
    },
    {
      title: 'Beta',
      value: {
        decimalValue: 0.87
      } as Scalar,
      type: EpochFolioType.TypeDecimal,
      group: 2
    }
  ]

  return {
    type: 1,
    category: 'Performance Metrics',
    data: [...cardDataGroup1, ...cardDataGroup2, ...cardDataGroup3],
    groupSize: 2
  }
}