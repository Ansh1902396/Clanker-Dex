// lib/uniswap/hooks/useUniswapV4.ts
'use client'

import { useState, useCallback } from 'react'
import { usePublicClient, useWalletClient, useAccount } from 'wagmi'
import { Token } from '@uniswap/sdk-core'
import { UniswapV4Swapper } from '../swapper'
import { UniswapV4Quoter } from '../quoter'
import { QuoteParams, SwapQuote, SwapResult, SwapState } from '../types'
import { formatTokenAmount } from '../utils'

/**
 * Hook for interacting with Uniswap V4
 */
export function useUniswapV4() {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  const [swapState, setSwapState] = useState<SwapState>({
    isLoading: false,
    isQuoting: false,
    isSwapping: false,
    quote: null,
    error: null,
  })

  // Get quote for a swap
  const getQuote = useCallback(async (params: QuoteParams): Promise<SwapQuote | null> => {
    if (!publicClient) {
      throw new Error('Public client not available')
    }

    setSwapState(prev => ({ 
      ...prev, 
      isQuoting: true, 
      error: null 
    }))

    try {
      const quoter = new UniswapV4Quoter(publicClient)
      const quote = await quoter.getQuoteExactInput(params)
      
      setSwapState(prev => ({ 
        ...prev, 
        quote, 
        isQuoting: false 
      }))

      return quote
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to get quote'
      setSwapState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        isQuoting: false 
      }))
      return null
    }
  }, [publicClient])

  // Execute a swap
  const executeSwap = useCallback(async (params: QuoteParams): Promise<SwapResult | null> => {
    if (!publicClient || !walletClient || !address) {
      throw new Error('Wallet not connected')
    }

    setSwapState(prev => ({ 
      ...prev, 
      isSwapping: true, 
      error: null 
    }))

    try {
      const swapper = new UniswapV4Swapper(publicClient, walletClient)
      const result = await swapper.swapExactInput(params, address)
      
      if (result.error) {
        setSwapState(prev => ({ 
          ...prev, 
          error: result.error!, 
          isSwapping: false 
        }))
      } else {
        setSwapState(prev => ({ 
          ...prev, 
          isSwapping: false 
        }))
      }

      return result
    } catch (error: any) {
      const errorMessage = error.message || 'Swap failed'
      setSwapState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        isSwapping: false 
      }))
      return null
    }
  }, [publicClient, walletClient, address])

  // Get token balance
  const getTokenBalance = useCallback(async (token: Token): Promise<string | null> => {
    if (!publicClient || !address) return null

    try {
      const swapper = new UniswapV4Swapper(publicClient, walletClient!)
      const balance = await swapper.getTokenBalance(token, address)
      return formatTokenAmount(balance, token)
    } catch (error) {
      console.error('Failed to get token balance:', error)
      return null
    }
  }, [publicClient, walletClient, address])

  // Check if pool exists
  const checkPoolExists = useCallback(async (
    tokenA: Token, 
    tokenB: Token, 
    fee: number
  ): Promise<boolean> => {
    if (!publicClient) return false

    try {
      const quoter = new UniswapV4Quoter(publicClient)
      return await quoter.checkPoolExists(tokenA, tokenB, fee)
    } catch (error) {
      console.error('Failed to check pool:', error)
      return false
    }
  }, [publicClient])

  // Reset state
  const resetState = useCallback(() => {
    setSwapState({
      isLoading: false,
      isQuoting: false,
      isSwapping: false,
      quote: null,
      error: null,
    })
  }, [])

  return {
    // State
    ...swapState,
    isConnected: !!address,

    // Actions
    getQuote,
    executeSwap,
    getTokenBalance,
    checkPoolExists,
    resetState,
  }
}
