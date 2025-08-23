// lib/uniswap/types.ts
import { Token } from '@uniswap/sdk-core'
import { Address } from 'viem'

export interface PoolKey {
  currency0: Address
  currency1: Address
  fee: number
  tickSpacing: number
  hooks: Address
}

export interface SwapParams {
  poolKey: PoolKey
  zeroForOne: boolean
  amountIn: string
  amountOutMinimum: string
  hookData: `0x${string}`
}

export interface QuoteParams {
  tokenIn: Token
  tokenOut: Token
  amountIn: string
  fee: number
  slippageBps?: number
}

export interface SwapQuote {
  amountOut: bigint
  amountOutFormatted: string
  amountOutMinimum: bigint
  amountOutMinimumFormatted: string
  gasEstimate: bigint
  priceImpact: number
}

export interface SwapResult {
  hash: `0x${string}`
  receipt?: any
  error?: string
}

export interface TokenBalance {
  token: Token
  balance: bigint
  balanceFormatted: string
}

export enum SwapType {
  EXACT_INPUT = 'exactInput',
  EXACT_OUTPUT = 'exactOutput'
}

export interface SwapState {
  isLoading: boolean
  isQuoting: boolean
  isSwapping: boolean
  quote: SwapQuote | null
  error: string | null
}
