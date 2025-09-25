import { Scalar, EpochFolioType } from '../types/proto'
import ms from 'ms'

export const getScalarValue = (scalar: Scalar | undefined | null): any => {
  if (!scalar) return null

  // Check all possible scalar value fields directly on the object
  if (scalar.stringValue !== undefined && scalar.stringValue !== null) return scalar.stringValue
  if (scalar.integerValue !== undefined && scalar.integerValue !== null) return scalar.integerValue
  if (scalar.decimalValue !== undefined && scalar.decimalValue !== null) return scalar.decimalValue
  if (scalar.percentValue !== undefined && scalar.percentValue !== null) return scalar.percentValue
  if (scalar.booleanValue !== undefined && scalar.booleanValue !== null) return scalar.booleanValue
  if (scalar.timestampMs !== undefined && scalar.timestampMs !== null) return scalar.timestampMs
  if (scalar.dateValue !== undefined && scalar.dateValue !== null) return scalar.dateValue
  if (scalar.dayDuration !== undefined && scalar.dayDuration !== null) return scalar.dayDuration
  if (scalar.monetaryValue !== undefined && scalar.monetaryValue !== null) return scalar.monetaryValue
  if (scalar.durationMs !== undefined && scalar.durationMs !== null) return scalar.durationMs
  if (scalar.nullValue !== undefined) return null

  return null
}

export const getScalarNumericValue = (scalar: Scalar | undefined | null, defaultValue: number = 0): number => {
  if (!scalar) return defaultValue

  if (scalar.integerValue !== undefined && scalar.integerValue !== null) return Number(scalar.integerValue)
  if (scalar.decimalValue !== undefined && scalar.decimalValue !== null) return scalar.decimalValue
  if (scalar.percentValue !== undefined && scalar.percentValue !== null) return scalar.percentValue
  if (scalar.monetaryValue !== undefined && scalar.monetaryValue !== null) return scalar.monetaryValue
  if (scalar.timestampMs !== undefined && scalar.timestampMs !== null) return Number(scalar.timestampMs)
  if (scalar.durationMs !== undefined && scalar.durationMs !== null) return Number(scalar.durationMs)

  return defaultValue
}

export const getScalarStringValue = (scalar: Scalar | undefined | null, defaultValue: string = ''): string => {
  if (!scalar) return defaultValue

  if (scalar.stringValue !== undefined && scalar.stringValue !== null) {
    return scalar.stringValue
  }

  return String(getScalarValue(scalar) ?? defaultValue)
}

export const getScalarDatetimeValue = (scalar: Scalar | undefined | null, defaultValue: number = 0): number => {
  if (!scalar) return defaultValue

  if (scalar.timestampMs !== undefined && scalar.timestampMs !== null) {
    return Number(scalar.timestampMs)
  }

  return defaultValue
}

export const formatScalarByType = (scalar: Scalar | undefined | null, type: EpochFolioType): string => {
  const value = getScalarValue(scalar)

  if (value === null || value === undefined) return '-'

  switch (type) {
    case EpochFolioType.TypeString:
      return String(value)

    case EpochFolioType.TypeInteger:
      return Number(value).toLocaleString('en-US', { maximumFractionDigits: 0 })

    case EpochFolioType.TypeDecimal:
      return Number(value).toLocaleString('en-US', { maximumFractionDigits: 2 })

    case EpochFolioType.TypePercent:
      return `${Number(value).toFixed(2)}%`

    case EpochFolioType.TypeMonetary:
      return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

    case EpochFolioType.TypeBoolean:
      return value ? 'Yes' : 'No'

    case EpochFolioType.TypeDateTime:
      return new Date(Number(value)).toLocaleString('en-US')

    case EpochFolioType.TypeDate:
      return new Date(Number(value)).toLocaleDateString('en-US')

    case EpochFolioType.TypeDayDuration:
      return `${value} days`

    case EpochFolioType.TypeDuration:
      return ms(Number(value), { long: false })

    default:
      return String(value)
  }
}