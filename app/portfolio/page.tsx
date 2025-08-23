import DashboardPageLayout from "@/components/dashboard/layout"
import EmailIcon from "@/components/icons/email"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const portfolioTokens = [
  {
    symbol: "ETH",
    name: "Ethereum",
    balance: "12.5",
    value: "$30,708.75",
    price: "$2,456.70",
    change24h: "+5.2%",
    allocation: "65.4%",
  },
  {
    symbol: "MONKY",
    name: "M.O.N.K.Y Token",
    balance: "50,000",
    value: "$1,170.00",
    price: "$0.0234",
    change24h: "+15.8%",
    allocation: "2.5%",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    balance: "15,000",
    value: "$15,000.00",
    price: "$1.00",
    change24h: "0.0%",
    allocation: "32.1%",
  },
]

const recentTransactions = [
  {
    type: "Swap",
    from: "ETH",
    to: "USDC",
    amount: "2.5 ETH",
    value: "$6,142.00",
    timestamp: "2 hours ago",
    status: "completed",
  },
  {
    type: "Add Liquidity",
    from: "ETH",
    to: "USDC",
    amount: "1.0 ETH + 2,456 USDC",
    value: "$4,913.40",
    timestamp: "1 day ago",
    status: "completed",
  },
  {
    type: "Swap",
    from: "USDC",
    to: "MONKY",
    amount: "1,000 USDC",
    value: "$1,000.00",
    timestamp: "3 days ago",
    status: "completed",
  },
]

export default function PortfolioPage() {
  return (
    <DashboardPageLayout
      header={{
        title: "Portfolio",
        description: "Your token holdings and trading history",
        icon: EmailIcon,
      }}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Portfolio Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <p className="text-3xl font-display">$46,878.75</p>
                <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-display text-green-500">+$2,341.20</p>
                <p className="text-sm text-muted-foreground">24h P&L</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-display text-green-500">+5.26%</p>
                <p className="text-sm text-muted-foreground">24h Change</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display">Token Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {portfolioTokens.map((token, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-display text-sm">{token.symbol}</span>
                    </div>
                    <div>
                      <h3 className="font-display">{token.name}</h3>
                      <p className="text-sm text-muted-foreground">{token.symbol}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-8 text-right">
                    <div>
                      <p className="font-mono">{token.balance}</p>
                      <p className="text-xs text-muted-foreground">Balance</p>
                    </div>
                    <div>
                      <p className="font-mono">{token.price}</p>
                      <p className="text-xs text-muted-foreground">Price</p>
                    </div>
                    <div>
                      <p
                        className={`font-mono ${token.change24h.startsWith("+") ? "text-green-500" : token.change24h === "0.0%" ? "text-muted-foreground" : "text-red-500"}`}
                      >
                        {token.change24h}
                      </p>
                      <p className="text-xs text-muted-foreground">24h</p>
                    </div>
                    <div>
                      <p className="font-mono font-semibold">{token.value}</p>
                      <p className="text-xs text-muted-foreground">{token.allocation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((tx, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-accent/30">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">{tx.type}</Badge>
                    <div>
                      <p className="font-display">
                        {tx.from} → {tx.to}
                      </p>
                      <p className="text-sm text-muted-foreground">{tx.timestamp}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-mono">{tx.amount}</p>
                    <p className="text-sm text-muted-foreground">{tx.value}</p>
                  </div>

                  <Badge variant={tx.status === "completed" ? "default" : "secondary"}>{tx.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardPageLayout>
  )
}
