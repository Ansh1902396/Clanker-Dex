"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react'
import type { Token } from '@/components/dashboard/token-list'

interface TokenContextType {
  selectedToken: Token | null
  setSelectedToken: (token: Token | null) => void
}

const TokenContext = createContext<TokenContextType | undefined>(undefined)

export function TokenProvider({ children }: { children: ReactNode }) {
  const [selectedToken, setSelectedToken] = useState<Token | null>(null)

  console.log("[TokenContext] Current selectedToken:", selectedToken?.symbol || "null")

  return (
    <TokenContext.Provider value={{ selectedToken, setSelectedToken }}>
      {children}
    </TokenContext.Provider>
  )
}

export function useToken() {
  const context = useContext(TokenContext)
  if (context === undefined) {
    throw new Error('useToken must be used within a TokenProvider')
  }
  return context
}
