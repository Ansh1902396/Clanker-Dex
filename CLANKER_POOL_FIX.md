# Fixed Clanker Pool Configuration Issues

## Key Problem Identified

The quote failures were caused by confusing **hook-level fee settings** with **Uniswap V4 pool fee tiers**.

### What was wrong:
- Using `clankerFee: 10000` from token metadata as `PoolKey.fee = 10000` 
- This doesn't match actual deployed pools, which use standard Uniswap fee tiers (500, 3000, 10000) or dynamic flag (0x800000)

## Fixes Applied

### 1. Corrected Pool Fee Logic (`lib/services/pool-resolver.ts`)

**Before:**
```typescript
// WRONG: Using hook fee settings as pool fee tiers
const clankerFee = token.extensions?.fees?.clankerFee
if (clankerFee) fee = clankerFee // This was wrong!
```

**After:**
```typescript
// CORRECT: Use standard Uniswap fee tiers based on hook type
if (feeType === 'static') {
  fee = FEE_TIERS.MEDIUM // 3000 (0.3%) - most common for static hooks
} else if (feeType === 'dynamic') {
  fee = FEE_TIERS.DYNAMIC // 0x800000 - dynamic fee flag
}
```

### 2. Smart Pool Configuration Detection (`lib/uniswap/quoter.ts`)

Added systematic testing of most common Clanker pool configurations in order:

```typescript
const poolConfigurations = [
  // Static hook combinations (most common)
  { 
    fee: 3000, 
    tickSpacing: 60, 
    hooks: '0xDd5EeaFf7BD481AD55Db083062b13a3cdf0A68CC',
    description: 'Static hook with 0.3% fee'
  },
  { 
    fee: 500, 
    tickSpacing: 10, 
    hooks: '0xDd5EeaFf7BD481AD55Db083062b13a3cdf0A68CC',
    description: 'Static hook with 0.05% fee'
  },
  // Dynamic hook combinations
  { 
    fee: 0x800000, 
    tickSpacing: 10, 
    hooks: '0x34a45c6B61876d739400Bd71228CbcbD4F53E8cC',
    description: 'Dynamic hook with tick spacing 10'
  },
  { 
    fee: 0x800000, 
    tickSpacing: 60, 
    hooks: '0x34a45c6B61876d739400Bd71228CbcbD4F53E8cC',
    description: 'Dynamic hook with tick spacing 60'
  }
]
```

### 3. Improved Tick Spacing Logic (`lib/uniswap/utils.ts`)

**Proper fee tier to tick spacing mapping:**
- `fee: 500` (0.05%) → `tickSpacing: 10`
- `fee: 3000` (0.3%) → `tickSpacing: 60`  
- `fee: 10000` (1%) → `tickSpacing: 200`
- `fee: 0x800000` (dynamic) → `tickSpacing: 60` (common) or `10` (fallback)

## Expected Results

The quoter will now:

1. **Try the correct pool fee tiers** instead of hook fee settings
2. **Test configurations systematically** starting with most common patterns
3. **Provide detailed logging** showing which configuration works
4. **Handle both static and dynamic hooks** properly

This should resolve the "contract function reverted" errors and successfully get quotes for Clanker tokens.

## Debug Output

You'll now see logs like:
```
Testing: Static hook with 0.3% fee (fee: 3000, tickSpacing: 60)
✅ Found working pool configuration: Static hook with 0.3% fee
```

This makes it clear which pool configuration actually works for each token.
