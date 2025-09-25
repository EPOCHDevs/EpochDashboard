import { EpochFolioType, Scalar } from '../types/proto'

export interface TableData {
  headers: string[]
  rows: Scalar[][]
  columnTypes: EpochFolioType[]
}

export const createMockTableData = (): TableData => {
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

  const rows: Scalar[][] = [
    [
      { stringValue: 'Momentum Alpha' } as Scalar,
      { integerValue: 1001 } as Scalar,
      { decimalValue: 12.45 } as Scalar,
      { percentValue: 78.5 } as Scalar,
      { booleanValue: true } as Scalar,
      { timestampMs: Date.now() - 3600000 } as Scalar, // 1 hour ago
      { dateValue: 1609459200000 } as Scalar, // Jan 1, 2021
      { dayDuration: 365 } as Scalar,
      { monetaryValue: 1250000 } as Scalar,
      { durationMs: 7200000 } as Scalar // 2 hours
    ],
    [
      { stringValue: 'Mean Reversion Beta' } as Scalar,
      { integerValue: 1002 } as Scalar,
      { decimalValue: -3.21 } as Scalar,
      { percentValue: 45.2 } as Scalar,
      { booleanValue: false } as Scalar,
      { timestampMs: Date.now() - 86400000 } as Scalar, // 1 day ago
      { dateValue: 1640995200000 } as Scalar, // Jan 1, 2022
      { dayDuration: 180 } as Scalar,
      { monetaryValue: 750000 } as Scalar,
      { durationMs: 1800000 } as Scalar // 30 minutes
    ],
    [
      { stringValue: 'Arbitrage Gamma' } as Scalar,
      { integerValue: 1003 } as Scalar,
      { decimalValue: 25.67 } as Scalar,
      { percentValue: 92.1 } as Scalar,
      { booleanValue: true } as Scalar,
      { timestampMs: Date.now() - 7200000 } as Scalar, // 2 hours ago
      { dateValue: 1672531200000 } as Scalar, // Jan 1, 2023
      { dayDuration: 90 } as Scalar,
      { monetaryValue: 2000000 } as Scalar,
      { durationMs: 14400000 } as Scalar // 4 hours
    ],
    [
      { stringValue: 'Trend Following Delta' } as Scalar,
      { integerValue: 1004 } as Scalar,
      { decimalValue: 8.93 } as Scalar,
      { percentValue: 65.8 } as Scalar,
      { booleanValue: true } as Scalar,
      { timestampMs: Date.now() - 1800000 } as Scalar, // 30 minutes ago
      { dateValue: 1704067200000 } as Scalar, // Jan 1, 2024
      { dayDuration: 45 } as Scalar,
      { monetaryValue: 500000 } as Scalar,
      { durationMs: 5400000 } as Scalar // 1.5 hours
    ],
    [
      { stringValue: 'Statistical Edge' } as Scalar,
      { integerValue: 1005 } as Scalar,
      { decimalValue: 0.0 } as Scalar,
      { percentValue: 0.0 } as Scalar,
      { booleanValue: false } as Scalar,
      { timestampMs: Date.now() } as Scalar, // now
      { dateValue: Date.now() } as Scalar, // today
      { dayDuration: 1 } as Scalar,
      { monetaryValue: 0 } as Scalar,
      { durationMs: 300000 } as Scalar // 5 minutes
    ]
  ]

  return {
    headers,
    rows,
    columnTypes
  }
}