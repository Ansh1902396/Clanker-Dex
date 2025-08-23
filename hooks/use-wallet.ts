'use client'

import { useAccount, useBalance, useDisconnect, useEnsName } from 'wagmi'
import { formatEther } from 'viem'

export function useWallet() {
  const { address, isConnected, isConnecting, isDisconnected } = useAccount()
  const { disconnect } = useDisconnect()
  
  const { data: balance, isLoading: isBalanceLoading } = useBalance({
    address,
  })
  
  const { data: ensName, isLoading: isEnsLoading } = useEnsName({
    address,
  })

  const formattedBalance = balance 
    ? `${parseFloat(formatEther(balance.value)).toFixed(4)} ${balance.symbol}`
    : '0.0000 ETH'

  return {
    address,
    isConnected,
    isConnecting,
    isDisconnected,
    balance,
    formattedBalance,
    ensName,
    isBalanceLoading,
    isEnsLoading,
    disconnect,
  }
}
