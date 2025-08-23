import DashboardPageLayout from "@/components/dashboard/layout"
import ProcessorIcon from "@/components/icons/proccesor"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const tradingPairs = [
  {
    pair: "ETH/USDC",
    price: "$2,456.78",
    change24h: "+5.2%",
    volume24h: "$12.4M",
    liquidity: "$45.2M",
    status: "active",
  },
  {
    pair: "BTC/USDT",
    price: "$43,210.50",
    change24h: "-2.1%",
    volume24h: "$8.7M",
    liquidity: "$32.1M",
    status: "active",
  },
  {
    pair: "MONKY/ETH",
    price: "$0.0234",
    change24h: "+15.8%",
    volume24h: "$2.1M",
    liquidity: "$8.5M",
    status: "active",
  },
  {
    pair: "LINK/USDC",
    price: "$14.67",
    change24h: "+3.4%",
    volume24h: "$1.8M",
    liquidity: "$6.2M",
    status: "active",
  },
]

export default function TradingPairsPage() {
  return (
    <DashboardPageLayout
      header={{
        title: "Trading Pairs",
        description: "Available token pairs for trading",
        icon: ProcessorIcon,
      }}
    >
      <div className="space-y-6">
        <div className="grid gap-4">
          {tradingPairs.map((pair, index) => (
            <Card key={index} className="hover:bg-accent/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="text-xl font-display">{pair.pair}</h3>
                      <p className="text-sm text-muted-foreground">Trading Pair</p>
                    </div>
                    <Badge variant={pair.status === "active" ? "default" : "secondary"}>
                      {pair.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-4 gap-8 text-right">
                    <div>
                      <p className="text-lg font-mono">{pair.price}</p>
                      <p className="text-xs text-muted-foreground">Price</p>
                    </div>
                    <div>
                      <p
                        className={`text-lg font-mono ${pair.change24h.startsWith("+") ? "text-green-500" : "text-red-500"}`}
                      >
                        {pair.change24h}
                      </p>
                      <p className="text-xs text-muted-foreground">24h Change</p>
                    </div>
                    <div>
                      <p className="text-lg font-mono">{pair.volume24h}</p>
                      <p className="text-xs text-muted-foreground">24h Volume</p>
                    </div>
                    <div>
                      <p className="text-lg font-mono">{pair.liquidity}</p>
                      <p className="text-xs text-muted-foreground">Liquidity</p>
                    </div>
                  </div>

                  <Button className="font-display">Trade</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardPageLayout>
  )
}
