// lib/uniswap/constants.ts
import { Token } from '@uniswap/sdk-core'

export const BASE_CHAIN_ID = 8453

// Native ETH in v4 poolKey is represented by the zero address
export const ETH_TOKEN = new Token(
  BASE_CHAIN_ID,
  '0x0000000000000000000000000000000000000000',
  18,
  'ETH',
  'Ether'
)

// USDC on Base (native)
export const USDC_TOKEN = new Token(
  BASE_CHAIN_ID,
  '0x833589fCD6eDb6E08f4c7c32D4f71b54Bda02913',
  6,
  'USDC',
  'USDC'
)

// WETH on Base
export const WETH_TOKEN = new Token(
  BASE_CHAIN_ID,
  '0x4200000000000000000000000000000000000006',
  18,
  'WETH',
  'Wrapped Ether'
)

// Uniswap v4 addresses on Base
export const UNISWAP_V4_ADDRESSES = {
  PoolManager: '0x498581ff718922c3f8e6a244956af099b2652b2b',
  PositionDescriptor: '0x25d093633990dc94bedeed76c8f3cdaa75f3e7d5',
  PositionManager: '0x7c5f5a4bbd8fd63184577525326123b519429bdc',
  Quoter: '0x0d5E0F971eD27FBFf6c2837Bf31316121532048d',
  StateView: '0xa3c0c9b65bad0b08107aa264b0f3db444b867a71',
  UniversalRouter: '0x6fF5693b99212DA76Ad316178a184ab56D299B43',
  Permit2: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
} as const

// Common fee tiers
export const FEE_TIERS = {
  LOWEST: 100,    // 0.01%
  LOW: 500,       // 0.05% 
  MEDIUM: 3000,   // 0.30%
  HIGH: 10000,    // 1.00%
} as const

// Tick spacing for different fee tiers
export const TICK_SPACING = {
  [FEE_TIERS.LOWEST]: 1,
  [FEE_TIERS.LOW]: 10,
  [FEE_TIERS.MEDIUM]: 60,
  [FEE_TIERS.HIGH]: 200,
} as const

export const DEFAULT_SLIPPAGE_BPS = 50 // 0.50%
export const MAX_SLIPPAGE_BPS = 5000 // 50%
