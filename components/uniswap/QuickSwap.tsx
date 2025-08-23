// components/uniswap/QuickSwap.tsx
'use client'

import React, { useState } from 'react'
import { useUniswapV4, ETH_TOKEN, USDC_TOKEN, FEE_TIERS } from '@/lib/uniswap'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ArrowRight, Zap } from 'lucide-react'

interface QuickSwapProps {
  className?: string
}

export function QuickSwap({ className }: QuickSwapProps) {
  const [amount, setAmount] = useState('0.1')
  
  const {
    quote,
    isQuoting,
    error,
    isConnected,
    getQuote,
    resetState,
  } = useUniswapV4()

  const handleQuote = async () => {
    if (!amount || parseFloat(amount) <= 0) return

    resetState()
    await getQuote({
      tokenIn: ETH_TOKEN,
      tokenOut: USDC_TOKEN,
      amountIn: amount,
      fee: FEE_TIERS.LOW,
      slippageBps: 50,
    })
  }

  if (!isConnected) return null

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-500" />
          Quick Swap Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.1"
            className="flex-1"
          />
          <span className="text-sm font-medium text-muted-foreground">ETH</span>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1 text-right">
            <span className="text-sm font-medium">
              {quote ? quote.amountOutFormatted : '0.00'} USDC
            </span>
          </div>
        </div>

        <Button
          onClick={handleQuote}
          disabled={isQuoting || !amount || parseFloat(amount) <= 0}
          size="sm"
          className="w-full"
        >
          {isQuoting ? (
            <>
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              Getting Quote...
            </>
          ) : (
            'Get Quote'
          )}
        </Button>

        {quote && (
          <div className="text-xs text-muted-foreground">
            Rate: 1 ETH = {(parseFloat(quote.amountOutFormatted) / parseFloat(amount)).toFixed(2)} USDC
          </div>
        )}

        {error && (
          <div className="text-xs text-destructive">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
