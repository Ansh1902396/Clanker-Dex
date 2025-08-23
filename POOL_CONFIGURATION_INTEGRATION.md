# Clanker Token Pool Configuration Integration

## Overview

The Clanker API now provides comprehensive pool configuration data for each token, including:

- `pool_config`: Contains paired token address and tick information
- `extensions.fees`: Contains hook address and fee configuration  
- Different fee types: `static` vs `dynamic`

## Key Changes Made

### 1. Updated Token Schema (`lib/schemas/clanker.ts`)

Added support for the `devBuy` extension field:

```typescript
devBuy: z.object({
  amount: z.string(),
  amountEth: z.string(),
  recipient: z.string(),
}).optional(),
```

### 2. Enhanced Pool Resolution (`lib/services/pool-resolver.ts`)

**Key improvements:**
- Validates all required pool configuration fields
- Properly handles static vs dynamic fee types
- Maps API fee values to standard Uniswap fee tiers
- Creates proper Token objects for unknown paired tokens
- Uses the new `createClankerPoolKey` function with correct parameters

**New validation logic:**
```typescript
// Required fields for valid pool
- token.pool_address
- token.extensions?.fees?.hook_address  
- token.pool_config?.pairedToken
```

**Fee type handling:**
- **Static fees**: Maps `clankerFee` to appropriate Uniswap fee tiers (LOW/MEDIUM/HIGH/DYNAMIC)
- **Dynamic fees**: Uses `FEE_TIERS.DYNAMIC` with optional `baseFee` override

### 3. Updated Token Utilities (`lib/utils/token-utils.ts`)

Enhanced `hasValidPool()` function to check all required fields:

```typescript
export function hasValidPool(clankerToken: ClankerToken): boolean {
  return !!(
    clankerToken.pool_address && 
    clankerToken.extensions?.fees?.hook_address &&
    clankerToken.pool_config?.pairedToken
  )
}
```

### 4. Improved Trading Modal (`components/trading/trading-modal.tsx`)

**Enhanced error handling:**
- More specific validation error messages
- Detailed pool configuration display in error states
- Shows fee type-specific information (static vs dynamic)

**New pool info display:**
```typescript
// Shows comprehensive pool configuration details:
- Pool address
- Hook address  
- Fee type and values
- Paired token information
- Validation status
```

### 5. Enhanced Dynamic Uniswap Hook (`lib/uniswap/hooks/useDynamicUniswapV4.ts`)

**Better error reporting:**
- Identifies specific missing configuration fields
- More descriptive error messages for debugging

### 6. Updated Token Fetching (`hooks/use-tokens.ts`)

**Added validation logging:**
- Validates pool configuration for each fetched token
- Logs warnings for tokens with missing configuration
- Helps identify API data quality issues

## Example Token Data Structure

Based on the provided API response, tokens now include:

```typescript
{
  "pool_config": {
    "pairedToken": "0x4200000000000000000000000000000000000006", // WETH
    "tickIfToken0IsNewToken": -230400
  },
  "extensions": {
    "fees": {
      "type": "static", // or "dynamic"
      "clankerFee": 10000,
      "pairedFee": 10000,
      "hook_address": "0xDd5EeaFf7BD481AD55Db083062b13a3cdf0A68CC"
    },
    // For dynamic fees:
    "fees": {
      "type": "dynamic",
      "baseFee": 10000,
      "maxFee": 50000,
      "hook_address": "0x34a45c6B61876d739400Bd71228CbcbD4F53E8cC"
    }
  }
}
```

## Fee Type Handling

### Static Fees
- Uses fixed fee values from `clankerFee`/`pairedFee`
- Maps to standard Uniswap fee tiers
- Hook address: Usually `0xDd5EeaFf7BD481AD55Db083062b13a3cdf0A68CC`

### Dynamic Fees  
- Uses variable fee structure with `baseFee` and `maxFee`
- Defaults to `FEE_TIERS.DYNAMIC`
- Hook address: Varies by implementation

## Testing

Created `lib/test-pool-resolution.ts` with sample tokens to validate:
- Pool configuration extraction
- Trading parameter generation
- Fee type handling
- Error scenarios

## Benefits

1. **Accurate Pool Resolution**: Uses actual pool configuration from API
2. **Better Error Handling**: Specific validation and error messages
3. **Fee Flexibility**: Supports both static and dynamic fee structures
4. **Improved UX**: Better feedback when trading is not available
5. **Debugging**: Comprehensive logging for troubleshooting

## Usage in Trading

The trading modal now:
1. Validates complete pool configuration
2. Uses correct hook addresses and fee structures
3. Provides detailed error information
4. Shows pool configuration details for debugging

This ensures that trading only works with properly configured tokens and provides clear feedback when configuration is missing or invalid.
