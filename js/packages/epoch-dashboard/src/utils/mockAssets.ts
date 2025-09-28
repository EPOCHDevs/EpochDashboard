/**
 * Mock Asset Database
 * 1000+ trading instruments across different categories
 */

export interface IAsset {
  id: string
  ticker: string
  name: string
  exchange: string
  category: 'forex' | 'crypto' | 'stocks' | 'indices' | 'commodities'
  price?: number
  change24h?: number
  volume24h?: number
  marketCap?: number
  isFavorite?: boolean
  sparklineData?: number[]
}

// Generate random sparkline data
const generateSparkline = (trend: 'up' | 'down' | 'flat' = 'flat'): number[] => {
  const points = 20
  const data: number[] = []
  let value = 50

  for (let i = 0; i < points; i++) {
    const random = Math.random() * 10 - 5
    if (trend === 'up') {
      value += random + 1
    } else if (trend === 'down') {
      value += random - 1
    } else {
      value += random
    }
    value = Math.max(10, Math.min(90, value))
    data.push(value)
  }
  return data
}

// FOREX Pairs
const FOREX_PAIRS: Partial<IAsset>[] = [
  // Major Pairs
  { ticker: 'EUR/USD', name: 'Euro / US Dollar', exchange: 'FOREX', price: 1.0856, change24h: 0.23 },
  { ticker: 'GBP/USD', name: 'British Pound / US Dollar', exchange: 'FOREX', price: 1.2734, change24h: -0.15 },
  { ticker: 'USD/JPY', name: 'US Dollar / Japanese Yen', exchange: 'FOREX', price: 149.85, change24h: 0.42 },
  { ticker: 'USD/CHF', name: 'US Dollar / Swiss Franc', exchange: 'FOREX', price: 0.8892, change24h: -0.08 },
  { ticker: 'AUD/USD', name: 'Australian Dollar / US Dollar', exchange: 'FOREX', price: 0.6523, change24h: 0.56 },
  { ticker: 'USD/CAD', name: 'US Dollar / Canadian Dollar', exchange: 'FOREX', price: 1.3612, change24h: -0.21 },
  { ticker: 'NZD/USD', name: 'New Zealand Dollar / US Dollar', exchange: 'FOREX', price: 0.5982, change24h: 0.34 },

  // Minor Pairs
  { ticker: 'EUR/GBP', name: 'Euro / British Pound', exchange: 'FOREX', price: 0.8523, change24h: 0.12 },
  { ticker: 'EUR/JPY', name: 'Euro / Japanese Yen', exchange: 'FOREX', price: 162.73, change24h: 0.65 },
  { ticker: 'GBP/JPY', name: 'British Pound / Japanese Yen', exchange: 'FOREX', price: 190.82, change24h: 0.28 },
  { ticker: 'AUD/JPY', name: 'Australian Dollar / Japanese Yen', exchange: 'FOREX', price: 97.75, change24h: -0.45 },
  { ticker: 'EUR/CHF', name: 'Euro / Swiss Franc', exchange: 'FOREX', price: 0.9652, change24h: -0.03 },
  { ticker: 'GBP/CHF', name: 'British Pound / Swiss Franc', exchange: 'FOREX', price: 1.1323, change24h: 0.18 },

  // Exotic Pairs
  { ticker: 'USD/SGD', name: 'US Dollar / Singapore Dollar', exchange: 'FOREX', price: 1.3428, change24h: -0.12 },
  { ticker: 'USD/HKD', name: 'US Dollar / Hong Kong Dollar', exchange: 'FOREX', price: 7.8265, change24h: 0.02 },
  { ticker: 'USD/NOK', name: 'US Dollar / Norwegian Krone', exchange: 'FOREX', price: 10.8234, change24h: 0.76 },
  { ticker: 'USD/SEK', name: 'US Dollar / Swedish Krona', exchange: 'FOREX', price: 10.9876, change24h: -0.54 },
  { ticker: 'USD/MXN', name: 'US Dollar / Mexican Peso', exchange: 'FOREX', price: 17.8234, change24h: 1.23 },
  { ticker: 'USD/ZAR', name: 'US Dollar / South African Rand', exchange: 'FOREX', price: 18.9234, change24h: -0.87 },
]

