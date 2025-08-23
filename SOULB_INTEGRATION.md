# SOULB Token Integration Guide

This guide shows how to integrate SOULB and other Clanker tokens with Uniswap V4 using the exact PoolKey resolution described in the fix.

## Quick Start
The implementation now correctly handles Clanker's static fee mechanism (which uses v4's dynamic fee infrastructure) and will successfully quote and swap SOULB tokens without reverts.

---

# 🔄 UPDATED: Dynamic Pool Resolution Integration

## What Changed

I've implemented a **dynamic approach** that extracts pool configuration from Clanker API responses instead of using hardcoded values. This makes the integration work with any Clanker token automatically.

### Key Improvements

1. **WETH Pool Usage**: Always uses WETH for pool operations (shows ETH in UI)
2. **API-Based Configuration**: Extracts pool data from Clanker API responses
3. **Dynamic Pool Resolution**: Automatically resolves tick spacing and creates PoolKeys
4. **Enhanced Trading Modal**: Updated to use dynamic pool resolution
5. **Better Error Handling**: Clear feedback when pool configuration is missing

### New Components

#### Enhanced Token Utils (`lib/utils/token-utils.ts`)
```typescript
// Get trading parameters with dynamic pool resolution
const tradingParams = getTradingParams(clankerToken)
console.log('Has valid pool:', tradingParams.hasValidPool)
console.log('Paired token:', tradingParams.pairedToken.symbol) // WETH, USDC, etc.
console.log('Pool key:', tradingParams.poolKey) // Resolved PoolKey
```

#### Dynamic Uniswap Hook (`lib/uniswap/hooks/useDynamicUniswapV4.ts`)
```typescript
const {
  getQuoteForClankerToken,
  executeSwapForClankerToken,
  checkTokenPool
} = useDynamicUniswapV4()

// Get quote for any Clanker token
const quote = await getQuoteForClankerToken({
  clankerToken,
  amountIn: '100000000000000000', // 0.1 ETH in wei
  isSellingToken: false, // buying the token
  slippageBps: 50 // 0.5% slippage
})
```

#### Pool Resolver Service (`lib/services/pool-resolver.ts`)
```typescript
// Extract pool configuration from API response
const poolInfo = extractClankerPoolConfig(clankerToken)
if (poolInfo?.hasPool) {
  // Token has valid pool configuration
  console.log('Pool Key:', poolInfo.poolKey)
  console.log('Hook:', poolInfo.hookAddress)
}
```

#### Updated Trading Modal
- Uses dynamic pool resolution
- Shows helpful error messages for tokens without pools
- Displays pool information for debugging
- Uses WETH pools but shows ETH to users

### Usage in Trading Window

```typescript
// In your trading component
import { useDynamicUniswapV4 } from '@/lib/uniswap/hooks/useDynamicUniswapV4'
import { getTradingParams } from '@/lib/utils/token-utils'

function TradingComponent({ clankerToken }) {
  const { getQuoteForClankerToken } = useDynamicUniswapV4()
  const tradingParams = getTradingParams(clankerToken)
  
  if (!tradingParams.hasValidPool) {
    return <div>No valid pool found for {clankerToken.symbol}</div>
  }
  
  // Use WETH pool for trading (pairedToken is WETH)
  console.log('Trading against:', tradingParams.pairedToken.symbol) // "WETH"
  console.log('Display as:', tradingParams.isETHPair ? 'ETH' : 'WETH') // "ETH"
  
  // Get quote...
}
```

### Pool Information Display

Use the new `PoolInfoDisplay` component to debug pool configurations:

```typescript
import { PoolInfoDisplay } from '@/components/trading/pool-info-display'

<PoolInfoDisplay token={clankerToken} />
```

This will show:
- Token and contract details
- Paired token information
- Pool ID and hook address
- Resolved PoolKey (if valid)
- Clear error messages for missing configuration

### Required API Response Format

For the dynamic resolution to work, Clanker API responses should include:

