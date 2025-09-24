import { Scalar, EpochFolioType } from '../types/proto'

export const getScalarValue = (scalar: Scalar | undefined | null): any => {
  if (!scalar || !scalar.value) return null

  const valueCase = Object.keys(scalar.value)[0]

  switch (valueCase) {
    case 'stringValue':
      return scalar.value.stringValue
    case 'integerValue':
      return scalar.value.integerValue
    case 'decimalValue':
      return scalar.value.decimalValue
    case 'percentValue':
      return scalar.value.percentValue
    case 'booleanValue':
      return scalar.value.booleanValue
    case 'timestampMs':
      return scalar.value.timestampMs
    case 'dateValue':
      return scalar.value.dateValue
    case 'dayDuration':
      return scalar.value.dayDuration
    case 'monetaryValue':
      return scalar.value.monetaryValue
    case 'durationMs':
      return scalar.value.durationMs
    case 'nullValue':
      return null
    default:
      return null
  }
}

export const getScalarNumericValue = (scalar: Scalar | undefined | null, defaultValue: number = 0): number => {
  if (!scalar || !scalar.value) return defaultValue

  const valueCase = Object.keys(scalar.value)[0]

  switch (valueCase) {
    case 'integerValue':
      return Number(scalar.value.integerValue) || defaultValue
    case 'decimalValue':
      return scalar.value.decimalValue || defaultValue
    case 'percentValue':
      return scalar.value.percentValue || defaultValue
    case 'monetaryValue':
      return scalar.value.monetaryValue || defaultValue
    case 'timestampMs':
      return Number(scalar.value.timestampMs) || defaultValue
    case 'durationMs':
      return Number(scalar.value.durationMs) || defaultValue
    default:
      return defaultValue
  }
}

export const getScalarStringValue = (scalar: Scalar | undefined | null, defaultValue: string = ''): string => {
  if (!scalar || !scalar.value) return defaultValue

  const valueCase = Object.keys(scalar.value)[0]

  if (valueCase === 'stringValue') {
    return scalar.value.stringValue || defaultValue
  }

  return String(getScalarValue(scalar) ?? defaultValue)
}

export const getScalarDatetimeValue = (scalar: Scalar | undefined | null, defaultValue: number = 0): number => {
  if (!scalar || !scalar.value) return defaultValue

  const valueCase = Object.keys(scalar.value)[0]

  if (valueCase === 'timestampMs') {
    return Number(scalar.value.timestampMs) || defaultValue
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
      return `${(Number(value) * 100).toFixed(2)}%`

    case EpochFolioType.TypeMonetary:
      return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

    case EpochFolioType.TypeBoolean:
      return value ? 'Yes' : 'No'

    case EpochFolioType.TypeDateTime:
      return new Date(Number(value)).toLocaleString('en-US')

    case EpochFolioType.TypeDate:
      return new Date(Number(value) * 86400000).toLocaleDateString('en-US')

    case EpochFolioType.TypeDayDuration:
      return `${value} days`

    case EpochFolioType.TypeDuration:
      const hours = Math.floor(Number(value) / 3600000)
      const minutes = Math.floor((Number(value) % 3600000) / 60000)
      return `${hours}h ${minutes}m`

    default:
      return String(value)
  }
}