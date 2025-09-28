/**
 * Mock Data Generator for Trade Analytics
 * Generates realistic candlestick (OHLCV) data for testing
 */

interface CandlestickData {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface GeneratorOptions {
  startTime: Date
  endTime: Date
  interval: string // '5m', '15m', '1h', '4h', '1D'
  basePrice: number
  volatility: number // 0-1, higher = more volatile
  trend: 'up' | 'down' | 'sideways'
  volumeRange: [number, number]
}

export class CandlestickDataGenerator {
  private getIntervalMs(interval: string): number {
    const map: Record<string, number> = {
      '1m': 60 * 1000,
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '30m': 30 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000,
      '1D': 24 * 60 * 60 * 1000,
      '1W': 7 * 24 * 60 * 60 * 1000,
    }
    return map[interval] || 5 * 60 * 1000 // default to 5m
  }

  generateCandlesticks(options: GeneratorOptions): CandlestickData[] {
    const {
      startTime,
      endTime,
      interval,
      basePrice,
      volatility,
      trend,
      volumeRange,
    } = options

    const intervalMs = this.getIntervalMs(interval)
    const candles: CandlestickData[] = []

    let currentTime = startTime.getTime()
    let currentPrice = basePrice

    // Trend bias
    const trendBias = trend === 'up' ? 0.0002 : trend === 'down' ? -0.0002 : 0

    while (currentTime <= endTime.getTime()) {
      // Random walk with trend bias
      const changePercent = (Math.random() - 0.5) * volatility * 0.02 + trendBias

      // Generate OHLC
      const open = currentPrice
      const close = open * (1 + changePercent)

      // High and low with some randomness
      const highExtra = Math.random() * volatility * 0.01
      const lowExtra = Math.random() * volatility * 0.01

      const high = Math.max(open, close) * (1 + highExtra)
      const low = Math.min(open, close) * (1 - lowExtra)

      // Volume with some correlation to price movement
      const volumeBase = volumeRange[0] + Math.random() * (volumeRange[1] - volumeRange[0])
      const volume = volumeBase * (1 + Math.abs(changePercent) * 10)

      candles.push({
        timestamp: currentTime,
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume: Math.floor(volume),
      })

      currentPrice = close
      currentTime += intervalMs
    }

    return candles
  }

  // Generate realistic trading round trips
  generateRoundTrips(
    assetId: string,
    assetName: string,
    candlesticks: CandlestickData[],
    numTrades: number = 10
  ) {
    const trades = []
    const totalCandles = candlesticks.length

    for (let i = 0; i < numTrades; i++) {
      // Random entry point (not too close to end)
      const entryIndex = Math.floor(Math.random() * (totalCandles - 20))
      const exitIndex = entryIndex + Math.floor(Math.random() * 15) + 5

      if (exitIndex >= totalCandles) continue

      const entryCandle = candlesticks[entryIndex]
      const exitCandle = candlesticks[exitIndex]

      const isLong = Math.random() > 0.5
      const entryPrice = entryCandle.close
      const exitPrice = exitCandle.close

      const pnl = isLong
        ? (exitPrice - entryPrice)
        : (entryPrice - exitPrice)

      const returnPercent = (pnl / entryPrice) * 100
      const size = 10000 // $10k position size
      const netReturn = pnl * (size / entryPrice)

      // Find highest and lowest prices during the trade
      let highest = entryPrice
      let lowest = entryPrice
      for (let j = entryIndex; j <= exitIndex; j++) {
        highest = Math.max(highest, candlesticks[j].high)
        lowest = Math.min(lowest, candlesticks[j].low)
      }

      trades.push({
        asset: assetName,
        asset_id: assetId,
        asset_root_id: assetId.split('-')[0],
        avg_entry_price: entryPrice,
        avg_exit_price: exitPrice,
        open_datetime: new Date(entryCandle.timestamp).toISOString(),
        close_datetime: new Date(exitCandle.timestamp).toISOString(),
        cost: size,
        duration: Math.floor((exitCandle.timestamp - entryCandle.timestamp) / (1000 * 60 * 60 * 24)), // days
        entry_cost: size,
        entry_trade_sizes: 1,
        exit_cost: size * (exitPrice / entryPrice),
        exit_trade_sizes: 1,
        highest_price: highest,
        index: i,
        lowest_price: lowest,
        net_return: netReturn,
        opening_price: entryPrice,
        closing_price: exitPrice,
        position: isLong ? 1 : -1,
        return_nominal: netReturn,
        return_percent: returnPercent,
        return_size: size / entryPrice,
        side: isLong ? "Long" : "Short",
        size: size,
        status: returnPercent > 0.5 ? "WIN" : returnPercent < -0.5 ? "LOSS" : "BREAK EVEN",
        stop_loss: isLong ? entryPrice * 0.95 : entryPrice * 1.05,
        take_profit: isLong ? entryPrice * 1.1 : entryPrice * 0.9,
        total_commissions: 10,
      })
    }

    return trades
  }
}

// Generate sample metadata
export function generateMetadata(assetId: string, assetName: string, ticker: string) {
  return {
    asset_info: {
      [assetId]: {
        asset: {
          id: assetId,
          name: assetName,
          ticker: ticker,
          asset_class: "CRYPTO",
          exchange: "Binance",
          currency: "USD",
          industry: "Cryptocurrency",
          sector: "Digital Assets",
          multiplier: 1,
          min_tick: 0.01,
          category: "Crypto",
          eod_start: "2020-01-01",
          eod_end: "2024-12-31",
          expiry_months: "",
        },
        start_date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date().toISOString(),
        timeframes: ["5m", "15m", "1h", "4h", "1D"],
      },
    },
    chart_info: {
      "5m": {
        yAxis: [
          { top: 0, height: 70 },
          { top: 75, height: 25 },
        ],
        series: [
          {
            id: "candlestick-main",
            type: "candlestick",
            name: "Price",
            dataMapping: {
              index: "timestamp",
              open: "open",
              high: "high",
              low: "low",
              close: "close",
            },
            zIndex: 1,
            yAxis: 0,
          },
          {
            id: "volume",
            type: "column",
            name: "Volume",
            dataMapping: {
              index: "timestamp",
              y: "volume",
            },
            zIndex: 0,
            yAxis: 1,
          },
        ],
      },
      "15m": {
        yAxis: [
          { top: 0, height: 70 },
          { top: 75, height: 25 },
        ],
        series: [
          {
            id: "candlestick-main",
            type: "candlestick",
            name: "Price",
            dataMapping: {
              index: "timestamp",
              open: "open",
              high: "high",
              low: "low",
              close: "close",
            },
            zIndex: 1,
            yAxis: 0,
          },
          {
            id: "volume",
            type: "column",
            name: "Volume",
            dataMapping: {
              index: "timestamp",
              y: "volume",
            },
            zIndex: 0,
            yAxis: 1,
          },
        ],
      },
      "1h": {
        yAxis: [
          { top: 0, height: 70 },
          { top: 75, height: 25 },
        ],
        series: [
          {
            id: "candlestick-main",
            type: "candlestick",
            name: "Price",
            dataMapping: {
              index: "timestamp",
              open: "open",
              high: "high",
              low: "low",
              close: "close",
            },
            zIndex: 1,
            yAxis: 0,
          },
          {
            id: "volume",
            type: "column",
            name: "Volume",
            dataMapping: {
              index: "timestamp",
              y: "volume",
            },
            zIndex: 0,
            yAxis: 1,
          },
        ],
      },
    },
  }
}