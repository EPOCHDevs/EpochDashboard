// Asset Types
export enum AssetClasses {
  STOCKS = "Stocks",
  FUTURES = "Futures",
  CRYPTO = "Crypto",
  FX = "FX",
}

export interface IAsset {
  id: string
  name: string
  ticker: string
  asset_class: AssetClasses
  exchange: string
  currency: string
  industry: string
  sector: string
  multiplier: number
  min_tick: number
  category: string
  eod_start: string
  eod_end: string
  expiry_months: string
}

export type GetAssetsResponseType = IAsset[]

export type GetFuturesContinuationResponseType = Array<{
  id: string
  name: string
  ticker?: string
}>