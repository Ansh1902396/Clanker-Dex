"use client"

import React from 'react'
import { Search, TrendingUp, TrendingDown, RefreshCw, ExternalLink } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTokens } from '@/hooks/use-tokens'
import { cn } from '@/lib/utils'
import { type Token } from '@/lib/schemas/clanker'

interface TokenItemProps {
  token: Token
  className?: string
  onTokenSelect?: (token: Token) => void
}

function TokenItem({ token, className, onTokenSelect }: TokenItemProps) {
  const marketData = token.related?.market
  // Handle both possible field names for price change
  const priceChange = marketData?.priceChange24h ?? marketData?.priceChangePercent24h
  const isPositive = priceChange ? priceChange >= 0 : null

  const formatMarketCap = (marketCap?: number) => {
    if (!marketCap || marketCap === 0) return 'N/A'
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`
    if (marketCap >= 1e3) return `$${(marketCap / 1e3).toFixed(2)}K`
    return `$${marketCap.toFixed(2)}`
  }

  const formatPrice = (price?: number) => {
    if (!price || price === 0) return 'N/A'
    if (price < 0.01) return `$${price.toExponential(2)}`
    return `$${price.toFixed(4)}`
  }

  return (
    <div 
      className={cn(
        "group flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer",
        className
      )}
      onClick={() => onTokenSelect?.(token)}
    >
      <Avatar className="size-10 shrink-0">
        <AvatarImage src={token.img_url || undefined} alt={token.symbol} />
        <AvatarFallback className="text-xs font-medium">
          {token.symbol.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{token.symbol}</span>
          <Badge variant="secondary" className="text-xs px-1 py-0">
            {token.pair}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="truncate">{token.name}</span>
          {marketData && priceChange !== undefined && priceChange !== 0 && isPositive !== null ? (
            <div className="flex items-center gap-1 shrink-0">
              {isPositive ? (
                <TrendingUp className="size-3 text-green-500" />
              ) : (
                <TrendingDown className="size-3 text-red-500" />
              )}
              <span className={cn(
                "font-medium",
                isPositive ? "text-green-500" : "text-red-500"
              )}>
                {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
              </span>
            </div>
          ) : (
            <Badge variant="outline" className="text-xs px-1 py-0">
              New
            </Badge>
          )}
        </div>

        {marketData && priceChange !== undefined && priceChange !== 0 && isPositive !== null ? (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {formatPrice(marketData.price)}
            </span>
            <span className="text-muted-foreground">
              {formatMarketCap(marketData.marketCap)}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">New Token</span>
            <span className="text-muted-foreground">
              MC: {token.starting_market_cap ? `$${token.starting_market_cap.toFixed(2)}` : 'N/A'}
            </span>
          </div>
        )}
      </div>

      <ExternalLink className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  )
}

interface TokenListProps {
  className?: string
  onTokenSelect?: (token: Token) => void
}

export function TokenList({ className, onTokenSelect }: TokenListProps) {
  const {
    tokens,
    loading,
    error,
    searchQuery,
    hasMore,
    search,
    loadMore,
    refresh,
    setSearchQuery,
  } = useTokens({ limit: 5, autoRefresh: true })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    search(searchQuery)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    
    // Auto-search with debouncing would be better, but for simplicity we'll search on form submit
    if (!value.trim()) {
      // If search is cleared, refresh to show latest tokens
      refresh()
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Live Tokens</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={refresh}
          disabled={loading}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className={cn("size-4", loading && "animate-spin")} />
        </Button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search tokens..."
          value={searchQuery}
          onChange={handleInputChange}
          className="pl-9 h-9"
        />
      </form>

      {/* Error State */}
      {error && (
        <div className="text-sm text-destructive p-2 rounded-md bg-destructive/10">
          {error}
        </div>
      )}

      {/* Token List */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {loading && tokens.length === 0 ? (
            // Loading skeletons
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                <div className="size-10 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse w-24" />
                  <div className="h-3 bg-muted rounded animate-pulse w-32" />
                  <div className="h-3 bg-muted rounded animate-pulse w-16" />
                </div>
              </div>
            ))
          ) : tokens.length > 0 ? (
            <>
              {tokens.map((token) => (
                <TokenItem 
                  key={token.id} 
                  token={token} 
                  onTokenSelect={onTokenSelect}
                />
              ))}
              
              {/* Load More Button */}
              {hasMore && (
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={loading}
                  className="w-full mt-2"
                  size="sm"
                >
                  {loading ? (
                    <RefreshCw className="size-4 animate-spin mr-2" />
                  ) : null}
                  Load More
                </Button>
              )}
            </>
          ) : (
            // Empty state
            <div className="text-center py-8 text-muted-foreground">
              <Search className="size-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {searchQuery ? 'No tokens found' : 'No tokens available'}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
