import DashboardPageLayout from "@/components/dashboard/layout"
import GearIcon from "@/components/icons/gear"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SettingsPage() {
  return (
    <DashboardPageLayout
      header={{
        title: "Settings",
        description: "Configure your DEX preferences",
        icon: GearIcon,
      }}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Trading Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-approve transactions</Label>
                <p className="text-sm text-muted-foreground">Automatically approve small transactions</p>
              </div>
              <Switch />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slippage">Default Slippage Tolerance</Label>
              <Select defaultValue="0.5">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.1">0.1%</SelectItem>
                  <SelectItem value="0.5">0.5%</SelectItem>
                  <SelectItem value="1.0">1.0%</SelectItem>
                  <SelectItem value="3.0">3.0%</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Transaction Deadline</Label>
              <Select defaultValue="20">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="20">20 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display">Wallet Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Connected Wallet</Label>
              <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <span className="font-mono">0x742d...4B2f</span>
                <Button variant="outline" size="sm">
                  Disconnect
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Show wallet balance</Label>
                <p className="text-sm text-muted-foreground">Display balance in sidebar</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display">Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Transaction notifications</Label>
                <p className="text-sm text-muted-foreground">Get notified when transactions complete</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Price alerts</Label>
                <p className="text-sm text-muted-foreground">Receive alerts for significant price changes</p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Liquidity rewards</Label>
                <p className="text-sm text-muted-foreground">Notifications for earned rewards</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button className="font-display">Save Settings</Button>
        </div>
      </div>
    </DashboardPageLayout>
  )
}
