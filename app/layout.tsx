import type React from "react"
import { Roboto_Mono } from "next/font/google"
import "./globals.css"
import type { Metadata } from "next"
import localFont from "next/font/local"
import ClientLayout from "./client-layout"

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
})

const rebelGrotesk = localFont({
  src: "../public/fonts/Rebels-Fett.woff2",
  variable: "--font-rebels",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    template: "%s – M.O.N.K.Y DEX",
    default: "M.O.N.K.Y DEX",
  },
  description: "Decentralized exchange for rebels. Trade tokens with confidence.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preload" href="/fonts/Rebels-Fett.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className={`${rebelGrotesk.variable} ${robotoMono.variable} antialiased`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
