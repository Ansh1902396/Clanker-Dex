"use client"

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useBalance, useEnsName } from 'wagmi'
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import MonkeyIcon from "@/components/icons/monkey"
import DotsVerticalIcon from "@/components/icons/dots-vertical"
import GearIcon from "@/components/icons/gear"
import Image from "next/image"
import { formatEther } from 'viem'

interface WalletConnectProps {
  onConnect?: () => void
  onDisconnect?: () => void
  className?: string
}

export function WalletConnect({ onConnect, onDisconnect, className }: WalletConnectProps) {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== 'loading'
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated')

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button
                    onClick={() => {
                      openConnectModal()
                      onConnect?.()
                    }}
                    className="w-full h-auto p-4 bg-sidebar-accent hover:bg-sidebar-accent-active/75 text-sidebar-accent-foreground border-0 justify-start gap-3"
                    variant="outline"
                  >
                    <div className="shrink-0 flex size-12 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                      <MonkeyIcon className="size-6" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="text-lg font-display">Connect Wallet</span>
                      <span className="text-xs uppercase opacity-50">Get Started</span>
                    </div>
                  </Button>
                )
              }

              if (chain.unsupported) {
                return (
                  <Button
                    onClick={openChainModal}
                    className="w-full h-auto p-4 bg-red-500 hover:bg-red-600 text-white border-0 justify-start gap-3"
                    variant="outline"
                  >
                    <div className="shrink-0 flex size-12 items-center justify-center rounded-lg bg-red-600 text-white">
                      <MonkeyIcon className="size-6" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="text-lg font-display">Wrong Network</span>
                      <span className="text-xs uppercase opacity-50">Click to switch</span>
                    </div>
                  </Button>
                )
              }

              return (
                <WalletConnected 
                  account={account}
                  chain={chain}
                  openAccountModal={openAccountModal}
                  openChainModal={openChainModal}
                  onDisconnect={onDisconnect}
                />
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}

function WalletConnected({ 
  account, 
  chain, 
  openAccountModal, 
  openChainModal, 
  onDisconnect 
}: {
  account: any
  chain: any
  openAccountModal: () => void
  openChainModal: () => void
  onDisconnect?: () => void
}) {
  const { data: balance } = useBalance({
    address: account.address,
  })
  
  const { data: ensName } = useEnsName({
    address: account.address,
  })

  const displayName = ensName || account.displayName
  const displayBalance = balance ? `${parseFloat(formatEther(balance.value)).toFixed(4)} ${balance.symbol}` : '0.0000 ETH'

  return (
    <Popover>
      <PopoverTrigger className="flex gap-0.5 w-full group cursor-pointer">
        <div className="shrink-0 flex size-14 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground overflow-clip">
          {account.ensAvatar ? (
            <Image 
              src={account.ensAvatar} 
              alt={displayName} 
              width={56} 
              height={56}
              className="rounded-lg"
            />
          ) : (
            <MonkeyIcon className="size-8" />
          )}
        </div>
        <div className="group/item pl-3 pr-1.5 pt-2 pb-1.5 flex-1 flex bg-sidebar-accent hover:bg-sidebar-accent-active/75 items-center rounded group-data-[state=open]:bg-sidebar-accent-active group-data-[state=open]:hover:bg-sidebar-accent-active group-data-[state=open]:text-sidebar-accent-foreground">
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate text-xl font-display">{displayName}</span>
            <span className="truncate text-xs uppercase opacity-50 group-hover/item:opacity-100">
              {account.displayBalance ? account.displayBalance : account.address}
            </span>
            <span className="truncate text-xs font-mono opacity-75 group-hover/item:opacity-100">
              {displayBalance}
            </span>
          </div>
          <DotsVerticalIcon className="ml-auto size-4" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" side="bottom" align="end" sideOffset={4}>
        <div className="flex flex-col">
          <button
            onClick={() => {
              openAccountModal()
            }}
            className="flex items-center px-4 py-2 text-sm hover:bg-accent transition-colors"
          >
            <MonkeyIcon className="mr-2 h-4 w-4" />
            Account Details
          </button>
          <button
            onClick={openChainModal}
            className="flex items-center px-4 py-2 text-sm hover:bg-accent transition-colors"
          >
            <GearIcon className="mr-2 h-4 w-4" />
            Switch Network
          </button>
          <ConnectButton.Custom>
            {({ openAccountModal }) => (
              <button
                onClick={() => {
                  // The actual disconnect will be handled by RainbowKit's modal
                  openAccountModal()
                  onDisconnect?.()
                }}
                className="flex items-center px-4 py-2 text-sm hover:bg-accent transition-colors text-red-500"
              >
                <MonkeyIcon className="mr-2 h-4 w-4" />
                Manage Wallet
              </button>
            )}
          </ConnectButton.Custom>
        </div>
      </PopoverContent>
    </Popover>
  )
}
