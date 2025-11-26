'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import clsx from 'clsx'
import { Search, X, Layers } from 'lucide-react'

interface CategorySelectorDialogProps {
  categories: string[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

export function CategorySelectorDialog({
  categories,
  selectedCategory,
  onCategoryChange,
}: CategorySelectorDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  // Close on escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  const handleSelectCategory = (category: string) => {
    onCategoryChange(category)
    setIsOpen(false)
    setSearchQuery('')
  }

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories

    const query = searchQuery.toLowerCase()
    return categories.filter((category) =>
      category.toLowerCase().includes(query)
    )
  }, [categories, searchQuery])

  // Separate ALL from asset-specific categories
  const allCategory = filteredCategories.find(c => c === 'ALL')
  const assetCategories = filteredCategories.filter(c => c !== 'ALL')

  if (categories.length === 0) {
    return null
  }

  // Display label for selected category
  const selectedLabel = selectedCategory === 'ALL'
    ? 'Campaign-Wide (ALL)'
    : selectedCategory

  return (
    <>
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "flex items-center gap-2 bg-background border rounded-md px-3 py-1.5",
          "text-sm font-medium transition-all cursor-pointer",
          "focus:outline-none focus:ring-2 focus:ring-accent",
          isOpen
            ? "border-accent bg-accent/10 text-foreground"
            : "border-border text-foreground hover:bg-muted hover:border-accent"
        )}
        disabled={categories.length === 1}
      >
        <span className="text-muted-foreground">View:</span>
        <span className="font-semibold">{selectedLabel}</span>
      </button>

      {/* Full-Screen Modal */}
      {isOpen && categories.length > 1 && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 animate-in fade-in duration-200"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsOpen(false)
              setSearchQuery('')
            }
          }}
        >
          {/* Modal Container */}
          <div className="w-full max-w-2xl bg-card border border-border rounded-lg shadow-2xl overflow-hidden animate-in slide-in-from-top-4 duration-300">
            {/* Header */}
            <div className="bg-background/50 border-b border-border px-4 py-3">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-foreground">Select View</h2>
                <button
                  onClick={() => {
                    setIsOpen(false)
                    setSearchQuery('')
                  }}
                  className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Search Input */}
              {categories.length > 5 && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search categories..."
                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                </div>
              )}
            </div>

            {/* Category List */}
            <div className="max-h-[500px] overflow-y-auto">
              {filteredCategories.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">No categories found</p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="mt-2 text-sm text-accent hover:underline"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {/* ALL Category - Campaign-Wide */}
                  {allCategory && (
                    <button
                      onClick={() => handleSelectCategory(allCategory)}
                      className={clsx(
                        "w-full px-4 py-3 text-left transition-colors hover:bg-accent/10",
                        selectedCategory === allCategory && "bg-accent/20"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        {/* Special Badge for ALL */}
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/30">
                          <Layers size={20} className="text-accent" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-foreground text-base">
                            Campaign-Wide
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Aggregated data across all assets
                          </div>
                        </div>

                        {/* Selected Indicator */}
                        <div className="w-5 flex-shrink-0">
                          {selectedCategory === allCategory && (
                            <svg
                              className="w-5 h-5 text-accent"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </button>
                  )}

                  {/* Asset-Specific Categories */}
                  {assetCategories.map((category) => {
                    const isSelected = category === selectedCategory

                    return (
                      <button
                        key={category}
                        onClick={() => handleSelectCategory(category)}
                        className={clsx(
                          "w-full px-4 py-2.5 text-left transition-colors hover:bg-accent/10",
                          isSelected && "bg-accent/20"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          {/* Asset Badge */}
                          <div className="px-3 py-1.5 rounded-md text-xs font-medium bg-blue-500/20 text-blue-400 flex-shrink-0">
                            ASSET
                          </div>

                          {/* Category Name */}
                          <div className="flex-1 font-semibold text-foreground text-sm">
                            {category}
                          </div>

                          {/* Selected Indicator */}
                          <div className="w-5 flex-shrink-0">
                            {isSelected && (
                              <svg
                                className="w-5 h-5 text-accent"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer - showing result count */}
            <div className="bg-background/50 border-t border-border px-4 py-2 text-xs text-muted-foreground">
              {searchQuery ? (
                <span>Showing {filteredCategories.length} of {categories.length} categories</span>
              ) : (
                <span>{filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'} available</span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default CategorySelectorDialog
