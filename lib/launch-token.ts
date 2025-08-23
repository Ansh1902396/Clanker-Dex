'use client'

import { Clanker } from 'clanker-sdk/v4'
import { createPublicClient, http, Account, WalletClient } from 'viem'
import { base } from 'viem/chains'

export interface TokenDeploymentParams {
  name: string
  symbol: string
  description?: string
  website?: string
  totalSupply?: string
  decimals?: number
  devBuyAmount?: number
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

    // Prepare deployment parameters
    const deploymentConfig = {
      name: params.name,
      symbol: params.symbol.toUpperCase(),
      tokenAdmin: account.address,
      metadata: {
        description: params.description || `${params.name} - A token created with Clanker SDK`,
      },
      context: {
        interface: 'Clanker SDK',
      },
      // Optional: Add dev buy if specified
      ...(params.devBuyAmount && params.devBuyAmount > 0 && {
        devBuy: {
          ethAmount: params.devBuyAmount,
        }
      })
    }

    console.log('Deploying token with config:', deploymentConfig)

    // Deploy the token
    const deployResult = await clanker.deploy(deploymentConfig)

    if (!deployResult || !deployResult.waitForTransaction) {
      throw new Error('Failed to initiate token deployment')
    }

    // Wait for transaction confirmation
    const result = await deployResult.waitForTransaction()

    if (!result || result.error) {
      throw new Error(result?.error?.message || 'Token deployment failed')
    }

    const address = result.address
    if (!address) {
      throw new Error('No token address returned from deployment')
    }

    // Generate URLs (we might not have transactionHash, so make explorer URL optional)
    const explorerUrl = `https://basescan.org/address/${address}`
    const clankerUrl = `https://clanker.world/clanker/${address}`

    return {
      address,
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

  if (!params.symbol || params.symbol.trim().length === 0) {
    errors.push('Token symbol is required')
  }

  if (params.symbol && params.symbol.length > 10) {
    errors.push('Token symbol must be 10 characters or less')
  }

  if (params.devBuyAmount && params.devBuyAmount < 0) {
    errors.push('Dev buy amount must be positive')
  }

  return errors
}