// Cryptocurrencies
const CRYPTO_ASSETS: Partial<IAsset>[] = [
  // Major Cryptos
  { ticker: 'BTC/USD', name: 'Bitcoin', exchange: 'CRYPTO', price: 43567.23, change24h: 2.34, marketCap: 852000000000 },
  { ticker: 'ETH/USD', name: 'Ethereum', exchange: 'CRYPTO', price: 2234.56, change24h: 1.87, marketCap: 268000000000 },
  { ticker: 'BNB/USD', name: 'Binance Coin', exchange: 'CRYPTO', price: 312.45, change24h: -0.93, marketCap: 48000000000 },
  { ticker: 'SOL/USD', name: 'Solana', exchange: 'CRYPTO', price: 98.76, change24h: 5.67, marketCap: 42000000000 },
  { ticker: 'XRP/USD', name: 'Ripple', exchange: 'CRYPTO', price: 0.6234, change24h: -1.23, marketCap: 33000000000 },
  { ticker: 'ADA/USD', name: 'Cardano', exchange: 'CRYPTO', price: 0.5876, change24h: 3.45, marketCap: 20000000000 },
  { ticker: 'AVAX/USD', name: 'Avalanche', exchange: 'CRYPTO', price: 38.92, change24h: 4.23, marketCap: 14000000000 },
  { ticker: 'DOGE/USD', name: 'Dogecoin', exchange: 'CRYPTO', price: 0.0923, change24h: -2.34, marketCap: 13000000000 },
  { ticker: 'DOT/USD', name: 'Polkadot', exchange: 'CRYPTO', price: 7.234, change24h: 1.56, marketCap: 9000000000 },
  { ticker: 'MATIC/USD', name: 'Polygon', exchange: 'CRYPTO', price: 0.8923, change24h: 2.87, marketCap: 8000000000 },

  // DeFi Tokens
  { ticker: 'UNI/USD', name: 'Uniswap', exchange: 'CRYPTO', price: 6.234, change24h: -0.67 },
  { ticker: 'LINK/USD', name: 'Chainlink', exchange: 'CRYPTO', price: 14.567, change24h: 1.23 },
  { ticker: 'AAVE/USD', name: 'Aave', exchange: 'CRYPTO', price: 102.34, change24h: 3.45 },
  { ticker: 'SUSHI/USD', name: 'SushiSwap', exchange: 'CRYPTO', price: 1.234, change24h: -1.87 },
  { ticker: 'COMP/USD', name: 'Compound', exchange: 'CRYPTO', price: 56.78, change24h: 2.34 },

  // Stablecoins
  { ticker: 'USDT/USD', name: 'Tether', exchange: 'CRYPTO', price: 1.0002, change24h: 0.02 },
  { ticker: 'USDC/USD', name: 'USD Coin', exchange: 'CRYPTO', price: 0.9998, change24h: -0.01 },
  { ticker: 'DAI/USD', name: 'Dai', exchange: 'CRYPTO', price: 1.0001, change24h: 0.01 },
  { ticker: 'BUSD/USD', name: 'Binance USD', exchange: 'CRYPTO', price: 0.9999, change24h: 0.00 },
]

