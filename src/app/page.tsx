"use client";

import { useState, useEffect } from "react";
import { WagmiProvider, createConfig, http, useReadContract } from "wagmi";
import { coinbaseWallet, walletConnect } from "wagmi/connectors";
import { sepolia, mainnet, polygon } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Web3AuthConnectorInstance from "./Web3AuthConnectorInstance";
import { ConnectButton } from "./ConnectButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Coins,
  Calendar,
  Clock,
  ArrowRight,
  AlertTriangle,
  Wallet,
  BarChart3,
  BirdIcon as Cricket,
} from "lucide-react";
import { useAccount } from "wagmi";
import abi from "../abis/Vote.json";
import { useSwitchChain } from "wagmi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

// Create a client
const queryClient = new QueryClient();

// Set up wagmi config
const config = createConfig({
  chains: [mainnet, sepolia, polygon],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
  },
  connectors: [
    walletConnect({
      projectId: "3314f39613059cb687432d249f1658d2",
      showQrModal: true,
    }),
    coinbaseWallet({ appName: "Cricket Prophet" }),
    Web3AuthConnectorInstance([mainnet, sepolia, polygon]),
  ],
});

export default function Home() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <DashBoard />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

function DashBoard() {
  const { chains, switchChain } = useSwitchChain();
  const { chain } = useAccount();
  const { address, isConnected } = useAccount();
  const [showNetworkDialog, setShowNetworkDialog] = useState(false);

  const { data: tokenBalance, isLoading: isBalanceLoading } = useReadContract({
    abi,
    address: "0xAaD3edE66EDa939C1d5876874A31798E02d3fdd2",
    functionName: "balanceOf",
    args: [address],
  });

  // Sample data for the dashboard
  const upcomingMatches = [
    { id: 1, teams: "India vs Australia", date: "2024-03-10", time: "14:00" },
    {
      id: 2,
      teams: "England vs South Africa",
      date: "2024-03-12",
      time: "15:30",
    },
    {
      id: 3,
      teams: "New Zealand vs Pakistan",
      date: "2024-03-15",
      time: "13:00",
    },
  ];

  const recentPredictions = [
    {
      id: 1,
      match: "India vs Sri Lanka",
      prediction: "India",
      result: "Won",
      reward: 25,
    },
    {
      id: 2,
      match: "Australia vs England",
      prediction: "England",
      result: "Lost",
      reward: 0,
    },
    {
      id: 3,
      match: "Pakistan vs Bangladesh",
      prediction: "Pakistan",
      result: "Won",
      reward: 15,
    },
  ];

  // Check if user is on Sepolia network
  useEffect(() => {
    if (isConnected && chain && chain.id !== sepolia.id) {
      setShowNetworkDialog(true);
    } else {
      setShowNetworkDialog(false);
    }
  }, [chain, isConnected]);

  // Handle network switch
  const handleSwitchToSepolia = async () => {
    try {
      switchChain({ chainId: sepolia.id });
    } catch (error) {
      console.error("Failed to switch network:", error);
    }
  };

  // Format address for display
  const formatAddress = (address: string | undefined) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Cricket className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Cricket Prophet</h1>
          </div>
          <div className="flex items-center gap-4">
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container px-4 py-6">
        {isConnected ? (
          <>
            {/* Account overview */}
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Wallet</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    <p className="text-2xl font-bold">
                      {formatAddress(address)}
                    </p>
                  </div>
                  {chain && (
                    <Badge
                      variant={chain?.id === sepolia.id ? "default" : "destructive"}
                      className="mt-2"
                    >
                      {chains.find((c) => c.id === chain?.id)?.name ||
                        "Unknown Network"}
                    </Badge>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Token Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isBalanceLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Coins className="h-4 w-4 text-muted-foreground" />
                      <p className="text-2xl font-bold">
                        {tokenBalance ? tokenBalance.toString() : "0"} CPT
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Prediction Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <p className="text-2xl font-bold">67% Win Rate</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    10 wins out of 15 predictions
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Dashboard tabs */}
            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="upcoming">Upcoming Matches</TabsTrigger>
                <TabsTrigger value="predictions">Your Predictions</TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {upcomingMatches.map((match) => (
                    <Card key={match.id}>
                      <CardHeader>
                        <CardTitle>{match.teams}</CardTitle>
                        <CardDescription>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{match.date}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            <span>{match.time} UTC</span>
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardFooter>
                        <Button className="w-full">
                          Make Prediction
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="predictions">
                <div className="grid gap-4">
                  {recentPredictions.map((prediction) => (
                    <Card key={prediction.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{prediction.match}</h3>
                            <p className="text-sm text-muted-foreground">
                              Predicted: {prediction.prediction}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge
                              variant={
                                prediction.result === "Won"
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {prediction.result}
                            </Badge>
                            <p className="text-sm mt-1">
                              {prediction.reward > 0
                                ? `+${prediction.reward} CPT`
                                : "No reward"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Welcome to Cricket Prophet</CardTitle>
                <CardDescription>
                  Connect your wallet to start making predictions on cricket
                  matches and earn rewards.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ConnectButton />
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Network switch dialog */}
      <Dialog open={showNetworkDialog} onOpenChange={setShowNetworkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Network Change Required
            </DialogTitle>
            <DialogDescription>
              Cricket Prophet requires the Sepolia test network. Please switch
              your network to continue.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 py-2">
            <Badge variant="outline" className="text-muted-foreground">
              Current:{" "}
              {chains.find((c) => c.id === chain?.id)?.name || "Unknown Network"}
            </Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Badge>Required: Sepolia</Badge>
          </div>
          <DialogFooter>
            <Button onClick={handleSwitchToSepolia}>Switch to Sepolia</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
