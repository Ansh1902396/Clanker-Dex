import React, { useState } from 'react';
import { useClankerQuote } from '@/hooks/use-clanker-quote';
import { ClankerQuoteParams } from '@/lib/services/clanker-quote';

export function ClankerQuoteExample() {
  const { data, loading, error, getQuote } = useClankerQuote({
    onSuccess: (data) => console.log('Quote received:', data),
    onError: (error) => console.error('Quote error:', error),
  });

  const [formData, setFormData] = useState<ClankerQuoteParams>({
    chainId: 8453, // Base chain
    sellToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // ETH
    buyToken: '0xa6106BB43A4679D3Ec2b275195F7FAf59e0Cef66', // SOULB token
    sellAmount: '10000000000000000', // 0.01 ETH in wei (increased from 0.001)
    taker: '0xcFE743EA353d4d3D2c20C41C7d878B2cbA66DA0a',
    swapFeeRecipient: '0x1eaf444ebDf6495C57aD52A04C61521bBf564ace',
    swapFeeBps: 100,
    swapFeeToken: '0xa6106BB43A4679D3Ec2b275195F7FAf59e0Cef66',
    tradeSurplusRecipient: '0x1eaf444ebDf6495C57aD52A04C61521bBf564ace',
  });

  const handleGetQuote = async () => {
    try {
      await getQuote(formData);
    } catch (error) {
      // Error is already handled by the hook
    }
  };

  const updateFormData = (field: keyof ClankerQuoteParams, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Calculate exact prices from quote data
  const calculatePrices = () => {
    if (!data || !data.buyAmount) return null;
    
    const sellAmountEth = parseFloat(formData.sellAmount) / Math.pow(10, 18);
    const buyAmountTokens = parseFloat(data.buyAmount) / Math.pow(10, 18);
    
    const pricePerToken = sellAmountEth / buyAmountTokens; // ETH per token
    const tokensPerEth = buyAmountTokens / sellAmountEth; // Tokens per ETH
    
    return {
      pricePerToken: pricePerToken.toExponential(4), // Use scientific notation for very small numbers
      tokensPerEth: buyAmountTokens < 1000 ? tokensPerEth.toFixed(8) : tokensPerEth.toFixed(2),
      sellAmountFormatted: sellAmountEth.toFixed(6),
      buyAmountFormatted: buyAmountTokens < 1000 ? buyAmountTokens.toFixed(8) : buyAmountTokens.toFixed(2),
      pricePerTokenDecimal: pricePerToken.toFixed(12) // Show full decimal precision
    };
  };

  const prices = calculatePrices();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Clanker Quote API Test</h2>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Chain ID</label>
          <input
            type="number"
            value={formData.chainId}
            onChange={(e) => updateFormData('chainId', parseInt(e.target.value))}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Sell Token</label>
          <input
            type="text"
            value={formData.sellToken}
            onChange={(e) => updateFormData('sellToken', e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Buy Token</label>
          <input
            type="text"
            value={formData.buyToken}
            onChange={(e) => updateFormData('buyToken', e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Sell Amount (wei)</label>
          <input
            type="text"
            value={formData.sellAmount}
            onChange={(e) => updateFormData('sellAmount', e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Taker Address</label>
          <input
            type="text"
            value={formData.taker}
            onChange={(e) => updateFormData('taker', e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Swap Fee BPS (optional)</label>
          <input
            type="number"
            value={formData.swapFeeBps || ''}
            onChange={(e) => updateFormData('swapFeeBps', parseInt(e.target.value) || 0)}
            className="w-full p-2 border rounded"
            placeholder="100"
          />
        </div>
      </div>
      
      <button
        onClick={handleGetQuote}
        disabled={loading}
        className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Getting Quote...' : 'Get Quote'}
      </button>
      
      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error.message}
        </div>
      )}
      
      {data && (
        <div className="mt-4 space-y-4">
          {/* Price Information */}
          {prices && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <h3 className="font-bold mb-2 text-blue-800">Quote Prices:</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Selling:</span>
                  <div className="font-mono text-lg">{prices.sellAmountFormatted} ETH</div>
                </div>
                <div>
                  <span className="text-gray-600">Receiving:</span>
                  <div className="font-mono text-lg">{prices.buyAmountFormatted} STK</div>
                </div>
                <div>
                  <span className="text-gray-600">Price per STK:</span>
                  <div className="font-mono text-sm">{prices.pricePerToken} ETH</div>
                  <div className="font-mono text-xs text-gray-500">{prices.pricePerTokenDecimal} ETH</div>
                </div>
                <div>
                  <span className="text-gray-600">STK per ETH:</span>
                  <div className="font-mono text-lg">{prices.tokensPerEth} STK</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Raw Quote Data */}
          <div className="p-4 bg-green-100 border border-green-400 rounded">
            <h3 className="font-bold mb-2">Raw Quote Result:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
