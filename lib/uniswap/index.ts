// lib/uniswap/index.ts

// Core classes
export { UniswapV4Quoter } from './quoter'
export { UniswapV4Swapper } from './swapper'

// Hooks
export { useUniswapV4 } from './hooks/useUniswapV4'

// Types
export type {
  PoolKey,
  SwapParams,
  QuoteParams,
  SwapQuote,
  SwapResult,
  TokenBalance,
  SwapState,
} from './types'
export { SwapType } from './types'

// Constants
export {
  BASE_CHAIN_ID,
  ETH_TOKEN,
  USDC_TOKEN,
  WETH_TOKEN,
  UNISWAP_V4_ADDRESSES,
  FEE_TIERS,
  TICK_SPACING,
  DEFAULT_SLIPPAGE_BPS,
  MAX_SLIPPAGE_BPS,
} from './constants'

// Utils
export {
  createPoolKey,
  isToken0,
  createSwapParams,
  calculateMinimumAmountOut,
  calculatePriceImpact,
  formatTokenAmount,
  isValidAddress,
  createDeadline,
  isNativeETH,
  getTokenOrder,
  validateSwapParams,
} from './utils'

// ABIs
export {
  V4_QUOTER_ABI,
  UNIVERSAL_ROUTER_ABI,
  ERC20_ABI,
  PERMIT2_ABI,
} from './abis'
