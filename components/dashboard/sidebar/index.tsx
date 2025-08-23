"use client"

import type * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import AtomIcon from "@/components/icons/atom"
import BracketsIcon from "@/components/icons/brackets"
import ProcessorIcon from "@/components/icons/proccesor"
import CuteRobotIcon from "@/components/icons/cute-robot"
import EmailIcon from "@/components/icons/email"
import GearIcon from "@/components/icons/gear"
import MonkeyIcon from "@/components/icons/monkey"
import { Bullet } from "@/components/ui/bullet"
import LockIcon from "@/components/icons/lock"
import { WalletConnect } from "../wallet/wallet-connect"

export function DashboardSidebar({ className, ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  const navData = {
    navMain: [
      {
        title: "Exchange",
        items: [
          {
            title: "Token Overview",
            url: "/",
            icon: BracketsIcon,
            isActive: pathname === "/",
          },
          {
            title: "Create Token",
            url: "/create-token",
            icon: AtomIcon,
            isActive: pathname === "/create-token",
          },
          {
            title: "Trading Pairs",
            url: "/trading-pairs",
            icon: ProcessorIcon,
            isActive: pathname === "/trading-pairs",
          },
          {
            title: "Liquidity Pools",
            url: "/liquidity",
            icon: CuteRobotIcon,
            isActive: pathname === "/liquidity",
          },
          {
            title: "Portfolio",
            url: "/portfolio",
            icon: EmailIcon,
            isActive: pathname === "/portfolio",
          },
          {
            title: "Settings",
            url: "/settings",
            icon: GearIcon,
            isActive: pathname === "/settings",
          },
        ],
      },
    ],
  }

  const handleWalletConnect = () => {
    console.log("Wallet connected")
    // Add your wallet connection logic here
  }

  const handleWalletDisconnect = () => {
    console.log("Wallet disconnected")
    // Add your wallet disconnection logic here
  }

  return (
    <Sidebar {...props} className={cn("py-sides", className)}>
      <SidebarHeader className="rounded-t-lg flex gap-3 flex-row rounded-b-none">
        <div className="flex overflow-clip size-12 shrink-0 items-center justify-center rounded bg-sidebar-primary-foreground/10 transition-colors group-hover:bg-sidebar-primary text-sidebar-primary-foreground">
          <MonkeyIcon className="size-10 group-hover:scale-[1.7] origin-top-left transition-transform" />
        </div>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="text-2xl font-display">M.O.N.K.Y.</span>
          <span className="text-xs uppercase">Decentralized Exchange</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {navData.navMain.map((group, i) => (
          <SidebarGroup className={cn(i === 0 && "rounded-t-none")} key={group.title}>
            <SidebarGroupLabel>
              <Bullet className="mr-2" />
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem
                    key={item.title}
                    className={cn(item.locked && "pointer-events-none opacity-50")}
                    data-disabled={item.locked}
                  >
                    <SidebarMenuButton
                      asChild={!item.locked}
                      isActive={item.isActive}
                      disabled={item.locked}
                      className={cn("disabled:cursor-not-allowed", item.locked && "pointer-events-none")}
                    >
                      {item.locked ? (
                        <div className="flex items-center gap-3 w-full">
                          <item.icon className="size-5" />
                          <span>{item.title}</span>
                        </div>
                      ) : (
                        <Link href={item.url}>
                          <item.icon className="size-5" />
                          <span>{item.title}</span>
                        </Link>
                      )}
                    </SidebarMenuButton>
                    {item.locked && (
                      <SidebarMenuBadge>
                        <LockIcon className="size-5 block" />
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-0">
        <SidebarGroup>
          <SidebarGroupLabel>
            <Bullet className="mr-2" />
            Wallet
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <WalletConnect onConnect={handleWalletConnect} onDisconnect={handleWalletDisconnect} />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
