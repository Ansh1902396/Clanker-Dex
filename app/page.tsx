"use client"

import { useState, useEffect } from "react"
import DashboardPageLayout from "@/components/dashboard/layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import BracketsIcon from "@/components/icons/brackets"
import TradingModal from "@/components/dashboard/trading-modal"
import { useTrading } from "@/hooks/use-trading"
import type { Token } from "@/components/dashboard/token-list"

interface DashboardOverviewProps {
  selectedToken?: Token | null
}

export default function DashboardOverview({ selectedToken }: DashboardOverviewProps) {
  const [showTradeModal, setShowTradeModal] = useState(false)
  const [currentToken, setCurrentToken] = useState(selectedToken?.symbol || "STK")
  
  // Use the trading hook for managing trading state and logic
  const { isLoading, error, balances, executeTrade, refreshBalances } = useTrading()

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

  // Refresh balances when component mounts
  useEffect(() => {
    refreshBalances()
  }, [refreshBalances])

  // Use SOULB token data
  const soulbToken = {
    symbol: "STK",
    price: "$0.0012",
    change: "+15.2%",
    name: "SOULB",
    address: "0xa6106BB43A4679D3Ec2b275195F7FAf59e0Cef66"
  }

  const tokenData = selectedToken || soulbToken

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
      <div className="flex justify-center mb-6">
        <Button
          onClick={() => setShowTradeModal(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-xl font-display"
        >
          Trade {currentToken}
        </Button>
      </div>

      {/* Trading Modal */}
      <TradingModal
        isOpen={showTradeModal}
        onClose={() => setShowTradeModal(false)}
        selectedToken={selectedToken}
        onTrade={executeTrade}
        isLoading={isLoading}
      />
    </DashboardPageLayout>
  )
}
