"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'
import { type Token as ClankerToken } from '@/lib/schemas/clanker'

interface NavigationContextType {
  selectedToken: ClankerToken | null
  setSelectedToken: (token: ClankerToken | null) => void
  openTradeModal: boolean
  setOpenTradeModal: (open: boolean) => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [selectedToken, setSelectedToken] = useState<ClankerToken | null>(null)
  const [openTradeModal, setOpenTradeModal] = useState(false)

  const handleSetSelectedToken = useCallback((token: ClankerToken | null) => {
    setSelectedToken(token)
    if (token) {
      setOpenTradeModal(true)
    }
  }, [])

  return (
    <NavigationContext.Provider
      value={{
        selectedToken,
        setSelectedToken: handleSetSelectedToken,
        openTradeModal,
        setOpenTradeModal,
      }}
    >
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context
}
