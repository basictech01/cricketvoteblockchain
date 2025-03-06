"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, ArrowRight } from "lucide-react"
import type { Chain } from "wagmi"

interface NetworkSwitchDialogProps {
  showNetworkDialog: boolean
  setShowNetworkDialog: (show: boolean) => void
  chain?: Chain
  chains: Chain[]
  handleSwitchToSepolia: () => Promise<void>
}

export default function NetworkSwitchDialog({
  showNetworkDialog,
  setShowNetworkDialog,
  chain,
  chains,
  handleSwitchToSepolia,
}: NetworkSwitchDialogProps) {
  return (
    <Dialog open={showNetworkDialog} onOpenChange={setShowNetworkDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Network Change Required
          </DialogTitle>
          <DialogDescription>
            Cricket Prophet requires the Sepolia test network. Please switch your network to continue.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="flex items-center gap-4 w-full">
            <Badge variant="outline" className="text-muted-foreground flex-1 justify-center py-2">
              Current: {chains.find((c) => c.id === chain?.id)?.name || "Unknown Network"}
            </Badge>
            <ArrowRight className="h-6 w-6 text-muted-foreground animate-pulse" />
            <Badge className="flex-1 justify-center py-2 bg-primary">Required: Sepolia</Badge>
          </div>
          <div className="text-sm text-muted-foreground text-center">
            Switching networks will allow you to interact with the Cricket Prophet platform and place predictions.
          </div>
        </div>
        <DialogFooter className="flex justify-center sm:justify-center gap-2">
          <Button onClick={handleSwitchToSepolia} className="w-full sm:w-auto">
            Switch to Sepolia
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

