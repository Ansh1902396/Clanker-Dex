import { NextRequest, NextResponse } from 'next/server';
import { getClankerQuote, ClankerQuoteParams } from '@/lib/services/clanker-quote';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract required parameters
    const chainId = searchParams.get('chainId');
    const sellToken = searchParams.get('sellToken');
    const buyToken = searchParams.get('buyToken');
    const sellAmount = searchParams.get('sellAmount');
    const taker = searchParams.get('taker');
    
    // Validate required parameters
    if (!chainId || !sellToken || !buyToken || !sellAmount || !taker) {
      return NextResponse.json(
        { 
          error: 'Missing required parameters',
          required: ['chainId', 'sellToken', 'buyToken', 'sellAmount', 'taker']
        },
        { status: 400 }
      );
    }
    
    // Build parameters object
    const params: ClankerQuoteParams = {
      chainId: parseInt(chainId),
      sellToken,
      buyToken,
      sellAmount,
      taker,
    };
    
    // Add optional parameters
    const swapFeeRecipient = searchParams.get('swapFeeRecipient');
    const swapFeeBps = searchParams.get('swapFeeBps');
    const swapFeeToken = searchParams.get('swapFeeToken');
    const tradeSurplusRecipient = searchParams.get('tradeSurplusRecipient');
    
    if (swapFeeRecipient) params.swapFeeRecipient = swapFeeRecipient;
    if (swapFeeBps) params.swapFeeBps = parseInt(swapFeeBps);
    if (swapFeeToken) params.swapFeeToken = swapFeeToken;
    if (tradeSurplusRecipient) params.tradeSurplusRecipient = tradeSurplusRecipient;
    
    // Get quote from Clanker
    const quote = await getClankerQuote(params);
    
    return NextResponse.json(quote);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch quote',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
