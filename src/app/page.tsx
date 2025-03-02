/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import {
  WagmiProvider,
  createConfig,
  http,
  useReadContract,
  useWriteContract,
  useAccount,
  useSwitchChain,
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
  CardFooter,
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
  Trophy,
  Calendar,
  Clock,
  Sparkles,
  Users,
  Zap,
  Bell,
  Menu,
  Flame,
  Star,
  Loader2,
} from "lucide-react";
import abi from "../abis/Vote.json";
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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

interface Prediction {
  id: string;
  match: string;
  question: string;
  selectedOption: string;
  date: string;
  status: "pending" | "won" | "lost";
  reward?: number;
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
  const [selectedOption, setSelectedOption] = useState<{
    [key: string]: string;
  }>({});
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Mock predictions data
  const [predictions, setPredictions] = useState<Prediction[]>([
    {
      id: "1",
      match: "India vs Australia",
      question: "Which team will win the toss?",
      selectedOption: "India",
      date: "2023-11-15T10:00:00",
      status: "won",
      reward: 120,
    },
    {
      id: "2",
      match: "England vs New Zealand",
      question: "Will there be a century scored?",
      selectedOption: "Yes",
      date: "2023-11-12T14:30:00",
      status: "lost",
    },
    {
      id: "3",
      match: "South Africa vs Pakistan",
      question: "Total sixes in the match?",
      selectedOption: "More than 10",
      date: "2023-11-18T09:15:00",
      status: "pending",
    },
  ]);

  const { data: tokenBalance, isLoading: isBalanceLoading } = useReadContract({
    abi,
    address: "0x66f8ECD191AF7F90bc4Fe82629d525e5AB9FDf4C",
    functionName: "balanceOf",
    args: [address],
  });

  // Updated to use the latest wagmi hooks correctly
  const { writeContractAsync, isPending, isError, error } = useWriteContract();

