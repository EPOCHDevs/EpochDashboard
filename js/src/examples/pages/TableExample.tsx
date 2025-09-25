import React from 'react'
import Table from '../../components/Table'
import { createMockTableData } from '../../utils/tableMocks'

export default function TableExample() {
  const tableData = createMockTableData()

  return (
    <div>
      <h2 className="text-2xl font-bold text-primary-white mb-6">
        Table Component
      </h2>
      <p className="text-secondary-ashGrey mb-8">
        Displays tabular data with all supported EpochFolioType formatting, sorting, and pagination.
        Click column headers to sort. Covers all 10 data types: String, Integer, Decimal, Percent, Boolean, DateTime, Date, DayDuration, Monetary, Duration.
      </p>

      <div className="space-y-6">
        <Table
          headers={tableData.headers}
          rows={tableData.rows}
          columnTypes={tableData.columnTypes}
          itemsPerPage={3} // Small page size for demo
        />
      </div>

      <div className="mt-8 p-4 rounded-lg bg-secondary-mildCementGrey border border-primary-white/10">
        <h3 className="text-lg font-medium text-primary-white mb-3">Type Coverage</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-secondary-ashGrey">✓ TypeString</div>
          <div className="text-secondary-ashGrey">✓ TypeInteger</div>
          <div className="text-secondary-ashGrey">✓ TypeDecimal</div>
          <div className="text-secondary-ashGrey">✓ TypePercent</div>
          <div className="text-secondary-ashGrey">✓ TypeBoolean</div>
          <div className="text-secondary-ashGrey">✓ TypeDateTime</div>
          <div className="text-secondary-ashGrey">✓ TypeDate</div>
          <div className="text-secondary-ashGrey">✓ TypeDayDuration</div>
          <div className="text-secondary-ashGrey">✓ TypeMonetary</div>
          <div className="text-secondary-ashGrey">✓ TypeDuration</div>
        </div>
      </div>
    </div>
  )
}