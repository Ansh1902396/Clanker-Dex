"use client"

import { useState, useEffect, useCallback } from 'react'
import { ClankerService } from '@/lib/services/clanker'
import { type Token, type TokensResponse } from '@/lib/schemas/clanker'

interface UseTokensParams {
  limit?: number
  autoRefresh?: boolean
  refreshInterval?: number
}

interface UseTokensReturn {
  tokens: Token[]
  loading: boolean
  error: string | null
  searchQuery: string
  cursor: string | null
  hasMore: boolean
  total: number
  search: (query: string) => Promise<void>
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
  setSearchQuery: (query: string) => void
}

export function useTokens({ 
  limit = 5, 
  autoRefresh = true, 
  refreshInterval = 30000 
}: UseTokensParams = {}): UseTokensReturn {
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [cursor, setCursor] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  const fetchTokens = useCallback(async (query = '', loadMore = false) => {
    try {
      if (!loadMore) {
        setLoading(true)
        setError(null)
      }

      let response: TokensResponse
      
      if (query.trim()) {
        response = await ClankerService.searchTokens(query, limit)
      } else {
        response = await ClankerService.getTokens({
          limit,
          cursor: loadMore ? cursor || undefined : undefined,
          includeMarket: true,
          sort: 'desc',
        })
      }

      // Validate and log pool configuration for debugging
      const validTokens = response.data.map(token => {
        const hasValidConfig = !!(
          token.pool_address && 
          token.extensions?.fees?.hook_address &&
          token.pool_config?.pairedToken
        )
        
        if (!hasValidConfig) {
          console.warn(`Token ${token.symbol} missing pool configuration:`, {
            pool_address: !!token.pool_address,
            hook_address: !!token.extensions?.fees?.hook_address,
            paired_token: !!token.pool_config?.pairedToken
          })
        }
        
        return token
      })

      if (loadMore && cursor) {
        setTokens(prev => [...prev, ...validTokens])
      } else {
        setTokens(validTokens)
      }
      
      setCursor(response.cursor || null)
      setTotal(response.total)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tokens'
      setError(errorMessage)
      console.error('Error fetching tokens:', err)
    } finally {
      setLoading(false)
    }
  }, [limit, cursor])

  const search = useCallback(async (query: string) => {
    setSearchQuery(query)
    setCursor(null) // Reset cursor for new search
    await fetchTokens(query, false)
  }, [fetchTokens])

  const loadMore = useCallback(async () => {
    if (cursor && !loading) {
      await fetchTokens(searchQuery, true)
    }
  }, [cursor, loading, searchQuery, fetchTokens])

  const refresh = useCallback(async () => {
    setCursor(null)
    await fetchTokens(searchQuery, false)
  }, [searchQuery, fetchTokens])

  // Initial load
  useEffect(() => {
    fetchTokens()
  }, [])

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh || searchQuery) return // Don't auto-refresh during search

    const interval = setInterval(() => {
      refresh()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, searchQuery, refresh])

  return {
    tokens,
    loading,
    error,
    searchQuery,
    cursor,
    hasMore: !!cursor,
    total,
    search,
    loadMore,
    refresh,
    setSearchQuery,
  }
}