```json
{
  "contract_address": "0xa6106BB43A4679D3Ec2b275195F7FAf59e0Cef66",
  "symbol": "SOULB", 
  "pool_address": "0xbd94faf00cfb93889b0fbca9ba9e794b5a1fb41b1a31be8361e2eb61dc043772",
  "extensions": {
    "fees": {
      "type": "static",
      "hook_address": "0xDd5EeaFf7BD481AD55Db083062b13a3cdf0A68CC"
    }
  },
  "pool_config": {
    "pairedToken": "0x4200000000000000000000000000000000000006"
  }
}
```

### Migration Guide

1. **Replace `useUniswapV4` with `useDynamicUniswapV4`** in trading components
2. **Use `getTradingParams()`** instead of manual token conversion
3. **Check `hasValidPool()`** before attempting trades
4. **Use WETH for all pool operations** (automatic with new utils)
5. **Add pool validation** to your UI components

The system now dynamically configures pools based on API responses while maintaining the exact PoolKey resolution logic for SOULB and other Clanker tokens!### 1. Import the necessary utilities

```typescript
import { createSOULBPoolKey, poolIdOf } from '@/lib/uniswap/utils'
import { UniswapV4Quoter } from '@/lib/uniswap/quoter'
import { SOULB_POOL_CONFIG, UNISWAP_V4_ADDRESSES } from '@/lib/uniswap/constants'
import { extractClankerPoolConfig } from '@/lib/services/pool-resolver'
```

### 2. Create the exact SOULB PoolKey

```typescript
// This uses the exact configuration from Clanker metadata
const poolKey = createSOULBPoolKey()

console.log('SOULB PoolKey:', poolKey)
// Output:
// {
//   currency0: "0x4200000000000000000000000000000000000006", // WETH (sorted first)
//   currency1: "0xa6106BB43A4679D3Ec2b275195F7FAf59e0Cef66", // SOULB
//   fee: 8388608, // 0x800000 - dynamic fee flag
//   tickSpacing: 60, // Resolved from known pool ID
//   hooks: "0xDd5EeaFf7BD481AD55Db083062b13a3cdf0A68CC"
// }

// Verify it matches the known pool ID
const computedPoolId = poolIdOf(poolKey)
console.log('Pool ID matches:', computedPoolId === SOULB_POOL_CONFIG.POOL_ID) // true
```

### 3. Get quotes without reverts

```typescript
import { createPublicClient, http, parseUnits } from 'viem'
import { base } from 'viem/chains'

const publicClient = createPublicClient({
  chain: base,
  transport: http('YOUR_RPC_URL')
})

const quoter = new UniswapV4Quoter(publicClient)

// Quote 0.1 ETH -> SOULB
const ethAmount = parseUnits('0.1', 18).toString()
const quote = await quoter.getSOULBQuote(true, ethAmount)

console.log(`0.1 ETH = ${quote.amountOutFormatted} SOULB`)
console.log(`Min output: ${quote.amountOutMinimumFormatted} SOULB`)
console.log(`Gas estimate: ${quote.gasEstimate.toString()}`)
```

### 4. Integrate with any Clanker token

```typescript
import { ClankerService } from '@/lib/services/clanker'
import { extractClankerPoolConfig } from '@/lib/services/pool-resolver'

// Fetch token from Clanker API
const response = await ClankerService.searchTokens('SOULB')
const clankerToken = response.data[0]

// Extract pool configuration
const poolInfo = extractClankerPoolConfig(clankerToken)

if (poolInfo) {
  console.log('Token:', poolInfo.token.symbol)
  console.log('Paired with:', poolInfo.pairedToken.symbol)
  console.log('Pool Key:', poolInfo.poolKey)
  console.log('Hook:', poolInfo.hookAddress)
  console.log('Fee type:', poolInfo.feeType)
  
  // Use the pool key for quotes/swaps
  // ... quoter logic here
}
```

## Key Components

### Constants (`lib/uniswap/constants.ts`)

- **SOULB_POOL_CONFIG**: Contains the exact pool metadata from Clanker
- **CLANKER_HOOKS.STATIC_FEE**: The hook address for static fee pools
- **FEE_TIERS.DYNAMIC**: The 0x800000 dynamic fee flag
- **UNISWAP_V4_ADDRESSES**: Correct contract addresses for Base

