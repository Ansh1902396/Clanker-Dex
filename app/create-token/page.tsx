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
    image: '',
    totalSupply: '1000000',
    decimals: 18,
    devBuyAmount: 0.001, // Default to minimum recommended amount
    vanity: false,
    projectType: 'meme',
    socialMediaUrls: [],
    auditUrls: []
  })
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentResult, setDeploymentResult] = useState<any>(null)
  
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const { toast } = useToast()

  const handleInputChange = (field: keyof TokenDeploymentParams, value: string | number | boolean | string[]) => {
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
          <Card className="border-success/20 bg-gradient-to-br from-success/5 to-success/10">
            <CardHeader className="pb-4">
              <CardTitle className="font-display text-xl text-success flex items-center gap-2">
                🎉 Token Deployed Successfully!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-card/60 p-6 rounded-xl border border-border/50 space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Token Address</Label>
                  <div className="font-mono text-sm bg-muted/50 p-3 rounded-lg border border-border/30 break-all">
                    {deploymentResult.address}
                  </div>
                </div>
                
                {deploymentResult.transactionHash && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Transaction Hash</Label>
                    <div className="font-mono text-sm bg-muted/50 p-3 rounded-lg border border-border/30 break-all">
                      {deploymentResult.transactionHash}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 font-display h-12"
                  onClick={() => window.open(deploymentResult.explorerUrl, '_blank')}
                >
                  View on BaseScan
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 font-display h-12"
                  onClick={() => window.open(deploymentResult.clankerUrl, '_blank')}
                >
                  View on Clanker
                </Button>
                <Button 
                  variant="default" 
                  className="flex-1 font-display h-12"
                  onClick={() => {
                    navigator.clipboard.writeText(deploymentResult.address)
                    toast({
                      title: "Copied!",
                      description: "Token address copied to clipboard",
                    })
                  }}
                >
                  Copy Address
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
                  min="0.001"
                  placeholder="0.001" 
                  className="font-mono h-12 px-4"
                  value={formData.devBuyAmount}
                  onChange={(e) => handleInputChange('devBuyAmount', parseFloat(e.target.value) || 0.001)}
                  disabled={isDeploying}
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 0.001 ETH guaranteed. This ensures you receive tokens from your deployment.
                </p>
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

            <div className="space-y-3">
              <Label htmlFor="image" className="text-sm font-medium">
                Token Image URL (Optional)
              </Label>
              <Input 
                id="image" 
                type="url" 
                placeholder="https://your-image-url.com/token.png or ipfs://..." 
                className="font-mono h-12 px-4"
                value={formData.image}
                onChange={(e) => handleInputChange('image', e.target.value)}
                disabled={isDeploying}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Token Type</Label>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="projectType"
                      value="meme"
                      checked={formData.projectType === 'meme'}
                      onChange={(e) => handleInputChange('projectType', e.target.value as 'meme' | 'project')}
                      disabled={isDeploying}
                      className="text-primary"
                    />
                    <span className="text-sm">Meme Token</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="projectType"
                      value="project"
                      checked={formData.projectType === 'project'}
                      onChange={(e) => handleInputChange('projectType', e.target.value as 'meme' | 'project')}
                      disabled={isDeploying}
                      className="text-primary"
                    />
                    <span className="text-sm">Project Token</span>
                  </label>
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-medium">Vanity Address</Label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.vanity || false}
                    onChange={(e) => handleInputChange('vanity', e.target.checked)}
                    disabled={isDeploying}
                    className="text-primary"
                  />
                  <span className="text-sm">Generate vanity address (ends with "b07")</span>
                </label>
              </div>
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
                <span className="font-mono">Clanker SDK v4.0.0</span>
              </div>
              <div className="flex justify-between items-center text-base">
                <span className="font-medium">Token Type:</span>
                <span className="font-mono capitalize">{formData.projectType}</span>
              </div>
              <div className="flex justify-between items-center text-base">
                <span className="font-medium">Dev Buy (Guaranteed):</span>
                <span className="font-mono text-primary">
                  {(formData.devBuyAmount && formData.devBuyAmount > 0) ? formData.devBuyAmount : 0.001} ETH
                </span>
              </div>
              {formData.vanity && (
                <div className="flex justify-between items-center text-base">
                  <span className="font-medium">Vanity Address:</span>
                  <span className="font-mono text-green-600">Enabled (ends with "b07")</span>
                </div>
              )}
              <div className="flex justify-between items-center text-base">
                <span className="font-medium">Fee Structure:</span>
                <span className="font-mono">1% Static Fees</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
              <h4 className="font-medium text-blue-900 mb-2">✨ Clanker v4.0.0 Features</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Automatic dev buy ensures you receive tokens</li>
                <li>• Enhanced metadata and social provenance</li>
                <li>• Optimized pool configurations</li>
                <li>• Professional fee structures</li>
                {formData.vanity && <li>• Vanity address generation</li>}
              </ul>
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
