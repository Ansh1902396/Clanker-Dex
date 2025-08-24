"use client"

import { useState, useEffect } from "react"
import DashboardPageLayout from "@/components/dashboard/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import BracketsIcon from "@/components/icons/brackets"
import TradingModal from "@/components/dashboard/trading-modal"
import { useTrading } from "@/hooks/use-trading"
import { useClankerQuote } from "@/hooks/use-clanker-quote"
import { useToken } from "@/contexts/token-context"
import Image from "next/image"
import type { Token } from "@/components/dashboard/token-list"

interface DashboardOverviewProps {
  selectedToken?: Token | null
}

export default function DashboardOverview({ selectedToken: propSelectedToken }: DashboardOverviewProps) {
  const [showTradeModal, setShowTradeModal] = useState(false)
  const [currentToken, setCurrentToken] = useState("STK")
  const [displayedToken, setDisplayedToken] = useState<Token | null>(null)
  
  // Use token context - this is the primary source of truth
  const { selectedToken } = useToken()
  
  console.log("[v0] DashboardOverview RENDER - context selectedToken:", selectedToken?.symbol || "null")
  console.log("[v0] DashboardOverview RENDER - prop selectedToken:", propSelectedToken?.symbol || "null")
  console.log("[v0] DashboardOverview RENDER - displayedToken:", displayedToken?.symbol || "null")
  
  // Use the trading hook for managing trading state and logic
  const { isLoading, error, balances, executeTrade, refreshBalances } = useTrading()

  // Get quote for the selected token
  const { data: quoteData, loading: quoteLoading, getQuote } = useClankerQuote()

  useEffect(() => {
    console.log("[v0] Main page: Context selectedToken changed:", selectedToken?.symbol || "null")
    if (selectedToken) {
      console.log("[v0] Main page: Setting currentToken to:", selectedToken.symbol)
      console.log("[v0] Main page: Setting displayedToken to:", selectedToken)
      setCurrentToken(selectedToken.symbol)
      setDisplayedToken(selectedToken)
      
      // Get quote for the selected token
      if (selectedToken.contractAddress) {
        console.log("[v0] Main page: Getting quote for:", selectedToken.contractAddress)
        getQuoteForToken(selectedToken.contractAddress)
      }
    }
  }, [selectedToken])

  // Add debugging for displayedToken state
  useEffect(() => {
    console.log("[v0] Main page: displayedToken changed to:", displayedToken)
  }, [displayedToken])

  const getQuoteForToken = async (tokenAddress: string) => {
    try {
      await getQuote({
        chainId: 8453, // Base chain
        sellToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // ETH
        buyToken: tokenAddress,
        sellAmount: "1000000000000000000", // 1 ETH in wei
        taker: "0xcFE743EA353d4d3D2c20C41C7d878B2cbA66DA0a",
      })
    } catch (err) {
      console.error("Failed to get quote:", err)
    }
  }

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

  // Use SOULB token data as fallback
  const soulbToken: Token = {
    id: "soulb-default",
    symbol: "STK",
    price: "$0.0012",
    change: "+15.2%",
    name: "SOULB",
    contractAddress: "0xa6106BB43A4679D3Ec2b275195F7FAf59e0Cef66",
    image: "/placeholder.svg",
    creator: "SOULB Team",
    description: "SOULB token - A revolutionary token on Base chain",
    marketCap: "$1.2M",
    volume: "$50K"
  }

  const tokenData = displayedToken || soulbToken

  // Add debugging for tokenData changes
  useEffect(() => {
    console.log("[v0] Main page: tokenData is now:", tokenData)
  }, [tokenData])

  // Format quote data for display - calculate actual price per token
  const formatQuotePrice = () => {
    if (quoteLoading) return "Loading..."
    if (!quoteData?.buyAmount) return "N/A"
    
    try {
      const buyAmountWei = parseFloat(quoteData.buyAmount)
      const sellAmountWei = 1e18 // 1 ETH in wei
      const pricePerToken = sellAmountWei / buyAmountWei // ETH per token
      const ethPrice = 2500 // Approximate ETH price in USD
      const usdPrice = pricePerToken * ethPrice
      
      if (usdPrice < 0.000001) {
        return `$${usdPrice.toExponential(3)}`
      } else if (usdPrice < 0.01) {
        return `$${usdPrice.toFixed(8)}`
      } else {
        return `$${usdPrice.toFixed(6)}`
      }
    } catch {
      return "N/A"
    }
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
                {/* Token Image and Info */}
                {displayedToken && (
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Image
                        src={tokenData.image || "/placeholder.svg"}
                        alt={tokenData.name}
                        width={40}
                        height={40}
                        className="rounded-full ring-2 ring-accent/20"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg"
                        }}
                      />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500/80 rounded-full border border-background"></div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground/80">{tokenData.name}</p>
                      <p className="text-xs text-muted-foreground/60">by {tokenData.creator || "Unknown"}</p>
                    </div>
                  </div>
                )}
                
                <h2 className="text-3xl font-display text-primary">{currentToken}/USD</h2>
                <Badge variant="secondary" className="bg-green-500/20 text-green-400 text-lg px-3 py-1">
                  {tokenData.price}
                </Badge>
                <span className={`text-lg ${tokenData.change?.startsWith("+") ? "text-green-400" : "text-red-400"}`}>
                  {tokenData.change || "0.00%"}
                </span>
                
                {/* Live Quote Display */}
                <div className="text-right">
                  <div className="text-sm text-muted-foreground/60">
                    Live Quote: {formatQuotePrice()}
                  </div>
                </div>
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
                {quoteData && (
                  <div className="mt-4 p-4 bg-background/40 rounded-lg border border-accent/15 max-w-md mx-auto">
                    <p className="text-sm text-muted-foreground mb-2">Live Quote (1 ETH → {currentToken})</p>
                    <p className="text-lg font-mono text-foreground">
                      {quoteData.buyAmount ? 
                        `${(parseFloat(quoteData.buyAmount) / Math.pow(10, 18)).toLocaleString(undefined, {maximumFractionDigits: 2})} ${currentToken}` : 
                        "No quote available"
                      }
                    </p>
                    <p className="text-sm text-muted-foreground/70 mt-1">
                      Price per token: {formatQuotePrice()}
                    </p>
                    {quoteData.gas && (
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        Est. Gas: {parseInt(quoteData.gas).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trade Actions */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
          <Button
            onClick={() => setShowTradeModal(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-xl font-display shadow-lg hover:shadow-xl transition-all duration-300"
            disabled={quoteLoading}
          >
            {quoteLoading ? "Loading Quote..." : `Trade ${currentToken}`}
          </Button>
          
          {tokenData && tokenData.contractAddress && tokenData.contractAddress !== "0xa6106BB43A4679D3Ec2b275195F7FAf59e0Cef66" && (
            <Button
              variant="outline"
              onClick={() => getQuoteForToken(tokenData.contractAddress)}
              className="px-6 py-3 text-lg border-accent/30 hover:border-accent/50 hover:bg-accent/5"
              disabled={quoteLoading}
            >
              {quoteLoading ? "Getting Quote..." : "Refresh Quote"}
            </Button>
          )}
        </div>
        
        {/* Quick Trade Info */}
        {tokenData && quoteData && (
          <div className="mt-6 max-w-2xl mx-auto">
            <Card className="bg-background/30 border-accent/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-display text-center">Quick Trade Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-background/40 rounded-lg border border-accent/10">
                    <p className="text-xs text-muted-foreground/70 uppercase tracking-wide mb-1">You Pay</p>
                    <p className="text-lg font-semibold">1 ETH</p>
                    <p className="text-xs text-muted-foreground/60">≈ $2,500</p>
                  </div>
                  <div className="p-3 bg-background/40 rounded-lg border border-accent/10">
                    <p className="text-xs text-muted-foreground/70 uppercase tracking-wide mb-1">You Get</p>
                    <p className="text-lg font-semibold">
                      {quoteData.buyAmount ? 
                        `${(parseFloat(quoteData.buyAmount) / Math.pow(10, 18)).toLocaleString(undefined, {maximumFractionDigits: 2})}` : 
                        "0"
                      } {currentToken}
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                      Price: {formatQuotePrice()} per token
                    </p>
                  </div>
                </div>
                {quoteData.gas && (
                  <div className="mt-3 text-center text-xs text-muted-foreground/60">
                    Estimated Gas: {parseInt(quoteData.gas).toLocaleString()} units
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Trading Modal */}
      <TradingModal
        isOpen={showTradeModal}
        onClose={() => setShowTradeModal(false)}
        onTrade={executeTrade}
        isLoading={isLoading}
      />
    </DashboardPageLayout>
  )
}
