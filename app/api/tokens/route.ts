import { NextRequest, NextResponse } from 'next/server'
import { tokensResponseSchema, tokensRequestSchema } from '@/lib/schemas/clanker'

const CLANKER_API_BASE = 'https://www.clanker.world/api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract and validate query parameters
    const params = {
      q: searchParams.get('q') || undefined,
      fids: searchParams.get('fids') || undefined,
      pairAddress: searchParams.get('pairAddress') || undefined,
      sort: searchParams.get('sort') || 'desc',
      socialInterface: searchParams.get('socialInterface') || undefined,
      limit: parseInt(searchParams.get('limit') || '5'),
      cursor: searchParams.get('cursor') || undefined,
      includeUser: searchParams.get('includeUser') === 'true',
      includeMarket: searchParams.get('includeMarket') === 'true',
      startDate: searchParams.get('startDate') ? parseInt(searchParams.get('startDate')!) : undefined,
    }

    // Validate parameters
    const validatedParams = tokensRequestSchema.parse(params)
    
    // Build query string for external API
    const queryParams = new URLSearchParams()
    
    if (validatedParams.q) queryParams.append('q', validatedParams.q)
    if (validatedParams.fids) queryParams.append('fids', validatedParams.fids)
    if (validatedParams.pairAddress) queryParams.append('pairAddress', validatedParams.pairAddress)
    if (validatedParams.sort) queryParams.append('sort', validatedParams.sort)
    if (validatedParams.socialInterface) queryParams.append('socialInterface', validatedParams.socialInterface)
    if (validatedParams.limit) queryParams.append('limit', validatedParams.limit.toString())
    if (validatedParams.cursor) queryParams.append('cursor', validatedParams.cursor)
    if (validatedParams.includeUser) queryParams.append('includeUser', validatedParams.includeUser.toString())
    if (validatedParams.includeMarket) queryParams.append('includeMarket', validatedParams.includeMarket.toString())
    if (validatedParams.startDate) queryParams.append('startDate', validatedParams.startDate.toString())
    
    const url = `${CLANKER_API_BASE}/tokens?${queryParams.toString()}`
    
    // Fetch from external API
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MONKY-Dashboard/1.0.0',
      },
      // Add cache control
      next: { revalidate: 30 }, // Cache for 30 seconds
    })

    if (!response.ok) {
      console.error(`Clanker API error: ${response.status} ${response.statusText}`)
      return NextResponse.json(
        { error: `External API error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // Use safeParse to handle validation errors gracefully
    const validationResult = tokensResponseSchema.safeParse(data)
    
    if (!validationResult.success) {
      console.error('Validation errors:', validationResult.error.issues)
      // Return the raw data if validation fails, but log the error
      console.warn('Returning unvalidated data due to schema mismatch')
      return NextResponse.json(data, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      })
    }
    
    // Return with CORS headers
    return NextResponse.json(validationResult.data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  } catch (error) {
    console.error('Error in tokens API route:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle preflight OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
