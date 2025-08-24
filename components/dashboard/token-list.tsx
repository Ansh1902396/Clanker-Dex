"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import Image from "next/image"
import { useTokens } from "@/hooks/use-tokens"
import { useToken } from "@/contexts/token-context"
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
  
  // Use token context
  const { setSelectedToken: setGlobalSelectedToken } = useToken()
  
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
    console.log("[v0] Full token object:", token)
    console.log("[v0] onTokenSelect callback exists:", !!onTokenSelect)

    // Always update the global context
    console.log("[v0] Setting global selected token via context")
    setGlobalSelectedToken(token)

    // Also call the callback if provided (for backward compatibility)
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
      <CardHeader className="pb-3 px-6 pt-5">
        <CardTitle className="font-display text-xl text-foreground/90 mb-3">Clanker Tokens</CardTitle>
        {/* Search Input */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-primary/5 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground/50 group-hover:text-accent/70 group-focus-within:text-accent h-4 w-4 transition-colors duration-200" />
            <Input
              placeholder="Search tokens..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 pr-4 py-2.5 h-10 bg-gradient-to-r from-background/30 via-background/20 to-background/30 border border-accent/15 hover:border-accent/30 focus:border-accent/60 focus:bg-background/40 transition-all duration-300 rounded-lg text-sm text-foreground placeholder:text-muted-foreground/40 shadow-sm hover:shadow-md focus:shadow-lg focus:shadow-accent/10 backdrop-blur-sm"
            />
          </div>
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground/50 hover:text-foreground/80 transition-colors duration-200 p-1 rounded-full hover:bg-background/50"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[600px] overflow-y-auto px-6 pb-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-accent/20">
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
            className="group p-4 rounded-lg bg-gradient-to-r from-background/40 to-background/20 border border-accent/10 hover:border-accent/30 hover:from-background/60 hover:to-background/40 cursor-pointer transition-all duration-300 hover:shadow-md hover:shadow-accent/5"
            onClick={() => handleTokenClick(token)}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <Image
                  src={token.image || "/placeholder.svg"}
                  alt={token.name}
                  width={40}
                  height={40}
                  className="rounded-full ring-2 ring-accent/10 group-hover:ring-accent/25 transition-all duration-300"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg"
                  }}
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500/80 rounded-full border border-background"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-display text-sm font-semibold text-foreground/90 group-hover:text-foreground transition-colors">
                    {token.symbol}
                  </span>
                  <Badge
                    variant="secondary"
                    className={`text-xs px-1.5 py-0.5 font-medium ${
                      token.change.startsWith("+") 
                        ? "bg-green-500/15 text-green-400 border-green-500/20" 
                        : "bg-red-500/15 text-red-400 border-red-500/20"
                    }`}
                  >
                    {token.change}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground/80 truncate mb-1 group-hover:text-muted-foreground transition-colors">
                  {token.name}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-mono font-medium text-foreground/80">
                    {token.price}
                  </p>
                  <p className="text-xs text-muted-foreground/60 font-medium truncate ml-2">
                    by {token.creator}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Load More Button */}
        {hasMore && (
          <div className="text-center pt-3 border-t border-accent/10">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLoadMore}
              disabled={loading}
              className="bg-gradient-to-r from-background/60 to-background/40 border-accent/20 hover:border-accent/40 text-foreground/80 hover:text-foreground px-4 py-2 text-sm font-medium transition-all duration-300 hover:shadow-md hover:shadow-accent/10"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-accent/30 border-t-accent mr-2"></div>
                  Loading...
                </>
              ) : (
                "Load More"
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export type { Token }
