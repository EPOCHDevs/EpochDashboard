import React from 'react'
import Card from '../../components/Card'
import { createMockCardDef } from '../../utils/mockData'

export default function CardExample() {
  const mockCardDef = createMockCardDef()

  return (
    <div>
      <h2 className="text-2xl font-bold text-primary-white mb-6">
        Card Component
      </h2>
      <p className="text-secondary-ashGrey mb-8">
        Displays grouped metric cards with various data types (percent, decimal, monetary, etc.)
      </p>

      <div className="space-y-6">
        <Card cardDef={mockCardDef} />
      </div>
    </div>
  )
}