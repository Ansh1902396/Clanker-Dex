// components/uniswap/SwapWidget.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useUniswapV4, ETH_TOKEN, USDC_TOKEN, FEE_TIERS } from '@/lib/uniswap'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowRight, Loader2, RefreshCw, DollarSign } from 'lucide-react'
import { ConnectButton } from '@rainbow-me/rainbowkit'

interface SwapWidgetProps {
  className?: string
  defaultAmountIn?: string
}

export function SwapWidget({ className, defaultAmountIn = '0.1' }: SwapWidgetProps) {
  const [amountIn, setAmountIn] = useState(defaultAmountIn)
  const [ethBalance, setEthBalance] = useState<string | null>(null)
  
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

  // Get ETH balance when connected
  useEffect(() => {
    if (isConnected) {
      handleGetBalance()
    }
  }, [isConnected])

  const handleGetQuote = async () => {
    if (!amountIn || parseFloat(amountIn) <= 0) {
      return
    }

    resetState()
    await getQuote({
      tokenIn: ETH_TOKEN,
      tokenOut: USDC_TOKEN,
      amountIn,
      fee: FEE_TIERS.LOW, // 0.05%
      slippageBps: 50, // 0.5%
    })
  }

  const handleSwap = async () => {
    if (!quote) return

    const result = await executeSwap({
      tokenIn: ETH_TOKEN,
      tokenOut: USDC_TOKEN,
      amountIn,
      fee: FEE_TIERS.LOW,
      slippageBps: 50,
    })

    if (result && !result.error) {
      // Refresh balance after successful swap
      setTimeout(handleGetBalance, 2000)
    }
  }

  const handleGetBalance = async () => {
    const balance = await getTokenBalance(ETH_TOKEN)
    setEthBalance(balance)
  }

  const handleAmountChange = (value: string) => {
    setAmountIn(value)
    // Auto-quote on amount change (debounced)
    if (value && parseFloat(value) > 0) {
      const timeoutId = setTimeout(() => {
        handleGetQuote()
      }, 500)
      return () => clearTimeout(timeoutId)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Uniswap V4 Swap
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Swap ETH for USDC on Base network
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-3">
              Connect your wallet to start swapping
            </p>
            <ConnectButton />
          </div>
        ) : (
          <>
            {/* Balance Display */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">ETH Balance:</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {ethBalance ? `${ethBalance} ETH` : 'Loading...'}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleGetBalance}
                  className="h-6 w-6 p-0"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Input Section */}
            <div className="space-y-2">
              <Label htmlFor="amountIn">From</Label>
              <div className="relative">
                <Input
                  id="amountIn"
                  type="number"
                  step="0.001"
                  value={amountIn}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0.1"
                  className="pr-16"
                />
                <Badge variant="secondary" className="absolute right-2 top-1/2 -translate-y-1/2">
                  ETH
                </Badge>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>

            {/* Output Section */}
            <div className="space-y-2">
              <Label>To</Label>
              <div className="relative">
                <Input
                  value={quote ? quote.amountOutFormatted : '0'}
                  readOnly
                  className="pr-20"
                  placeholder="0.00"
                />
                <Badge variant="secondary" className="absolute right-2 top-1/2 -translate-y-1/2">
                  USDC
                </Badge>
              </div>
            </div>

            {/* Quote Button */}
            <Button
              onClick={handleGetQuote}
              disabled={isQuoting || !amountIn || parseFloat(amountIn) <= 0}
              variant="outline"
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

            {/* Quote Details */}
            {quote && (
              <div className="p-3 bg-muted/50 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rate:</span>
                  <span>
                    1 ETH = {(parseFloat(quote.amountOutFormatted) / parseFloat(amountIn)).toFixed(2)} USDC
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Min received:</span>
                  <span>{quote.amountOutMinimumFormatted} USDC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fee tier:</span>
                  <span>0.05%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Slippage:</span>
                  <span>0.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gas estimate:</span>
                  <span>{quote.gasEstimate.toString()}</span>
                </div>
              </div>
            )}

            {/* Swap Button */}
            {quote && (
              <Button
                onClick={handleSwap}
                disabled={isSwapping}
                className="w-full"
                size="lg"
              >
                {isSwapping ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Swapping...
                  </>
                ) : (
                  `Swap ${amountIn} ETH for ${quote.amountOutFormatted} USDC`
                )}
              </Button>
            )}

            {/* Error Display */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="text-destructive text-sm font-medium">
                  {error}
                </div>
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

            {/* Disclaimer */}
            <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted/30 rounded-lg">
              <div>⚠️ Swap execution is currently disabled for safety</div>
              <div>✅ Quote functionality is fully working</div>
              <div>🔗 Powered by Uniswap V4 on Base</div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
