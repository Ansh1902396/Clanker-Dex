'use client'

import { useState } from "react"
import { useWalletClient, useAccount } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useToast } from "@/hooks/use-toast"
import DashboardPageLayout from "@/components/dashboard/layout"
import AtomIcon from "@/components/icons/atom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { deployToken, validateTokenParams, type TokenDeploymentParams } from "@/lib/launch-token"

export default function CreateTokenPage() {
  const [formData, setFormData] = useState<TokenDeploymentParams>({
    name: '',
    symbol: '',
    description: '',
    website: '',
    totalSupply: '1000000',
    decimals: 18,
    devBuyAmount: 0.01
  })
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentResult, setDeploymentResult] = useState<any>(null)
  
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const { toast } = useToast()

  const handleInputChange = (field: keyof TokenDeploymentParams, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleDeploy = async () => {
    if (!isConnected || !address || !walletClient) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to deploy a token",
        variant: "destructive"
      })
      return
    }

    // Validate form data
    const errors = validateTokenParams(formData)
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.join(', '),
        variant: "destructive"
      })
      return
    }

    setIsDeploying(true)
    try {
      const result = await deployToken(formData, { address } as any, walletClient)
      setDeploymentResult(result)
      
      toast({
        title: "Token Deployed Successfully!",
        description: `Token deployed at ${result.address}`,
      })
    } catch (error) {
      console.error('Deployment error:', error)
      toast({
        title: "Deployment Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      })
    } finally {
      setIsDeploying(false)
    }
  }
  return (
    <DashboardPageLayout
      header={{
        title: "Create Token",
        description: "Deploy your own token on the blockchain",
        icon: AtomIcon,
      }}
    >
      <div className="max-w-3xl mx-auto space-y-8">
        {!isConnected && (
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-semibold mb-4">Connect Your Wallet</h3>
              <p className="text-muted-foreground mb-6">
                You need to connect your wallet to deploy a token
              </p>
              <ConnectButton />
            </CardContent>
          </Card>
        )}

        {deploymentResult && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">🎉 Token Deployed Successfully!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Token Address:</Label>
                <p className="font-mono text-sm bg-white p-2 rounded border mt-1">
                  {deploymentResult.address}
                </p>
              </div>
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(deploymentResult.explorerUrl, '_blank')}
                >
                  View on Explorer
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(deploymentResult.clankerUrl, '_blank')}
                >
                  View on Clanker
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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
                <Input 
                  id="token-name" 
                  placeholder="e.g., My Awesome Token" 
                  className="font-mono h-12 px-4"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={isDeploying}
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="token-symbol" className="text-sm font-medium">
                  Token Symbol
                </Label>
                <Input 
                  id="token-symbol" 
                  placeholder="e.g., MAT" 
                  className="font-mono uppercase h-12 px-4"
                  value={formData.symbol}
                  onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
                  disabled={isDeploying}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="total-supply" className="text-sm font-medium">
                  Total Supply
                </Label>
                <Input 
                  id="total-supply" 
                  type="number" 
                  placeholder="1000000" 
                  className="font-mono h-12 px-4"
                  value={formData.totalSupply}
                  onChange={(e) => handleInputChange('totalSupply', e.target.value)}
                  disabled={isDeploying}
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="dev-buy" className="text-sm font-medium">
                  Dev Buy Amount (ETH)
                </Label>
                <Input 
                  id="dev-buy" 
                  type="number" 
                  step="0.001"
                  placeholder="0.01" 
                  className="font-mono h-12 px-4"
                  value={formData.devBuyAmount}
                  onChange={(e) => handleInputChange('devBuyAmount', parseFloat(e.target.value) || 0)}
                  disabled={isDeploying}
                />
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
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                disabled={isDeploying}
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="website" className="text-sm font-medium">
                Website (Optional)
              </Label>
              <Input 
                id="website" 
                type="url" 
                placeholder="https://yourtoken.com" 
                className="font-mono h-12 px-4"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                disabled={isDeploying}
              />
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
                <span className="font-medium">Network:</span>
                <span className="font-mono">Base Mainnet</span>
              </div>
              <div className="flex justify-between items-center text-base">
                <span className="font-medium">SDK:</span>
                <span className="font-mono">Clanker SDK v4</span>
              </div>
              {(formData.devBuyAmount || 0) > 0 && (
                <div className="flex justify-between items-center text-base">
                  <span className="font-medium">Dev Buy:</span>
                  <span className="font-mono text-primary">{formData.devBuyAmount || 0} ETH</span>
                </div>
              )}
            </div>

            <Button 
              className="w-full font-display h-14 text-lg" 
              size="lg"
              onClick={handleDeploy}
              disabled={!isConnected || isDeploying || !formData.name || !formData.symbol}
            >
              {isDeploying ? 'Deploying Token...' : 'Deploy Token'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardPageLayout>
  )
}
