'use client'

import React, { useMemo } from 'react'
import { Table as TableProto, Scalar, EpochFolioType } from '../../types/proto'
import { getScalarValue, formatScalarByType } from '../../utils/protoHelpers'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  SortingState,
  ColumnDef
} from '@tanstack/react-table'

interface TearsheetTableProps {
  table: TableProto
}

const TearsheetTable: React.FC<TearsheetTableProps> = ({ table }) => {
  const [sorting, setSorting] = React.useState<SortingState>([])

  // Extract headers from columns
  const headers = useMemo(() => {
    return table.columns?.map(col => col.name || '') || []
  }, [table.columns])

  // Extract column types
  const columnTypes = useMemo(() => {
    return table.columns?.map(col => col.type || EpochFolioType.TypeString) || []
  }, [table.columns])

  // Extract rows from table data
  const rows = useMemo(() => {
    if (!table.data?.rows) return []
    return table.data.rows.map(row => {
      if (!row.values) return []
      return row.values // Keep original scalar objects, don't extract values yet
    })
  }, [table.data])

  // Create columns for react-table
  const columns = useMemo<ColumnDef<any[]>[]>(() => {
    return headers.map((header, index) => ({
      id: header,
      accessorFn: row => row[index],
      header: () => header,
      cell: ({ getValue }) => {
        const scalar = getValue()
        const columnType = columnTypes[index]

        if (!scalar) {
          return <span className="text-primary-white/20">-</span>
        }

        // Special case for boolean to show checkmarks
        if (columnType === EpochFolioType.TypeBoolean) {
          return getScalarValue(scalar) ? '✓' : '✗'
        }

        // Use centralized scalar formatting
        return formatScalarByType(scalar, columnType)
      }
    }))
  }, [headers, columnTypes])

  const tableInstance = useReactTable({
    data: rows,
    columns,
    state: {
      sorting
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  })

  if (rows.length === 0) {
    return (
      <div className="w-full">
        <div className="h-[400px] flex items-center justify-center bg-primary-white/5 rounded-lg">
          <div className="text-primary-white/40">No data available</div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="overflow-hidden bg-primary-white/5 rounded-lg">
        {table.title && (
          <div className="px-4 py-3 border-b border-primary-white/10">
            <h3 className="text-sm font-medium text-primary-white">
              {table.title}
            </h3>
          </div>
        )}
        <div className="h-[400px] epoch-table-scrollbar">
          <table className="min-w-full">
            <thead className="sticky top-0 bg-secondary-darkGray/95 backdrop-blur">
              {tableInstance.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-medium text-primary-white/70 uppercase tracking-wider cursor-pointer hover:text-primary-white"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getIsSorted() && (
                          <span className="text-primary-white/50">
                            {header.column.getIsSorted() === 'desc' ? '↓' : '↑'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-transparent divide-y divide-primary-white/5">
              {tableInstance.getRowModel().rows.map(row => (
                <tr
                  key={row.id}
                  className="border-b border-primary-white/5 hover:bg-primary-white/5 transition-colors"
                >
                  {row.getVisibleCells().map(cell => (
                    <td
                      key={cell.id}
                      className="px-4 py-3 text-sm text-primary-white whitespace-nowrap"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default TearsheetTable