  useEffect(() => {
    const fetchMatches = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/layout/fetch");
        const data = await response.json();
        setMatches(data.matches);
      } catch (error) {
        console.error("Error fetching matches:", error);
        // Fallback mock data if API fails
        setMatches([
          {
            _id: "1",
            teamA: "India",
            teamB: "Australia",
            matchDate: new Date(Date.now() + 86400000 * 2).toISOString(),
            questions: [
              {
                _id: "q1",
                question: "Which team will win?",
                options: ["India", "Australia", "Draw"],
                isActive: true,
                closedAt: new Date(Date.now() + 86400000).toISOString(),
              },
              {
                _id: "q2",
                question: "Will there be a century?",
                options: ["Yes", "No"],
                isActive: true,
                closedAt: new Date(Date.now() + 86400000).toISOString(),
              },
            ],
          },
          {
            _id: "2",
            teamA: "England",
            teamB: "South Africa",
            matchDate: new Date(Date.now() + 86400000 * 4).toISOString(),
            questions: [
              {
                _id: "q3",
                question: "Which team will score more in powerplay?",
                options: ["England", "South Africa"],
                isActive: true,
                closedAt: new Date(Date.now() + 86400000 * 3).toISOString(),
              },
            ],
          },
          {
            _id: "3",
            teamA: "Pakistan",
            teamB: "New Zealand",
            matchDate: new Date(Date.now() + 86400000 * 6).toISOString(),
            questions: [
              {
                _id: "q4",
                question: "Total wickets in the match?",
                options: ["Less than 10", "10-15", "More than 15"],
                isActive: true,
                closedAt: new Date(Date.now() + 86400000 * 5).toISOString(),
              },
            ],
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, []);

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
      toast({
        title: "Network Switching",
        description: "Switching to Sepolia testnet...",
      });
    } catch (error) {
      console.error("Failed to switch network:", error);
      toast({
        title: "Error",
        description: "Failed to switch network. Please try manually.",
        variant: "destructive",
      });
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

  const getTimeRemaining = (dateString: string) => {
    const targetDate = new Date(dateString);
    const now = new Date();
    const diff = targetDate.getTime() - now.getTime();

    if (diff <= 0) return "Closed";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  const handleBet = async (questionId: string) => {
    if (!address) {
      toast({
        title: "Error",
        description: "Please connect your wallet first.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedOption[questionId]) {
      toast({
        title: "Error",
        description: "Please select an option first.",
        variant: "destructive",
      });
      return;
    }

    setIsPlacingBet(true);

    try {
      // Fixed contract write function using the latest wagmi hooks
      await writeContractAsync({
        address: "0x66f8ECD191AF7F90bc4Fe82629d525e5AB9FDf4C",
        abi: abi,
        functionName: "vote",
        // args: [address],
      });

      // Call the backend API to create a betting instance
      const response = await fetch("/api/bet/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address,
          questionId,
          option: selectedOption[questionId],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create betting instance");
      }

      // Add to predictions
      if (selectedMatch) {
        const question = selectedMatch.questions.find(
          (q) => q._id === questionId
        );
        if (question) {
          const newPrediction: Prediction = {
            id: Date.now().toString(),
            match: `${selectedMatch.teamA} vs ${selectedMatch.teamB}`,
            question: question.question,
            selectedOption: selectedOption[questionId],
            date: new Date().toISOString(),
            status: "pending",
          };

          setPredictions((prev) => [newPrediction, ...prev]);
        }
      }

      toast({
        title: "Success",
        description: "Your prediction has been placed successfully!",
        variant: "default",
      });

      // Reset selected option for this question
      setSelectedOption((prev) => ({
        ...prev,
        [questionId]: "",
      }));
    } catch (error) {
      console.error("Error placing bet:", error);
      toast({
        title: "Error",
        description:
          "There was an error placing your prediction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPlacingBet(false);
    }
  };

  const getTeamLogo = (teamName: string) => {
    // This would ideally fetch actual team logos
    const teamLogos: Record<string, string> = {
      India: "/placeholder.svg?height=40&width=40&text=IND",
      Australia: "/placeholder.svg?height=40&width=40&text=AUS",
      England: "/placeholder.svg?height=40&width=40&text=ENG",
      "South Africa": "/placeholder.svg?height=40&width=40&text=SA",
      Pakistan: "/placeholder.svg?height=40&width=40&text=PAK",
      "New Zealand": "/placeholder.svg?height=40&width=40&text=NZ",
    };

    return (
      teamLogos[teamName] ||
      `/placeholder.svg?height=40&width=40&text=${teamName
        .slice(0, 3)
        .toUpperCase()}`
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "won":
        return "bg-green-500";
      case "lost":
        return "bg-red-500";
      default:
        return "bg-yellow-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "won":
        return "Won";
      case "lost":
        return "Lost";
      default:
        return "Pending";
    }
  };

  // Sidebar navigation items
  const navItems = [
    { icon: <Trophy className="h-5 w-5" />, label: "Matches", active: true },
    { icon: <Users className="h-5 w-5" />, label: "Leaderboard" },
    { icon: <Zap className="h-5 w-5" />, label: "Rewards" },
    { icon: <Bell className="h-5 w-5" />, label: "Notifications" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 dark:from-background dark:to-background">
      {/* Mobile Menu */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
          <SheetHeader className="p-6 border-b">
            <SheetTitle className="flex items-center gap-2">
              <Cricket className="h-6 w-6 text-primary" />
              <span>Cricket Prophet</span>
            </SheetTitle>
            <SheetDescription>
              Make predictions on cricket matches
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            {isConnected && (
              <div className="px-6 py-4 border-b">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-10 w-10 border-2 border-primary">
                    <AvatarFallback>{address?.slice(2, 4)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{formatAddress(address)}</p>
                    <Badge
                      variant={
                        chain?.id === sepolia.id ? "default" : "destructive"
                      }
                      className="mt-1"
                    >
                      {chains.find((c) => c.id === chain?.id)?.name ||
                        "Unknown Network"}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Coins className="h-4 w-4 text-primary" />
                    <span>
                      {tokenBalance ? tokenBalance.toString() : "0"} CPT
                    </span>
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
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Close Menu
                </Button>
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
            <p className="text-sm text-muted-foreground">
              Predict & win with blockchain
            </p>
          </div>

          {isConnected && (
            <div className="p-4 border-b">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-10 w-10 border-2 border-primary">
                  <AvatarFallback>{address?.slice(2, 4)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{formatAddress(address)}</p>
                  <Badge
                    variant={
                      chain?.id === sepolia.id ? "default" : "destructive"
                    }
                    className="mt-1"
                  >
                    {chains.find((c) => c.id === chain?.id)?.name ||
                      "Unknown Network"}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <Coins className="h-4 w-4 text-primary" />
                  <span>
                    {tokenBalance ? tokenBalance.toString() : "0"} CPT
                  </span>
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
                  <Button
                    variant={item.active ? "default" : "ghost"}
                    className="w-full justify-start"
                  >
                    {item.icon}
                    <span className="ml-2">{item.label}</span>
                  </Button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4 border-t mt-auto">
            <div className="flex items-center justify-between">
              <ThemeToggle />
              {!isConnected && <ConnectButton />}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-10 backdrop-blur-md bg-background/80 border-b">
            <div className="container flex h-16 items-center justify-between px-4">
              <div className="flex items-center gap-2 lg:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(true)}
                >
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
                <div className="hidden md:flex items-center gap-2">
                  <ThemeToggle />
                </div>
                <ConnectButton />
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 container px-4 py-6">
            {isConnected ? (
              <>
                {/* Account overview - Mobile only */}
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
                          <AvatarFallback>
                            {address?.slice(2, 4)}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-xl font-bold">
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

                {/* Tabs for Upcoming Matches and Your Predictions */}
                <Tabs
                  defaultValue="upcoming"
                  className="mb-6"
                  onValueChange={setActiveTab}
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger
                      value="upcoming"
                      className="flex items-center gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      Upcoming Matches
                    </TabsTrigger>
                    <TabsTrigger
                      value="predictions"
                      className="flex items-center gap-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      Your Predictions
                    </TabsTrigger>
                  </TabsList>

                  {/* Upcoming Matches Tab */}
                  <TabsContent value="upcoming" className="mt-4">
                    <Card className="overflow-hidden border-primary/20">
                      <CardHeader className="bg-primary/5">
                        <CardTitle>Upcoming Matches</CardTitle>
                        <CardDescription>
                          Swipe or use arrows to navigate matches
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="relative p-0">
                        {isLoading ? (
                          <div className="p-6">
                            <Skeleton className="h-64 w-full" />
                          </div>
                        ) : (
                          <div className="relative min-h-[300px]">
                            <AnimatePresence mode="wait">
                              <motion.div
                                key={currentMatchIndex}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.3 }}
                                className="p-6"
                              >
                                <div className="bg-card text-card-foreground p-6 rounded-lg shadow-lg border border-primary/20 dark:bg-card/50 dark:backdrop-blur-sm">
                                  <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                      <img
                                        src={
                                          getTeamLogo(
                                            matches[currentMatchIndex].teamA
                                          ) || "/placeholder.svg"
                                        }
                                        alt={matches[currentMatchIndex].teamA}
                                        className="h-10 w-10 rounded-full bg-primary/10"
                                      />
                                      <span className="text-xl font-bold">
                                        {matches[currentMatchIndex].teamA}
                                      </span>
                                    </div>
                                    <span className="text-xl font-bold">
                                      vs
                                    </span>
                                    <div className="flex items-center gap-4">
                                      <span className="text-xl font-bold">
                                        {matches[currentMatchIndex].teamB}
                                      </span>
                                      <img
                                        src={
                                          getTeamLogo(
                                            matches[currentMatchIndex].teamB
                                          ) || "/placeholder.svg"
                                        }
                                        alt={matches[currentMatchIndex].teamB}
                                        className="h-10 w-10 rounded-full bg-primary/10"
                                      />
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 mb-6 text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                      {formatDate(
                                        matches[currentMatchIndex].matchDate
                                      )}
                                    </span>
                                    <Clock className="h-4 w-4 ml-2" />
                                    <span>
                                      {getTimeRemaining(
                                        matches[currentMatchIndex].matchDate
                                      )}
                                    </span>
                                  </div>

                                  <div className="flex justify-center">
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-medium flex items-center gap-2"
                                      onClick={() =>
                                        setSelectedMatch(
                                          matches[currentMatchIndex]
                                        )
                                      }
                                    >
                                      View Details & Predict
                                      <ArrowRight className="h-4 w-4" />
                                    </motion.button>
                                  </div>
                                </div>
                              </motion.div>
                            </AnimatePresence>

                            <Button
                              variant="outline"
                              size="icon"
                              className="absolute top-1/2 left-2 transform -translate-y-1/2 rounded-full h-10 w-10 bg-background/80 backdrop-blur-sm"
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
                              className="absolute top-1/2 right-2 transform -translate-y-1/2 rounded-full h-10 w-10 bg-background/80 backdrop-blur-sm"
                              onClick={() =>
                                setCurrentMatchIndex((prev) =>
                                  prev < matches.length - 1 ? prev + 1 : 0
                                )
                              }
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="bg-primary/5 py-3 px-6">
                        <div className="flex justify-between items-center w-full">
                          <span className="text-sm text-muted-foreground">
                            {!isLoading &&
                              `${currentMatchIndex + 1} of ${
                                matches.length
                              } matches`}
                          </span>
                          <div className="flex gap-1">
                            {!isLoading &&
                              matches.map((_, idx) => (
                                <div
                                  key={idx}
                                  className={`h-2 w-2 rounded-full cursor-pointer ${
                                    idx === currentMatchIndex
                                      ? "bg-primary"
                                      : "bg-primary/30"
                                  }`}
                                  onClick={() => setCurrentMatchIndex(idx)}
                                />
                              ))}
                          </div>
                        </div>
                      </CardFooter>
                    </Card>
                  </TabsContent>

                  {/* Your Predictions Tab */}
                  <TabsContent value="predictions" className="mt-4">
                    <Card className="overflow-hidden border-primary/20">
                      <CardHeader className="bg-primary/5">
                        <CardTitle>Your Predictions</CardTitle>
                        <CardDescription>
                          Track your recent predictions and rewards
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-0">
                        <ScrollArea className="h-[400px]">
                          {predictions.length > 0 ? (
                            <div className="divide-y">
                              {predictions.map((prediction) => (
                                <motion.div
                                  key={prediction.id}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ duration: 0.3 }}
                                  className="p-4 hover:bg-muted/30 transition-colors"
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <h3 className="font-medium">
                                        {prediction.match}
                                      </h3>
                                      <p className="text-sm text-muted-foreground">
                                        {prediction.question}
                                      </p>
                                    </div>
                                    <Badge
                                      variant="outline"
                                      className={`${getStatusColor(
                                        prediction.status
                                      )} text-white`}
                                    >
                                      {getStatusText(prediction.status)}
                                    </Badge>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="secondary">
                                        {prediction.selectedOption}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        {formatDate(prediction.date)}
                                      </span>
                                    </div>
                                    {prediction.reward && (
                                      <div className="flex items-center gap-1 text-green-500">
                                        <Coins className="h-3 w-3" />
                                        <span className="font-medium">
                                          +{prediction.reward} CPT
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full p-6">
                              <Trophy className="h-12 w-12 text-muted-foreground mb-2" />
                              <p className="text-muted-foreground text-center">
                                You haven&apos;t made any predictions yet.
                                <br />
                                Start predicting to earn rewards!
                              </p>
                            </div>
                          )}
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* Trending Matches - Desktop Only */}
                <div className="hidden lg:block mt-6">
                  <h2 className="text-xl font-bold mb-4">Trending Matches</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {!isLoading &&
                      matches.map((match, idx) => (
                        <Card
                          key={idx}
                          className="overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-md"
                        >
                          <CardHeader className="bg-primary/5 pb-2">
                            <CardTitle className="text-base flex items-center justify-between">
                              <span>
                                {match.teamA} vs {match.teamB}
                              </span>
                              <Badge variant="outline" className="ml-2">
                                {getTimeRemaining(match.matchDate)}
                              </Badge>
                            </CardTitle>
                            <CardDescription className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(match.matchDate)}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="p-4">
                            <div className="text-sm text-muted-foreground mb-2">
                              {match.questions.length} prediction questions
                              available
                            </div>
                            <div className="flex items-center gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex -space-x-2">
                                      <Avatar className="border-2 border-background h-8 w-8">
                                        <AvatarFallback className="bg-primary/20 text-xs">
                                          {match.teamA.slice(0, 2)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <Avatar className="border-2 border-background h-8 w-8">
                                        <AvatarFallback className="bg-primary/20 text-xs">
                                          {match.teamB.slice(0, 2)}
                                        </AvatarFallback>
                                      </Avatar>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      {match.teamA} vs {match.teamB}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <div className="text-sm">
                                <span className="text-primary font-medium">
                                  250+
                                </span>{" "}
                                users predicting
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="bg-muted/20 p-3">
                            <Button
                              variant="ghost"
                              className="w-full"
                              onClick={() => setSelectedMatch(match)}
                            >
                              View Details
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                  </div>
                </div>

                {/* Leaderboard - Desktop Only */}
                <div className="hidden lg:block mt-8">
                  <h2 className="text-xl font-bold mb-4">Top Predictors</h2>
                  <Card>
                    <CardHeader className="bg-primary/5">
                      <CardTitle>Weekly Leaderboard</CardTitle>
                      <CardDescription>
                        Top performers based on prediction accuracy
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-4"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 font-bold">
                                {i}
                              </div>
                              <Avatar className="h-10 w-10 border-2 border-primary/20">
                                <AvatarFallback>
                                  {String.fromCharCode(64 + i)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">User{i}</p>
                                <p className="text-xs text-muted-foreground">
                                  {90 - i * 5}% accuracy
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className="bg-primary/10"
                              >
                                <Flame className="h-3 w-3 mr-1 text-primary" />
                                {10 - i} streak
                              </Badge>
                              <Badge>
                                <Star className="h-3 w-3 mr-1" />
                                {1000 - i * 100} CPT
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
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
                    <CardTitle className="text-2xl">
                      Welcome to Cricket Prophet
                    </CardTitle>
                    <CardDescription>
                      Connect your wallet to start making predictions on cricket
                      matches and earn rewards.
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
                          <p className="text-sm text-muted-foreground">
                            Predict outcomes of cricket matches
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <Coins className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">Earn Rewards</h3>
                          <p className="text-sm text-muted-foreground">
                            Win CPT tokens for correct predictions
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <BarChart3 className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">Track Performance</h3>
                          <p className="text-sm text-muted-foreground">
                            Monitor your prediction history and stats
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-center p-6 bg-primary/5">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ConnectButton />
                    </motion.div>
                  </CardFooter>
                </Card>
              </motion.div>
            )}
          </main>
        </div>
      </div>

      {/* Match Detail Modal */}
      <Dialog
        open={!!selectedMatch}
        onOpenChange={(open) => !open && setSelectedMatch(null)}
      >
        <DialogContent className="max-w-4xl overflow-hidden">
          <DialogHeader className="bg-primary/5 p-4 rounded-t-lg">
            <DialogTitle className="text-2xl flex items-center justify-center gap-4">
              <img
                src={selectedMatch ? getTeamLogo(selectedMatch.teamA) : ""}
                alt={selectedMatch?.teamA}
                className="h-8 w-8 rounded-full bg-primary/10"
              />
              <span>
                {selectedMatch?.teamA} vs {selectedMatch?.teamB}
              </span>
              <img
                src={selectedMatch ? getTeamLogo(selectedMatch.teamB) : ""}
                alt={selectedMatch?.teamB}
                className="h-8 w-8 rounded-full bg-primary/10"
              />
            </DialogTitle>
            <DialogDescription className="text-center flex items-center justify-center gap-2">
              <Calendar className="h-4 w-4" />
              {selectedMatch && formatDate(selectedMatch.matchDate)}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 p-6">
              {selectedMatch?.questions.map((question) => (
                <Card
                  key={question._id}
                  className="overflow-hidden border-primary/20"
                >
                  <CardHeader className="bg-primary/5">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">
                        {question.question}
                      </CardTitle>
                      <Badge variant="outline" className="ml-2">
                        {getTimeRemaining(question.closedAt)}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Closes: {formatDate(question.closedAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {question.options.map((option, index) => (
                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            setSelectedOption({
                              ...selectedOption,
                              [question._id]: option,
                            })
                          }
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedOption[question._id] === option
                              ? "border-primary bg-primary/10"
                              : "border-muted hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-4 w-4 rounded-full border ${
                                selectedOption[question._id] === option
                                  ? "border-primary bg-primary"
                                  : "border-muted-foreground"
                              }`}
                            >
                              {selectedOption[question._id] === option && (
                                <div className="h-2 w-2 m-[3px] rounded-full bg-white" />
                              )}
                            </div>
                            <span className="font-medium">{option}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="bg-primary/5 p-4 flex justify-end">
                    <Button
                      onClick={() => handleBet(question._id)}
                      disabled={!selectedOption[question._id] || isPlacingBet}
                      className="relative overflow-hidden"
                    >
                      {isPlacingBet ? (
                        <>
                          <span className="opacity-0">Place Prediction</span>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="h-5 w-5 animate-spin" />
                          </div>
                        </>
                      ) : (
                        <>
                          Place Prediction
                          <Sparkles className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter className="bg-primary/5 p-4 rounded-b-lg">
            <Button variant="outline" onClick={() => setSelectedMatch(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Network switch dialog */}
      <Dialog open={showNetworkDialog} onOpenChange={setShowNetworkDialog}>
        <DialogContent className="sm:max-w-md">
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
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="flex items-center gap-4 w-full">
              <Badge
                variant="outline"
                className="text-muted-foreground flex-1 justify-center py-2"
              >
                Current:{" "}
                {chains.find((c) => c.id === chain?.id)?.name ||
                  "Unknown Network"}
              </Badge>
              <ArrowRight className="h-6 w-6 text-muted-foreground animate-pulse" />
              <Badge className="flex-1 justify-center py-2 bg-primary">
                Required: Sepolia
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground text-center">
              Switching networks will allow you to interact with the Cricket
              Prophet platform and place predictions.
            </div>
          </div>
          <DialogFooter className="flex justify-center sm:justify-center gap-2">
            <Button
              onClick={handleSwitchToSepolia}
              className="w-full sm:w-auto"
            >
              Switch to Sepolia
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
