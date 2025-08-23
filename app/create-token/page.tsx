import DashboardPageLayout from "@/components/dashboard/layout"
import AtomIcon from "@/components/icons/atom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CreateTokenPage() {
  return (
    <DashboardPageLayout
      header={{
        title: "Create Token",
        description: "Deploy your own token on the blockchain",
        icon: AtomIcon,
      }}
    >
      <div className="max-w-3xl mx-auto space-y-8">
        <Card>
          <CardHeader className="pb-6">
            <CardTitle className="font-display text-xl">Token Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 px-8 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="token-name" className="text-sm font-medium">
                  Token Name
                </Label>
                <Input id="token-name" placeholder="e.g., My Awesome Token" className="font-mono h-12 px-4" />
              </div>
              <div className="space-y-3">
                <Label htmlFor="token-symbol" className="text-sm font-medium">
                  Token Symbol
                </Label>
                <Input id="token-symbol" placeholder="e.g., MAT" className="font-mono uppercase h-12 px-4" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="total-supply" className="text-sm font-medium">
                  Total Supply
                </Label>
                <Input id="total-supply" type="number" placeholder="1000000" className="font-mono h-12 px-4" />
              </div>
              <div className="space-y-3">
                <Label htmlFor="decimals" className="text-sm font-medium">
                  Decimals
                </Label>
                <Input id="decimals" type="number" placeholder="18" defaultValue="18" className="font-mono h-12 px-4" />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Describe your token's purpose and utility..."
                className="font-mono min-h-[120px] px-4 py-3 resize-none"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="website" className="text-sm font-medium">
                Website (Optional)
              </Label>
              <Input id="website" type="url" placeholder="https://yourtoken.com" className="font-mono h-12 px-4" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-6">
            <CardTitle className="font-display text-xl">Deployment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 px-8 pb-8">
            <div className="bg-muted/50 p-6 rounded-xl space-y-4 border">
              <div className="flex justify-between items-center text-base">
                <span className="font-medium">Estimated Gas Fee:</span>
                <span className="font-mono text-primary">0.025 ETH</span>
              </div>
              <div className="flex justify-between items-center text-base">
                <span className="font-medium">Network:</span>
                <span className="font-mono">Ethereum Mainnet</span>
              </div>
            </div>

            <Button className="w-full font-display h-14 text-lg" size="lg">
              Deploy Token
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardPageLayout>
  )
}
