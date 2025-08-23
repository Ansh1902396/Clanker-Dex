import DashboardPageLayout from "@/components/dashboard/layout"
import CuteRobotIcon from "@/components/icons/cute-robot"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

const liquidityPools = [
  {
    pair: "ETH/USDC",
    tvl: "$45.2M",
    apr: "12.5%",
    myLiquidity: "$5,420.00",
    poolShare: "0.12%",
    rewards: "$124.50",
  },
  {
    pair: "MONKY/ETH",
    tvl: "$8.5M",
    apr: "24.8%",
    myLiquidity: "$2,100.00",
    poolShare: "0.25%",
    rewards: "$89.20",
  },
  {
    pair: "BTC/USDT",
    tvl: "$32.1M",
    apr: "8.9%",
    myLiquidity: "$0.00",
    poolShare: "0.00%",
    rewards: "$0.00",
  },
]

export default function LiquidityPage() {
  return (
    <DashboardPageLayout
      header={{
        title: "Liquidity Pools",
        description: "Provide liquidity and earn rewards",
        icon: CuteRobotIcon,
      }}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-display">My Liquidity Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-2xl font-display">$7,520.00</p>
                <p className="text-sm text-muted-foreground">Total Liquidity</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-display text-green-500">$213.70</p>
                <p className="text-sm text-muted-foreground">Total Rewards</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-display">18.7%</p>
                <p className="text-sm text-muted-foreground">Avg APR</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {liquidityPools.map((pool, index) => (
            <Card key={index} className="hover:bg-accent/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-display">{pool.pair}</h3>
                    <p className="text-sm text-muted-foreground">Liquidity Pool</p>
                  </div>
                  <Badge variant="outline" className="text-green-500 border-green-500">
                    {pool.apr} APR
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  <div>
                    <p className="text-lg font-mono">{pool.tvl}</p>
                    <p className="text-xs text-muted-foreground">TVL</p>
                  </div>
                  <div>
                    <p className="text-lg font-mono">{pool.myLiquidity}</p>
                    <p className="text-xs text-muted-foreground">My Liquidity</p>
                  </div>
                  <div>
                    <p className="text-lg font-mono">{pool.poolShare}</p>
                    <p className="text-xs text-muted-foreground">Pool Share</p>
                  </div>
                  <div>
                    <p className="text-lg font-mono text-green-500">{pool.rewards}</p>
                    <p className="text-xs text-muted-foreground">Rewards</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="font-display">
                      Add
                    </Button>
                    <Button size="sm" variant="outline" className="font-display bg-transparent">
                      Remove
                    </Button>
                  </div>
                </div>

                {Number.parseFloat(pool.myLiquidity.replace(/[$,]/g, "")) > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Pool participation</span>
                      <span>{pool.poolShare}</span>
                    </div>
                    <Progress value={Number.parseFloat(pool.poolShare.replace("%", "")) * 40} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardPageLayout>
  )
}
