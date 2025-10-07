import React, { useEffect, useMemo, useState } from "react"
import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  OnChangeFn,
  RowSelectionState,
  SortingState,
  TableOptions,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import clsx from "clsx"
import { ChevronDown, ChevronUp } from "lucide-react"

interface EpochTableProps<T> extends Omit<TableOptions<T>, "enableRowSelection"> {
  isLoading?: boolean
  filters?: ColumnFiltersState
  onFiltersChange?: OnChangeFn<ColumnFiltersState>
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  columnVisibility?: VisibilityState
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>
  rowSelection?: RowSelectionState
  onRowSelectionChange?: OnChangeFn<RowSelectionState>
  enableRowSelection?: boolean | ((row: any) => boolean)
  onRowClick?: (row: any) => void
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
}

function EpochTable<T>({
  columns,
  data,
  isLoading = false,
  filters,
  onFiltersChange,
  sorting,
  onSortingChange,
  columnVisibility,
  onColumnVisibilityChange,
  rowSelection,
  onRowSelectionChange,
  enableRowSelection = false,
  getCoreRowModel: getCoreRowModelProp,
  getSortedRowModel: getSortedRowModelProp,
  getFilteredRowModel: getFilteredRowModelProp,
  onRowClick,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  ...restOfTableOptions
}: EpochTableProps<T>) {
  const [internalSorting, setInternalSorting] = useState<SortingState>([])
  const [internalColumnFilters, setInternalColumnFilters] = useState<ColumnFiltersState>([])
  const [internalColumnVisibility, setInternalColumnVisibility] = useState<VisibilityState>({})
  const [internalRowSelection, setInternalRowSelection] = useState<RowSelectionState>({})
  const [globalFilter, setGlobalFilter] = useState("")

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModelProp ?? getCoreRowModel(),
    getSortedRowModel: getSortedRowModelProp ?? getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModelProp ?? getFilteredRowModel(),
    onSortingChange: onSortingChange ?? setInternalSorting,
    onColumnFiltersChange: onFiltersChange ?? setInternalColumnFilters,
    onColumnVisibilityChange: onColumnVisibilityChange ?? setInternalColumnVisibility,
    onRowSelectionChange: onRowSelectionChange ?? setInternalRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting: sorting ?? internalSorting,
      columnFilters: filters ?? internalColumnFilters,
      columnVisibility: columnVisibility ?? internalColumnVisibility,
      rowSelection: rowSelection ?? internalRowSelection,
      globalFilter: searchValue ?? globalFilter,
    },
    enableRowSelection,
    ...restOfTableOptions,
  })

  // Update global filter when search changes
  useEffect(() => {
    if (searchValue !== undefined) {
      setGlobalFilter(searchValue)
    }
  }, [searchValue])

  const tableRows = useMemo(() => table.getRowModel().rows, [table])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-pulse text-primary-white">Loading assets...</div>
      </div>
    )
  }

  return (
    <div className="h-full w-full overflow-auto">
      <table className="w-full">
        <thead className="sticky top-0 bg-secondary-darkGray">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort()
                return (
                  <th
                    key={header.id}
                    className={clsx(
                      "border-b border-primary-white/10 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-primary-white/70",
                      canSort && "cursor-pointer select-none hover:text-primary-white"
                    )}
                    style={{
                      width: header.getSize(),
                    }}
                    onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                  >
                    <div className="flex items-center gap-2">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                      {canSort && (
                        <span className="text-primary-white/50">
                          {header.column.getIsSorted() === "asc" ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : header.column.getIsSorted() === "desc" ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <span className="opacity-30">↕</span>
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-primary-white/5 bg-secondary-charcoal">
          {tableRows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-secondary-ashGrey">
                No assets found
              </td>
            </tr>
          ) : (
            tableRows.map((row) => (
              <tr
                key={row.id}
                className={clsx(
                  "transition-colors hover:bg-primary-white/5",
                  onRowClick && "cursor-pointer",
                  row.getIsSelected() && "bg-territory-blue/10"
                )}
                onClick={() => onRowClick?.(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-3 text-sm text-primary-white"
                    style={{
                      width: cell.column.getSize(),
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default EpochTable