'use client'

import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import {
  base,
} from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'M.O.N.K.Y DEX',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID', // Get this from https://cloud.walletconnect.com
  chains: [
    base,
  ],
  ssr: true, // If your dApp uses server side rendering (SSR)
})
