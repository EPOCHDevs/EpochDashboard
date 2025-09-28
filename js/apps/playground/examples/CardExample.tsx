import React from 'react'
import { Card, CardDef, EpochFolioType, EpochFolioDashboardWidget } from '@epochlab/epoch-dashboard'

const CardExample: React.FC = () => {
  const sampleCardDef: CardDef = {
    type: EpochFolioDashboardWidget.WidgetCard,
    category: 'Performance',
    data: [
      {
        title: 'Total Return',
        value: {
          percentValue: 0.1523
        },
        type: EpochFolioType.TypePercent,
        group: 0
      },
      {
        title: 'Sharpe Ratio',
        value: {
          decimalValue: 1.87
        },
        type: EpochFolioType.TypeDecimal,
        group: 0
      },
      {
        title: 'Max Drawdown',
        value: {
          percentValue: -0.0842
        },
        type: EpochFolioType.TypePercent,
        group: 0
      },
      {
        title: 'Win Rate',
        value: {
          percentValue: 0.6234
        },
        type: EpochFolioType.TypePercent,
        group: 0
      },
      {
        title: 'Total Trades',
        value: {
          integerValue: 1247
        },
        type: EpochFolioType.TypeInteger,
        group: 1
      },
      {
        title: 'Avg Trade Duration',
        value: {
          dayDuration: 3
        },
        type: EpochFolioType.TypeDayDuration,
        group: 1
      },
      {
        title: 'Profit Factor',
        value: {
          decimalValue: 2.14
        },
        type: EpochFolioType.TypeDecimal,
        group: 1
      },
      {
        title: 'Capital',
        value: {
          monetaryValue: 250000
        },
        type: EpochFolioType.TypeMonetary,
        group: 1
      }
    ],
    groupSize: 2
  }

  return (
    <div style={{ padding: '2rem', backgroundColor: '#0f172a', minHeight: '100vh' }}>
      <h1 style={{ color: '#f1f5f9', marginBottom: '2rem' }}>Card Component Example</h1>

      <Card cardDef={sampleCardDef} />

      <div style={{ marginTop: '2rem', color: '#94a3b8' }}>
        <h2 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Features Demonstrated:</h2>
        <ul style={{ lineHeight: '1.75' }}>
          <li>✅ Group-based card organization (2 groups with 4 cards each)</li>
          <li>✅ Multiple EpochFolioType formats (Percent, Decimal, Integer, Monetary, DayDuration)</li>
          <li>✅ Separator between groups</li>
          <li>✅ 2-column grid layout</li>
          <li>✅ Proper styling matching EpochWeb design</li>
        </ul>
      </div>
    </div>
  )
}

export default CardExample