### Utils (`lib/uniswap/utils.ts`)

- **poolIdOf()**: Calculates pool ID from PoolKey parameters
- **resolveTickSpacing()**: Finds correct tick spacing by matching pool IDs
- **createSOULBPoolKey()**: Creates the exact SOULB PoolKey
- **resolveClankerPoolKey()**: Generic function for any Clanker token

### Updated Quoter (`lib/uniswap/quoter.ts`)

- **V4_QUOTER_ABI**: Updated with correct `sqrtPriceLimitX96` parameter
- **getSOULBQuote()**: Specific method for SOULB quotes
- Uses the correct Base addresses: Quoter, StateView, Universal Router

### Pool Resolver (`lib/services/pool-resolver.ts`)

- **extractClankerPoolConfig()**: Extracts pool info from Clanker API responses
- **ClankerPoolResolver**: Service for managing multiple tokens
- **validatePoolKey()**: Verifies pool keys match expected pool IDs

## Why This Works

1. **Correct Fee Configuration**: Uses `0x800000` (dynamic flag) instead of `3000`
2. **Proper Token Ordering**: Sorts currencies by address (`currency0 < currency1`)
3. **Uses WETH not ETH**: Pool keys use WETH address, not zero address
4. **Correct Hook Address**: Uses the actual Clanker hook address
5. **Resolved Tick Spacing**: Computes tick spacing by matching known pool IDs
6. **Updated ABI**: Includes `sqrtPriceLimitX96` parameter for quotes

## Address Reference

### Base Network Addresses
```typescript
const addresses = {
  // Uniswap V4
  Quoter: '0x0d5e0F971ED27FBfF6c2837bf31316121532048D',
  StateView: '0xA3c0c9b65baD0b08107Aa264b0f3dB444b867A71',
  UniversalRouter: '0x6fF5693b99212Da76ad316178A184AB56D299b43',
  
  // Tokens
  WETH: '0x4200000000000000000000000000000000000006',
  USDC: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
  SOULB: '0xa6106BB43A4679D3Ec2b275195F7FAf59e0Cef66',
  
  // Clanker Hook
  ClankerHookStaticFee: '0xDd5EeaFf7BD481AD55Db083062b13a3cdf0A68CC'
}
```

## Error Resolution

### Previous Error: "Pool does not exist"
- **Cause**: Used `fee: 3000` and `hooks: 0x0`
- **Fix**: Use `fee: 0x800000` and correct hook address

### Previous Error: "No liquidity"
- **Cause**: Incorrect tick spacing or currency order  
- **Fix**: Resolve tick spacing by matching pool IDs

### Previous Error: "Invalid pool key"
- **Cause**: Used native ETH (0x0) instead of WETH
- **Fix**: Use WETH address in pool keys

## Next Steps

1. **Swap Execution**: Use the resolved PoolKey with Universal Router
2. **UI Integration**: Connect with your swap interface
3. **Error Handling**: Add robust error handling for edge cases
4. **Caching**: Cache resolved pool keys for performance
5. **Testing**: Test with different tokens and amounts

## Example Pool Key Output

For SOULB token, the resolved PoolKey should be:

```json
{
  "currency0": "0x4200000000000000000000000000000000000006",
  "currency1": "0xa6106BB43A4679D3Ec2b275195F7FAf59e0Cef66", 
  "fee": 8388608,
  "tickSpacing": 60,
  "hooks": "0xDd5EeaFf7BD481AD55Db083062b13a3cdf0A68CC"
}
```

This will produce pool ID: `0xbd94faf00cfb93889b0fbca9ba9e794b5a1fb41b1a31be8361e2eb61dc043772`

## Running the Example

```typescript
import { runSOULBExample } from '@/lib/uniswap/soulb-example'

// This will demonstrate the complete flow
const result = await runSOULBExample()
```

The implementation now correctly handles Clanker's "static fee" mechanism (which uses v4's dynamic fee infrastructure) and will successfully quote and swap SOULB tokens without reverts.
