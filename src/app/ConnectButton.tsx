// ConnectButton.tsx
"use client";
import { useState } from "react";
import { useConnect, useAccount, useDisconnect, Connector } from "wagmi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronDown, LogOut, Wallet } from "lucide-react";

export function ConnectButton() {
  const { address, connector, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  // Format address for display
  const formatAddress = (addr: string | undefined): string => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // If connected, show the account dropdown
  if (isConnected && address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={`https://effigy.im/a/${address}.svg`}
                alt="Avatar"
              />
              <AvatarFallback>
                <Wallet className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <span>{formatAddress(address)}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            Connected with {connector?.name}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigator.clipboard.writeText(address)}
          >
            Copy Address
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex items-center gap-2 text-red-500 cursor-pointer"
            onClick={() => disconnect()}
          >
            <LogOut className="h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // If not connected, show the connect button that opens dialog
  return (
    <>
      <Button onClick={() => setIsDialogOpen(true)}>Connect Wallet</Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Wallet</DialogTitle>
            <DialogDescription>
              Choose your preferred wallet to connect to this application.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {connectors.map((connector: Connector) => {
              return (
                <Card
                  key={connector.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg">{connector.name}</CardTitle>
                  </CardHeader>
                  <CardFooter className="p-4 pt-0 flex justify-end">
                    <Button
                      onClick={() => {
                        connect({ connector });
                        setIsDialogOpen(false);
                      }}
                      disabled={isPending}
                    >
                      {isPending ? "Connecting..." : "Connect"}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
