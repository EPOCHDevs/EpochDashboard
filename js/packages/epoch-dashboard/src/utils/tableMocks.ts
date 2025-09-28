import { EpochFolioType, Scalar } from '../types/proto'

export interface TableData {
  headers: string[]
  rows: Scalar[][]
  columnTypes: EpochFolioType[]
}

// Seeded random number generator for deterministic values
class SeededRandom {
  private seed: number

  constructor(seed: number) {
    this.seed = seed
  }

  next(): number {
    // Linear congruential generator
    this.seed = (this.seed * 1664525 + 1013904223) % 2147483647
    return this.seed / 2147483647
  }
}

const generateDeterministicMockRow = (index: number, rng: SeededRandom): Scalar[] => {
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

  const strategyName = rng.next() > 0.7
    ? longNames[index % longNames.length]
    : `${strategies[index % strategies.length]} v${Math.floor(index / strategies.length) + 1}`

  // Fixed base timestamp (January 1, 2024)
  const baseTimestamp = 1704067200000

  // Introduce some null values deterministically (10% chance for numeric fields)
  const shouldBeNull = () => rng.next() < 0.1

  return [
    { stringValue: strategyName } as Scalar,
    { integerValue: 1001 + index } as Scalar,
    shouldBeNull() ? { nullValue: 0 } as Scalar : { decimalValue: (rng.next() - 0.3) * 50 } as Scalar,
    shouldBeNull() ? { nullValue: 0 } as Scalar : { percentValue: rng.next() * 40 + 30 } as Scalar, // 30-70%
    { booleanValue: rng.next() > 0.3 } as Scalar,
    { timestampMs: baseTimestamp - rng.next() * 86400000 * 30 } as Scalar, // within 30 days from base
    shouldBeNull() ? { nullValue: 0 } as Scalar : { dateValue: baseTimestamp - rng.next() * 86400000 * 365 * 3 } as Scalar, // within 3 years
    shouldBeNull() ? { nullValue: 0 } as Scalar : { dayDuration: Math.floor(rng.next() * 1000) + 1 } as Scalar,
    shouldBeNull() ? { nullValue: 0 } as Scalar : { monetaryValue: Math.floor(rng.next() * 50000000) } as Scalar,
    shouldBeNull() ? { nullValue: 0 } as Scalar : { durationMs: Math.floor(rng.next() * 86400000) + 60000 } as Scalar // 1min to 24h
  ]
}

export const createMockTableData = (numRows: number = 150): TableData => {
  const headers = [
    'Strategy',
    'ID',
    'Returns',
    'Win Rate',
    'Active',
    'Last Updated',
    'Created',
    'Runtime',
    'AUM',
    'Duration'
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

  // Use a fixed seed for deterministic data generation
  const rng = new SeededRandom(12345)
  const rows = Array.from({ length: numRows }, (_, i) => generateDeterministicMockRow(i, rng))

  return {
    headers,
    rows,
    columnTypes
  }
}