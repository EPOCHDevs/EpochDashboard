'use client'

import React, { useMemo, useRef } from 'react'
import { Table as TableProto, Scalar, EpochFolioType, ColumnDef as ProtoColumnDef, TableRow } from '../../types/proto'
import { getScalarValue, formatScalarByType } from '../../utils/protoHelpers'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  SortingState,
  ColumnDef as ReactTableColumnDef
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'

interface TearsheetTableProps {
  table: TableProto
}

const TearsheetTable: React.FC<TearsheetTableProps> = ({ table }) => {
  const [sorting, setSorting] = React.useState<SortingState>([])

  // Extract headers from columns
  const headers = useMemo(() => {
    return table.columns?.map((col: ProtoColumnDef) => col.name || '') || []
  }, [table.columns])

  // Extract column types
  const columnTypes = useMemo(() => {
    return table.columns?.map((col: ProtoColumnDef) => col.type || EpochFolioType.TypeString) || []
  }, [table.columns])

  // Extract rows from table data
  const rows = useMemo(() => {
    if (!table.data?.rows) return []
    return table.data.rows.map((row: TableRow) => {
      if (!row.values) return []
      return row.values // Keep original scalar objects, don't extract values yet
    })
  }, [table.data])

  // Create columns for react-table
  const columns = useMemo<ReactTableColumnDef<any[]>[]>(() => {
    return headers.map((header: string, index: number) => ({
      id: header,
      accessorFn: (row: any[]) => row[index],
      header: () => header,
      cell: ({ getValue }: { getValue: () => any }) => {
        const scalar = getValue()
        const columnType = columnTypes[index]

        if (!scalar) {
          return <span className="text-muted-foreground/30">-</span>
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

  // Virtual scrolling for large datasets (critical for 500+ rows)
  const tableContainerRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: tableInstance.getRowModel().rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 45, // Estimated row height in pixels
    overscan: 10, // Render 10 extra rows above and below viewport
  })

  if (rows.length === 0) {
    return (
      <div className="w-full">
        <div className="h-[400px] flex items-center justify-center bg-card/50 rounded-lg">
          <div className="text-muted-foreground">No data available</div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="overflow-hidden bg-card/50 rounded-lg">
        {table.title && (
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-medium text-foreground">
              {table.title}
            </h3>
          </div>
        )}
        <div
          ref={tableContainerRef}
          className="h-[400px] overflow-auto epoch-table-scrollbar"
        >
          <div className="min-w-full">
            {/* Header */}
            <div className="sticky top-0 bg-card/95 backdrop-blur z-10 border-b border-border">
              {tableInstance.getHeaderGroups().map(headerGroup => (
                <div key={headerGroup.id} className="flex">
                  {headerGroup.headers.map(header => (
                    <div
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground flex-1 min-w-[200px] overflow-hidden"
                      onClick={header.column.getToggleSortingHandler()}
                      title={typeof header.column.columnDef.header === 'string' ? header.column.columnDef.header : ''}
                    >
                      <div className="flex items-center gap-1 truncate">
                        <span className="truncate">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </span>
                        {header.column.getIsSorted() && (
                          <span className="text-muted-foreground/70 flex-shrink-0">
                            {header.column.getIsSorted() === 'desc' ? '↓' : '↑'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Virtual scrolling body */}
            <div
              className="relative bg-transparent"
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
              }}
            >
              {rowVirtualizer.getVirtualItems().map(virtualRow => {
                const row = tableInstance.getRowModel().rows[virtualRow.index]
                return (
                  <div
                    key={row.id}
                    className="border-b border-border/50 hover:bg-foreground/5 transition-colors absolute w-full flex"
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    {row.getVisibleCells().map(cell => {
                      const cellValue = cell.getValue()
                      const displayValue = flexRender(cell.column.columnDef.cell, cell.getContext())
                      const tooltipValue = typeof cellValue === 'string' || typeof cellValue === 'number' ? String(cellValue) : ''

                      return (
                        <div
                          key={cell.id}
                          className="px-4 py-3 text-sm text-foreground flex-1 min-w-[200px] flex items-center overflow-hidden"
                          title={tooltipValue}
                        >
                          <span className="truncate w-full">
                            {displayValue}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TearsheetTable