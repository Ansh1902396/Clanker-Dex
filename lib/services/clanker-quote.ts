export interface ClankerQuoteParams {
  chainId: number;
  sellToken: string;
  buyToken: string;
  sellAmount: string;
  taker: string;
  swapFeeRecipient?: string;
  swapFeeBps?: number;
  swapFeeToken?: string;
  tradeSurplusRecipient?: string;
}

export interface ClankerQuoteResponse {
  // Add the expected response structure based on Clanker API
  [key: string]: any;
}

const CLANKER_BASE_URL = 'https://clanker.world';

export async function getClankerQuote(params: ClankerQuoteParams): Promise<ClankerQuoteResponse> {
  const searchParams = new URLSearchParams();
  
  // Add required parameters
  searchParams.append('chainId', params.chainId.toString());
  searchParams.append('sellToken', params.sellToken);
  searchParams.append('buyToken', params.buyToken);
  searchParams.append('sellAmount', params.sellAmount);
  searchParams.append('taker', params.taker);
  
  // Add optional parameters
  if (params.swapFeeRecipient) {
    searchParams.append('swapFeeRecipient', params.swapFeeRecipient);
  }
  if (params.swapFeeBps) {
    searchParams.append('swapFeeBps', params.swapFeeBps.toString());
  }
  if (params.swapFeeToken) {
    searchParams.append('swapFeeToken', params.swapFeeToken);
  }
  if (params.tradeSurplusRecipient) {
    searchParams.append('tradeSurplusRecipient', params.tradeSurplusRecipient);
  }
  
  const url = `${CLANKER_BASE_URL}/api/quote?${searchParams.toString()}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Clanker API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Clanker quote:', error);
    throw error;
  }
}
