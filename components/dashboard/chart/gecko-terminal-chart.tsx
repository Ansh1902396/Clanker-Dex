"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, ExternalLink, AlertCircle } from "lucide-react"

interface GeckoTerminalChartProps {
  tokenAddress?: string
  tokenSymbol?: string
  tokenName?: string
  className?: string
  height?: string
}

export default function GeckoTerminalChart({
  tokenAddress,
  tokenSymbol = "Token",
  tokenName = "Token",
  className = "",
  height = "600px"
}: GeckoTerminalChartProps) {
  const [chartKey, setChartKey] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Default to SOULB token if no address provided
  const defaultTokenAddress = "0xa6106BB43A4679D3Ec2b275195F7FAf59e0Cef66"
  const activeTokenAddress = tokenAddress || defaultTokenAddress

  // For GeckoTerminal, we need to construct the URL properly
  // The URL format is: https://www.geckoterminal.com/base/pools/{TOKEN_ADDRESS}
  // Note: This might be a pool address or token address depending on what GeckoTerminal has indexed
  const geckoTerminalUrl = `https://www.geckoterminal.com/base/pools/${activeTokenAddress}?embed=1&info=0&swaps=0&light_chart=0&chart_type=market_cap&resolution=1d&bg_color=111827`
  
  // Alternative URL in case the first one doesn't work (try searching by token)
  const fallbackUrl = `https://www.geckoterminal.com/base/tokens/${activeTokenAddress}?embed=1&info=0&swaps=0&light_chart=0&chart_type=market_cap&resolution=1d&bg_color=111827`
  
  // Reset states when token changes
  useEffect(() => {
    setIsLoading(true)
    setHasError(false)
    setChartKey(prev => prev + 1) // Force iframe reload
  }, [activeTokenAddress])

  const handleRefresh = () => {
    setIsLoading(true)
    setHasError(false)
    setChartKey(prev => prev + 1)
  }

  const handleIframeLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  const handleIframeError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  const openInNewTab = () => {
    // Try both URLs - first the pool URL, then the token URL
    window.open(`https://www.geckoterminal.com/base/pools/${activeTokenAddress}`, '_blank')
  }

  const openTokenPage = () => {
    window.open(fallbackUrl.replace('?embed=1&info=0&swaps=0&light_chart=0&chart_type=market_cap&resolution=1d&bg_color=111827', ''), '_blank')
  }

  return (
    <Card className={`bg-background/50 border-accent/20 ${className}`}>
      <CardContent className="p-0" style={{ height }}>
        {/* Chart Header */}
        <div className="p-4 border-b border-accent/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {tokenName} Chart
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {tokenSymbol}
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  {activeTokenAddress.slice(0, 6)}...{activeTokenAddress.slice(-4)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="h-8 w-8 p-0"
              title="Refresh Chart"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={openInNewTab}
              className="h-8 w-8 p-0"
              title="Open in GeckoTerminal"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Chart Content */}
        <div className="relative" style={{ height: `calc(${height} - 80px)` }}>
          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 bg-background/30 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin text-accent mx-auto mb-2" />
                <p className="text-muted-foreground">Loading chart...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {hasError && (
            <div className="absolute inset-0 bg-background/30 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="text-center max-w-sm mx-auto p-6">
                <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Chart not available for this token. It may not be listed on GeckoTerminal yet.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    className="text-sm"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openTokenPage}
                    className="text-sm"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in GeckoTerminal
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* GeckoTerminal Iframe */}
          <iframe
            key={chartKey}
            id="geckoterminal-embed"
            title={`GeckoTerminal Chart for ${tokenSymbol}`}
            src={geckoTerminalUrl}
            frameBorder="0"
            allow="clipboard-write"
            allowFullScreen
            className="w-full h-full rounded-b-lg"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            style={{
              border: 'none',
              background: 'transparent'
            }}
          />
        </div>

        {/* Chart Info Footer */}
        <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm rounded px-2 py-1 text-xs text-muted-foreground border border-accent/10">
          Powered by GeckoTerminal
        </div>
      </CardContent>
    </Card>
  )
}
