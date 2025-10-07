import React, { useMemo } from 'react'
import { CardDef, CardData, EpochFolioType } from '../types/proto'
import { formatScalarByType, getScalarValue } from '../utils/protoHelpers'

interface CardProps {
  cardDef: CardDef
  className?: string
}

interface GroupedCards {
  groups: CardData[][]
  category?: string
}

const Card: React.FC<CardProps> = ({ cardDef, className = '' }) => {
  const groupedCardData = useMemo((): GroupedCards | undefined => {
    if (!cardDef?.data || !Array.isArray(cardDef.data) || cardDef.data.length === 0) {
      return undefined
    }

    const cardDataArray = cardDef.data
    const groupedCards: CardData[][] = []

    const groupNumbers = Array.from(
      new Set(cardDataArray.map((c: CardData) => c.group))
    ).sort((a, b) => {
      if (a === undefined || a === null) return 1
      if (b === undefined || b === null) return -1
      return Number(a) - Number(b)
    })

    for (const groupNum of groupNumbers) {
      const group = cardDataArray.filter((card: CardData) => card.group === groupNum)
      if (group.length > 0) {
        groupedCards.push(group)
      }
    }

    return {
      groups: groupedCards,
      category: cardDef.category || undefined
    }
  }, [cardDef])

  const formatCardValue = (cardData: CardData): string => {
    const scalarValue = getScalarValue(cardData.value)

    if (scalarValue === null || scalarValue === undefined) {
      return '-'
    }

    if (typeof scalarValue === 'boolean') {
      return scalarValue ? 'Yes' : 'No'
    }

    const type = cardData.type || EpochFolioType.TypeString
    return formatScalarByType(cardData.value, type)
  }

  if (!groupedCardData?.groups?.length) {
    return null
  }

  return (
    <div
      className={`flex h-fit flex-col items-start gap-5 rounded-2 border border-border/50 bg-card/50 p-5 ${className}`}
    >
      {groupedCardData.groups.map((group, groupIndex) => (
        <div key={groupIndex} className="flex w-full flex-col gap-5">
          <div className="grid grid-cols-2 gap-x-2.5 gap-y-5">
            {group.map((cardData, index) => (
              <div
                key={index}
                className="flex flex-col items-start gap-1.25"
              >
                <p className="text-xs font-normal text-muted-foreground m-0">
                  {cardData.title}
                </p>
                <p className="text-lg font-normal text-foreground m-0">
                  {formatCardValue(cardData)}
                </p>
              </div>
            ))}
          </div>
          {groupIndex < groupedCardData.groups.length - 1 && (
            <div className="h-px w-full bg-border" />
          )}
        </div>
      ))}
    </div>
  )
}

export default Card