import { PieDef, EpochFolioDashboardWidget } from '@epochlab/epoch-dashboard'

// Test Case 1: Basic Pie Chart
export const createBasicPieChart = (): PieDef => {
  return {
    chartDef: {
      id: 'pie-test-1',
      title: 'Portfolio Allocation',
      type: EpochFolioDashboardWidget.WidgetPie
    },
    data: [
      {
        name: 'Portfolio',
        points: [
          { name: 'Stocks', y: 45.2 },
          { name: 'Bonds', y: 28.5 },
          { name: 'Real Estate', y: 16.8 },
          { name: 'Commodities', y: 6.1 },
          { name: 'Cash', y: 3.4 }
        ],
        size: '70%'
      }
    ]
  }
}

// Test Case 2: Donut Chart
export const createDonutChart = (): PieDef => {
  return {
    chartDef: {
      id: 'pie-test-2',
      title: 'Revenue by Product Category',
      type: EpochFolioDashboardWidget.WidgetPie
    },
    data: [
      {
        name: 'Revenue',
        points: [
          { name: 'Software Licenses', y: 125.5 },
          { name: 'Professional Services', y: 89.3 },
          { name: 'Support & Maintenance', y: 67.2 },
          { name: 'Training', y: 32.1 },
          { name: 'Hardware', y: 18.9 }
        ],
        size: '75%',
        innerSize: '40%'
      }
    ]
  }
}

// Test Case 3: Multiple Pie Charts (nested)
export const createMultiplePieChart = (): PieDef => {
  return {
    chartDef: {
      id: 'pie-test-3',
      title: 'Global Market Share Analysis',
      type: EpochFolioDashboardWidget.WidgetPie
    },
    data: [
      {
        name: 'Regions',
        points: [
          { name: 'North America', y: 42.5 },
          { name: 'Europe', y: 31.2 },
          { name: 'Asia Pacific', y: 19.8 },
          { name: 'Latin America', y: 4.3 },
          { name: 'Others', y: 2.2 }
        ],
        size: '60%',
        innerSize: '0%'
      },
      {
        name: 'Products',
        points: [
          { name: 'Product A', y: 38.1 },
          { name: 'Product B', y: 27.4 },
          { name: 'Product C', y: 21.3 },
          { name: 'Product D', y: 13.2 }
        ],
        size: '80%',
        innerSize: '70%'
      }
    ]
  }
}

// Test Case 4: Trading Performance Pie
export const createTradingPerformancePie = (): PieDef => {
  return {
    chartDef: {
      id: 'pie-test-4',
      title: 'Trading Strategy Performance',
      type: EpochFolioDashboardWidget.WidgetPie
    },
    data: [
      {
        name: 'Strategy Returns',
        points: [
          { name: 'Momentum Strategy', y: 12.8 },
          { name: 'Mean Reversion', y: 8.5 },
          { name: 'Arbitrage', y: 4.2 },
          { name: 'Long/Short Equity', y: 15.6 },
          { name: 'Market Neutral', y: 6.9 },
          { name: 'Event Driven', y: 9.3 }
        ],
        size: '65%'
      }
    ]
  }
}

// Test Case 5: Risk Distribution
export const createRiskDistributionPie = (): PieDef => {
  return {
    chartDef: {
      id: 'pie-test-5',
      title: 'Portfolio Risk Distribution',
      type: EpochFolioDashboardWidget.WidgetPie
    },
    data: [
      {
        name: 'Risk Metrics',
        points: [
          { name: 'Market Risk', y: 35.7 },
          { name: 'Credit Risk', y: 22.8 },
          { name: 'Operational Risk', y: 18.5 },
          { name: 'Liquidity Risk', y: 12.4 },
          { name: 'Currency Risk', y: 7.8 },
          { name: 'Interest Rate Risk', y: 2.8 }
        ],
        size: '80%',
        innerSize: '30%'
      }
    ]
  }
}

