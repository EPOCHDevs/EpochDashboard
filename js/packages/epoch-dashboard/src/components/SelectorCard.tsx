import React, { useState } from 'react'
import clsx from 'clsx'
import {
  CardColumnSchema,
  CardRowData,
  CardSlot,
  CardRenderType,
  CardColor,
} from '../types/SelectorTypes'
import {
  formatCardValue,
  getBadgeDisplayText,
  getBadgeColor,
  getColorClasses,
} from '../utils/cardHelpers'

interface SelectorCardProps {
  schemas: CardColumnSchema[]
  rowData: CardRowData
  isSelected?: boolean
  isExpanded?: boolean
  onClick?: () => void
  onToggleExpand?: (e: React.MouseEvent) => void
}

const DETAIL_FIELDS_THRESHOLD = 5 // Show details directly if <= 5 fields, use expand/collapse if more

const SelectorCard: React.FC<SelectorCardProps> = ({
  schemas,
  rowData,
  isSelected = false,
  isExpanded = false,
  onClick,
  onToggleExpand,
}) => {
  // Group schemas by slot
  const schemasBySlot = schemas.reduce((acc, schema) => {
    if (!acc[schema.slot]) {
      acc[schema.slot] = []
    }
    acc[schema.slot].push(schema)
    return acc
  }, {} as Record<CardSlot, CardColumnSchema[]>)

  // Determine color for numeric values based on POSITIVE/NEGATIVE
  const getNumericColor = (value: number, colorMap?: any): CardColor => {
    if (!colorMap) {
      // Default: positive is success, negative is error
      return value >= 0 ? CardColor.Success : CardColor.Error
    }

    // Check if color_map has POSITIVE/NEGATIVE keys
    if (colorMap[CardColor.Success]?.includes('POSITIVE') && value >= 0) {
      return CardColor.Success
    }
    if (colorMap[CardColor.Error]?.includes('NEGATIVE') && value < 0) {
      return CardColor.Error
    }
    if (colorMap[CardColor.Warning]?.includes('ZERO') && value === 0) {
      return CardColor.Warning
    }

    // Fallback
    return value >= 0 ? CardColor.Success : CardColor.Error
  }

  // Render a single field based on its schema
  const renderField = (schema: CardColumnSchema, context: 'hero' | 'badge' | 'subtitle' | 'details' = 'details') => {
    const value = rowData[schema.column_id]

    if (value === null || value === undefined || value === '') {
      return <span className="text-muted-foreground">-</span>
    }

    switch (schema.render_type) {
      case CardRenderType.Badge: {
        const color = getBadgeColor(value, schema.color_map)
        const colorClasses = getColorClasses(color)
        const displayText = getBadgeDisplayText(value)

        return (
          <span
            className={clsx(
              'px-2 py-0.5 rounded-md text-xs font-medium',
              colorClasses.bg,
              colorClasses.text
            )}
          >
            {displayText}
          </span>
        )
      }

      case CardRenderType.Integer:
      case CardRenderType.Decimal: {
        const formattedValue = formatCardValue(value, schema.render_type)

        // For Hero slot, show large colored number
        if (context === 'hero') {
          const color = getNumericColor(value, schema.color_map)
          const colorClasses = getColorClasses(color)
          return (
            <span className={clsx('text-2xl font-bold', colorClasses.text)}>
              {formattedValue}
            </span>
          )
        }

        return <span className="font-medium">{formattedValue}</span>
      }

      case CardRenderType.Duration: {
        const formattedValue = formatCardValue(value, CardRenderType.Duration)
        return <span className="text-sm text-muted-foreground">{formattedValue}</span>
      }

      case CardRenderType.Monetary: {
        const formattedValue = formatCardValue(value, CardRenderType.Monetary)

        // For Hero slot, show large colored monetary value
        if (context === 'hero') {
          const color = getNumericColor(value, schema.color_map)
          const colorClasses = getColorClasses(color)
          return (
            <span className={clsx('text-2xl font-bold', colorClasses.text)}>
              {formattedValue}
            </span>
          )
        }

        // For footer, show in parentheses with smaller text
        if (context === 'details') {
          const color = getNumericColor(value, schema.color_map)
          const colorClasses = getColorClasses(color)
          return (
            <span className={clsx('text-sm', colorClasses.text)}>
              {formattedValue}
            </span>
          )
        }

        return <span className="font-medium">{formattedValue}</span>
      }

      case CardRenderType.Percent: {
        const formattedValue = formatCardValue(value, CardRenderType.Percent)

        // Show in parentheses with smaller text and color
        const color = getNumericColor(value, schema.color_map)
        const colorClasses = getColorClasses(color)
        return (
          <span className={clsx('text-sm', colorClasses.text)}>
            ({formattedValue})
          </span>
        )
      }

      case CardRenderType.Timestamp: {
        const formattedValue = formatCardValue(value, CardRenderType.Timestamp)
        return <span className="text-xs text-muted-foreground">{formattedValue}</span>
      }

      case CardRenderType.Boolean: {
        const boolValue = Boolean(value)
        const colorClasses = getColorClasses(boolValue ? CardColor.Success : CardColor.Error)
        return (
          <span className={clsx('text-sm font-medium', colorClasses.text)}>
            {boolValue ? 'Yes' : 'No'}
          </span>
        )
      }

      case CardRenderType.Text:
      default: {
        const textValue = String(value)
        const maxLength = 100
        const isTruncated = textValue.length > maxLength
        const displayText = isTruncated ? textValue.slice(0, maxLength) + '...' : textValue

        return (
          <span
            className={clsx('text-sm', isTruncated && 'cursor-help')}
            title={isTruncated ? textValue : undefined}
          >
            {displayText}
          </span>
        )
      }
    }
  }

  // Get primary badge schemas
  const primaryBadges = schemasBySlot[CardSlot.PrimaryBadge] || []
  const secondaryBadges = schemasBySlot[CardSlot.SecondaryBadge] || []
  const heroSchemas = schemasBySlot[CardSlot.Hero] || []
  const subtitleSchemas = schemasBySlot[CardSlot.Subtitle] || []
  const footerSchemas = schemasBySlot[CardSlot.Footer] || []
  const detailSchemas = schemasBySlot[CardSlot.Details] || []

  const hasDetails = detailSchemas.length > 0
  const shouldShowDetailsInline = detailSchemas.length <= DETAIL_FIELDS_THRESHOLD
  const shouldShowExpandButton = hasDetails && !shouldShowDetailsInline

  return (
    <button
      className={clsx(
        'relative flex flex-col gap-4 overflow-hidden rounded-lg w-full px-4 py-3 text-left group border transform-gpu transition-transform duration-150',
        isSelected
          ? 'bg-accent/20 border-accent shadow-md ring-1 ring-accent'
          : 'bg-background border-border hover:bg-muted hover:border-accent/50 hover:shadow-sm hover:scale-[1.01]'
      )}
      onClick={onClick}
    >
      {/* Card Content */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          {/* Row 1: Hero + Badges */}
          <div className="flex items-baseline gap-2 flex-wrap">
            {/* Hero - Large number */}
            {heroSchemas.map((schema, idx) => (
              <React.Fragment key={idx}>{renderField(schema, 'hero')}</React.Fragment>
            ))}

            {/* Primary Badge - e.g., SHORT */}
            {primaryBadges.map((schema, idx) => (
              <React.Fragment key={idx}>{renderField(schema, 'badge')}</React.Fragment>
            ))}

            {/* Secondary Badge - e.g., LOSS/WIN */}
            {secondaryBadges.map((schema, idx) => (
              <React.Fragment key={idx}>{renderField(schema, 'badge')}</React.Fragment>
            ))}
          </div>

          {/* Row 2: Subtitle + Footer */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Subtitle - Timestamp */}
            {subtitleSchemas.map((schema, idx) => (
              <React.Fragment key={idx}>{renderField(schema, 'subtitle')}</React.Fragment>
            ))}

            {/* Footer - Percentage */}
            {footerSchemas.map((schema, idx) => (
              <React.Fragment key={idx}>{renderField(schema, 'details')}</React.Fragment>
            ))}
          </div>

          {/* Inline Details - Show if <= threshold */}
          {shouldShowDetailsInline && hasDetails && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2 border-t border-border/30 mt-2">
              {detailSchemas.map((schema, idx) => (
                <div key={idx}>
                  <p className="text-xs text-muted-foreground mb-0.5">
                    {schema.label || schema.column_id}
                  </p>
                  <p className="text-sm text-foreground">
                    {renderField(schema)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expand/Collapse Button - Only show if > threshold */}
        {shouldShowExpandButton && onToggleExpand && (
          <div
            onClick={onToggleExpand}
            className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors shrink-0 cursor-pointer"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onToggleExpand(e as any)
              }
            }}
          >
            <svg
              className={clsx(
                'w-4 h-4 text-muted-foreground transition-transform duration-150',
                isExpanded && 'rotate-180'
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Expanded Details Section - Only show if > threshold */}
      {isExpanded && shouldShowExpandButton && (
        <div className="overflow-hidden">
          <div className="pt-3 border-t border-border/50">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {detailSchemas.map((schema, idx) => (
                <div key={idx}>
                  <p className="text-xs text-muted-foreground mb-1">
                    {schema.label || schema.column_id}
                  </p>
                  <p className="text-sm text-foreground">
                    {renderField(schema)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </button>
  )
}

export default SelectorCard
