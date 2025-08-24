import { useState, useCallback } from 'react';
import { ClankerQuoteParams, ClankerQuoteResponse } from '@/lib/services/clanker-quote';

interface UseClankerQuoteOptions {
  onSuccess?: (data: ClankerQuoteResponse) => void;
  onError?: (error: Error) => void;
}

export function useClankerQuote(options?: UseClankerQuoteOptions) {
  const [data, setData] = useState<ClankerQuoteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getQuote = useCallback(async (params: ClankerQuoteParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const searchParams = new URLSearchParams();
      
      // Add all parameters to the query string
      searchParams.append('chainId', params.chainId.toString());
      searchParams.append('sellToken', params.sellToken);
      searchParams.append('buyToken', params.buyToken);
      searchParams.append('sellAmount', params.sellAmount);
      searchParams.append('taker', params.taker);
      
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
      
      const url = `/api/quote?${searchParams.toString()}`
      console.log("[useClankerQuote] Making request to:", url)
      
      const response = await fetch(url);
      
      console.log("[useClankerQuote] Response status:", response.status)
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("[useClankerQuote] Error response:", errorData)
        throw new Error(errorData.message || 'Failed to fetch quote');
      }
      
      const quoteData = await response.json();
      console.log("[useClankerQuote] Quote data received:", quoteData)
      setData(quoteData);
      
      if (options?.onSuccess) {
        options.onSuccess(quoteData);
      }
      
      return quoteData;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      
      if (options?.onError) {
        options.onError(error);
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [options]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    getQuote,
    reset,
  };
}
