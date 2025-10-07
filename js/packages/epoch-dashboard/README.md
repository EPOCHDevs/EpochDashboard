# @epochlab/epoch-dashboard

A powerful, customizable React dashboard component for visualizing TearSheet protobuf data with Tailwind CSS styling.

![EpochLab Epoch Dashboard](https://img.shields.io/badge/EpochLab-Epoch%20Dashboard-blue.svg)
![Version](https://img.shields.io/badge/version-1.5.1-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🚀 Features

- **Next.js Optimized**: Built for Next.js 13+ with App Router and Pages Router support
- **Proto-First**: Built specifically for TearSheet protobuf objects
- **Fully Customizable**: Tailwind CSS-based styling with CSS custom properties
- **Responsive Design**: Adaptive layouts for all screen sizes
- **Interactive Charts**: Powered by Highcharts with custom theming
- **File Upload**: Drag & drop protobuf (.pb) file support
- **TypeScript**: Full type safety and intellisense
- **Zero Config**: Works out of the box with sensible defaults

## 📦 Installation

### Step 1: Install the Package

```bash
npm install @epochlab/epoch-dashboard
# or
yarn add @epochlab/epoch-dashboard
# or
pnpm add @epochlab/epoch-dashboard
```

### Step 2: Install Required Peer Dependencies

This package requires the following peer dependencies:

```bash
npm install \
  next \
  react \
  react-dom \
  tailwindcss \
  @epochlab/epoch-protos \
  highcharts \
  highcharts-react-official \
  @tanstack/react-query \
  @tanstack/react-table \
  @radix-ui/themes \
  react-hook-form \
  date-fns \
  axios
```

**Version Requirements:**
- Next.js: ^13.0.0 || ^14.0.0 || ^15.0.0
- React: ^18.0.0 || ^19.0.0
- Tailwind CSS: ^3.0.0

**Important:** This package is specifically designed for Next.js applications and leverages Next.js features like "use client" directives and App Router compatibility.

## 🎯 Quick Start

### Basic Usage

```tsx
import React from 'react'
import { TearsheetDashboard } from '@epochlab/epoch-dashboard'
import '@epochlab/epoch-dashboard/dist/dashboard.css'

function App() {
  const [tearsheet, setTearsheet] = React.useState(null)

  // Load your tearsheet data
  React.useEffect(() => {
    loadTearsheetData().then(setTearsheet)
  }, [])

  if (!tearsheet) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <TearsheetDashboard
        tearsheet={tearsheet}
        className="h-screen p-8"
      />
    </div>
  )
}
```

### With Custom Styling

```tsx
import { TearsheetDashboard } from '@epochlab/epoch-dashboard'

function CustomDashboard({ tearsheet }) {
  return (
    <TearsheetDashboard
      tearsheet={tearsheet}
      className="bg-slate-900 text-white" // Override default styling
      hideLayoutControls={false}
      onCategoryChange={(category) => console.log('Category:', category)}
      onLayoutChange={(layout) => console.log('Layout:', layout)}
    />
  )
}
```

## 🔌 Integration with EpochWeb

The dashboard is designed to seamlessly integrate with EpochWeb, which already has the necessary theme infrastructure.

### Prerequisites

EpochWeb already has:
- ✅ CSS semantic tokens configured (`--background`, `--foreground`, `--card`, etc.)
- ✅ Tailwind config with semantic color mappings
- ✅ Dark theme matching the dashboard's pure dark gray aesthetic
- ✅ `@epochlab/epoch-protos` package installed

### Integration Steps

#### 1. Install the Package

```bash
cd /path/to/EpochWeb
npm install @epochlab/epoch-dashboard
```

#### 2. Update Tailwind Config

Add the dashboard package to your Tailwind content paths in `tailwind.config.ts`:

```typescript
content: [
  "./public/**/*.html",
  "./src/**/*.{js,ts,jsx,tsx}",
  // Add this line to scan dashboard components:
  "./node_modules/@epochlab/epoch-dashboard/dist/**/*.{js,mjs}"
],
```

#### 3. Import Dashboard Styles

Add the dashboard CSS to your main layout (e.g., `/src/app/layout.tsx` or root component):

```typescript
import '@epochlab/epoch-dashboard/dist/dashboard.css'
```

#### 4. (Optional) Add Custom Scrollbar Utilities

If not already present, add these utilities to your `globals.css`:

```css
@layer utilities {
  .epoch-scrollbar-horizontal {
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.15) rgba(255, 255, 255, 0.02);
  }

  .epoch-scrollbar-horizontal::-webkit-scrollbar {
    height: 12px;
  }

  .epoch-scrollbar-horizontal::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.02);
    border-radius: 6px;
  }

  .epoch-scrollbar-horizontal::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 6px;
  }

  .epoch-table-scrollbar {
    overflow: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.15) rgba(255, 255, 255, 0.02);
  }

  .epoch-table-scrollbar::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  .epoch-table-scrollbar::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.02);
    border-radius: 4px;
  }

  .epoch-table-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
}
```

### Usage in EpochWeb

```typescript
import { TearsheetDashboard } from '@epochlab/epoch-dashboard'

export default function DashboardPage({ tearsheet }) {
  return (
    <div className="min-h-screen bg-background">
      <TearsheetDashboard
        tearsheet={tearsheet}
        className="h-screen p-8"
      />
    </div>
  )
}
```

### Theme Compatibility

The dashboard automatically inherits EpochWeb's theme through semantic tokens:

| Dashboard Class | EpochWeb CSS Variable | Value (Dark Mode) |
|----------------|----------------------|-------------------|
| `bg-background` | `--background` | `0 0% 6%` (Pure dark gray) |
| `bg-card` | `--card` | `0 0% 8%` (Card background) |
| `text-foreground` | `--foreground` | `0 0% 98%` (White text) |
| `text-muted-foreground` | `--muted-foreground` | `0 0% 64%` (Muted gray) |
| `border-border` | `--border` | `0 0% 20%` (Neutral borders) |
| `text-accent` | `--accent` | `194 100% 50%` (Cyan) |

No additional theme configuration is required - the dashboard will automatically use EpochWeb's existing dark gray theme.

## 📊 API Reference

### TearsheetDashboard Component

```tsx
interface TearsheetDashboardProps {
  tearsheet: TearSheet              // Required: Proto data
  className?: string                 // Optional: Additional CSS classes
  hideLayoutControls?: boolean       // Optional: Hide layout switcher
  onCategoryChange?: (category: string) => void  // Optional: Category callback
  onLayoutChange?: (layout: string) => void      // Optional: Layout callback
}
```

---

### UnifiedDashboardContainer Component (🌟 Recommended - All-in-One)

**The ultimate component that combines Performance Overview + Trade Analytics in one seamless interface.**

Perfect for production apps where users need both tearsheet performance stats AND detailed trade analysis.

```tsx
interface UnifiedDashboardContainerProps {
  campaignId: string            // Required: Your campaign/strategy ID
  apiEndpoint: string           // Required: Backend URL (use "" for Next.js proxy)
  userId?: string               // Optional: User ID for authentication (default: "guest")
  defaultView?: 'dashboard' | 'charts'  // Optional: Starting view (default: "dashboard")
  hideLayoutControls?: boolean  // Optional: Hide layout switcher in dashboard view (default: false)
  className?: string            // Optional: Custom CSS classes
  TopToolbarComponent?: React.ComponentType  // Optional: Custom toolbar for Charts view
}
```

**Basic Usage:**

```tsx
import { UnifiedDashboardContainer } from '@epochlab/epoch-dashboard'

function MyDashboard() {
  return (
    <UnifiedDashboardContainer
      campaignId="campaign-123"
      apiEndpoint="https://your-backend.com"
      userId="user-456"
      defaultView="dashboard"
    />
  )
}
```

**Next.js Proxy Setup (Recommended):**

For Next.js apps, use the built-in proxy by setting `apiEndpoint=""`:

```tsx
// In your Next.js page component
function DashboardPage() {
  const router = useRouter()
  const campaignId = router.query.campaignId as string

  return (
    <UnifiedDashboardContainer
      campaignId={campaignId}
      apiEndpoint=""  // Empty string = use Next.js API routes
      userId="user-123"
    />
  )
}
```

**What it does:**
- ✅ **Unified Interface**: Combines both Dashboard and Charts in one seamless toolbar
- ✅ **Consistent Toolbar**: Both views share the same toolbar structure and height
- ✅ **View Switcher**: Clean toggle buttons integrated into the toolbar (right side)
- ✅ **URL Sync**: View state syncs with URL (`?view=dashboard` or `?view=charts`)
- ✅ **Smooth Transitions**: Fade animations when switching views
- ✅ **Shared Data**: Single QueryClient for optimal performance
- ✅ **Deep Linking**: Users can bookmark specific views

**Views:**

1. **Dashboard** - Shows Pyfolio tearsheet with:
   - Performance cards (stats, metrics)
   - Charts (equity curve, drawdown, etc.)
   - Tables (trade history, monthly returns)
   - Category tabs (Account, Positions, Returns distribution, etc.)
   - Layout controls (2-column, 3-column, grid)

2. **Charts** - Shows TradingView-style chart with:
   - Candlestick chart with trade signals
   - Asset + timeframe selectors in the same toolbar
   - Round trips visualization
   - Trade cards selector
   - Future: Pattern scanner, RSI crossovers, volume analysis

**When to use:**
- ✅ Production apps where users need both performance stats AND trade analysis
- ✅ You want a professional, unified interface with consistent toolbar
- ✅ Users need to easily switch between high-level overview and detailed analysis
- ✅ You want URL-based view state for bookmarking/sharing

**When NOT to use:**
- ❌ You only need dashboard OR charts (use `DashboardContainer` or `TradeAnalyticsContainer` instead)
- ❌ You need a completely custom layout/navigation (use individual components)

---

### DashboardContainer Component (Performance Only)

**High-level component that automatically fetches tearsheet data from your backend.**

Similar to `TradeAnalyticsContainer`, this component handles all data fetching automatically - you just provide the campaign ID and API endpoint.

```tsx
interface DashboardContainerProps {
  campaignId: string          // Required: Your campaign/strategy ID
  apiEndpoint: string         // Required: Backend URL (use "" for Next.js proxy)
  userId?: string             // Optional: User ID for authentication (default: "guest")
  showHeader?: boolean        // Optional: Show default header (default: true)
  hideLayoutControls?: boolean // Optional: Hide layout switcher (default: false)
  className?: string          // Optional: Custom CSS classes
}
```

**Basic Usage:**

```tsx
import { DashboardContainer } from '@epochlab/epoch-dashboard'

function MyDashboard() {
  return (
    <DashboardContainer
      campaignId="campaign-123"
      apiEndpoint="https://your-backend.com"
      userId="user-456"
    />
  )
}
```

**What it does automatically:**
- ✅ Fetches metadata to discover available categories
- ✅ Fetches tearsheet protobuf data for each category
- ✅ Decodes protobuf data automatically
- ✅ Provides category tabs/dropdown when multiple categories exist
- ✅ Handles all state management and loading states

**Backend API Requirements:**

Your backend must implement these endpoints:

1. **Metadata Endpoint** - Discovers available categories:
   ```
   GET /api/v1/dashboard/perf-metadata/{campaignId}
   Headers: X-User-Id: {userId}

   Response:
   {
     "tearsheet_metadata": {
       "AAPL-Stocks": {
         "cards_count": 18,
         "charts_count": 0,
         "tables_count": 1
       },
       "BTC-Crypto": {
         "cards_count": 12,
         "charts_count": 5,
         "tables_count": 2
       }
     }
   }
   ```

2. **Tearsheet Data Endpoint** - Returns protobuf data for selected category:
   ```
   GET /api/v1/dashboard/perf/{campaignId}?category={category}&raw=true&all=true
   Headers:
     X-User-Id: {userId}
     Content-Type: application/octet-stream

   Response: Binary protobuf data (TearSheet message)
   ```

**Next.js Proxy Pattern (Recommended):**

For Next.js apps, create API routes that proxy to your backend:

```typescript
// pages/api/v1/dashboard/perf-metadata/[campaignId].ts
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { campaignId } = req.query
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:9000'
  const userId = req.headers['x-user-id'] || 'guest'

  const response = await fetch(`${backendUrl}/api/v1/dashboard/perf-metadata/${campaignId}`, {
    headers: {
      'X-User-Id': userId as string,
      'Content-Type': 'application/json',
    },
  })

  const data = await response.json()
  res.status(200).json(data)
}
```

```typescript
// pages/api/v1/dashboard/perf/[campaignId].ts
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { campaignId, category } = req.query
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:9000'
  const userId = req.headers['x-user-id'] || 'guest'

  const response = await fetch(
    `${backendUrl}/api/v1/dashboard/perf/${campaignId}?category=${category}&raw=true&all=true`,
    {
      headers: {
        'X-User-Id': userId as string,
      },
    }
  )

  const buffer = await response.arrayBuffer()
  res.setHeader('Content-Type', 'application/octet-stream')
  res.status(200).send(Buffer.from(buffer))
}
```

Then use the component with empty `apiEndpoint`:

```tsx
<DashboardContainer
  campaignId="campaign-123"
  apiEndpoint=""  // Empty = use Next.js /api routes
  userId="user-456"
/>
```

**Category Handling:**

- **Single Category**: Displays dashboard directly without tabs
- **Multiple Categories (2-5)**: Shows horizontal tabs for easy switching
- **Many Categories (>5)**: Shows dropdown selector to save space

**When to use:**
- ✅ You have a backend API serving tearsheet data
- ✅ You want automatic data fetching and category management
- ✅ You need a complete dashboard solution with minimal setup

**When NOT to use:**
- ❌ You already have tearsheet data loaded (use `TearsheetDashboard` directly)
- ❌ You need custom data sources or transformations
- ❌ You're loading from static files (use `readTearsheetFile` + `TearsheetDashboard`)

---

### Trade Analytics Components

There are **two components** for trade analytics, choose based on your needs:

---

#### 1. TradeAnalyticsContainer (Recommended - Easy Mode)

**High-level component that handles everything automatically.**

```tsx
interface TradeAnalyticsContainerProps {
  campaignId: string        // Required: Your campaign/strategy ID
  apiEndpoint: string       // Required: Backend URL (use "" for Next.js proxy)
  userId?: string           // Optional: User ID for authentication
  showHeader?: boolean      // Optional: Show default header
  className?: string        // Optional: Custom CSS classes
}
```

**Basic Usage:**

```tsx
import { TradeAnalyticsContainer } from '@epochlab/epoch-dashboard'

function MyTradeAnalytics() {
  return (
    <TradeAnalyticsContainer
      campaignId="campaign-123"
      apiEndpoint="https://your-backend.com"
      userId="user-456"
    />
  )
}
```

**What it does automatically:**
- ✅ Fetches metadata (available assets, timeframes, etc.)
- ✅ Fetches round trips
- ✅ Fetches candlestick data (Apache Arrow format)
- ✅ Provides asset selector UI
- ✅ Provides timeframe selector UI
- ✅ Handles all state management

**Backend API Requirements:**

Your backend must implement these endpoints:

1. **Metadata Endpoint** - Returns available assets and timeframes:
   ```
   GET /api/v1/dashboard/analytics-metadata/{campaignId}
   Headers: X-User-Id: {userId}

   Response:
   {
     "assets": ["BTC-USD", "ETH-USD"],
     "timeframes": ["1m", "5m", "15m", "1h"],
     "default_asset": "BTC-USD",
     "default_timeframe": "5m"
   }
   ```

2. **Round Trips Endpoint** - Returns trade round trip data:
   ```
   GET /api/v1/dashboard/round_trip/{campaignId}?page=1
   Headers: X-User-Id: {userId}

   Response:
   {
     "round_trips": [
       {
         "entry_time": "2024-01-01T10:00:00Z",
         "exit_time": "2024-01-01T11:00:00Z",
         "pnl": 150.25,
         "side": "long",
         // ... other fields
       }
     ]
   }
   ```

3. **Arrow Data Endpoint** - Returns candlestick data in Apache Arrow format:
   ```
   GET /api/v1/dashboard/analytics/{campaignId}?asset={assetId}&timeframe={timeframe}
   Headers: X-User-Id: {userId}

   Response: Binary Apache Arrow IPC stream format with columns:
   - timestamp (int64, milliseconds since epoch)
   - open (float64)
   - high (float64)
   - low (float64)
   - close (float64)
   - volume (float64)
   ```

**Next.js Proxy Setup:**

Create these API routes in your Next.js app:

```typescript
// pages/api/trade-analytics/metadata/[campaignId].ts
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { campaignId } = req.query
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:9000'
  const userId = req.headers['x-user-id'] || 'guest'

  const response = await fetch(`${backendUrl}/api/v1/dashboard/analytics-metadata/${campaignId}`, {
    headers: { 'X-User-Id': userId as string }
  })

  res.status(response.status).json(await response.json())
}
```

```typescript
// pages/api/trade-analytics/round-trips/[campaignId].ts
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { campaignId } = req.query
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:9000'
  const userId = req.headers['x-user-id'] || 'guest'

  const response = await fetch(`${backendUrl}/api/v1/dashboard/round_trip/${campaignId}?page=1`, {
    headers: { 'X-User-Id': userId as string }
  })

  res.status(response.status).json(await response.json())
}
```

```typescript
// pages/api/trade-analytics/arrow-data/[campaignId]/[assetId].ts
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { campaignId, assetId } = req.query
  const { timeframe = '1m' } = req.query
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:9000'
  const userId = req.headers['x-user-id'] || 'guest'

  const response = await fetch(
    `${backendUrl}/api/v1/dashboard/analytics/${campaignId}?asset=${assetId}&timeframe=${timeframe}`,
    {
      headers: { 'X-User-Id': userId as string }
    }
  )

  const buffer = await response.arrayBuffer()
  res.setHeader('Content-Type', 'application/octet-stream')
  res.status(200).send(Buffer.from(buffer))
}
```

Then use empty `apiEndpoint`:

```tsx
<TradeAnalyticsContainer
  campaignId="campaign-123"
  apiEndpoint=""  // Empty = use Next.js /api routes
  userId="user-456"
/>
```

---

#### 2. TradeAnalyticsChartRenderer (Advanced - Manual Control)

**Low-level component when you need full control and want to fetch data yourself.**

```tsx
interface TradeAnalyticsChartRendererProps {
  campaignId: string                    // Required: Strategy/campaign ID
  assetId: string                       // Required: Asset identifier
  tradeAnalyticsMetadata?: GetTradeAnalyticsMetadataResponseType  // Optional: Pass metadata
  selectedRoundTrips?: IRoundTrip[]     // Optional: Round trips to highlight
  timeframe?: string                    // Optional: Override timeframe
  // ... more advanced options
}
```

**Basic Usage:**

```tsx
import { TradeAnalyticsChartRenderer } from '@epochlab/epoch-dashboard'

function TradeChart() {
  return (
    <TradeAnalyticsChartRenderer
      campaignId="strategy-123"
      assetId="BTC-USD"
    />
  )
}
```

**Use this when:**
- You want to fetch metadata/data yourself
- You need custom data sources
- You're building a custom UI around the chart

**Advanced Props:**
- `tradeAnalyticsMetadata`: Pass metadata object directly
- `selectedRoundTrips`: Array of round trips to highlight
- `paddingProfile`: Data padding mode (MINIMAL, CONSERVATIVE, STANDARD, AGGRESSIVE)
- `wheelZoomMode`: Zoom behavior ("default" or "cursor")
- `isFullScreen`: Fullscreen mode optimizations
- `fetchEntireCandleStickData`: Fetch all data vs lazy loading

---

### Individual Components

```tsx
import {
  LineChart,
  BarChart,
  TearsheetTable,
  Card
} from '@epochlab/epoch-dashboard'

// Use individual components for custom layouts
<LineChart data={tearsheet.charts.charts[0].linesDef} height={400} />
<TearsheetTable table={tearsheet.tables.tables[0]} />
```

### Utility Functions

```tsx
import {
  downloadTearsheet,
  readTearsheetFile,
  groupByCategory
} from '@epochlab/epoch-dashboard'

// File handling
const data = await readTearsheetFile(file)
downloadTearsheet(tearsheet, 'my-tearsheet.pb')

// Data processing
const categoryData = groupByCategory(tearsheet)
```

## 🧪 Development & Testing

### Test Data Server

For development and testing, the package includes a test data server that provides mock tearsheet data:

```bash
# From the monorepo root (EpochDashboard/js/)
cd apps/playground

# Start the test server (runs on port 3001)
node scripts/test-server.js
```

The test server provides these endpoints:

- **GET `/api/tearsheet/:id`** - Returns tearsheet data for any strategy ID
- **GET `/api/tearsheet/example`** - Returns example tearsheet data
- **GET `/health`** - Health check endpoint

Example usage:
```bash
# Get tearsheet data for a strategy
curl http://localhost:3001/api/tearsheet/my-strategy

# Get example data
curl http://localhost:3001/api/tearsheet/example

# Health check
curl http://localhost:3001/health
```

### Using with Playground

When running the playground with the test server:

```bash
# Terminal 1: Start the test server
cd apps/playground && node scripts/test-server.js

# Terminal 2: Start the playground
npm run dev

# Visit these URLs:
# http://localhost:3000/dashboard/my-strategy
# http://localhost:3000/dashboard/minimal
# http://localhost:3000/dashboard/example
```

The playground will automatically fetch data from the test server based on the strategy ID in the URL.

## 🎨 Styling & Theming

The dashboard uses **semantic tokens** for theming, making it easy to customize and integrate with existing design systems.

### Semantic Token Architecture

The dashboard references these CSS variables:

```css
/* Required CSS variables - add to your globals.css */
@layer base {
  .dark {
    --background: 0 0% 6%;               /* Main background */
    --foreground: 0 0% 98%;              /* Primary text */
    --card: 0 0% 8%;                     /* Card backgrounds */
    --card-foreground: 0 0% 98%;         /* Card text */
    --muted: 0 0% 15%;                   /* Muted backgrounds */
    --muted-foreground: 0 0% 64%;        /* Secondary text */
    --border: 0 0% 20%;                  /* Borders */
    --accent: 194 100% 50%;              /* Accent color (cyan) */
    --accent-foreground: 0 0% 98%;       /* Accent text */
    --destructive: 344 98% 61%;          /* Error/destructive */
    --destructive-foreground: 0 0% 98%;  /* Error text */
  }
}
```

### Tailwind Config

Map these variables to Tailwind utilities:

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        border: 'hsl(var(--border))',
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
      }
    }
  }
}
```

### Custom Theme Colors

To customize the theme, simply update the CSS variables:

```css
.dark {
  /* Blue-tinted dark theme */
  --background: 222 47% 11%;    /* Navy background */
  --accent: 207 90% 54%;        /* Blue accent */
}

.light {
  /* Light theme */
  --background: 0 0% 100%;      /* White background */
  --foreground: 0 0% 0%;        /* Black text */
  --accent: 194 100% 50%;       /* Cyan accent */
}
```

### Theme Toggle with next-themes

```tsx
import { ThemeProvider } from 'next-themes'

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <YourApp />
    </ThemeProvider>
  )
}
```

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- [Documentation](https://docs.epochlab.com/tearsheet-dashboard)
- [GitHub Repository](https://github.com/epochlab/tearsheet-dashboard)
- [Issues](https://github.com/epochlab/tearsheet-dashboard/issues)