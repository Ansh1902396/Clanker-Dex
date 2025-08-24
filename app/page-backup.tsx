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
import Image from "next/image"
import type { Token } from "@/components/dashboard/token-list"

interface DashboardOverviewProps {
  selectedToken?: Token | null
}

export default function DashboardOverview({ selectedToken }: DashboardOverviewProps) {
  const [showTradeModal, setShowTradeModal] = useState(false)
  const [currentToken, setCurrentToken] = useState<string>(selectedToken?.symbol || "")
  const [displayedToken, setDisplayedToken] = useState<Token | null>(selectedToken || null)
  
  // Use the trading hook for managing trading state and logic
  const { isLoading, error, balances, executeTrade, refreshBalances } = useTrading()

  // Get quote for the selected token
  const { data: quoteData, loading: quoteLoading, getQuote } = useClankerQuote()

  useEffect(() => {
    console.log("[v0] Main page: selectedToken prop received:", selectedToken?.symbol || "null")
    if (selectedToken) {
      console.log("[v0] Main page: Setting currentToken to:", selectedToken.symbol)
      setCurrentToken(selectedToken.symbol)
      setDisplayedToken(selectedToken)
      
      // Get quote for the selected token
      if (selectedToken.contractAddress) {
        getQuoteForToken(selectedToken.contractAddress)
      }
    } else {
      // Reset when no token is selected
      setCurrentToken("")
      setDisplayedToken(null)
    }
  }, [selectedToken])

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

  // Format quote data for display
  const formatQuotePrice = () => {
    if (quoteLoading) return "Loading..."
    if (!quoteData?.buyAmount || !displayedToken) return "N/A"
    
    try {
      const buyAmount = parseFloat(quoteData.buyAmount)
      const sellAmount = 1e18 // 1 ETH in wei
      const price = sellAmount / buyAmount // Price per token in ETH
      return `${price.toFixed(8)} ETH`
    } catch {
      return "N/A"
    }
  }

  return (
    <DashboardPageLayout
      header={{
        title: displayedToken ? `${displayedToken.symbol} Trading` : "Trading Interface",
        description: displayedToken ? `Trade ${displayedToken.name} tokens` : "Select a token from the sidebar to start trading",
        icon: BracketsIcon,
      }}
    >
      {/* Token Information Header - Only show when token is selected */}
      {displayedToken ? (
        <div className="mb-6">
          <Card className="bg-background/40 border-accent/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-6 mb-4">
                <div className="relative">
                  <Image
                    src={displayedToken.image || "/placeholder.svg"}
                    alt={displayedToken.name}
                    width={60}
                    height={60}
                    className="rounded-full ring-2 ring-accent/20"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg"
                    }}
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500/80 rounded-full border-2 border-background"></div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-display font-bold text-foreground">{displayedToken.symbol}</h1>
                    <Badge
                      variant="secondary"
                      className={`text-sm px-3 py-1 font-medium ${
                        displayedToken.change.startsWith("+") 
                          ? "bg-green-500/15 text-green-400 border-green-500/20" 
                          : "bg-red-500/15 text-red-400 border-red-500/20"
                      }`}
                    >
                      {displayedToken.change}
                    </Badge>
                  </div>
                  <p className="text-lg text-muted-foreground/80 mb-1">{displayedToken.name}</p>
                  <p className="text-sm text-muted-foreground/60">by {displayedToken.creator}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-mono font-bold text-foreground mb-1">
                    {displayedToken.price}
                  </div>
                  <div className="text-sm text-muted-foreground/60">
                    Quote Price: {formatQuotePrice()}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-background/30 rounded-lg p-4 border border-accent/10">
                  <p className="text-xs text-muted-foreground/70 mb-1 uppercase tracking-wide">Market Cap</p>
                  <p className="text-lg font-semibold text-foreground/90">{displayedToken.marketCap}</p>
                </div>
                <div className="bg-background/30 rounded-lg p-4 border border-accent/10">
                  <p className="text-xs text-muted-foreground/70 mb-1 uppercase tracking-wide">24h Volume</p>
                  <p className="text-lg font-semibold text-foreground/90">{displayedToken.volume}</p>
                </div>
                <div className="bg-background/30 rounded-lg p-4 border border-accent/10">
                  <p className="text-xs text-muted-foreground/70 mb-1 uppercase tracking-wide">Contract</p>
                  <p className="text-sm font-mono text-foreground/80 truncate">{displayedToken.contractAddress}</p>
                </div>
              </div>
              
              {displayedToken.description && (
                <div className="mt-4 p-4 bg-background/30 rounded-lg border border-accent/10">
                  <p className="text-xs text-muted-foreground/70 mb-2 uppercase tracking-wide">Description</p>
                  <p className="text-sm text-foreground/80 leading-relaxed">{displayedToken.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Default state when no token is selected */
        <div className="mb-6">
          <Card className="bg-background/40 border-accent/20 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="text-6xl font-display mb-4 text-accent/50">🪙</div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">Select a Token to Trade</h2>
              <p className="text-lg text-muted-foreground/80">
                Choose a token from the Clanker Tokens list on the right to view detailed information and start trading.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
                    height={60}
                    className="rounded-full ring-2 ring-accent/20"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg"
                    }}
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500/80 rounded-full border-2 border-background"></div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-display font-bold text-foreground">{displayedToken.symbol}</h1>
                    <Badge
                      variant="secondary"
                      className={`text-sm px-3 py-1 font-medium ${
                        displayedToken.change.startsWith("+") 
                          ? "bg-green-500/15 text-green-400 border-green-500/20" 
                          : "bg-red-500/15 text-red-400 border-red-500/20"
                      }`}
                    >
                      {displayedToken.change}
                    </Badge>
                  </div>
                  <p className="text-lg text-muted-foreground/80 mb-1">{displayedToken.name}</p>
                  <p className="text-sm text-muted-foreground/60">by {displayedToken.creator}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-mono font-bold text-foreground mb-1">
                    {displayedToken.price}
                  </div>
                  <div className="text-sm text-muted-foreground/60">
                    Live Quote: {formatQuotePrice()}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-background/30 rounded-lg p-4 border border-accent/10">
                  <p className="text-xs text-muted-foreground/70 mb-1 uppercase tracking-wide">Market Cap</p>
                  <p className="text-lg font-semibold text-foreground/90">{displayedToken.marketCap}</p>
                </div>
                <div className="bg-background/30 rounded-lg p-4 border border-accent/10">
                  <p className="text-xs text-muted-foreground/70 mb-1 uppercase tracking-wide">24h Volume</p>
                  <p className="text-lg font-semibold text-foreground/90">{displayedToken.volume}</p>
                </div>
                <div className="bg-background/30 rounded-lg p-4 border border-accent/10">
                  <p className="text-xs text-muted-foreground/70 mb-1 uppercase tracking-wide">Contract</p>
                  <p className="text-sm font-mono text-foreground/80 truncate">{displayedToken.contractAddress}</p>
                </div>
              </div>
              
              {displayedToken.description && (
                <div className="mt-4 p-4 bg-background/30 rounded-lg border border-accent/10">
                  <p className="text-xs text-muted-foreground/70 mb-2 uppercase tracking-wide">Description</p>
                  <p className="text-sm text-foreground/80 leading-relaxed">{displayedToken.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

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
                {quoteData && (
                  <div className="mt-4 p-4 bg-background/40 rounded-lg border border-accent/15 max-w-md mx-auto">
                    <p className="text-sm text-muted-foreground mb-2">Latest Quote (1 ETH)</p>
                    <p className="text-lg font-mono text-foreground">
                      {quoteData.buyAmount ? 
                        `${(parseFloat(quoteData.buyAmount) / Math.pow(10, 18)).toFixed(2)} ${currentToken}` : 
                        "No quote available"
                      }
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
          
          {displayedToken && (
            <Button
              variant="outline"
              onClick={() => getQuoteForToken(displayedToken.contractAddress)}
              className="px-6 py-3 text-lg border-accent/30 hover:border-accent/50 hover:bg-accent/5"
              disabled={quoteLoading}
            >
              {quoteLoading ? "Getting Quote..." : "Refresh Quote"}
            </Button>
          )}
        </div>
        
        {/* Quick Trade Info */}
        {displayedToken && quoteData && (
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
                        `${(parseFloat(quoteData.buyAmount) / Math.pow(10, 18)).toFixed(2)}` : 
                        "0"
                      } {currentToken}
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                      Rate: {formatQuotePrice()} per {currentToken}
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
        selectedToken={displayedToken}
        onTrade={executeTrade}
        isLoading={isLoading}
      />
    </DashboardPageLayout>
  )
}
