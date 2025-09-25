import React, { useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
  createColumnHelper,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table'
import clsx from 'clsx'
import { Scalar, EpochFolioType } from '../types/proto'
import { formatScalarByType, getScalarValue } from '../utils/protoHelpers'

interface TableProps {
  headers: string[]
  rows: Scalar[][]
  columnTypes: EpochFolioType[]
  className?: string
}

const Table: React.FC<TableProps> = ({
  headers,
  rows,
  columnTypes,
  className = ''
}) => {
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

  return (
    <div className={clsx('w-full', className)}>
      <div className="h-[400px] overflow-auto rounded-2 border border-primary-white/5 bg-primary-white/2 scrollbar-horizontal-only">
        <table className="min-w-full">
          <thead className="sticky top-0 z-10 bg-secondary-mildCementGrey">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="border-b border-primary-white/10">
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium text-secondary-ashGrey uppercase cursor-pointer hover:bg-primary-white/5 transition-colors whitespace-nowrap"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      <span>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </span>
                      <span className="text-xs opacity-60 ml-1 flex-shrink-0">
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
          <tbody>
            {tableRows.map(row => (
              <tr
                key={row.id}
                className="border-b border-primary-white/5 hover:bg-primary-white/3 transition-colors"
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
  )
}

export default Table