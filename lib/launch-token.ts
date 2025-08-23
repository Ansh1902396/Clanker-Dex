'use client'

import { Clanker } from 'clanker-sdk/v4'
import { createPublicClient, http, Account, WalletClient } from 'viem'
import { base } from 'viem/chains'

export interface TokenDeploymentParams {
  name: string
  symbol: string
  description?: string
  website?: string
  image?: string
  totalSupply?: string
  decimals?: number
  devBuyAmount?: number
  vanity?: boolean
  projectType?: 'meme' | 'project'
  socialMediaUrls?: string[]
  auditUrls?: string[]
}

export interface DeploymentResult {
  address: string
  transactionHash?: string
  explorerUrl: string
  clankerUrl: string
}

export async function deployToken(
  params: TokenDeploymentParams,
  account: Account,
  walletClient: WalletClient
): Promise<DeploymentResult> {
  try {
    // Create public client
    const publicClient = createPublicClient({
      chain: base,
      transport: http()
    })

    // Initialize the Clanker SDK
    const clanker = new Clanker({ 
      publicClient: publicClient as any, 
      wallet: walletClient as any
    })

    // Set default dev buy amount if not provided (always keep some tokens with dev)
    const defaultDevBuyAmount = 0.001 // 0.001 ETH default
    const devBuyAmount = params.devBuyAmount && params.devBuyAmount > 0 
      ? params.devBuyAmount 
      : defaultDevBuyAmount

    // Convert social media URLs to the expected format
    const socialMediaUrls = params.socialMediaUrls?.map(url => ({
      platform: 'website',
      url: url
    })) || []

    // Prepare deployment configuration according to Clanker v4 SDK
    const deploymentConfig = {
      name: params.name,
      symbol: params.symbol.toUpperCase(),
      tokenAdmin: account.address as `0x${string}`,
      // Add vanity address generation if requested
      vanity: params.vanity || false,
      // Add image if provided
      ...(params.image && { image: params.image }),
      // Add metadata
      metadata: {
        description: params.description || `${params.name} - A token created with Clanker SDK`,
        socialMediaUrls: socialMediaUrls,
        auditUrls: params.auditUrls || [],
      },
      // Add context for social provenance
      context: {
        interface: 'Clanker SDK Dashboard',
        platform: 'dashboard',
        messageId: '',
        id: '',
      },
      // Configure fees - use static fees for compatibility
      fees: {
        type: "static" as const,
        clankerFee: 100, // 1% fee
        pairedFee: 100,  // 1% fee
      },
      // Always include dev buy to keep some tokens with the creator
      devBuy: {
        ethAmount: devBuyAmount,
      }
    }

    console.log('Deploying token with config:', deploymentConfig)

    // Deploy the token
    const { txHash, waitForTransaction, error } = await clanker.deploy(deploymentConfig)

    // Check for immediate deployment errors
    if (error) {
      throw new Error(error.message || 'Token deployment failed')
    }

    if (!waitForTransaction) {
      throw new Error('Failed to initiate token deployment')
    }

    console.log('Transaction hash:', txHash)

    // Wait for transaction confirmation
    const result = await waitForTransaction()

    if (!result || !result.address) {
      throw new Error('Token deployment failed - no address returned')
    }

    const address = result.address

    // Generate URLs
    const explorerUrl = `https://basescan.org/address/${address}`
    const clankerUrl = `https://clanker.world/clanker/${address}`

    return {
      address,
      transactionHash: txHash,
      explorerUrl,
      clankerUrl
    }
  } catch (error) {
    console.error('Token deployment failed:', error)
    throw new Error(error instanceof Error ? error.message : 'Token deployment failed')
  }
}

export function validateTokenParams(params: TokenDeploymentParams): string[] {
  const errors: string[] = []

  if (!params.name || params.name.trim().length === 0) {
    errors.push('Token name is required')
  }

  if (params.name && params.name.length > 50) {
    errors.push('Token name must be 50 characters or less')
  }

  if (!params.symbol || params.symbol.trim().length === 0) {
    errors.push('Token symbol is required')
  }

  if (params.symbol && params.symbol.length > 10) {
    errors.push('Token symbol must be 10 characters or less')
  }

  if (params.devBuyAmount && params.devBuyAmount < 0) {
    errors.push('Dev buy amount must be positive')
  }

  if (params.devBuyAmount && params.devBuyAmount > 10) {
    errors.push('Dev buy amount should not exceed 10 ETH')
  }

  if (params.description && params.description.length > 500) {
    errors.push('Description must be 500 characters or less')
  }

  if (params.socialMediaUrls && params.socialMediaUrls.length > 5) {
    errors.push('Maximum 5 social media URLs allowed')
  }

  if (params.auditUrls && params.auditUrls.length > 3) {
    errors.push('Maximum 3 audit URLs allowed')
  }

  return errors
}

// Helper function to create a deployment configuration with advanced options
export function createAdvancedTokenConfig(
  params: TokenDeploymentParams,
  account: Account,
  options?: {
    enableVesting?: boolean
    vestingPercentage?: number
    lockupDuration?: number
    vestingDuration?: number
    customRewards?: {
      recipient: string
      admin: string
      bps: number
      token: 'Paired' | 'Both' | 'Clanker'
    }[]
  }
) {
  const defaultDevBuyAmount = 0.001
  const devBuyAmount = params.devBuyAmount && params.devBuyAmount > 0 
    ? params.devBuyAmount 
    : defaultDevBuyAmount

  const socialMediaUrls = params.socialMediaUrls?.map(url => ({
    platform: 'website',
    url: url
  })) || []

  const baseConfig = {
    name: params.name,
    symbol: params.symbol.toUpperCase(),
    tokenAdmin: account.address as `0x${string}`,
    vanity: params.vanity || false,
    ...(params.image && { image: params.image }),
    metadata: {
      description: params.description || `${params.name} - A token created with Clanker SDK`,
      socialMediaUrls: socialMediaUrls,
      auditUrls: params.auditUrls || [],
    },
    context: {
      interface: 'Clanker SDK Dashboard',
      platform: 'dashboard',
      messageId: '',
      id: '',
    },
    fees: {
      type: "static" as const,
      clankerFee: 100,
      pairedFee: 100,
    },
    devBuy: {
      ethAmount: devBuyAmount,
    }
  }

  // Add advanced options if provided
  if (options?.enableVesting) {
    return {
      ...baseConfig,
      vault: {
        percentage: options.vestingPercentage || 10,
        lockupDuration: options.lockupDuration || 2592000, // 30 days
        vestingDuration: options.vestingDuration || 2592000, // 30 days
      }
    }
  }

  if (options?.customRewards) {
    return {
      ...baseConfig,
      rewards: {
        recipients: options.customRewards
      }
    }
  }

  return baseConfig
}
