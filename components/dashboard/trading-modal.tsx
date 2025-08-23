"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { X, ArrowUpDown } from "lucide-react"
import type { Token } from "@/components/dashboard/token-list"
import type { TradeParams, TokenBalance, TradeResult } from "@/types/trading"

interface TradingModalProps {
  isOpen: boolean
  onClose: () => void
  selectedToken?: Token | null
  onTrade?: (tradeParams: TradeParams) => Promise<TradeResult>
  balances?: TokenBalance[]
  isLoading?: boolean
}

export default function TradingModal({ 
  isOpen, 
  onClose, 
  selectedToken, 
  onTrade,
  balances = [],
  isLoading = false 
}: TradingModalProps) {
  const [currentToken, setCurrentToken] = useState(selectedToken?.symbol || "STK")
  const [sellAmount, setSellAmount] = useState("")
  const [buyAmount, setBuyAmount] = useState("")
  const [isSwapped, setIsSwapped] = useState(false)

  useEffect(() => {
    if (selectedToken) {
      console.log("[Trading Modal] Setting currentToken to:", selectedToken.symbol)
      setCurrentToken(selectedToken.symbol)
    }
  }, [selectedToken])

  useEffect(() => {
    console.log("[Trading Modal] currentToken changed to:", currentToken)
  }, [currentToken])

  // Get balances from props or use mock data as fallback
  const getTokenBalance = (symbol: string): number => {
    const balance = balances.find(b => b.symbol === symbol)
    if (balance) return balance.balance
    
    // Mock balances as fallback
    switch (symbol) {
      case "ETH": return 2.5
      case "STK": return 1000000
      default: return 0
    }
  }

  const ethBalance = getTokenBalance("ETH")
  const stkBalance = getTokenBalance(selectedToken?.symbol || "STK")
  const exchangeRate = 0.0012 // 1 STK = 0.0012 ETH - TODO: Get from price feed

  const handleSwapDirection = () => {
    setIsSwapped(!isSwapped)
    setSellAmount("")
    setBuyAmount("")
  }

  const handleSellAmountChange = (value: string) => {
    setSellAmount(value)
    if (value && !isNaN(Number(value))) {
      if (isSwapped) {
        setBuyAmount((Number(value) * exchangeRate).toFixed(6))
      } else {
        setBuyAmount((Number(value) / exchangeRate).toFixed(0))
      }
    } else {
      setBuyAmount("")
    }
  }

  const handlePercentage = (percentage: number, isSell: boolean) => {
    const balance = isSell ? (isSwapped ? stkBalance : ethBalance) : isSwapped ? ethBalance : stkBalance
    const amount = ((balance * percentage) / 100).toString()

    if (isSell) {
      handleSellAmountChange(amount)
    }
  }

  const handleTrade = async () => {
    const tradeParams: TradeParams = {
      sellToken: isSwapped ? currentToken : "ETH",
      buyToken: isSwapped ? "ETH" : currentToken,
      sellAmount,
      buyAmount,
      isSwapped
    }

    console.log("[Trading Modal] Executing trade:", tradeParams)
    
    try {
      if (onTrade) {
        const result = await onTrade(tradeParams)
        if (result.success) {
          console.log("[Trading Modal] Trade successful:", result)
          // Close modal on successful trade
          onClose()
        } else {
          console.error("[Trading Modal] Trade failed:", result.error)
          // TODO: Show error message to user
        }
      } else {
        // Default behavior if no onTrade handler is provided
        console.log("[Trading Modal] No trade handler provided - using default behavior")
        // TODO: Implement default trading logic here
        // - Connect to wallet
        // - Execute swap transaction
        // - Handle success/error states
        // - Update balances
        onClose()
      }
    } catch (error) {
      console.error("[Trading Modal] Trade failed:", error)
      // TODO: Show error message to user
      // You could add error state here and display it in the UI
    }
  }

  const currentSellToken = isSwapped ? currentToken : "ETH"
  const currentBuyToken = isSwapped ? "ETH" : currentToken
  const currentSellBalance = isSwapped ? stkBalance : ethBalance
  const currentBuyBalance = isSwapped ? ethBalance : stkBalance

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4 bg-background border-accent/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="font-display text-xl">Trade ${currentToken}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sell Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-base text-muted-foreground">Sell</span>
              <span className="text-base text-muted-foreground">
                Balance: {currentSellBalance.toLocaleString()} {currentSellToken}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="0.0"
                value={sellAmount}
                onChange={(e) => handleSellAmountChange(e.target.value)}
                className="flex-1 text-3xl font-mono bg-background/50"
              />
              <Badge variant="secondary" className="px-3 py-2 text-base">
                {currentSellToken}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-sm bg-transparent"
                onClick={() => handlePercentage(10, true)}
              >
                10%
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-sm bg-transparent"
                onClick={() => handlePercentage(25, true)}
              >
                25%
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-sm bg-transparent"
                onClick={() => handlePercentage(50, true)}
              >
                50%
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-sm bg-transparent"
                onClick={() => handlePercentage(100, true)}
              >
                Max
              </Button>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSwapDirection}
              className="w-10 h-10 rounded-full bg-accent/20 hover:bg-accent/30 flex items-center justify-center"
            >
              <ArrowUpDown className="h-5 w-5 text-accent" />
            </Button>
          </div>

          {/* Buy Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-base text-muted-foreground">Buy</span>
              <span className="text-base text-muted-foreground">
                Balance: {currentBuyBalance.toLocaleString()} {currentBuyToken}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="0.0"
                value={buyAmount}
                readOnly
                className="flex-1 text-3xl font-mono bg-background/50"
              />
              <Badge variant="secondary" className="px-3 py-2 text-base">
                {currentBuyToken}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-sm bg-transparent" disabled>
                10%
              </Button>
              <Button variant="outline" size="sm" className="text-sm bg-transparent" disabled>
                25%
              </Button>
              <Button variant="outline" size="sm" className="text-sm bg-transparent" disabled>
                50%
              </Button>
              <Button variant="outline" size="sm" className="text-sm bg-transparent" disabled>
                Max
              </Button>
            </div>
          </div>

          <Button
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 font-display text-lg"
            disabled={!sellAmount || Number(sellAmount) <= 0 || isLoading}
            onClick={handleTrade}
          >
            {isLoading 
              ? "Processing..." 
              : `${isSwapped ? "Sell" : "Buy"} ${currentBuyToken}`
            }
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
