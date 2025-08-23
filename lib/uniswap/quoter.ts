// lib/uniswap/quoter.ts
import { PublicClient, formatUnits } from 'viem'
import { Token } from '@uniswap/sdk-core'
import { V4_QUOTER_ABI } from './abis'
import { UNISWAP_V4_ADDRESSES, DEFAULT_SLIPPAGE_BPS } from './constants'
import { QuoteParams, SwapQuote } from './types'
import { 
  createSwapParams, 
  calculateMinimumAmountOut, 
  formatTokenAmount,
  validateSwapParams 
} from './utils'

/**
 * Service for getting quotes from Uniswap V4
 */
export class UniswapV4Quoter {
  constructor(private publicClient: PublicClient) {}

  /**
   * Get a quote for an exact input swap
   */
  async getQuoteExactInput(params: QuoteParams): Promise<SwapQuote> {
    // Validate parameters
    const validation = validateSwapParams(params)
    if (validation) {
      throw new Error(validation)
    }

    const { tokenIn, tokenOut, slippageBps = DEFAULT_SLIPPAGE_BPS } = params
    const swapParams = createSwapParams(params)

    try {
      // Call the quoter contract
      const { result } = await this.publicClient.simulateContract({
        address: UNISWAP_V4_ADDRESSES.Quoter,
        abi: V4_QUOTER_ABI,
        functionName: 'quoteExactInputSingle',
        args: [{
          poolKey: {
            currency0: swapParams.poolKey.currency0,
            currency1: swapParams.poolKey.currency1,
            fee: swapParams.poolKey.fee,
            tickSpacing: swapParams.poolKey.tickSpacing,
            hooks: swapParams.poolKey.hooks,
          },
          zeroForOne: swapParams.zeroForOne,
          exactAmount: BigInt(swapParams.amountIn),
          hookData: swapParams.hookData,
        }],
      })

      const [amountOut, gasEstimate] = result as [bigint, bigint]

      if (!amountOut || amountOut === BigInt(0)) {
        throw new Error('No liquidity available for this swap')
      }

      // Calculate minimum amount out considering slippage
      const amountOutMinimum = calculateMinimumAmountOut(amountOut, slippageBps)

      return {
        amountOut,
        amountOutFormatted: formatTokenAmount(amountOut, tokenOut),
        amountOutMinimum,
        amountOutMinimumFormatted: formatTokenAmount(amountOutMinimum, tokenOut),
        gasEstimate,
        priceImpact: 0, // TODO: Calculate price impact if needed
      }
    } catch (error: any) {
      console.error('Quote error:', error)
      throw new Error(`Failed to get quote: ${error.message}`)
    }
  }

  /**
   * Get a quote for an exact output swap
   */
  async getQuoteExactOutput(params: QuoteParams): Promise<SwapQuote> {
    // Validate parameters
    const validation = validateSwapParams(params)
    if (validation) {
      throw new Error(validation)
    }

    const { tokenIn, tokenOut, slippageBps = DEFAULT_SLIPPAGE_BPS } = params
    const swapParams = createSwapParams(params)

    try {
      // Call the quoter contract
      const { result } = await this.publicClient.simulateContract({
        address: UNISWAP_V4_ADDRESSES.Quoter,
        abi: V4_QUOTER_ABI,
        functionName: 'quoteExactOutputSingle',
        args: [{
          poolKey: {
            currency0: swapParams.poolKey.currency0,
            currency1: swapParams.poolKey.currency1,
            fee: swapParams.poolKey.fee,
            tickSpacing: swapParams.poolKey.tickSpacing,
            hooks: swapParams.poolKey.hooks,
          },
          zeroForOne: swapParams.zeroForOne,
          exactAmount: BigInt(swapParams.amountIn), // This is actually amountOut for exact output
          hookData: swapParams.hookData,
        }],
      })

      const [amountIn, gasEstimate] = result as [bigint, bigint]

      if (!amountIn || amountIn === BigInt(0)) {
        throw new Error('No liquidity available for this swap')
      }

      // For exact output, we add slippage to the input amount
      const amountInMaximum = (amountIn * BigInt(10000 + slippageBps)) / BigInt(10000)

      return {
        amountOut: BigInt(swapParams.amountIn), // This is the exact amount we want out
        amountOutFormatted: formatTokenAmount(BigInt(swapParams.amountIn), tokenOut),
        amountOutMinimum: amountInMaximum, // For exact output, this represents max input
        amountOutMinimumFormatted: formatTokenAmount(amountInMaximum, tokenIn),
        gasEstimate,
        priceImpact: 0, // TODO: Calculate price impact if needed
      }
    } catch (error: any) {
      console.error('Quote error:', error)
      throw new Error(`Failed to get quote: ${error.message}`)
    }
  }

  /**
   * Check if a pool exists for the given tokens and fee
   */
  async checkPoolExists(tokenA: Token, tokenB: Token, fee: number): Promise<boolean> {
    try {
      await this.getQuoteExactInput({
        tokenIn: tokenA,
        tokenOut: tokenB,
        amountIn: '1', // Small amount to test
        fee,
      })
      return true
    } catch {
      return false
    }
  }
}
