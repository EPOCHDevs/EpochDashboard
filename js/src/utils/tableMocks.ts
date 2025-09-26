import { EpochFolioType, Scalar } from '../types/proto'

export interface TableData {
  headers: string[]
  rows: Scalar[][]
  columnTypes: EpochFolioType[]
}

const generateRandomMockRow = (index: number): Scalar[] => {
  const strategies = [
    'Momentum Alpha Strategy',
    'Mean Reversion Beta',
    'Arbitrage Gamma Engine',
    'Trend Following Delta Model',
    'Statistical Edge Framework',
    'Volatility Trading System',
    'Cross-Asset Correlation Analysis',
    'High-Frequency Scalping Bot',
    'Pairs Trading Algorithm',
    'Risk Parity Allocation Model',
    'Event-Driven Strategy Engine',
    'Market Neutral Hedge Fund Strategy'
  ]

  const longNames = [
    'Long Term Growth and Capital Appreciation Strategy with Risk Management',
    'Advanced Statistical Arbitrage with Machine Learning Enhancement',
    'Multi-Asset Cross-Correlation Analysis and Trading Framework',
    'High-Frequency Market Making with Latency Optimization Engine'
  ]

  const strategyName = Math.random() > 0.7
    ? longNames[index % longNames.length]
    : `${strategies[index % strategies.length]} v${Math.floor(index / strategies.length) + 1}`

  // Introduce some null values randomly (10% chance for numeric fields)
  const shouldBeNull = () => Math.random() < 0.1

  return [
    { stringValue: strategyName } as Scalar,
    { integerValue: 1001 + index } as Scalar,
    shouldBeNull() ? { nullValue: 0 } as Scalar : { decimalValue: (Math.random() - 0.3) * 50 } as Scalar,
    shouldBeNull() ? { nullValue: 0 } as Scalar : { percentValue: Math.random() * 40 + 30 } as Scalar, // 30-70%
    { booleanValue: Math.random() > 0.3 } as Scalar,
    { timestampMs: Date.now() - Math.random() * 86400000 * 30 } as Scalar, // within 30 days
    shouldBeNull() ? { nullValue: 0 } as Scalar : { dateValue: Date.now() - Math.random() * 86400000 * 365 * 3 } as Scalar, // within 3 years
    shouldBeNull() ? { nullValue: 0 } as Scalar : { dayDuration: Math.floor(Math.random() * 1000) + 1 } as Scalar,
    shouldBeNull() ? { nullValue: 0 } as Scalar : { monetaryValue: Math.floor(Math.random() * 50000000) } as Scalar,
    shouldBeNull() ? { nullValue: 0 } as Scalar : { durationMs: Math.floor(Math.random() * 86400000) + 60000 } as Scalar // 1min to 24h
  ]
}

export const createMockTableData = (numRows: number = 150): TableData => {
  const headers = [
    'Strategy Name',      // TypeString
    'ID',                // TypeInteger
    'Returns',           // TypeDecimal
    'Success Rate',      // TypePercent
    'Active',            // TypeBoolean
    'Last Updated',      // TypeDateTime
    'Start Date',        // TypeDate
    'Runtime Days',      // TypeDayDuration
    'Capital',           // TypeMonetary
    'Avg Duration'       // TypeDuration
  ]

  const columnTypes = [
    EpochFolioType.TypeString,
    EpochFolioType.TypeInteger,
    EpochFolioType.TypeDecimal,
    EpochFolioType.TypePercent,
    EpochFolioType.TypeBoolean,
    EpochFolioType.TypeDateTime,
    EpochFolioType.TypeDate,
    EpochFolioType.TypeDayDuration,
    EpochFolioType.TypeMonetary,
    EpochFolioType.TypeDuration
  ]

  const rows: Scalar[][] = Array.from({ length: numRows }, (_, index) => generateRandomMockRow(index))

  return {
    headers,
    rows,
    columnTypes
  }
}