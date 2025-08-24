import { useState, useEffect, useCallback } from 'react'
import { useAccount, useBalance } from 'wagmi'
import { erc20Abi } from 'viem'
import { useReadContract } from 'wagmi'
import type { TokenBalance } from '@/types/trading'

// SOULB Token Configuration
const SOULB_TOKEN = {
  address: '0xa6106BB43A4679D3Ec2b275195F7FAf59e0Cef66' as `0x${string}`,
  symbol: 'STK',
  name: 'SOULB',
  decimals: 18,
}

export function useTokenBalances() {
  const { address, isConnected } = useAccount()
  const [balances, setBalances] = useState<TokenBalance[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get ETH balance
  const { data: ethBalance, isLoading: ethLoading } = useBalance({
    address,
  })

  // Get SOULB token balance
  const { data: stkBalance, isLoading: stkLoading } = useReadContract({
    address: SOULB_TOKEN.address,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  })

  const refreshBalances = useCallback(async () => {
    if (!isConnected || !address) {
      // Set mock balances when not connected
      setBalances([
        { symbol: 'ETH', balance: 0, decimals: 18 },
        { symbol: 'STK', balance: 0, decimals: 18 }
      ])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const newBalances: TokenBalance[] = []

      // Add ETH balance
      if (ethBalance) {
        const ethBalanceFormatted = parseFloat(ethBalance.formatted)
        newBalances.push({
          symbol: 'ETH',
          balance: ethBalanceFormatted,
          decimals: 18
        })
      }

      // Add SOULB token balance
      if (stkBalance !== undefined) {
        const stkBalanceFormatted = parseFloat((Number(stkBalance) / Math.pow(10, 18)).toFixed(6))
        newBalances.push({
          symbol: 'STK',
          balance: stkBalanceFormatted,
          decimals: 18
        })
      }

      setBalances(newBalances)
    } catch (err) {
      console.error('Failed to fetch token balances:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch balances')
    } finally {
      setIsLoading(false)
    }
  }, [isConnected, address, ethBalance, stkBalance])

  // Update balances when wallet connection or balance data changes
  useEffect(() => {
    refreshBalances()
  }, [refreshBalances])

  return {
    balances,
    isLoading: isLoading || ethLoading || stkLoading,
    error,
    refreshBalances,
    isConnected,
    address,
  }
}
