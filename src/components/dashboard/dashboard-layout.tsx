"use client"

import type { ReactNode } from "react"
import { ConnectButton } from "@/components/wallet/connect-button"
import DashboardSignupIntegration from "@/components/dashboard-signup-integration"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Trophy, Users, Zap, Bell, Menu, BirdIcon as Cricket, Coins } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { formatAddress } from "@/lib/utils"
import { motion } from "framer-motion"
import type { Chain } from "wagmi"

// Define navigation items outside component to avoid re-creation
const navItems = [
  { icon: <Trophy className="h-5 w-5" />, label: "Matches", active: true },
  { icon: <Users className="h-5 w-5" />, label: "Leaderboard" },
  { icon: <Zap className="h-5 w-5" />, label: "Rewards" },
  { icon: <Bell className="h-5 w-5" />, label: "Notifications" },
]

interface DashboardLayoutProps {
  children: ReactNode
  isConnected: boolean
  address?: string
  chain?: Chain
  tokenBalance?: bigint
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (open: boolean) => void
  chains: Chain[]
}

export default function DashboardLayout({
  children,
  isConnected,
  address,
  chain,
  tokenBalance,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  chains,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen">
      {/* Mobile Menu */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
          <SheetHeader className="p-6 border-b">
            <SheetTitle className="flex items-center gap-2">
              <Cricket className="h-6 w-6 text-primary" />
              <span>Cricket Prophet</span>
            </SheetTitle>
            <SheetDescription>Make predictions on cricket matches</SheetDescription>
          </SheetHeader>
          <div className="py-4">
            {isConnected && address && (
              <div className="px-6 py-4 border-b">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-10 w-10 border-2 border-primary">
                    <AvatarFallback>{address?.slice(2, 4)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{formatAddress(address)}</p>
                    <Badge variant={chain?.id === 11155111 ? "default" : "destructive"} className="mt-1">
                      {chains.find((c) => c.id === chain?.id)?.name || "Unknown Network"}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Coins className="h-4 w-4 text-primary" />
                    <span>{tokenBalance ? tokenBalance.toString() : "0"} CPT</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="h-4 w-4 text-primary" />
                    <span>67% Win Rate</span>
                  </div>
                </div>
              </div>
            )}
            <nav className="px-2 py-4">
              <ul className="space-y-1">
                {navItems.map((item, i) => (
                  <li key={i}>
                    <Button
                      variant={item.active ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.icon}
                      <span className="ml-2">{item.label}</span>
                    </Button>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="px-6 pt-4 mt-4 border-t">
              {!isConnected ? (
                <ConnectButton />
              ) : (
                <>
                  <DashboardSignupIntegration className="w-full mb-2" />
                  <Button variant="outline" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                    Close Menu
                  </Button>
                </>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Layout */}
      <div className="flex min-h-screen">
        {/* Sidebar - Desktop only */}
        <aside className="hidden lg:flex flex-col w-64 border-r bg-card/50 backdrop-blur-sm">
          <div className="p-6 border-b">
            <div className="flex items-center gap-2 mb-2">
              <motion.div
                initial={{ rotate: -10 }}
                animate={{ rotate: 10 }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                  duration: 1.5,
                }}
              >
                <Cricket className="h-6 w-6 text-primary" />
              </motion.div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Cricket Prophet
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">Predict & win with blockchain</p>
          </div>

          {isConnected && address && (
            <div className="p-4 border-b">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-10 w-10 border-2 border-primary">
                  <AvatarFallback>{address.slice(2, 4)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{formatAddress(address)}</p>
                  <Badge variant={chain?.id === 11155111 ? "default" : "destructive"} className="mt-1">
                    {chains.find((c) => c.id === chain?.id)?.name || "Unknown Network"}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <Coins className="h-4 w-4 text-primary" />
                  <span>{tokenBalance ? tokenBalance.toString() : "0"} CPT</span>
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="h-4 w-4 text-primary" />
                  <span>67% Win Rate</span>
                </div>
              </div>
            </div>
          )}

          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navItems.map((item, i) => (
                <li key={i}>
                  <Button variant={item.active ? "default" : "ghost"} className="w-full justify-start">
                    {item.icon}
                    <span className="ml-2">{item.label}</span>
                  </Button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4 border-t mt-auto">
            <div className="flex items-center justify-between">{!isConnected && <ConnectButton />}</div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-10 backdrop-blur-md bg-background/80 border-b">
            <div className="container flex h-16 items-center justify-between px-4">
              <div className="flex items-center gap-2 lg:hidden">
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
                  <Menu className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Cricket Prophet
                </h1>
              </div>
              <div className="hidden lg:block">
                <h2 className="text-xl font-bold">Dashboard</h2>
              </div>
              <div className="flex items-center gap-4">
                <DashboardSignupIntegration className="hidden md:flex" />
                <ConnectButton />
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 container px-4 py-6">{children}</main>
        </div>
      </div>
    </div>
  )
}

