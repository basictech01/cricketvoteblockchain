"use client";

import { useState, useEffect } from "react";
import {
  WagmiProvider,
  createConfig,
  http,
  useReadContract,
  useWriteContract,
} from "wagmi";
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
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Coins,
  ArrowRight,
  AlertTriangle,
  Wallet,
  BarChart3,
  BirdIcon as Cricket,
  ChevronLeft,
  ChevronRight,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";

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

interface Match {
  _id: string;
  teamA: string;
  teamB: string;
  matchDate: string;
  questions: Question[];
}

interface Question {
  _id: string;
  question: string;
  options: string[];
  isActive: boolean;
  closedAt: string;
}

function DashBoard() {
  const { chains, switchChain } = useSwitchChain();
  const { chain } = useAccount();
  const { address, isConnected } = useAccount();
  const [showNetworkDialog, setShowNetworkDialog] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const { data: tokenBalance, isLoading: isBalanceLoading } = useReadContract({
    abi,
    address: "0xAaD3edE66EDa939C1d5876874A31798E02d3fdd2",
    functionName: "balanceOf",
    args: [address],
  });

  const { writeContract } = useWriteContract();

  useEffect(() => {
    const fetchMatches = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/layout/fetch");
        const data = await response.json();
        setMatches(data.matches);
      } catch (error) {
        console.error("Error fetching matches:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, []);

  // Sample data for the dashboard
  // const upcomingMatches = [
  //   { id: 1, teams: "India vs Australia", date: "2024-03-10", time: "14:00" },
  //   {
  //     id: 2,
  //     teams: "England vs South Africa",
  //     date: "2024-03-12",
  //     time: "15:30",
  //   },
  //   {
  //     id: 3,
  //     teams: "New Zealand vs Pakistan",
  //     date: "2024-03-15",
  //     time: "13:00",
  //   },
  // ];

  // const recentPredictions = [
  //   {
  //     id: 1,
  //     match: "India vs Sri Lanka",
  //     prediction: "India",
  //     result: "Won",
  //     reward: 25,
  //   },
  //   {
  //     id: 2,
  //     match: "Australia vs England",
  //     prediction: "England",
  //     result: "Lost",
  //     reward: 0,
  //   },
  //   {
  //     id: 3,
  //     match: "Pakistan vs Bangladesh",
  //     prediction: "Pakistan",
  //     result: "Won",
  //     reward: 15,
  //   },
  // ];

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleBet = async (questionId: string, option: string) => {
    if (!address) {
      toast({
        title: "Error",
        description: "Please connect your wallet first.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Call the smart contract to place the bet
      writeContract({
        address: "0xYourContractAddress",
        abi: abi,
        functionName: "placeBet",
        args: [questionId, option],
      });

      // Wait for the transaction to be mined

      // Call the backend API to create a betting instance
      const response = await fetch("/api/bet/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address,
          questionId,
          option,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create betting instance");
      }

      toast({
        title: "Success",
        description: "Your bet has been placed successfully!",
      });

      // Close the match detail modal
      setSelectedMatch(null);
    } catch (error) {
      console.error("Error placing bet:", error);
      toast({
        title: "Error",
        description: "There was an error placing your bet. Please try again.",
        variant: "destructive",
      });
    }
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
                      variant={
                        chain?.id === sepolia.id ? "default" : "destructive"
                      }
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

            {/* Matches Carousel */}
            <Card className="mb-6 overflow-hidden">
              <CardHeader>
                <CardTitle>Upcoming Matches</CardTitle>
                <CardDescription>
                  Swipe or use arrows to navigate matches
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                {isLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentMatchIndex}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                        className="bg-card text-card-foreground p-6 rounded-lg shadow-lg"
                      >
                        <h3 className="text-2xl font-bold mb-2">
                          {matches[currentMatchIndex].teamA} vs{" "}
                          {matches[currentMatchIndex].teamB}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          {formatDate(matches[currentMatchIndex].matchDate)}
                        </p>
                        <Button
                          onClick={() =>
                            setSelectedMatch(matches[currentMatchIndex])
                          }
                        >
                          View Details & Bet
                        </Button>
                      </motion.div>
                    </AnimatePresence>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute top-1/2 left-2 transform -translate-y-1/2"
                      onClick={() =>
                        setCurrentMatchIndex((prev) =>
                          prev > 0 ? prev - 1 : matches.length - 1
                        )
                      }
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute top-1/2 right-2 transform -translate-y-1/2"
                      onClick={() =>
                        setCurrentMatchIndex((prev) =>
                          prev < matches.length - 1 ? prev + 1 : 0
                        )
                      }
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Match Detail Modal */}
            <Dialog
              open={!!selectedMatch}
              onOpenChange={() => setSelectedMatch(null)}
            >
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>
                    {selectedMatch?.teamA} vs {selectedMatch?.teamB}
                  </DialogTitle>
                  <DialogDescription>
                    {formatDate(selectedMatch?.matchDate || "")}
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh]">
                  <div className="space-y-4 p-4">
                    {selectedMatch?.questions.map((question) => (
                      <Card key={question._id}>
                        <CardHeader>
                          <CardTitle className="text-lg">
                            {question.question}
                          </CardTitle>
                          <CardDescription>
                            Closes at: {formatDate(question.closedAt)}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {question.options.map((option, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                onClick={() => handleBet(question._id, option)}
                              >
                                {option}
                              </Button>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedMatch(null)}
                  >
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Your Predictions (placeholder) */}
            <Card>
              <CardHeader>
                <CardTitle>Your Predictions</CardTitle>
                <CardDescription>
                  Track your recent predictions and rewards
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* TODO: Implement user predictions */}
                <p className="text-muted-foreground">
                  You haven&apos;t made any predictions yet.
                </p>
              </CardContent>
            </Card>
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
              {chains.find((c) => c.id === chain?.id)?.name ||
                "Unknown Network"}
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