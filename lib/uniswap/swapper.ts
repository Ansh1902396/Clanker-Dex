// lib/uniswap/swapper.ts
import { WalletClient, PublicClient, Address, formatUnits } from 'viem'
import { Token } from '@uniswap/sdk-core'
import { UNIVERSAL_ROUTER_ABI, ERC20_ABI } from './abis'
import { UNISWAP_V4_ADDRESSES, DEFAULT_SLIPPAGE_BPS } from './constants'
import { QuoteParams, SwapResult, SwapQuote } from './types'
import { 
  createSwapParams, 
  isNativeETH, 
  createDeadline,
  validateSwapParams 
} from './utils'
import { UniswapV4Quoter } from './quoter'

/**
 * Service for executing swaps on Uniswap V4
 */
export class UniswapV4Swapper {
  private quoter: UniswapV4Quoter

  constructor(
    private publicClient: PublicClient,
    private walletClient: WalletClient
  ) {
    this.quoter = new UniswapV4Quoter(publicClient)
  }

  /**
   * Execute an exact input swap
   */
  async swapExactInput(
    params: QuoteParams,
    userAddress: Address
  ): Promise<SwapResult> {
    try {
      // Validate parameters
      const validation = validateSwapParams(params)
      if (validation) {
        throw new Error(validation)
      }

      const { tokenIn, tokenOut } = params

      // Get quote first
      const quote = await this.quoter.getQuoteExactInput(params)
      console.log(`Quote: ${params.amountIn} ${tokenIn.symbol} -> ${quote.amountOutFormatted} ${tokenOut.symbol}`)

      // Handle token approvals if not native ETH
      if (!isNativeETH(tokenIn)) {
        const swapParams = createSwapParams(params)
        await this.ensureTokenApproval(tokenIn, userAddress, BigInt(swapParams.amountIn))
      }

      // For now, return a placeholder - actual swap implementation would be more complex
      // This is where you would integrate with the V4 SDK and Universal Router
      throw new Error('Swap execution not yet implemented - use quote functionality for now')

    } catch (error: any) {
      console.error('Swap failed:', error)
      return {
        hash: '0x' as `0x${string}`,
        error: error.message || 'Swap failed'
      }
    }
  }

  /**
   * Get a quote for a swap
   */
  async getQuote(params: QuoteParams): Promise<SwapQuote> {
    return this.quoter.getQuoteExactInput(params)
  }

  /**
   * Check token balance
   */
  async getTokenBalance(token: Token, userAddress: Address): Promise<bigint> {
    if (isNativeETH(token)) {
      return await this.publicClient.getBalance({ address: userAddress })
    }

    const balance = await this.publicClient.readContract({
      address: token.address as Address,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [userAddress],
    })

    return balance as bigint
  }

  /**
   * Ensure token approval for Universal Router
   */
  private async ensureTokenApproval(
    token: Token, 
    userAddress: Address, 
    amount: bigint
  ): Promise<void> {
    // Check current allowance
    const allowance = await this.publicClient.readContract({
      address: token.address as Address,
      abi: ERC20_ABI,
      functionName: 'allowance',
      args: [userAddress, UNISWAP_V4_ADDRESSES.UniversalRouter],
    }) as bigint

    if (allowance < amount) {
      console.log(`Approving ${formatUnits(amount, token.decimals)} ${token.symbol}...`)
      
      // Note: In a real implementation, you'd handle the approval transaction here
      console.log('Approval would be sent here')
    }
  }

  /**
   * Estimate gas for a swap
   */
  async estimateSwapGas(
    params: QuoteParams,
    userAddress: Address
  ): Promise<bigint> {
    try {
      const quote = await this.quoter.getQuoteExactInput(params)
      return quote.gasEstimate
    } catch (error) {
      console.error('Gas estimation failed:', error)
      return BigInt(300000) // Fallback gas estimate
    }
  }
}
