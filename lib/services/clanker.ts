import { tokensResponseSchema, tokensRequestSchema, type TokensRequest, type TokensResponse } from '@/lib/schemas/clanker'

// Use our internal API route instead of calling external API directly
const API_BASE = '/api'

export class ClankerService {
  private static buildQueryParams(params: TokensRequest): string {
    const searchParams = new URLSearchParams()
    
    if (params.q) searchParams.append('q', params.q)
    if (params.fids) searchParams.append('fids', params.fids)
    if (params.pairAddress) searchParams.append('pairAddress', params.pairAddress)
    if (params.sort) searchParams.append('sort', params.sort)
    if (params.socialInterface) searchParams.append('socialInterface', params.socialInterface)
    if (params.limit) searchParams.append('limit', params.limit.toString())
    if (params.cursor) searchParams.append('cursor', params.cursor)
    if (params.includeUser) searchParams.append('includeUser', params.includeUser.toString())
    if (params.includeMarket) searchParams.append('includeMarket', params.includeMarket.toString())
    if (params.startDate) searchParams.append('startDate', params.startDate.toString())
    
    return searchParams.toString()
  }

  static async getTokens(params: Partial<TokensRequest> = {}): Promise<TokensResponse> {
    try {
      // Validate and set defaults
      const validatedParams = tokensRequestSchema.parse(params)
      
      const queryString = this.buildQueryParams(validatedParams)
      const url = `${API_BASE}/tokens${queryString ? `?${queryString}` : ''}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Remove Next.js specific cache option since this runs in browser
        cache: 'no-store', // Don't cache in browser for real-time data
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // Validate response with Zod
      return tokensResponseSchema.parse(data)
    } catch (error) {
      console.error('Error fetching tokens:', error)
      throw new Error(`Failed to fetch tokens: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  static async searchTokens(query: string, limit = 5): Promise<TokensResponse> {
    return this.getTokens({
      q: query,
      limit,
      includeMarket: true,
      sort: 'desc',
    })
  }

  static async getLatestTokens(limit = 5): Promise<TokensResponse> {
    return this.getTokens({
      limit,
      includeMarket: true,
      sort: 'desc',
    })
  }
}
