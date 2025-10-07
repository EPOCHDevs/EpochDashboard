import React, { useEffect, useMemo, useRef, useState } from 'react'
import { GetTradeAnalyticsMetadataResponseType } from '../../../../packages/epoch-dashboard/src/types/TradeAnalyticsTypes'
import { createColumnHelper, getCoreRowModel } from '@tanstack/react-table'
import EpochTable from './EpochTable'
import { Check, Search, X } from 'lucide-react'
import clsx from 'clsx'

interface AssetInfo {
  id: string
  ticker?: string
  name?: string
  currency?: string
  assetClass?: string
  exchange?: string
  sector?: string
}

interface AssetSelectionModalProps {
  show: boolean
  metadata?: GetTradeAnalyticsMetadataResponseType
  selectedAssetId: string
  onAssetSelect: (assetId: string) => void
  onClose: () => void
}

const AssetSelectionModal: React.FC<AssetSelectionModalProps> = ({
  show,
  metadata,
  selectedAssetId,
  onAssetSelect,
  onClose,
}) => {
  const [searchValue, setSearchValue] = useState('')
  const modalRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Focus search input when modal opens
  useEffect(() => {
    if (show) {
      setTimeout(() => searchInputRef.current?.focus(), 100)
    }
  }, [show])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && show) {
        onClose()
      }
    }

    if (show) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [show, onClose])

  // Transform metadata to table data format
  const assetsData = useMemo<AssetInfo[]>(() => {
    if (!metadata?.asset_info) return []

    return Object.entries(metadata.asset_info).map(([id, info]) => ({
      id,
      ticker: info.asset.ticker,
      name: info.asset.name,
      currency: info.asset.currency,
      assetClass: info.asset.asset_class,
      exchange: info.asset.exchange,
      sector: info.asset.sector,
    }))
  }, [metadata])

  const columnHelper = createColumnHelper<AssetInfo>()

  const columns = useMemo(() => {
    return [
      columnHelper.display({
        id: 'select',
        enableSorting: false,
        header: () => (
          <div className="text-foreground/10">
            <Check size={20} />
          </div>
        ),
        cell: ({ row }) => {
          const isSelected = row.original.id === selectedAssetId
          return (
            <div className={clsx(
              isSelected ? "text-accent" : "text-foreground/10"
            )}>
              <Check size={20} />
            </div>
          )
        },
        size: 40,
      }),
      columnHelper.accessor('ticker', {
        header: 'Symbol',
        cell: ({ getValue }) => (
          <span className="font-medium text-foreground">
            {getValue() || '-'}
          </span>
        ),
        size: 100,
      }),
      columnHelper.accessor('name', {
        header: 'Name',
        enableGlobalFilter: true,
        cell: ({ getValue }) => (
          <span className="text-foreground">
            {getValue() || '-'}
          </span>
        ),
        minSize: 200,
      }),
      columnHelper.accessor('currency', {
        header: 'Currency',
        cell: ({ getValue }) => (
          <span className="text-foreground/70">
            {getValue() || '-'}
          </span>
        ),
        size: 100,
      }),
      columnHelper.accessor('assetClass', {
        header: 'Type',
        cell: ({ getValue }) => (
          <span className="text-foreground/70">
            {getValue() || '-'}
          </span>
        ),
        size: 120,
      }),
      columnHelper.accessor('exchange', {
        header: 'Exchange',
        cell: ({ getValue }) => (
          <span className="text-foreground/70">
            {getValue() || '-'}
          </span>
        ),
        size: 120,
      }),
      columnHelper.accessor('sector', {
        header: 'Sector',
        cell: ({ getValue }) => (
          <span className="text-foreground/70">
            {getValue() || '-'}
          </span>
        ),
        size: 150,
      }),
    ]
  }, [columnHelper, selectedAssetId])

  const handleAssetClick = (asset: AssetInfo) => {
    onAssetSelect(asset.id)
    onClose()
    setSearchValue('')
  }

  if (!show) return null

  return (
    <>
      {/* Semi-transparent backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[1200px] h-[80vh] bg-card border border-border rounded-lg shadow-2xl z-50 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-foreground">
              Select Asset
            </h2>
            <div className="h-8 w-px bg-border" />
            <span className="text-sm text-muted-foreground">
              {assetsData.length} assets available
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-muted/50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4 border-b border-border flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search by symbol, name, or type..."
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground outline-none focus:border-accent transition-colors"
            />
            {searchValue && (
              <button
                onClick={() => setSearchValue('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-hidden px-6 pb-6">
          <EpochTable
            columns={columns}
            data={assetsData}
            isLoading={false}
            onRowClick={handleAssetClick}
            searchValue={searchValue}
            enableRowSelection={false}
            getCoreRowModel={getCoreRowModel()}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between flex-shrink-0">
          <div className="text-sm text-muted-foreground">
            {selectedAssetId && (
              <>
                Currently selected: <span className="text-accent font-medium">
                  {metadata?.asset_info[selectedAssetId]?.asset?.ticker ||
                   metadata?.asset_info[selectedAssetId]?.asset?.name ||
                   selectedAssetId}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-foreground bg-muted/50 hover:bg-muted rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default AssetSelectionModal