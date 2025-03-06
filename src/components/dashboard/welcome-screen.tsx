"use client"

import { motion } from "framer-motion"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { BirdIcon as Cricket, Trophy, Coins, BarChart3 } from "lucide-react"
import { ConnectButton } from "@/components/wallet/connect-button"

export default function WelcomeScreen() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-12"
    >
      <Card className="w-full max-w-md overflow-hidden border-primary/20">
        <CardHeader className="bg-primary/5 text-center">
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: 10 }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              duration: 1.5,
            }}
            className="mx-auto mb-4"
          >
            <Cricket className="h-12 w-12 text-primary" />
          </motion.div>
          <CardTitle className="text-2xl">Welcome to Cricket Prophet</CardTitle>
          <CardDescription>
            Connect your wallet to start making predictions on cricket matches and earn rewards.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Trophy className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Make Predictions</h3>
                <p className="text-sm text-muted-foreground">Predict outcomes of cricket matches</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Coins className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Earn Rewards</h3>
                <p className="text-sm text-muted-foreground">Win CPT tokens for correct predictions</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Track Performance</h3>
                <p className="text-sm text-muted-foreground">Monitor your prediction history and stats</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center p-6 bg-primary/5">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <ConnectButton />
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

