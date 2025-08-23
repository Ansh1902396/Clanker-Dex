# Uniswap V4 Integration

This directory contains a complete Uniswap V4 integration for Base network, designed to work with Rainbow Wallet and wagmi.

## Features

- ✅ **Quote Generation**: Get swap quotes using Uniswap V4 Quoter
- ✅ **Token Balance Checking**: Check ETH and ERC20 token balances
- ✅ **Pool Validation**: Check if pools exist for token pairs
- ⚠️ **Swap Execution**: Framework ready (implementation pending for safety)
- ✅ **React Hooks**: Easy-to-use React hooks for components
- ✅ **TypeScript Support**: Full type safety and IntelliSense
- ✅ **Error Handling**: Comprehensive error handling and validation

## Quick Start

### 1. Import the hook

```tsx
import { useUniswapV4, ETH_TOKEN, USDC_TOKEN, FEE_TIERS } from '@/lib/uniswap'
```

### 2. Use in your component

```tsx
function SwapComponent() {
  const {
    quote,
    isQuoting,
    getQuote,
    error
  } = useUniswapV4()

  const handleGetQuote = async () => {
    await getQuote({
      tokenIn: ETH_TOKEN,
      tokenOut: USDC_TOKEN,
      amountIn: '0.1',
      fee: FEE_TIERS.LOW, // 0.05%
      slippageBps: 50, // 0.5%
    })
  }

  return (
    <div>
      <button onClick={handleGetQuote} disabled={isQuoting}>
        {isQuoting ? 'Getting Quote...' : 'Get Quote'}
      </button>
      
      {quote && (
        <div>
          Output: {quote.amountOutFormatted} USDC
        </div>
      )}
      
      {error && <div>Error: {error}</div>}
    </div>
  )
}
```

## Files Structure

```
lib/uniswap/
├── index.ts              # Main exports
├── constants.ts          # Token addresses, fee tiers, etc.
├── types.ts             # TypeScript type definitions
├── abis.ts              # Contract ABIs
├── utils.ts             # Utility functions
├── quoter.ts            # Quote generation service
├── swapper.ts           # Swap execution service (limited)
├── hooks/
│   └── useUniswapV4.ts  # React hook
├── examples/
│   └── SwapExample.tsx  # Example component
└── README.md            # This file
```

## Available Tokens

### Base Network Tokens
- **ETH**: Native Ethereum (`0x0000...0000`)
- **USDC**: USD Coin (`0x833589fCD6eDb6E08f4c7c32D4f71b54Bda02913`)
- **WETH**: Wrapped Ethereum (`0x4200000000000000000000000000000000000006`)

### Fee Tiers
- `FEE_TIERS.LOWEST`: 100 (0.01%)
- `FEE_TIERS.LOW`: 500 (0.05%)
- `FEE_TIERS.MEDIUM`: 3000 (0.30%)
- `FEE_TIERS.HIGH`: 10000 (1.00%)

## API Reference

### `useUniswapV4()` Hook

#### State
- `isQuoting: boolean` - Whether a quote is being fetched
- `isSwapping: boolean` - Whether a swap is being executed
- `quote: SwapQuote | null` - Current quote data
- `error: string | null` - Error message if any
- `isConnected: boolean` - Whether wallet is connected

#### Methods

##### `getQuote(params: QuoteParams): Promise<SwapQuote | null>`
Get a quote for a token swap.

```tsx
const quote = await getQuote({
  tokenIn: ETH_TOKEN,
  tokenOut: USDC_TOKEN,
  amountIn: '0.1',
  fee: FEE_TIERS.LOW,
  slippageBps: 50 // Optional, defaults to 50 (0.5%)
})
```

##### `executeSwap(params: QuoteParams): Promise<SwapResult | null>`
Execute a token swap (currently returns error for safety).

##### `getTokenBalance(token: Token): Promise<string | null>`
Get formatted token balance for connected wallet.

```tsx
const balance = await getTokenBalance(ETH_TOKEN)
console.log(`Balance: ${balance} ETH`)
```

##### `checkPoolExists(tokenA: Token, tokenB: Token, fee: number): Promise<boolean>`
Check if a pool exists for the given token pair and fee tier.

##### `resetState(): void`
Reset all state to initial values.

## Types

### `QuoteParams`
```tsx
interface QuoteParams {
  tokenIn: Token          // Input token
  tokenOut: Token         // Output token
  amountIn: string        // Input amount (human readable)
  fee: number            // Fee tier (100, 500, 3000, 10000)
  slippageBps?: number   // Slippage in basis points (default: 50)
}
```

### `SwapQuote`
```tsx
interface SwapQuote {
  amountOut: bigint                    // Raw output amount
  amountOutFormatted: string           // Formatted output amount
  amountOutMinimum: bigint             // Minimum output (with slippage)
  amountOutMinimumFormatted: string    // Formatted minimum output
  gasEstimate: bigint                  // Estimated gas cost
  priceImpact: number                  // Price impact percentage
}
```

## Example Usage

See `examples/SwapExample.tsx` for a complete working example.

## Contract Addresses (Base Mainnet)

- **Pool Manager**: `0x498581ff718922c3f8e6a244956af099b2652b2b`
- **Quoter**: `0x0d5E0F971eD27FBFf6c2837Bf31316121532048d`
- **Universal Router**: `0x6fF5693b99212DA76Ad316178a184ab56D299B43`
- **Permit2**: `0x000000000022D473030F116dDEE9F6B43aC78BA3`

## Safety Notes

⚠️ **Important**: Swap execution is currently disabled for safety. This implementation:
- ✅ Provides accurate quotes
- ✅ Validates parameters
- ✅ Checks token balances
- ⚠️ Does not execute actual swaps yet

The quote functionality is fully working and safe to use. Actual swap execution would require additional testing and security considerations.

## Dependencies

Make sure these packages are installed:
```bash
pnpm add @uniswap/sdk-core @uniswap/v4-sdk @uniswap/universal-router-sdk
```

This integration is built for:
- **viem**: 2.x
- **wagmi**: ^2.16.4
- **@rainbow-me/rainbowkit**: ^2.2.8
- **Base network**: Chain ID 8453
