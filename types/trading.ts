// Trading-related types and interfaces
export interface TradeParams {
  sellToken: string
  buyToken: string
  sellAmount: string
  buyAmount: string
  isSwapped: boolean
}

export interface TokenBalance {
  symbol: string
  balance: number
  decimals?: number
}

export interface ExchangeRate {
  pair: string
  rate: number
  lastUpdated: Date
}

export interface TradeResult {
  success: boolean
  transactionHash?: string
  error?: string
  executedAmount?: string
  actualRate?: number
}

export interface TradingConfig {
  slippageTolerance: number
  gasLimit?: number
  deadline?: number
}
