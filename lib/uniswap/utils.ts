// lib/uniswap/utils.ts
import { Token } from '@uniswap/sdk-core'
import { formatUnits, parseUnits, Address } from 'viem'
import { PoolKey, QuoteParams, SwapParams } from './types'
import { TICK_SPACING, FEE_TIERS } from './constants'

/**
 * Creates a pool key for Uniswap V4
 */
export function createPoolKey(
  tokenA: Token,
  tokenB: Token,
  fee: number = FEE_TIERS.LOW,
  hooks: Address = '0x0000000000000000000000000000000000000000'
): PoolKey {
  // Ensure tokens are ordered correctly (currency0 < currency1)
  const [currency0, currency1] = tokenA.address.toLowerCase() < tokenB.address.toLowerCase() 
    ? [tokenA.address as Address, tokenB.address as Address]
    : [tokenB.address as Address, tokenA.address as Address]

  const tickSpacing = TICK_SPACING[fee as keyof typeof TICK_SPACING] || 10

  return {
    currency0,
    currency1,
    fee,
    tickSpacing,
    hooks,
  }
}

/**
 * Determines if tokenA is currency0 in the pool
 */
export function isToken0(tokenA: Token, tokenB: Token): boolean {
  return tokenA.address.toLowerCase() < tokenB.address.toLowerCase()
}

/**
 * Creates swap parameters from quote parameters
 */
export function createSwapParams(params: QuoteParams): SwapParams {
  const { tokenIn, tokenOut, amountIn, fee } = params
  const poolKey = createPoolKey(tokenIn, tokenOut, fee)
  const zeroForOne = isToken0(tokenIn, tokenOut)

  return {
    poolKey,
    zeroForOne,
    amountIn: parseUnits(amountIn, tokenIn.decimals).toString(),
    amountOutMinimum: '0', // Will be set after getting quote
    hookData: '0x',
  }
}

/**
 * Calculates minimum output amount considering slippage
 */
export function calculateMinimumAmountOut(
  amountOut: bigint,
  slippageBps: number
): bigint {
  if (slippageBps < 0 || slippageBps > 10000) {
    throw new Error('Slippage must be between 0 and 10000 bps')
  }
  
  return (amountOut * BigInt(10000 - slippageBps)) / BigInt(10000)
}

/**
 * Calculates price impact percentage
 */
export function calculatePriceImpact(
  amountIn: bigint,
  amountOut: bigint,
  tokenIn: Token,
  tokenOut: Token,
  expectedRate?: number
): number {
  if (!expectedRate) return 0
  
  const actualRate = Number(formatUnits(amountOut, tokenOut.decimals)) / 
                    Number(formatUnits(amountIn, tokenIn.decimals))
  
  return Math.abs((actualRate - expectedRate) / expectedRate) * 100
}

/**
 * Formats token amount for display
 */
export function formatTokenAmount(
  amount: bigint,
  token: Token,
  precision: number = 6
): string {
  const formatted = formatUnits(amount, token.decimals)
  const num = parseFloat(formatted)
  
  if (num === 0) return '0'
  if (num < 0.000001) return '< 0.000001'
  
  return num.toFixed(precision).replace(/\.?0+$/, '')
}

/**
 * Validates token addresses
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

/**
 * Creates deadline timestamp (20 minutes from now)
 */
export function createDeadline(minutesFromNow: number = 20): bigint {
  return BigInt(Math.floor(Date.now() / 1000) + (minutesFromNow * 60))
}

/**
 * Checks if token is native ETH
 */
export function isNativeETH(token: Token): boolean {
  return token.address === '0x0000000000000000000000000000000000000000'
}

/**
 * Gets token sort order for pool key
 */
export function getTokenOrder(tokenA: Token, tokenB: Token): [Token, Token] {
  return tokenA.address.toLowerCase() < tokenB.address.toLowerCase() 
    ? [tokenA, tokenB] 
    : [tokenB, tokenA]
}

/**
 * Validates swap parameters
 */
export function validateSwapParams(params: QuoteParams): string | null {
  const { tokenIn, tokenOut, amountIn, fee, slippageBps } = params

  if (!isValidAddress(tokenIn.address)) {
    return 'Invalid input token address'
  }

  if (!isValidAddress(tokenOut.address)) {
    return 'Invalid output token address'
  }

  if (tokenIn.address.toLowerCase() === tokenOut.address.toLowerCase()) {
    return 'Input and output tokens cannot be the same'
  }

  if (!amountIn || parseFloat(amountIn) <= 0) {
    return 'Amount must be greater than 0'
  }

  if (!(Object.values(FEE_TIERS) as number[]).includes(fee)) {
    return 'Invalid fee tier'
  }

  if (slippageBps !== undefined && (slippageBps < 0 || slippageBps > 10000)) {
    return 'Slippage must be between 0 and 10000 bps'
  }

  return null
}
