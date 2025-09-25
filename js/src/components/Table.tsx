import React, { useMemo, useRef } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
  createColumnHelper,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import clsx from 'clsx'
import { Scalar, EpochFolioType } from '../types/proto'
import { formatScalarByType, getScalarValue } from '../utils/protoHelpers'

interface TableProps {
  headers: string[]
  rows: Scalar[][]
  columnTypes: EpochFolioType[]
  className?: string
}

const ROW_HEIGHT = 43

const Table: React.FC<TableProps> = ({
  headers,
  rows,
  columnTypes,
  className = ''
}) => {
  const parentRef = useRef<HTMLDivElement>(null)
  const [sorting, setSorting] = React.useState<SortingState>([])

  // Convert rows to objects for TanStack Table
  const tableData = useMemo(() => {
    return rows.map((row, index) => {
      const rowObj: Record<string, any> = { _index: index }
      headers.forEach((header, colIndex) => {
        rowObj[header] = {
          value: row[colIndex],
          type: columnTypes[colIndex],
          formatted: formatScalarByType(row[colIndex], columnTypes[colIndex])
        }
      })
      return rowObj
    })
  }, [rows, headers, columnTypes])

  // Create column definitions
  const columnHelper = createColumnHelper<typeof tableData[0]>()
  const columns: ColumnDef<typeof tableData[0], any>[] = useMemo(() => {
    return headers.map((header, index) =>
      columnHelper.accessor(header, {
        header: header,
        cell: ({ getValue }) => {
          const cellData = getValue()
          return cellData?.formatted || '-'
        },
        sortingFn: (rowA, rowB, columnId) => {
          const aVal = getScalarValue(rowA.getValue(columnId)?.value)
          const bVal = getScalarValue(rowB.getValue(columnId)?.value)

          if (aVal === null && bVal === null) return 0
          if (aVal === null) return 1
          if (bVal === null) return -1

          const columnType = columnTypes[index]
          if (columnType === EpochFolioType.TypeString) {
            return String(aVal).localeCompare(String(bVal))
          } else if (columnType === EpochFolioType.TypeBoolean) {
            return (aVal === bVal) ? 0 : aVal ? 1 : -1
          } else {
            return Number(aVal) - Number(bVal)
          }
        }
      })
    )
  }, [headers, columnTypes, columnHelper])

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const { rows: tableRows } = table.getRowModel()

  // Virtualization
  const rowVirtualizer = useVirtualizer({
    count: tableRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
  })

  return (
    <div className={clsx('w-full', className)}>
      <div
        ref={parentRef}
        className="h-[400px] overflow-auto rounded-2 border border-primary-white/5 bg-primary-white/2 scrollbar-hide"
      >
        <table className="w-full" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            {table.getAllColumns().map((_, index) => (
              <col key={index} style={{ width: `${100 / table.getAllColumns().length}%` }} />
            ))}
          </colgroup>
          <thead className="sticky top-0 z-10 bg-secondary-mildCementGrey">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="border-b border-primary-white/10">
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium text-secondary-ashGrey uppercase cursor-pointer hover:bg-primary-white/5 transition-colors"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      <span className="text-xs opacity-60 ml-1">
                        {{
                          asc: '▲',
                          desc: '▼',
                        }[header.column.getIsSorted() as string] ?? '⇅'}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              position: 'relative'
            }}
          >
            {rowVirtualizer.getVirtualItems().map(virtualItem => {
              const row = tableRows[virtualItem.index]
              return (
                <tr
                  key={row.id}
                  className="border-b border-primary-white/5 hover:bg-primary-white/3 transition-colors"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  {row.getVisibleCells().map(cell => (
                    <td
                      key={cell.id}
                      className="px-4 py-3 text-sm text-primary-white truncate"
                      style={{
                        width: `${100 / table.getAllColumns().length}%`,
                        maxWidth: 0
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Stats */}
      <div className="mt-4 text-sm text-secondary-ashGrey">
        Showing {tableRows.length} entries with virtualized scrolling
      </div>
    </div>
  )
}

export default Table