// Test Case 6: Small Dataset Pie
export const createSmallDatasetPie = (): PieDef => {
  return {
    chartDef: {
      id: 'pie-test-6',
      title: 'Binary Decision Analysis',
      type: EpochFolioDashboardWidget.WidgetPie
    },
    data: [
      {
        name: 'Decision',
        points: [
          { name: 'Approve', y: 68.5 },
          { name: 'Reject', y: 31.5 }
        ],
        size: '50%'
      }
    ]
  }
}

// Test Case 7: Large Dataset Pie
export const createLargeDatasetPie = (): PieDef => {
  const sectors = [
    'Technology', 'Healthcare', 'Financials', 'Consumer Discretionary',
    'Communication Services', 'Industrials', 'Consumer Staples', 'Energy',
    'Utilities', 'Real Estate', 'Materials', 'Aerospace & Defense',
    'Biotechnology', 'Media & Entertainment', 'Food & Beverage'
  ]

  const points = sectors.map((sector, _index) => ({
    name: sector,
    y: Math.random() * 15 + 2 // Random values between 2-17
  }))

  return {
    chartDef: {
      id: 'pie-test-7',
      title: 'Sector Allocation (Detailed)',
      type: EpochFolioDashboardWidget.WidgetPie
    },
    data: [
      {
        name: 'Sectors',
        points,
        size: '85%'
      }
    ]
  }
}

// Test Case 8: Currency Distribution
export const createCurrencyDistributionPie = (): PieDef => {
  return {
    chartDef: {
      id: 'pie-test-8',
      title: 'Currency Exposure',
      type: EpochFolioDashboardWidget.WidgetPie
    },
    data: [
      {
        name: 'Currencies',
        points: [
          { name: 'USD', y: 45.2 },
          { name: 'EUR', y: 23.8 },
          { name: 'GBP', y: 12.5 },
          { name: 'JPY', y: 8.7 },
          { name: 'CHF', y: 5.3 },
          { name: 'CAD', y: 2.9 },
          { name: 'AUD', y: 1.6 }
        ],
        size: '70%',
        innerSize: '25%'
      }
    ]
  }
}

// Test Case 9: Performance Attribution
export const createPerformanceAttributionPie = (): PieDef => {
  return {
    chartDef: {
      id: 'pie-test-9',
      title: 'Performance Attribution Analysis',
      type: EpochFolioDashboardWidget.WidgetPie
    },
    data: [
      {
        name: 'Attribution',
        points: [
          { name: 'Stock Selection', y: 3.2 },
          { name: 'Sector Allocation', y: 1.8 },
          { name: 'Currency Impact', y: -0.5 },
          { name: 'Timing Effects', y: 0.9 },
          { name: 'Interaction Effects', y: 0.3 },
          { name: 'Transaction Costs', y: -0.7 }
        ],
        size: '65%'
      }
    ]
  }
}

// Test Case 10: ESG Scoring
export const createESGScoringPie = (): PieDef => {
  return {
    chartDef: {
      id: 'pie-test-10',
      title: 'ESG Portfolio Scoring',
      type: EpochFolioDashboardWidget.WidgetPie
    },
    data: [
      {
        name: 'ESG Components',
        points: [
          { name: 'Environmental', y: 33.4 },
          { name: 'Social', y: 35.7 },
          { name: 'Governance', y: 30.9 }
        ],
        size: '55%',
        innerSize: '0%'
      }
    ]
  }
}

// Create all test pie charts
export const createAllPieChartTests = (): PieDef[] => {
  return [
    createBasicPieChart(),
    createDonutChart(),
    createMultiplePieChart(),
    createTradingPerformancePie(),
    createRiskDistributionPie(),
    createSmallDatasetPie(),
    createLargeDatasetPie(),
    createCurrencyDistributionPie(),
    createPerformanceAttributionPie(),
    createESGScoringPie()
  ]
}