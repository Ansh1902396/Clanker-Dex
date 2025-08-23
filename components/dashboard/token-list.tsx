"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"

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

const mockTokens: Token[] = [
  {
    id: "1",
    name: "SOUL Token",
    symbol: "SOUL",
    price: "$0.00004706",
    change: "+2.5%",
    marketCap: "$470k",
    volume: "$12.3k",
    image: "/soul-token-logo.png",
    creator: "0xFC76...ao2f",
    description: "A nice token for the soul",
    contractAddress: "0xFC76...ao2f",
  },
  {
    id: "2",
    name: "REBEL Token",
    symbol: "RBL",
    price: "$0.00012345",
    change: "-1.2%",
    marketCap: "$890k",
    volume: "$45.6k",
    image: "/rebel-token-logo.png",
    creator: "0xAB12...cd34",
    description: "Token for the rebels",
    contractAddress: "0xAB12...cd34",
  },
  {
    id: "3",
    name: "MONKY Token",
    symbol: "MNKY",
    price: "$0.00067890",
    change: "+15.7%",
    marketCap: "$1.2M",
    volume: "$78.9k",
    image: "/monkey-token-logo.png",
    creator: "0x1234...5678",
    description: "The original MONKY token",
    contractAddress: "0x1234...5678",
  },
]

interface TokenListProps {
  onTokenSelect?: (token: Token) => void
}

export default function TokenList({ onTokenSelect }: TokenListProps) {
  const [selectedToken, setSelectedToken] = useState<Token | null>(null)

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

  return (
    <Card className="w-full bg-background/50 border-accent/20">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-lg">Created Tokens</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
        {mockTokens.map((token) => (
          <div
            key={token.id}
            className="p-4 rounded-lg bg-background/30 border border-accent/10 hover:border-accent/30 cursor-pointer transition-all"
            onClick={() => handleTokenClick(token)}
          >
            <div className="flex items-center gap-3">
              <Image
                src={token.image || "/placeholder.svg"}
                alt={token.name}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-display text-sm">{token.symbol}</span>
                  <Badge
                    variant="secondary"
                    className={`text-xs ${
                      token.change.startsWith("+") ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {token.change}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">{token.name}</p>
                <p className="text-xs font-mono">{token.price}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Token Info Modal - only show if no onTokenSelect callback */}
        {selectedToken && !onTokenSelect && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <Card className="w-full max-w-md mx-4 bg-background border-accent/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex items-center gap-3">
                  <Image
                    src={selectedToken.image || "/placeholder.svg"}
                    alt={selectedToken.name}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <div>
                    <CardTitle className="font-display">{selectedToken.symbol}</CardTitle>
                    <p className="text-sm text-muted-foreground">{selectedToken.name}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedToken(null)}>
                  ✕
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Price</p>
                    <p className="font-mono">{selectedToken.price}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">24h Change</p>
                    <p
                      className={`font-mono ${
                        selectedToken.change.startsWith("+") ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {selectedToken.change}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Market Cap</p>
                    <p className="font-mono">{selectedToken.marketCap}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">24h Volume</p>
                    <p className="font-mono">{selectedToken.volume}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Creator</p>
                  <p className="font-mono text-sm">{selectedToken.creator}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Contract Address</p>
                  <p className="font-mono text-sm break-all">{selectedToken.contractAddress}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Description</p>
                  <p className="text-sm">{selectedToken.description}</p>
                </div>

                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-display">
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
