# Trade Analytics Mock Server

This mock server provides sample data for developing and testing the TradeAnalyticsChartRenderer component with candlestick charts.

## Features

- Generates realistic OHLCV (candlestick) data
- Provides Apache Arrow formatted responses
- Simulates trading round trips with various outcomes
- Supports multiple assets and timeframes
- Configurable via environment variables

## Setup

1. Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```

2. Configure environment variables (optional):
```env
REACT_APP_API_BASE_URL=http://localhost:3002/api
MOCK_SERVER_PORT=3002
MOCK_DATA_DELAY=0  # Add delay to simulate network latency
```

## Running the Mock Server

### Start the server:
```bash
npm run mock:server
```

### Start with auto-reload (development):
```bash
npm run mock:server:watch
```

### Run mock server with build watch:
```bash
npm run dev:with-mock
```

## API Endpoints

### 1. Get Metadata
```
GET http://localhost:3002/api/trade-analytics/metadata/{strategyId}
```

Returns asset information and chart configuration.

### 2. Get Round Trips (Trading History)
```
GET http://localhost:3002/api/trade-analytics/round-trips/{strategyId}
```

Query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

### 3. Get Chart Data (Apache Arrow format)
```
GET http://localhost:3002/api/backend-server/dashboard/trade-analytics-chart-data/{strategyId}
```

Query parameters:
- `assetId`: Asset identifier (required, e.g., "BTC-USD")
- `timeframe`: Time interval (required, e.g., "5m", "1h", "1D")
- `from_ms`: Start timestamp in milliseconds (optional)
- `to_ms`: End timestamp in milliseconds (optional)
- `pivot`: Focus timestamp for padding (optional)
- `pad_front`: Candles before pivot (optional)
- `pad_back`: Candles after pivot (optional)

## Data Structure

### Candlestick Data
```typescript
{
  timestamp: number    // Unix timestamp in ms
  open: number        // Opening price
  high: number        // Highest price
  low: number         // Lowest price
  close: number       // Closing price
  volume: number      // Trading volume
}
```

### Round Trip (Trade)
```typescript
{
  asset: string
  asset_id: string
  side: "Long" | "Short"
  status: "WIN" | "LOSS" | "OPEN" | "BREAK EVEN"
  avg_entry_price: number
  avg_exit_price: number
  return_percent: number
  // ... more fields
}
```

## Example Usage

See `src/examples/TradeAnalyticsExample.tsx` for a complete React component example.

## Customization

To customize the generated data, modify:
- `dataGenerator.ts`: Change price ranges, volatility, trends
- `server.ts`: Add new endpoints or modify response formats
- `arrowConverter.ts`: Adjust Apache Arrow schema

## Troubleshooting

1. **Port already in use**: Change `MOCK_SERVER_PORT` in your `.env` file
2. **CORS errors**: Ensure the mock server is running and CORS is enabled
3. **No data showing**: Check browser console for API errors
4. **Arrow parsing errors**: Verify apache-arrow package is installed