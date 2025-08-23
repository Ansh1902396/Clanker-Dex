"use client"

import React from "react"
import { V0Provider } from "@/lib/v0-context"
import { SidebarProvider } from "@/components/ui/sidebar"
import { MobileHeader } from "@/components/dashboard/mobile-header"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { Providers } from "@/components/providers"
import mockDataJson from "@/mock.json"
import type { MockData } from "@/types/dashboard"
import Widget from "@/components/dashboard/widget"
import TokenList, { type Token } from "@/components/dashboard/token-list"
import { useState, useEffect } from "react"

const mockData = mockDataJson as MockData
const isV0 = process.env["VERCEL_URL"]?.includes("vusercontent.net") ?? false

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [selectedToken, setSelectedToken] = useState<Token | null>(null)

  const handleTokenSelect = (token: Token) => {
    console.log("[v0] ClientLayout: Token selected:", token.symbol)
    setSelectedToken(token)
  }

  useEffect(() => {
    console.log("[v0] ClientLayout: selectedToken changed:", selectedToken?.symbol || "null")
  }, [selectedToken])

  return (
    <Providers>
      <V0Provider isV0={isV0}>
        <SidebarProvider>
          {/* Mobile Header - only visible on mobile */}
          <MobileHeader mockData={mockData} />

          {/* Desktop Layout */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-gap lg:px-sides">
            <div className="hidden lg:block col-span-2 top-0 relative">
              <DashboardSidebar />
            </div>
            <div className="col-span-1 lg:col-span-7">
              {React.isValidElement(children) 
                ? React.cloneElement(children, { selectedToken } as any)
                : children
              }
            </div>
            <div className="col-span-3 hidden lg:block">
              <div className="space-y-gap py-sides min-h-screen max-h-screen sticky top-0 overflow-y-auto">
                <Widget widgetData={mockData.widgetData} />
                <TokenList onTokenSelect={handleTokenSelect} />
              </div>
            </div>
          </div>
        </SidebarProvider>
      </V0Provider>
    </Providers>
  )
}