// US Stocks
const US_STOCKS: Partial<IAsset>[] = [
  // Tech Giants
  { ticker: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', price: 182.34, change24h: 0.87, marketCap: 2890000000000 },
  { ticker: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', price: 378.92, change24h: 1.23, marketCap: 2810000000000 },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', price: 139.67, change24h: -0.54, marketCap: 1750000000000 },
  { ticker: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ', price: 155.23, change24h: 2.34, marketCap: 1600000000000 },
  { ticker: 'META', name: 'Meta Platforms Inc.', exchange: 'NASDAQ', price: 362.45, change24h: -1.67, marketCap: 925000000000 },
  { ticker: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ', price: 242.84, change24h: 3.45, marketCap: 770000000000 },
  { ticker: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', price: 495.67, change24h: 4.23, marketCap: 1220000000000 },

  // Financial
  { ticker: 'JPM', name: 'JPMorgan Chase & Co.', exchange: 'NYSE', price: 156.78, change24h: 0.45 },
  { ticker: 'BAC', name: 'Bank of America Corp.', exchange: 'NYSE', price: 34.23, change24h: -0.23 },
  { ticker: 'WFC', name: 'Wells Fargo & Co.', exchange: 'NYSE', price: 45.67, change24h: 0.67 },
  { ticker: 'GS', name: 'Goldman Sachs Group', exchange: 'NYSE', price: 389.23, change24h: 1.23 },
  { ticker: 'MS', name: 'Morgan Stanley', exchange: 'NYSE', price: 87.45, change24h: -0.87 },
  { ticker: 'C', name: 'Citigroup Inc.', exchange: 'NYSE', price: 48.92, change24h: 0.34 },

  // Healthcare
  { ticker: 'JNJ', name: 'Johnson & Johnson', exchange: 'NYSE', price: 158.92, change24h: -0.45 },
  { ticker: 'UNH', name: 'UnitedHealth Group', exchange: 'NYSE', price: 523.45, change24h: 0.78 },
  { ticker: 'PFE', name: 'Pfizer Inc.', exchange: 'NYSE', price: 31.23, change24h: -1.23 },
  { ticker: 'ABBV', name: 'AbbVie Inc.', exchange: 'NYSE', price: 156.78, change24h: 0.56 },
  { ticker: 'MRK', name: 'Merck & Co.', exchange: 'NYSE', price: 107.89, change24h: 0.23 },

  // Consumer
  { ticker: 'WMT', name: 'Walmart Inc.', exchange: 'NYSE', price: 163.45, change24h: 0.34 },
  { ticker: 'PG', name: 'Procter & Gamble', exchange: 'NYSE', price: 151.23, change24h: -0.12 },
  { ticker: 'KO', name: 'Coca-Cola Company', exchange: 'NYSE', price: 59.87, change24h: 0.45 },
  { ticker: 'PEP', name: 'PepsiCo Inc.', exchange: 'NASDAQ', price: 172.34, change24h: 0.67 },
  { ticker: 'NKE', name: 'Nike Inc.', exchange: 'NYSE', price: 105.67, change24h: 1.23 },
  { ticker: 'MCD', name: "McDonald's Corp.", exchange: 'NYSE', price: 282.34, change24h: -0.34 },

  // Energy
  { ticker: 'XOM', name: 'Exxon Mobil Corp.', exchange: 'NYSE', price: 105.67, change24h: 2.34 },
  { ticker: 'CVX', name: 'Chevron Corporation', exchange: 'NYSE', price: 156.78, change24h: 1.87 },
]

// Indices
const INDICES: Partial<IAsset>[] = [
  // US Indices
  { ticker: 'SPX', name: 'S&P 500 Index', exchange: 'INDEX', price: 4567.23, change24h: 0.45 },
  { ticker: 'DJI', name: 'Dow Jones Industrial', exchange: 'INDEX', price: 35678.92, change24h: 0.23 },
  { ticker: 'NDX', name: 'NASDAQ 100', exchange: 'INDEX', price: 15892.45, change24h: 0.87 },
  { ticker: 'RUT', name: 'Russell 2000', exchange: 'INDEX', price: 1987.65, change24h: -0.34 },
  { ticker: 'VIX', name: 'CBOE Volatility Index', exchange: 'INDEX', price: 16.78, change24h: -2.34 },

  // European Indices
  { ticker: 'FTSE', name: 'FTSE 100', exchange: 'INDEX', price: 7687.45, change24h: 0.56 },
  { ticker: 'DAX', name: 'DAX 40', exchange: 'INDEX', price: 16234.56, change24h: 0.78 },
  { ticker: 'CAC', name: 'CAC 40', exchange: 'INDEX', price: 7456.78, change24h: -0.23 },
  { ticker: 'STOXX50', name: 'Euro Stoxx 50', exchange: 'INDEX', price: 4398.76, change24h: 0.45 },

  // Asian Indices
  { ticker: 'N225', name: 'Nikkei 225', exchange: 'INDEX', price: 32456.78, change24h: 1.23 },
  { ticker: 'HSI', name: 'Hang Seng Index', exchange: 'INDEX', price: 17234.56, change24h: -0.87 },
  { ticker: 'SSEC', name: 'Shanghai Composite', exchange: 'INDEX', price: 3087.65, change24h: 0.34 },
  { ticker: 'KOSPI', name: 'KOSPI Index', exchange: 'INDEX', price: 2567.89, change24h: 0.67 },
]

// Commodities
const COMMODITIES: Partial<IAsset>[] = [
  // Precious Metals
  { ticker: 'XAUUSD', name: 'Gold Spot', exchange: 'COMEX', price: 2043.56, change24h: 0.34 },
  { ticker: 'XAGUSD', name: 'Silver Spot', exchange: 'COMEX', price: 24.567, change24h: -0.87 },
  { ticker: 'XPTUSD', name: 'Platinum Spot', exchange: 'NYMEX', price: 987.65, change24h: 1.23 },
  { ticker: 'XPDUSD', name: 'Palladium Spot', exchange: 'NYMEX', price: 1045.78, change24h: -0.45 },

  // Energy
  { ticker: 'CL', name: 'WTI Crude Oil', exchange: 'NYMEX', price: 78.45, change24h: 2.34 },
  { ticker: 'BRN', name: 'Brent Crude Oil', exchange: 'ICE', price: 83.67, change24h: 2.56 },
  { ticker: 'NG', name: 'Natural Gas', exchange: 'NYMEX', price: 2.789, change24h: -1.23 },
  { ticker: 'RB', name: 'Gasoline', exchange: 'NYMEX', price: 2.456, change24h: 1.87 },

  // Agricultural
  { ticker: 'ZC', name: 'Corn Futures', exchange: 'CBOT', price: 478.50, change24h: -0.67 },
  { ticker: 'ZW', name: 'Wheat Futures', exchange: 'CBOT', price: 587.25, change24h: 0.45 },
  { ticker: 'ZS', name: 'Soybean Futures', exchange: 'CBOT', price: 1287.50, change24h: 0.23 },
  { ticker: 'KC', name: 'Coffee Futures', exchange: 'ICE', price: 167.85, change24h: -2.34 },
  { ticker: 'SB', name: 'Sugar Futures', exchange: 'ICE', price: 26.78, change24h: 1.56 },
  { ticker: 'CC', name: 'Cocoa Futures', exchange: 'ICE', price: 4123.67, change24h: 3.45 },

  // Industrial Metals
  { ticker: 'HG', name: 'Copper Futures', exchange: 'COMEX', price: 3.8765, change24h: 0.87 },
  { ticker: 'ZN', name: 'Zinc Futures', exchange: 'LME', price: 2567.89, change24h: -0.34 },
  { ticker: 'AL', name: 'Aluminum Futures', exchange: 'LME', price: 2234.56, change24h: 0.56 },
]

// Generate additional synthetic stocks to reach 1000+ assets
function generateSyntheticAssets(baseCount: number): IAsset[] {
  const sectors = ['Technology', 'Healthcare', 'Finance', 'Energy', 'Consumer', 'Industrial', 'Materials', 'Utilities']
  const exchanges = ['NYSE', 'NASDAQ', 'LSE', 'TSE', 'HKEX', 'ASX', 'TSX', 'NSE']
  const additionalAssets: IAsset[] = []

  for (let i = 0; i < (1000 - baseCount); i++) {
    const sector = sectors[i % sectors.length]
    const exchange = exchanges[i % exchanges.length]
    const ticker = `${sector.substring(0, 1)}${String.fromCharCode(65 + (i % 26))}${String.fromCharCode(65 + ((i + 7) % 26))}${i % 100}`
    const trend = ['up', 'down', 'flat'][i % 3] as 'up' | 'down' | 'flat'

    additionalAssets.push({
      id: `synthetic-${i}`,
      ticker,
      name: `${sector} Corp ${i}`,
      exchange,
      category: 'stocks',
      price: 50 + Math.random() * 500,
      change24h: (Math.random() - 0.5) * 10,
      volume24h: Math.floor(Math.random() * 10000000),
      sparklineData: generateSparkline(trend)
    })
  }

  return additionalAssets
}

// Combine all assets
export function generateMockAssets(): IAsset[] {
  const allAssets: IAsset[] = []

  // Add Forex pairs
  FOREX_PAIRS.forEach((asset, index) => {
    allAssets.push({
      id: `forex-${index}`,
      category: 'forex',
      sparklineData: generateSparkline(['up', 'down', 'flat'][index % 3] as any),
      ...asset
    } as IAsset)
  })

  // Add Cryptocurrencies
  CRYPTO_ASSETS.forEach((asset, index) => {
    allAssets.push({
      id: `crypto-${index}`,
      category: 'crypto',
      sparklineData: generateSparkline(['up', 'down', 'flat'][index % 3] as any),
      volume24h: Math.floor(Math.random() * 1000000000),
      ...asset
    } as IAsset)
  })

  // Add Stocks
  US_STOCKS.forEach((asset, index) => {
    allAssets.push({
      id: `stock-${index}`,
      category: 'stocks',
      sparklineData: generateSparkline(['up', 'down', 'flat'][index % 3] as any),
      volume24h: Math.floor(Math.random() * 100000000),
      ...asset
    } as IAsset)
  })

  // Add Indices
  INDICES.forEach((asset, index) => {
    allAssets.push({
      id: `index-${index}`,
      category: 'indices',
      sparklineData: generateSparkline(['up', 'down', 'flat'][index % 3] as any),
      ...asset
    } as IAsset)
  })

  // Add Commodities
  COMMODITIES.forEach((asset, index) => {
    allAssets.push({
      id: `commodity-${index}`,
      category: 'commodities',
      sparklineData: generateSparkline(['up', 'down', 'flat'][index % 3] as any),
      ...asset
    } as IAsset)
  })

  // Generate synthetic assets to reach 1000+
  const currentCount = allAssets.length
  const syntheticAssets = generateSyntheticAssets(currentCount)
  allAssets.push(...syntheticAssets)

  return allAssets
}

// Export a singleton instance
export const mockAssets = generateMockAssets()