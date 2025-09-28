/**
 * Apache Arrow Data Converter
 * Converts JSON candlestick data to Apache Arrow IPC format
 */

import { Table, Float64, Int64, tableToIPC, Schema, Field, makeVector, makeData } from 'apache-arrow'

interface CandlestickData {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export function convertToArrowTable(candlesticks: CandlestickData[]): Table {
  // Extract columns from candlestick data
  const timestamps = BigInt64Array.from(candlesticks.map(c => BigInt(c.timestamp)))
  const opens = Float64Array.from(candlesticks.map(c => c.open))
  const highs = Float64Array.from(candlesticks.map(c => c.high))
  const lows = Float64Array.from(candlesticks.map(c => c.low))
  const closes = Float64Array.from(candlesticks.map(c => c.close))
  const volumes = Float64Array.from(candlesticks.map(c => c.volume))

  // Create schema
  const schema = new Schema([
    new Field('timestamp', new Int64()),
    new Field('open', new Float64()),
    new Field('high', new Float64()),
    new Field('low', new Float64()),
    new Field('close', new Float64()),
    new Field('volume', new Float64()),
  ])

  // Create table using the constructor
  const table = new Table(schema, {
    'timestamp': makeVector(timestamps),
    'open': makeVector(opens),
    'high': makeVector(highs),
    'low': makeVector(lows),
    'close': makeVector(closes),
    'volume': makeVector(volumes),
  })

  return table
}

export function tableToIPCBuffer(table: Table): Uint8Array {
  return tableToIPC(table)
}

export function createArrowResponse(candlesticks: CandlestickData[]): Buffer {
  const table = convertToArrowTable(candlesticks)
  const ipcBuffer = tableToIPCBuffer(table)
  return Buffer.from(ipcBuffer)
}