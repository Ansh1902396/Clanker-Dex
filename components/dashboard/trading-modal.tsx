"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { X, ArrowUpDown, RefreshCw } from "lucide-react"
import { useClankerQuote } from "@/hooks/use-clanker-quote"
import { useWallet } from "@/hooks/use-wallet"
import { useTokenBalances } from "@/hooks/use-token-balances"
import { useToken } from "@/contexts/token-context"
import Image from "next/image"
import type { Token } from "@/components/dashboard/token-list"
import type { TradeParams, TokenBalance, TradeResult } from "@/types/trading"

interface TradingModalProps {
  isOpen: boolean
  onClose: () => void
  onTrade?: (tradeParams: TradeParams) => Promise<TradeResult>
  isLoading?: boolean
}

// SOULB Token Configuration from Clanker
const SOULB_TOKEN = {
  address: "0xa6106BB43A4679D3Ec2b275195F7FAf59e0Cef66",
  symbol: "STK",
  name: "SOULB",
  decimals: 18,
  chainId: 8453,
  pairedToken: "0x4200000000000000000000000000000000000006", // WETH on Base
}

const ETH_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" // Standard ETH placeholder
const TAKER_ADDRESS = "0xcFE743EA353d4d3D2c20C41C7d878B2cbA66DA0a" // Default taker from token data

