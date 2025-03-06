"use client"

import { motion } from "framer-motion"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Wallet, Coins, Trophy, BarChart3 } from "lucide-react"
import { formatAddress } from "@/lib/utils"
import type { Chain } from "wagmi"

interface MobileAccountOverviewProps {
  address?: string
  chain?: Chain
  chains: Chain[]
  tokenBalance?: bigint
  isBalanceLoading: boolean
}

export default function MobileAccountOverview({
  address,
  chain,
  chains,
  tokenBalance,
  isBalanceLoading,
}: MobileAccountOverviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="lg:hidden grid gap-4 md:grid-cols-3 mb-6"
    >
      <Card className="overflow-hidden border-primary/20 hover:border-primary/50 transition-colors duration-300">
        <CardHeader className="pb-2 bg-primary/5">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 bg-primary/10">
              <AvatarFallback>{address?.slice(2, 4)}</AvatarFallback>
            </Avatar>
            <p className="text-xl font-bold">{formatAddress(address || "")}</p>
          </div>
          {chain && (
            <Badge variant={chain?.id === 11155111 ? "default" : "destructive"} className="mt-2">
              {chains.find((c) => c.id === chain?.id)?.name || "Unknown Network"}
            </Badge>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-primary/20 hover:border-primary/50 transition-colors duration-300">
        <CardHeader className="pb-2 bg-primary/5">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Coins className="h-4 w-4 text-primary" />
            Token Balance
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {isBalanceLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping"></div>
                <div className="relative h-8 w-8 rounded-full bg-primary/30 flex items-center justify-center">
                  <Coins className="h-4 w-4 text-primary" />
                </div>
              </div>
              <p className="text-xl font-bold">
                {tokenBalance ? tokenBalance.toString() : "0"}
                <span className="text-primary ml-1">CPT</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-primary/20 hover:border-primary/50 transition-colors duration-300">
        <CardHeader className="pb-2 bg-primary/5">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Prediction Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-8 rounded-full bg-primary/30 flex items-center justify-center">
              <Trophy className="h-4 w-4 text-primary" />
            </div>
            <p className="text-xl font-bold">67% Win Rate</p>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span>10 wins</span>
              <span>15 total</span>
            </div>
            <Progress value={67} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

