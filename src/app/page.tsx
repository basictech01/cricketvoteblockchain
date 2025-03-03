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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";

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
  accuracy?: number;
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
  const [loadingQuestions, setLoadingQuestions] = useState<{
    [key: string]: boolean;
  }>({});
  const [, setActiveTab] = useState("upcoming");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [matchQuestions, setMatchQuestions] = useState<Question[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  const [predictions, setPredictions] = useState<Prediction[]>([
    {
      id: "1",
      match: "India vs Australia",
      question: "Which team will win the toss?",
      selectedOption: "India",
      date: "2023-11-15T10:00:00",
      status: "won",
      reward: 120,
      accuracy: 92,
    },
    {
      id: "2",
      match: "England vs New Zealand",
      question: "Will there be a century scored?",
      selectedOption: "Yes",
      date: "2023-11-12T14:30:00",
      status: "lost",
      accuracy: 45,
    },
    {
      id: "3",
      match: "South Africa vs Pakistan",
      question: "Total sixes in the match?",
      selectedOption: "More than 10",
      date: "2023-11-18T09:15:00",
      status: "pending",
      accuracy: 78,
    },
  ]);

  const { data: tokenBalance, isLoading: isBalanceLoading } = useReadContract({
    abi,
    address: "0x66f8ECD191AF7F90bc4Fe82629d525e5AB9FDf4C",
    functionName: "balanceOf",
    args: [address],
  });

  const { writeContractAsync, isPending } = useWriteContract();

  useEffect(() => {
    const fetchMatches = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/layout/matches");
        const data = await response.json();
        setMatches(data.matches);
      } catch (error) {
        console.error("Error fetching matches:", error);
        setMatches([
          {
            _id: "1",
            teamA: "India",
            teamB: "Australia",
            matchDate: new Date(Date.now() + 86400000 * 2).toISOString(),
            questions: [],
          },
          {
            _id: "2",
            teamA: "England",
            teamB: "South Africa",
            matchDate: new Date(Date.now() + 86400000 * 4).toISOString(),
            questions: [],
          },
          {
            _id: "3",
            teamA: "Pakistan",
            teamB: "New Zealand",
            matchDate: new Date(Date.now() + 86400000 * 6).toISOString(),
            questions: [],
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!selectedMatch) return;

      setIsLoadingQuestions(true);
      try {
        const response = await fetch("/api/layout/questions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ matchId: selectedMatch._id }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch questions");
        }

        const data = await response.json();
        setMatchQuestions(data.questions);
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    fetchQuestions();
  }, [selectedMatch]);

  useEffect(() => {
    if (isConnected && chain && chain.id !== sepolia.id) {
      setShowNetworkDialog(true);
    } else {
      setShowNetworkDialog(false);
    }
  }, [chain, isConnected]);

  const handleSwitchToSepolia = async () => {
    try {
      switchChain({ chainId: sepolia.id });
    } catch (error) {
      console.error("Failed to switch network:", error);
    }
  };

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
      toast.error("Please connect your wallet first");
      return;
    }

    if (!selectedOption[questionId]) {
      toast.error("Please select an option first");
      return;
    }

    setLoadingQuestions((prev) => ({
      ...prev,
      [questionId]: true,
    }));

    try {
      await writeContractAsync({
        address: "0x66f8ECD191AF7F90bc4Fe82629d525e5AB9FDf4C",
        abi: abi,
        functionName: "vote",
      });

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

      if (selectedMatch) {
        const question = matchQuestions.find((q) => q._id === questionId);
        if (question) {
          const confidenceScore = Math.floor(Math.random() * 30) + 70;

          const newPrediction: Prediction = {
            id: Date.now().toString(),
            match: `${selectedMatch.teamA} vs ${selectedMatch.teamB}`,
            question: question.question,
            selectedOption: selectedOption[questionId],
            date: new Date().toISOString(),
            status: "pending",
            accuracy: confidenceScore,
          };

          setPredictions((prev) => [newPrediction, ...prev]);
          toast.success("Prediction placed successfully!");
        }
      }

      setSelectedOption((prev) => ({
        ...prev,
        [questionId]: "",
      }));
    } catch (error) {
      console.error("Error placing bet:", error);
      toast.error("Failed to place prediction. Please try again.");
    } finally {
      setLoadingQuestions((prev) => ({
        ...prev,
        [questionId]: false,
      }));
    }
  };

  const getTeamLogo = (teamName: string) => {
    const teamLogos: Record<string, string> = {
      "Chennai Super Kings":
        "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhn3plcgt5OnAx_VelXAj9Z8TWBiqg6B-xgCJ__kuFeXr1ClntuhvVu0IugURU6TfyHk9qUuECEpos1E5ayEmx0fAupMIvNLQnLOwavDhBYxkIwvRv9cmm7_qHZmlcSwr3Un-hJpy92AooR9Qn77PUcr4yRgAORYwoTBjTYOmyYlHbZ0nDyaL3HWqUk/s2141/Original%20Chennai%20Super%20Fun%20Logo%20PNG%20-%20SVG%20File%20Download%20Free%20Download.png",
      "Mumbai Indians":
        "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhcIHFJONN-c6wVsb8I0TI5u1He8Vh5aUlmZ7vPzd6paraXfCf5r-bNdOoT3rqBA5S8Yu3DwefbB4C_Utu6a4E1XUXtdo28k2ViLDYs2fDS7cG9LO0S6ESd5pEZrE1GvYAf6M0_dTs9OibYMQAwkOQZvALvo-ggMxtTh_4JINiQsYeBWtQ0APFedzCZ/s7200/Original%20Mumbai%20Indians%20PNG-SVG%20File%20Download%20Free%20Download.png",
      "Royal Challengers Bangalore":
        "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgEMirAmSelGzQqwMqkzMifgCNy9asa4lGjk7tFe7WlVAQ3NU7eGj8nP0c-NRXNY6ZN5FgrDJV0k_UjOLa8rUHJDfEzFsj9qxgL_DxfB0y4RlFli0AnCxNqWXZ9wCATAZ1FBoZafwsUWddYNpVOyBEAxK7yIdLy4OkVjkUMEDErfWKE_54Rt2WW9iXL/s1178/Original%20Royal%20Challengers%20Bangalore%20PNG-SVG%20File%20Download%20Free%20Download.png",
      "Kolkata Knight Riders":
        "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhw4FPuHDf0g4n2Gaf_prBrTXdS7GO6zGVcS-Lx4ioHzH-HUUGm5gY7Sj2vmy_6HwxtSZ2fojvZrXqCUIljlZy_aenyml7DLwx3mRXTS-qWBHsBFpt85nq8Y7__HB6uK3JystxJDwx0KoLubgsAIWIH6xXoh2nxjLDM2bNV08uHlBj3zy6SQmfSIUuZ/s1024/Original%20Kolkata%20Knight%20Riders%20PNG-SVG%20File%20Download%20Free%20Download.png",
      "Sunrisers Hyderabad":
        "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgFNUOHxX-5sofC3Iioht3A6_naxWEImhNUKs6eU6xqjxYJjOa1OLc_hxKRkckg_F6bnG2XzSrAsKQpgYpeXPzFkwNLHQwS5xVrYaL7aKn155nR2J0dPCunLn4LrR8d-bLjqfaLhpAG2tGRZF4RuWgblEy_1DhbmszchchOWOs3ZwAZ_Lj-1bT535Ye/s7200/Original%20Sunrisers%20Hyderabad%20PNG-SVG%20File%20Download%20Free%20Download.png",
      "Delhi Capitals":
        "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEixNFCNIFm0aH1xUBTkbrLQdE__aSNP32JP1zsee3iJW5va96W_r3qyl486fHQilJQjaVBJt0Fl0xAawdBD4duYEg6Sj-MgCNvVfWuA3UpO4oXBr4qt8WeaaS2Fhtbac8mfzE_euPhJ9hQUVxAgWQDLG1WgrJaSv1I2L4XgNGvFoxrdWQq_LUi82XIw/s944/Original%20Delhi%20Capitals%20Logo%20PNG-SVG%20File%20Download%20Free%20Download.png",
      "Rajasthan Royals":
        "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgHxGVAL3asVmq-N8vAbTJ0Wk1C7WQNO4yr_O-7dIDgrszmr7L1ODXPuc5IzB8VGr941igDjeEX8OSZ1db2sDpn5uziRk1BVYAVRZBltH4A5FJGhfjmn8PzDLcP7qxCXVyuYQr1uaLktAqoNefxAgjVGXGXIcec8WYXBO4lB-4vtCCmcu2C9RhG5XXm/s1024/Original%20Rajasthan%20Royals%20Logo%20PNG-SVG%20File%20Download%20Free%20Download.png",
      "Punjab Kings":
        "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjWofXDOj6B3eYR3eBKQaPeJjTsblyohHrqK1JO4BEojD0u_Izr_2kIxmrI7Oli8_EvW9tNxB4Qi_OotqkyIWTkOsg6xIroj5U39vvmbGDPSJJXkSn5mzAF58_Mz5Fg8uIrXfJnXWlWrqSig2uxfuUGCrV3wPlZwuZ1OtWVXZUhWYeIzJyrH7klLVer/s1540/Original%20Punjab%20Kings%20PNG-SVG%20File%20Download%20Free%20Download.png",
      "Gujarat Titans":
        "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhAviPjlBbeRYz6ny9-HOVtr9VmyQJ3FXOw60rSy8ye_U_nMy9gPWtgEPpPMAO7va36UX6nyw9BNvWVrC5kwShXJT3V7FtA5HmDO9aAwsBS4iGQWFRQWOX_ltiBkSajurq-ulo_Mu82VYsIMDkIme9jCuqMxKTt0P1fO9bv_tdXBzYj51QgTcD7pz-2/s1024/Original%20Gujarat%20Titans%20Logo%20PNG-SVG%20File%20Download%20Free%20Download.png",
      "Lucknow Super Giants":
        "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEijb28SNOESbzSkJ5J8-YuxEweSWpHRLhF_uQ5Ceah9b61K8ytbL8fwmK9oMKbM2-ZZxlualj5wlNPlriod0mdrFFXBSx0dj0-_4DQIXwZmGkleqqiIpr0GmV7V8dkYbLXisxjWUPtf4joGikLHSiExgCpaO477APLpjA8_pGhnlvUEAJM4_TvabF85/s7201/Original%20Lucknow%20Super%20Giants%20PNG-SVG%20File%20Download%20Free%20Download.png",
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

  const getAccuracyColor = (accuracy = 0) => {
    if (accuracy >= 80) return "text-green-500";
    if (accuracy >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const navItems = [
    { icon: <Trophy className="h-5 w-5" />, label: "Matches", active: true },
    { icon: <Users className="h-5 w-5" />, label: "Leaderboard" },
    { icon: <Zap className="h-5 w-5" />, label: "Rewards" },
    { icon: <Bell className="h-5 w-5" />, label: "Notifications" },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Mobile Menu */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent
          side="left"
          className="w-[300px] sm:w-[400px] p-0 bg-black border-gray-800"
        >
          <SheetHeader className="p-6 border-b border-gray-800">
            <SheetTitle className="flex items-center gap-2 text-white">
              <Cricket className="h-6 w-6 text-primary" />
              <span>Cricket Prophet</span>
            </SheetTitle>
            <SheetDescription className="text-gray-400">
              Make predictions on cricket matches
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            {isConnected && (
              <div className="px-6 py-4 border-b border-gray-800">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-10 w-10 border-2 border-primary">
                    <AvatarFallback>{address?.slice(2, 4)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-white">
                      {formatAddress(address)}
                    </p>
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
                    <span className="text-gray-300">
                      {tokenBalance ? tokenBalance.toString() : "0"} CPT
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="h-4 w-4 text-primary" />
                    <span className="text-gray-300">67% Win Rate</span>
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
            <div className="px-6 pt-4 mt-4 border-t border-gray-800">
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
        <aside className="hidden lg:flex flex-col w-64 border-r border-gray-800 bg-black">
          <div className="p-6 border-b border-gray-800">
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
            <p className="text-sm text-gray-400">
              Predict & win with blockchain
            </p>
          </div>

          {isConnected && (
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-10 w-10 border-2 border-primary">
                  <AvatarFallback>{address?.slice(2, 4)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-white">
                    {formatAddress(address)}
                  </p>
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
                  <span className="text-gray-300">
                    {tokenBalance ? tokenBalance.toString() : "0"} CPT
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="h-4 w-4 text-primary" />
                  <span className="text-gray-300">67% Win Rate</span>
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

          <div className="p-4 border-t border-gray-800 mt-auto">
            <div className="flex items-center justify-between">
              {!isConnected && <ConnectButton />}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-gray-800">
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
                <h2 className="text-xl font-bold text-white">Dashboard</h2>
              </div>
              <div className="flex items-center gap-4">
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
                  <Card className="overflow-hidden border-primary/20 hover:border-primary/50 transition-colors duration-300 bg-gray-900">
                    <CardHeader className="pb-2 bg-primary/5">
                      <CardTitle className="text-sm font-medium flex items-center gap-2 text-white">
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
                        <p className="text-xl font-bold text-white">
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

                  <Card className="overflow-hidden border-primary/20 hover:border-primary/50 transition-colors duration-300 bg-gray-900">
                    <CardHeader className="pb-2 bg-primary/5">
                      <CardTitle className="text-sm font-medium flex items-center gap-2 text-white">
                        <Coins className="h-4 w-4 text-primary" />
                        Token Balance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      {isBalanceLoading ? (
                        <Skeleton className="h-8 w-24 bg-gray-700" />
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping"></div>
                            <div className="relative h-8 w-8 rounded-full bg-primary/30 flex items-center justify-center">
                              <Coins className="h-4 w-4 text-primary" />
                            </div>
                          </div>
                          <p className="text-xl font-bold text-white">
                            {tokenBalance ? tokenBalance.toString() : "0"}
                            <span className="text-primary ml-1">CPT</span>
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="overflow-hidden border-primary/20 hover:border-primary/50 transition-colors duration-300 bg-gray-900">
                    <CardHeader className="pb-2 bg-primary/5">
                      <CardTitle className="text-sm font-medium flex items-center gap-2 text-white">
                        <BarChart3 className="h-4 w-4 text-primary" />
                        Prediction Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <div className="relative h-8 w-8 rounded-full bg-primary/30 flex items-center justify-center">
                          <Trophy className="h-4 w-4 text-primary" />
                        </div>
                        <p className="text-xl font-bold text-white">
                          67% Win Rate
                        </p>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1 text-gray-400">
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
                  <TabsList className="grid w-full grid-cols-2 bg-gray-900">
                    <TabsTrigger
                      value="upcoming"
                      className="flex items-center gap-2 data-[state=active]:bg-primary"
                    >
                      <Calendar className="h-4 w-4" />
                      Upcoming Matches
                    </TabsTrigger>
                    <TabsTrigger
                      value="predictions"
                      className="flex items-center gap-2 data-[state=active]:bg-primary"
                    >
                      <Sparkles className="h-4 w-4" />
                      Your Predictions
                    </TabsTrigger>
                  </TabsList>

                  {/* Upcoming Matches Tab */}
                  <TabsContent value="upcoming" className="mt-4">
                    <Card className="overflow-hidden border-primary/20 bg-gray-900">
                      <CardHeader className="bg-primary/5">
                        <CardTitle className="text-white">
                          Upcoming Matches
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                          Swipe or use arrows to navigate matches
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="relative p-0">
                        {isLoading ? (
                          <div className="p-6">
                            <Skeleton className="h-64 w-full bg-gray-800" />
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
                                <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg border border-primary/20">
                                  <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                      <img
                                        src={
                                          getTeamLogo(
                                            matches[currentMatchIndex].teamA
                                          ) || "/placeholder.svg"
                                        }
                                        alt={matches[currentMatchIndex].teamA}
                                        className="h-auto max-h-20"
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
                                        className="h-auto max-h-20"
                                      />
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 mb-6 text-gray-400">
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
                              className="absolute top-1/2 left-2 transform -translate-y-1/2 rounded-full h-10 w-10 bg-black/80 backdrop-blur-sm"
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
                              className="absolute top-1/2 right-2 transform -translate-y-1/2 rounded-full h-10 w-10 bg-black/80 backdrop-blur-sm"
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
                          <span className="text-sm text-gray-400">
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
                    <Card className="overflow-hidden border-primary/20 bg-gray-900">
                      <CardHeader className="bg-primary/5">
                        <CardTitle className="text-white">
                          Your Predictions
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                          Track your recent predictions and rewards
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-0">
                        <ScrollArea className="h-[400px]">
                          {predictions.length > 0 ? (
                            <div className="divide-y divide-gray-800">
                              {predictions.map((prediction) => (
                                <motion.div
                                  key={prediction.id}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ duration: 0.3 }}
                                  className="p-4 hover:bg-gray-800/50 transition-colors"
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <h3 className="font-medium text-white">
                                        {prediction.match}
                                      </h3>
                                      <p className="text-sm text-gray-400">
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
                                      <span className="text-xs text-gray-400">
                                        {formatDate(prediction.date)}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {prediction.accuracy && (
                                        <span
                                          className={`text-xs font-medium ${getAccuracyColor(
                                            prediction.accuracy
                                          )}`}
                                        >
                                          {prediction.accuracy}% Confidence
                                        </span>
                                      )}
                                      {prediction.reward && (
                                        <div className="flex items-center gap-1 text-green-500">
                                          <Coins className="h-3 w-3" />
                                          <span className="font-medium">
                                            +{prediction.reward} CPT
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full p-6">
                              <Trophy className="h-12 w-12 text-gray-600 mb-2" />
                              <p className="text-gray-400 text-center">
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
                  <h2 className="text-xl font-bold mb-4 text-white">
                    Trending Matches
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {!isLoading &&
                      matches.map((match, idx) => (
                        <Card
                          key={idx}
                          className="overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-md bg-gray-900"
                        >
                          <CardHeader className="bg-primary/5 pb-2">
                            <CardTitle className="text-base flex items-center justify-between text-white">
                              <span>
                                {match.teamA} vs {match.teamB}
                              </span>
                              <Badge variant="outline" className="ml-2">
                                {getTimeRemaining(match.matchDate)}
                              </Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {/* Add content here if needed */}
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <AlertTriangle className="h-10 w-10 text-gray-500 mb-4" />
                <p className="text-gray-400 text-lg mb-2">
                  Please connect your wallet to continue.
                </p>
                <ConnectButton />
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Network Switcher Dialog */}
      <Dialog open={showNetworkDialog} onOpenChange={setShowNetworkDialog}>
        <DialogContent className="bg-gray-900 border border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Wrong Network</DialogTitle>
            <DialogDescription>
              Please switch to the Sepolia test network to use this application.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowNetworkDialog(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSwitchToSepolia}>
              Switch to Sepolia
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Match Details Modal */}
      <Dialog
        open={selectedMatch !== null}
        onOpenChange={() => setSelectedMatch(null)}
      >
        <DialogContent className="bg-gray-900 border border-gray-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Match Details
              <Flame className="h-4 w-4 text-orange-500" />
            </DialogTitle>
            <DialogDescription>
              Make your predictions for this match
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[400px]">
            {selectedMatch && (
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        getTeamLogo(selectedMatch.teamA) || "/placeholder.svg"
                      }
                      alt={selectedMatch.teamA}
                      className="h-auto max-h-16"
                    />
                    <span className="text-xl font-bold">
                      {selectedMatch.teamA}
                    </span>
                  </div>
                  <span className="text-xl font-bold">vs</span>
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-bold">
                      {selectedMatch.teamB}
                    </span>
                    <img
                      src={
                        getTeamLogo(selectedMatch.teamB) || "/placeholder.svg"
                      }
                      alt={selectedMatch.teamB}
                      className="h-auto max-h-16"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-6 text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(selectedMatch.matchDate)}</span>
                  <Clock className="h-4 w-4 ml-2" />
                  <span>{getTimeRemaining(selectedMatch.matchDate)}</span>
                </div>

                {isLoadingQuestions ? (
                  <div className="p-4">
                    <Skeleton className="h-48 w-full bg-gray-800" />
                  </div>
                ) : (
                  matchQuestions.map((question) => (
                    <Card
                      key={question._id}
                      className="mb-4 bg-gray-800 border border-gray-700"
                    >
                      <CardHeader>
                        <CardTitle className="text-lg text-white">
                          {question.question}
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                          Time remaining: {getTimeRemaining(question.closedAt)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-2">
                          {question.options.map((option) => (
                            <Button
                              key={option}
                              variant="outline"
                              className={`w-full justify-start ${
                                selectedOption[question._id] === option
                                  ? "bg-primary text-primary-foreground"
                                  : ""
                              }`}
                              onClick={() =>
                                setSelectedOption((prev) => ({
                                  ...prev,
                                  [question._id]: option,
                                }))
                              }
                            >
                              {option}
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          className="w-full"
                          onClick={() => handleBet(question._id)}
                          disabled={loadingQuestions[question._id] || isPending}
                        >
                          {loadingQuestions[question._id] || isPending ? (
                            <>
                              Placing Bet...
                              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                            </>
                          ) : (
                            "Place Bet"
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                )}
              </div>
            )}
          </ScrollArea>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setSelectedMatch(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
