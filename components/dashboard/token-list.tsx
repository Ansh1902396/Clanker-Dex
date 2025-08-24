"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import Image from "next/image"
import { useTokens } from "@/hooks/use-tokens"
import { type Token as ClankerToken } from "@/lib/schemas/clanker"

// Interface for compatibility with existing components
interface Token {
  id: string
  name: string
  symbol: string
  price: string
  change: string
  marketCap: string
  volume: string
  image: string
  creator: string
  description: string
  contractAddress: string
}

// Helper function to format numbers
const formatNumber = (value: number | undefined): string => {
  if (!value) return "N/A"
  
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}k`
  return `$${value.toFixed(2)}`
}

// Helper function to format price
const formatPrice = (value: number | undefined): string => {
  if (!value) return "N/A"
  
  if (value < 0.01) {
    return `$${value.toFixed(8)}`
  }
  return `$${value.toFixed(6)}`
}

// Helper function to format percentage
const formatPercentage = (value: number | undefined): string => {
  if (value === undefined || value === null) return "0.00%"
  
  const sign = value >= 0 ? "+" : ""
  return `${sign}${value.toFixed(2)}%`
}

// Helper function to shorten address
const shortenAddress = (address: string): string => {
  if (!address) return "N/A"
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Convert Clanker token to our Token interface
const convertClankerToken = (clankerToken: ClankerToken): Token => {
  const market = clankerToken.related?.market
  const user = clankerToken.related?.user
  
  return {
    id: clankerToken.id.toString(),
    name: clankerToken.name,
    symbol: clankerToken.symbol,
    price: formatPrice(market?.price),
    change: formatPercentage(market?.priceChangePercent24h || market?.priceChange24h),
    marketCap: formatNumber(market?.marketCap),
    volume: formatNumber(market?.volume24h),
    image: clankerToken.img_url || "/placeholder.svg",
    creator: user?.username ? `@${user.username}` : shortenAddress(clankerToken.msg_sender),
    description: clankerToken.description || "No description available",
    contractAddress: clankerToken.contract_address,
  }
}

interface TokenListProps {
  onTokenSelect?: (token: Token) => void
}

export default function TokenList({ onTokenSelect }: TokenListProps) {
  const [selectedToken, setSelectedToken] = useState<Token | null>(null)
  const [searchInput, setSearchInput] = useState("")
  
  // Use the tokens hook with search functionality
  const { 
    tokens: clankerTokens, 
    loading, 
    error, 
    search, 
    refresh,
    hasMore,
    loadMore 
  } = useTokens({ 
    limit: 10, 
    autoRefresh: true,
    refreshInterval: 30000 
  })

  // Convert clanker tokens to our format
  const tokens = useMemo(() => {
    return clankerTokens.map(convertClankerToken)
  }, [clankerTokens])

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchInput.trim()) {
        search(searchInput.trim())
      } else {
        refresh() // Reset to show all tokens
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [searchInput, search, refresh])

  const handleTokenClick = (token: Token) => {
    console.log("[v0] Token clicked:", token.symbol)
    console.log("[v0] onTokenSelect callback exists:", !!onTokenSelect)

    if (onTokenSelect) {
      console.log("[v0] Calling onTokenSelect with token:", token)
      onTokenSelect(token)
    } else {
      console.log("[v0] No callback, setting local state")
      setSelectedToken(token)
    }
  }

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      loadMore()
    }
  }

  return (
    <Card className="w-full bg-background/40 border-accent/10 shadow-lg backdrop-blur-sm">
      <CardHeader className="pb-4 px-6 pt-6">
        <CardTitle className="font-display text-xl text-foreground/90 mb-4">Clanker Tokens</CardTitle>
        {/* Search Input */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-primary/5 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground/50 group-hover:text-accent/70 group-focus-within:text-accent h-4 w-4 transition-colors duration-200" />
            <Input
              placeholder="Search tokens by name or symbol..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-12 pr-4 py-3.5 bg-gradient-to-r from-background/30 via-background/20 to-background/30 border border-accent/15 hover:border-accent/30 focus:border-accent/60 focus:bg-background/40 transition-all duration-300 rounded-xl text-foreground placeholder:text-muted-foreground/40 shadow-sm hover:shadow-md focus:shadow-lg focus:shadow-accent/10 backdrop-blur-sm"
            />
          </div>
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground/50 hover:text-foreground/80 transition-colors duration-200 p-1 rounded-full hover:bg-background/50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 max-h-[500px] overflow-y-auto px-6 pb-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-accent/20">
        {/* Loading State */}
        {loading && tokens.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center space-y-3">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-accent/30 border-t-accent"></div>
              <p className="text-muted-foreground/70 text-sm">Loading tokens...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-8 px-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
              <p className="text-red-400/90 text-sm mb-3">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refresh}
                className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && !error && tokens.length === 0 && (
          <div className="text-center py-12 px-4">
            <div className="bg-muted/10 border border-muted/20 rounded-lg p-8">
              <p className="text-muted-foreground/70 text-sm">No tokens found</p>
              <p className="text-muted-foreground/50 text-xs mt-1">Try a different search term</p>
            </div>
          </div>
        )}

        {/* Token List */}
        {tokens.map((token) => (
          <div
            key={token.id}
            className="group p-5 rounded-xl bg-gradient-to-r from-background/40 to-background/20 border border-accent/10 hover:border-accent/30 hover:from-background/60 hover:to-background/40 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-accent/5"
            onClick={() => handleTokenClick(token)}
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <Image
                  src={token.image || "/placeholder.svg"}
                  alt={token.name}
                  width={48}
                  height={48}
                  className="rounded-full ring-2 ring-accent/10 group-hover:ring-accent/25 transition-all duration-300"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg"
                  }}
                />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500/80 rounded-full border-2 border-background"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-display text-base font-semibold text-foreground/90 group-hover:text-foreground transition-colors">
                    {token.symbol}
                  </span>
                  <Badge
                    variant="secondary"
                    className={`text-xs px-2 py-1 font-medium ${
                      token.change.startsWith("+") 
                        ? "bg-green-500/15 text-green-400 border-green-500/20" 
                        : "bg-red-500/15 text-red-400 border-red-500/20"
                    }`}
                  >
                    {token.change}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground/80 truncate mb-1 group-hover:text-muted-foreground transition-colors">
                  {token.name}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-mono font-medium text-foreground/80">
                    {token.price}
                  </p>
                  <p className="text-xs text-muted-foreground/60 font-medium">
                    by {token.creator}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Load More Button */}
        {hasMore && (
          <div className="text-center pt-4 border-t border-accent/10">
            <Button
              variant="outline"
              size="default"
              onClick={handleLoadMore}
              disabled={loading}
              className="bg-gradient-to-r from-background/60 to-background/40 border-accent/20 hover:border-accent/40 text-foreground/80 hover:text-foreground px-6 py-3 font-medium transition-all duration-300 hover:shadow-md hover:shadow-accent/10"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-accent/30 border-t-accent mr-2"></div>
                  Loading...
                </>
              ) : (
                "Load More Tokens"
              )}
            </Button>
          </div>
        )}

        {/* Token Info Modal - only show if no onTokenSelect callback */}
        {selectedToken && !onTokenSelect && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-lg z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg mx-4 bg-gradient-to-br from-background/95 to-background/80 border-accent/20 shadow-2xl backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 px-6 pt-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Image
                      src={selectedToken.image || "/placeholder.svg"}
                      alt={selectedToken.name}
                      width={40}
                      height={40}
                      className="rounded-full ring-2 ring-accent/20"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg"
                      }}
                    />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500/80 rounded-full border-2 border-background"></div>
                  </div>
                  <div>
                    <CardTitle className="font-display text-xl text-foreground/90">{selectedToken.symbol}</CardTitle>
                    <p className="text-sm text-muted-foreground/80">{selectedToken.name}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedToken(null)}
                  className="text-muted-foreground hover:text-foreground hover:bg-accent/10"
                >
                  ✕
                </Button>
              </CardHeader>
              <CardContent className="space-y-6 px-6 pb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background/40 rounded-lg p-4 border border-accent/10">
                    <p className="text-xs text-muted-foreground/70 mb-1 uppercase tracking-wide">Price</p>
                    <p className="font-mono text-base font-semibold text-foreground/90">{selectedToken.price}</p>
                  </div>
                  <div className="bg-background/40 rounded-lg p-4 border border-accent/10">
                    <p className="text-xs text-muted-foreground/70 mb-1 uppercase tracking-wide">24h Change</p>
                    <p
                      className={`font-mono text-base font-semibold ${
                        selectedToken.change.startsWith("+") ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {selectedToken.change}
                    </p>
                  </div>
                  <div className="bg-background/40 rounded-lg p-4 border border-accent/10">
                    <p className="text-xs text-muted-foreground/70 mb-1 uppercase tracking-wide">Market Cap</p>
                    <p className="font-mono text-base font-semibold text-foreground/90">{selectedToken.marketCap}</p>
                  </div>
                  <div className="bg-background/40 rounded-lg p-4 border border-accent/10">
                    <p className="text-xs text-muted-foreground/70 mb-1 uppercase tracking-wide">24h Volume</p>
                    <p className="font-mono text-base font-semibold text-foreground/90">{selectedToken.volume}</p>
                  </div>
                </div>

                <div className="bg-background/40 rounded-lg p-4 border border-accent/10">
                  <p className="text-xs text-muted-foreground/70 mb-2 uppercase tracking-wide">Creator</p>
                  <p className="font-mono text-sm text-foreground/80">{selectedToken.creator}</p>
                </div>

                <div className="bg-background/40 rounded-lg p-4 border border-accent/10">
                  <p className="text-xs text-muted-foreground/70 mb-2 uppercase tracking-wide">Contract Address</p>
                  <p className="font-mono text-sm break-all text-foreground/80">{selectedToken.contractAddress}</p>
                </div>

                <div className="bg-background/40 rounded-lg p-4 border border-accent/10">
                  <p className="text-xs text-muted-foreground/70 mb-2 uppercase tracking-wide">Description</p>
                  <p className="text-sm text-foreground/80 leading-relaxed">{selectedToken.description}</p>
                </div>

                <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-display text-lg py-3 shadow-lg transition-all duration-300">
                  Trade {selectedToken.symbol}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export type { Token }
