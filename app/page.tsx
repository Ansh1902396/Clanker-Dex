"use client"

import { useState, useEffect } from "react"
import DashboardPageLayout from "@/components/dashboard/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import BracketsIcon from "@/components/icons/brackets"
import { X, ArrowUpDown } from "lucide-react"
import type { Token } from "@/components/dashboard/token-list"

interface DashboardOverviewProps {
  selectedToken?: Token | null
}

export default function DashboardOverview({ selectedToken }: DashboardOverviewProps) {
  const [showTradeModal, setShowTradeModal] = useState(false)
  const [currentToken, setCurrentToken] = useState(selectedToken?.symbol || "STK")
  const [sellAmount, setSellAmount] = useState("")
  const [buyAmount, setBuyAmount] = useState("")
  const [isSwapped, setIsSwapped] = useState(false)

  useEffect(() => {
    console.log("[v0] Main page: selectedToken prop received:", selectedToken?.symbol || "null")
    if (selectedToken) {
      console.log("[v0] Main page: Setting currentToken to:", selectedToken.symbol)
      console.log("[v0] Main page: Opening trade modal")
      setCurrentToken(selectedToken.symbol)
      setShowTradeModal(true)
    }
  }, [selectedToken])

  useEffect(() => {
    console.log("[v0] Main page: currentToken changed to:", currentToken)
  }, [currentToken])

  useEffect(() => {
    console.log("[v0] Main page: showTradeModal changed to:", showTradeModal)
  }, [showTradeModal])

  const ethBalance = 2.5
  const stkBalance = 1000000
  const exchangeRate = 0.0012 // 1 STK = 0.0012 ETH

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

  const currentSellToken = isSwapped ? currentToken : "ETH"
  const currentBuyToken = isSwapped ? "ETH" : currentToken
  const currentSellBalance = isSwapped ? stkBalance : ethBalance
  const currentBuyBalance = isSwapped ? ethBalance : stkBalance

  const tokenData = selectedToken || {
    symbol: "STK",
    price: "$1,234.56",
    change: "+12.5%",
    name: "STK Token",
  }

  return (
    <DashboardPageLayout
      header={{
        title: "Trading Interface",
        description: "Trade tokens with advanced charts",
        icon: BracketsIcon,
      }}
    >
      {/* Main Trading Chart Area */}
      <div className="mb-6">
        <Card className="h-[600px] bg-background/50 border-accent/20">
          <CardContent className="p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-3xl font-display text-primary">{currentToken}/USD</h2>
                <Badge variant="secondary" className="bg-green-500/20 text-green-400 text-lg px-3 py-1">
                  {tokenData.price}
                </Badge>
                <span className={`text-lg ${tokenData.change?.startsWith("+") ? "text-green-400" : "text-red-400"}`}>
                  {tokenData.change}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="text-sm bg-transparent">
                  1s
                </Button>
                <Button variant="outline" size="sm" className="text-sm bg-transparent">
                  1m
                </Button>
                <Button variant="outline" size="sm" className="bg-accent text-sm">
                  5m
                </Button>
                <Button variant="outline" size="sm" className="text-sm bg-transparent">
                  15m
                </Button>
                <Button variant="outline" size="sm" className="text-sm bg-transparent">
                  1h
                </Button>
                <Button variant="outline" size="sm" className="text-sm bg-transparent">
                  4h
                </Button>
                <Button variant="outline" size="sm" className="text-sm bg-transparent">
                  1D
                </Button>
              </div>
            </div>

            {/* Chart Placeholder */}
            <div className="h-full bg-background/30 rounded-lg border border-accent/20 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl font-display mb-4 text-accent">📈</div>
                <p className="text-muted-foreground text-xl">Trading Chart</p>
                <p className="text-lg text-muted-foreground/60">Real-time price data for {currentToken}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trade Button */}
      <div className="flex justify-center">
        <Button
          onClick={() => setShowTradeModal(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-xl font-display"
        >
          Trade {currentToken}
        </Button>
      </div>

      {/* Trade Modal */}
      {showTradeModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="w-full max-w-md mx-4 bg-background border-accent/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="font-display text-xl">Trade ${currentToken}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowTradeModal(false)}>
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
                disabled={!sellAmount || Number(sellAmount) <= 0}
              >
                {isSwapped ? "Sell" : "Buy"} {currentBuyToken}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardPageLayout>
  )
}