export default function TradingModal({ 
  isOpen, 
  onClose, 
  onTrade,
  isLoading = false 
}: TradingModalProps) {
  // Get selected token from context
  const { selectedToken } = useToken()
  
  const [currentToken, setCurrentToken] = useState(selectedToken?.symbol || "STK")
  const [sellAmount, setSellAmount] = useState("")
  const [buyAmount, setBuyAmount] = useState("")
  const [isSwapped, setIsSwapped] = useState(false)
  const [exchangeRate, setExchangeRate] = useState<number | null>(null)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [quoteTimeout, setQuoteTimeout] = useState<NodeJS.Timeout | null>(null)
  const [lastQuoteTime, setLastQuoteTime] = useState<number>(0)

  // Get wallet connection status
  const { isConnected, address } = useWallet()

  // Get real token balances
  const { 
    balances, 
    isLoading: balancesLoading, 
    error: balancesError, 
    refreshBalances 
  } = useTokenBalances()

  // Initialize Clanker quote hook
  const { data: quoteData, loading: clankerLoading, error: quoteError, getQuote } = useClankerQuote({
    onSuccess: (data) => {
      console.log("[Trading Modal] Quote SUCCESS - Full response:", data)
      
      // Extract and format the buy amount from quote data
      if (data && data.buyAmount) {
        console.log("[Trading Modal] Processing buyAmount:", data.buyAmount)
        
        try {
          // buyAmount from API is in wei string format, convert to number
          const buyAmountWei = data.buyAmount.toString()
          const buyAmountNumber = parseFloat(buyAmountWei) / Math.pow(10, 18)
          
          console.log("[Trading Modal] Conversion:", {
            buyAmountWei,
            buyAmountNumber,
            sellAmount,
            isSwapped
          })
          
          // Handle very small amounts better
          let formattedDisplay: string
          if (buyAmountNumber === 0) {
            formattedDisplay = "0"
          } else if (buyAmountNumber < 0.000001) {
            // For very small amounts, use scientific notation
            formattedDisplay = buyAmountNumber.toExponential(6)
          } else if (buyAmountNumber < 1) {
            // For small amounts, show more decimals
            formattedDisplay = buyAmountNumber.toFixed(8)
          } else {
            // For larger amounts, show fewer decimals
            formattedDisplay = buyAmountNumber.toFixed(6)
          }
          
          console.log("[Trading Modal] Setting buyAmount to:", formattedDisplay)
          setBuyAmount(formattedDisplay)
          setLastQuoteTime(Date.now()) // Force re-render
          
          // Calculate exchange rate
          const sellAmountNum = parseFloat(sellAmount || "0")
          if (sellAmountNum > 0 && buyAmountNumber > 0) {
            const rate = buyAmountNumber / sellAmountNum
            console.log("[Trading Modal] Setting exchange rate to:", rate)
            setExchangeRate(rate)
          }
        } catch (error) {
          console.error("[Trading Modal] Error processing quote:", error)
          setBuyAmount("Error")
        }
      } else {
        console.warn("[Trading Modal] No buyAmount in quote response:", data)
        setBuyAmount("No quote available")
      }
    },
    onError: (error) => {
      console.error("[Trading Modal] Quote ERROR:", error)
      setBuyAmount("Error getting quote")
      setExchangeRate(null)
    }
  })

  useEffect(() => {
    if (selectedToken) {
      console.log("[Trading Modal] Setting currentToken to:", selectedToken.symbol)
      setCurrentToken(selectedToken.symbol)
    }
  }, [selectedToken])

  useEffect(() => {
    console.log("[Trading Modal] currentToken changed to:", currentToken)
  }, [currentToken])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (quoteTimeout) {
        clearTimeout(quoteTimeout)
      }
    }
  }, [quoteTimeout])

  // Get balances using the real token balances hook
  const getTokenBalance = (symbol: string): number => {
    const balance = balances.find((b: TokenBalance) => b.symbol === symbol)
    return balance ? balance.balance : 0
  }

  const ethBalance = getTokenBalance("ETH")
  const stkBalance = getTokenBalance(selectedToken?.symbol || "STK")

  // Get real-time quote from Clanker API
  const getQuoteFromClanker = useCallback(async (amount: string) => {
    if (!amount || isNaN(Number(amount))) return
    if (!selectedToken) {
      console.error("[Trading Modal] No selected token available for quote")
      setBuyAmount("No token selected")
      return
    }
    
    console.log("[Trading Modal] Selected token for quote:", {
      symbol: selectedToken.symbol,
      contractAddress: selectedToken.contractAddress,
      name: selectedToken.name
    })
    
    const amountNum = Number(amount)
    if (amountNum <= 0) return
    
    // Set minimum amount to prevent API errors - very small amounts like 0.0001 ETH
    if (amountNum < 0.00001) {
      console.log("[Trading Modal] Amount too small for quote:", amountNum)
      setBuyAmount("Amount too small")
      return
    }

    setQuoteLoading(true)
    setBuyAmount("") // Clear previous quote
    setExchangeRate(null)
    
    try {
      // Determine sell and buy tokens based on swap direction - USE SELECTED TOKEN ADDRESS
      const sellToken = isSwapped ? selectedToken.contractAddress : ETH_ADDRESS
      const buyToken = isSwapped ? ETH_ADDRESS : selectedToken.contractAddress
      
      // Convert to wei with higher precision for small amounts
      const sellAmountWei = (amountNum * Math.pow(10, 18)).toString()

      console.log("[Trading Modal] Getting quote for:", {
        sellToken: isSwapped ? selectedToken.symbol : "ETH",
        buyToken: isSwapped ? "ETH" : selectedToken.symbol, 
        sellAmount: amount,
        sellAmountWei,
        isSwapped,
        sellTokenAddress: sellToken,
        buyTokenAddress: buyToken,
        selectedTokenContract: selectedToken.contractAddress
      })

      await getQuote({
        chainId: 8453, // Base chain - tokens should be on Base
        sellToken,
        buyToken,
        sellAmount: sellAmountWei,
        taker: address || TAKER_ADDRESS, // Use connected wallet address if available
        swapFeeRecipient: "0x1eaf444ebDf6495C57aD52A04C61521bBf564ace",
        swapFeeBps: 100,
        swapFeeToken: buyToken,
        tradeSurplusRecipient: "0x1eaf444ebDf6495C57aD52A04C61521bBf564ace",
      })
    } catch (error) {
      console.error("[Trading Modal] Failed to get quote:", error)
      setBuyAmount("Quote failed")
    } finally {
      setQuoteLoading(false)
    }
  }, [getQuote, address, selectedToken, isSwapped]) // Add selectedToken and isSwapped to dependencies

  const handleSwapDirection = () => {
    setIsSwapped(!isSwapped)
    setSellAmount("")
    setBuyAmount("")
    setExchangeRate(null)
    console.log("[Trading Modal] Swap direction changed to:", !isSwapped)
  }

  const handleSellAmountChange = (value: string) => {
    setSellAmount(value)
    setBuyAmount("") // Clear buy amount while getting new quote
    setExchangeRate(null) // Clear exchange rate
    
    // Clear existing timeout
    if (quoteTimeout) {
      clearTimeout(quoteTimeout)
    }
    
    if (value && !isNaN(Number(value)) && Number(value) > 0) {
      // Debounce the quote API call by 500ms
      const timeout = setTimeout(() => {
        getQuoteFromClanker(value)
      }, 500)
      setQuoteTimeout(timeout)
    }
  }

  const handlePercentage = (percentage: number, isSell: boolean) => {
    const balance = isSell ? (isSwapped ? stkBalance : ethBalance) : isSwapped ? ethBalance : stkBalance
    const calculatedAmount = (balance * percentage) / 100
    
    // Format the amount based on the token type
    let formattedAmount: string
    if (isSwapped && isSell) {
      // Selling STK tokens - show with 2 decimal places for readability
      formattedAmount = calculatedAmount.toFixed(2)
    } else {
      // Selling ETH - show with 6 decimal places for precision
      formattedAmount = calculatedAmount.toFixed(6)
    }
    
    console.log("[Trading Modal] Percentage calculation:", {
      percentage,
      balance,
      calculatedAmount,
      formattedAmount,
      isSwapped,
      isSell
    })

    if (isSell) {
      handleSellAmountChange(formattedAmount)
    }
  }

  const handleTrade = async () => {
    if (!quoteData) {
      console.error("[Trading Modal] No quote data available")
      return
    }

    if (!selectedToken) {
      console.error("[Trading Modal] No selected token available")
      return
    }

    const tradeParams: TradeParams = {
      sellToken: isSwapped ? selectedToken.contractAddress : ETH_ADDRESS,
      buyToken: isSwapped ? ETH_ADDRESS : selectedToken.contractAddress,
      sellAmount,
      buyAmount,
      isSwapped,
      quoteData // Pass the quote data for execution
    }

    console.log("[Trading Modal] Executing trade:", tradeParams)
    
    try {
      if (onTrade) {
        const result = await onTrade(tradeParams)
        if (result.success) {
          console.log("[Trading Modal] Trade successful:", result)
          // Close modal on successful trade
          onClose()
        } else {
          console.error("[Trading Modal] Trade failed:", result.error)
          // TODO: Show error message to user
        }
      } else {
        // Default behavior if no onTrade handler is provided
        console.log("[Trading Modal] No trade handler provided - using default behavior")
        // TODO: Implement default trading logic here
        // - Connect to wallet
        // - Execute swap transaction using quoteData
        // - Handle success/error states
        // - Update balances
        onClose()
      }
    } catch (error) {
      console.error("[Trading Modal] Trade failed:", error)
      // TODO: Show error message to user
      // You could add error state here and display it in the UI
    }
  }

  const currentSellToken = isSwapped ? currentToken : "ETH"
  const currentBuyToken = isSwapped ? "ETH" : currentToken
  const currentSellBalance = isSwapped ? stkBalance : ethBalance
  const currentBuyBalance = isSwapped ? ethBalance : stkBalance

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="w-full max-w-lg mx-4 bg-gradient-to-br from-background/95 to-background/80 border-accent/20 shadow-2xl backdrop-blur-sm">
        <CardHeader className="space-y-4 pb-6">
          {/* Header with Close Button */}
          <div className="flex items-center justify-between">
            <CardTitle className="font-display text-xl text-foreground/90">
              Trade {selectedToken ? selectedToken.symbol : currentToken}
            </CardTitle>
            <div className="flex items-center space-x-2">
              {isConnected && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshBalances}
                  disabled={balancesLoading}
                  className="p-2 hover:bg-accent/10"
                >
                  <RefreshCw className={`h-4 w-4 ${balancesLoading ? 'animate-spin' : ''}`} />
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="p-2 hover:bg-accent/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Error Display */}
          {(balancesError || quoteError) && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2 text-red-800">
                <span className="text-sm font-medium">❌ Error</span>
              </div>
              <p className="text-sm text-red-700 mt-1">
                {balancesError || quoteError?.message}
              </p>
            </div>
          )}

          {/* Wallet Connection Status */}
          {!isConnected && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2 text-yellow-800">
                <span className="text-sm font-medium">⚠️ Wallet not connected</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Connect your wallet to see real balances and execute trades
              </p>
            </div>
          )}

          {/* Loading Balances */}
          {balancesLoading && isConnected && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 text-blue-800">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="text-sm font-medium">Loading balances...</span>
              </div>
            </div>
          )}

          {/* Sell Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-base text-muted-foreground">Sell</span>
              <div className="flex items-center space-x-2">
                <span className="text-base text-muted-foreground">
                  Balance: {currentSellBalance.toFixed(6)} {currentSellToken}
                </span>
                {!isConnected && <span className="text-yellow-600 text-sm">(Demo)</span>}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="0.0"
                value={sellAmount}
                onChange={(e) => handleSellAmountChange(e.target.value)}
                className="flex-1 text-3xl font-mono bg-background/50"
              />
              <Badge variant="secondary" className="px-3 py-2 text-base">
                {currentSellToken}
              </Badge>
            </div>
            {/* Minimum amount helper */}
            {currentSellToken === "ETH" && (
              <div className="text-xs text-muted-foreground">
                Minimum: 0.00001 ETH (~$0.024)
              </div>
            )}
            <div className="flex gap-2">
              {/* Dynamic preset amounts based on sell token */}
              {!isSwapped ? (
                // Selling ETH - show ETH amounts
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-sm bg-transparent"
                    onClick={() => handleSellAmountChange("0.001")}
                  >
                    0.001 ETH
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-sm bg-transparent"
                    onClick={() => handleSellAmountChange("0.01")}
                  >
                    0.01 ETH
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-sm bg-transparent"
                    onClick={() => handleSellAmountChange("0.1")}
                  >
                    0.1 ETH
                  </Button>
                </>
              ) : (
                // Selling STK - show percentage buttons
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-sm bg-transparent"
                    onClick={() => handlePercentage(10, true)}
                  >
                    10%
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-sm bg-transparent"
                    onClick={() => handlePercentage(25, true)}
                  >
                    25%
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-sm bg-transparent"
                    onClick={() => handlePercentage(50, true)}
                  >
                    50%
                  </Button>
                </>
              )}
              {/* Max button for both directions */}
              <Button
                variant="outline"
                size="sm"
                className="text-sm bg-transparent"
                onClick={() => handlePercentage(100, true)}
              >
                Max
              </Button>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSwapDirection}
              className="w-10 h-10 rounded-full bg-accent/20 hover:bg-accent/30 flex items-center justify-center"
            >
              <ArrowUpDown className="h-5 w-5 text-accent" />
            </Button>
          </div>

          {/* Buy Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-base text-muted-foreground">Buy</span>
              <div className="flex items-center space-x-2">
                <span className="text-base text-muted-foreground">
                  Balance: {currentBuyBalance.toFixed(6)} {currentBuyToken}
                </span>
                {!isConnected && <span className="text-yellow-600 text-sm">(Demo)</span>}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                placeholder={quoteLoading || clankerLoading ? "Getting quote..." : "0.0"}
                value={buyAmount}
                readOnly
                className="flex-1 text-3xl font-mono bg-background/50"
              />
              <Badge variant="secondary" className="px-3 py-2 text-base">
                {currentBuyToken}
              </Badge>
              {(quoteLoading || clankerLoading) && (
                <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            
            {/* Exchange Rate Display */}
            {exchangeRate && buyAmount && sellAmount && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm text-blue-800 space-y-1">
                  <div className="flex justify-between">
                    <span>Exchange Rate:</span>
                    <span className="font-mono">1 {currentSellToken} = {exchangeRate.toFixed(8)} {currentBuyToken}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>You Pay:</span>
                    <span className="font-mono">{parseFloat(sellAmount).toFixed(6)} {currentSellToken}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>You Receive:</span>
                    <span className="font-mono">{parseFloat(buyAmount).toFixed(6)} {currentBuyToken}</span>
                  </div>
                </div>
              </div>
            )}
            
            {quoteError && (
              <div className="text-sm text-red-500 text-center p-2 bg-red-50 rounded">
                Failed to get quote: {quoteError.message}
              </div>
            )}

            {/* Debug Info - Remove in production */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded space-y-1">
                <div>Quote Loading: {quoteLoading || clankerLoading ? 'Yes' : 'No'}</div>
                <div>Has Quote Data: {quoteData ? 'Yes' : 'No'}</div>
                <div>Buy Amount: {buyAmount || 'None'}</div>
                <div>Exchange Rate: {exchangeRate ? exchangeRate.toFixed(8) : 'None'}</div>
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-sm bg-transparent" disabled>
                10%
              </Button>
              <Button variant="outline" size="sm" className="text-sm bg-transparent" disabled>
                25%
              </Button>
              <Button variant="outline" size="sm" className="text-sm bg-transparent" disabled>
                50%
              </Button>
              <Button variant="outline" size="sm" className="text-sm bg-transparent" disabled>
                Max
              </Button>
            </div>
          </div>

          <Button
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 font-display text-lg"
            disabled={
              !sellAmount || 
              Number(sellAmount) <= 0 || 
              isLoading || 
              quoteLoading || 
              clankerLoading || 
              !buyAmount ||
              balancesLoading ||
              !isConnected
            }
            onClick={handleTrade}
          >
            {!isConnected
              ? "Connect Wallet"
              : isLoading 
              ? "Processing..." 
              : (quoteLoading || clankerLoading)
              ? "Getting Quote..."
              : balancesLoading
              ? "Loading Balances..."
              : !buyAmount
              ? "Enter Amount"
              : `${isSwapped ? "Sell" : "Buy"} ${currentBuyToken}`
            }
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
