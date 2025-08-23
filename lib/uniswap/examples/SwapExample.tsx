// lib/uniswap/examples/SwapExample.tsx
'use client'

import React, { useState } from 'react'
import { useUniswapV4, ETH_TOKEN, USDC_TOKEN, FEE_TIERS } from '../index'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

/**
 * Example component showing how to use the Uniswap V4 integration
 */
export function SwapExample() {
  const [amountIn, setAmountIn] = useState('0.1')
  const [tokenBalance, setTokenBalance] = useState<string | null>(null)
  
  const {
    quote,
    isQuoting,
    isSwapping,
    error,
    isConnected,
    getQuote,
    executeSwap,
    getTokenBalance,
    resetState,
  } = useUniswapV4()

  const handleGetQuote = async () => {
    if (!amountIn || parseFloat(amountIn) <= 0) {
      alert('Please enter a valid amount')
      return
    }

    await getQuote({
      tokenIn: ETH_TOKEN,
      tokenOut: USDC_TOKEN,
      amountIn,
      fee: FEE_TIERS.LOW, // 0.05%
      slippageBps: 50, // 0.5%
    })
  }

  const handleSwap = async () => {
    if (!quote) {
      alert('Please get a quote first')
      return
    }

    const result = await executeSwap({
      tokenIn: ETH_TOKEN,
      tokenOut: USDC_TOKEN,
      amountIn,
      fee: FEE_TIERS.LOW,
      slippageBps: 50,
    })

    if (result && !result.error) {
      alert(`Swap initiated! Transaction: ${result.hash}`)
    }
  }

  const handleGetBalance = async () => {
    const balance = await getTokenBalance(ETH_TOKEN)
    setTokenBalance(balance)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Uniswap V4 Swap Example</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected && (
          <div className="text-center text-sm text-gray-500">
            Please connect your wallet to use this feature
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Amount ETH</label>
          <Input
            type="number"
            step="0.01"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
            placeholder="0.1"
            disabled={!isConnected}
          />
        </div>

        <div className="space-y-2">
          <Button
            onClick={handleGetQuote}
            disabled={!isConnected || isQuoting || !amountIn}
            className="w-full"
          >
            {isQuoting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Getting Quote...
              </>
            ) : (
              'Get Quote'
            )}
          </Button>
        </div>

        {quote && (
          <div className="p-3 bg-gray-50 rounded-lg space-y-1">
            <div className="text-sm">
              <strong>Quote:</strong> {amountIn} ETH → {quote.amountOutFormatted} USDC
            </div>
            <div className="text-sm text-gray-600">
              Min received: {quote.amountOutMinimumFormatted} USDC
            </div>
            <div className="text-sm text-gray-600">
              Gas estimate: {quote.gasEstimate.toString()}
            </div>
          </div>
        )}

        {quote && (
          <Button
            onClick={handleSwap}
            disabled={!isConnected || isSwapping}
            className="w-full"
            variant="default"
          >
            {isSwapping ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Swapping...
              </>
            ) : (
              'Execute Swap'
            )}
          </Button>
        )}

        <div className="space-y-2">
          <Button
            onClick={handleGetBalance}
            disabled={!isConnected}
            variant="outline"
            className="w-full"
          >
            Get ETH Balance
          </Button>
          {tokenBalance && (
            <div className="text-sm text-center">
              Balance: {tokenBalance} ETH
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-800 text-sm">{error}</div>
            <Button
              onClick={resetState}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Clear Error
            </Button>
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <div>• This example swaps ETH → USDC on Base</div>
          <div>• Fee tier: 0.05% (500)</div>
          <div>• Slippage: 0.5% (50 bps)</div>
          <div>• Current swap execution is disabled for safety</div>
        </div>
      </CardContent>
    </Card>
  )
}
