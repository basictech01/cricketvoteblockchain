/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { coinbaseWallet, walletConnect } from "wagmi/connectors";
import { sepolia, mainnet, polygon } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Web3AuthConnectorInstance from "./Web3AuthConnectorInstance";
import { ConnectButton } from "./ConnectButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coins, Trophy, User, Calendar, Clock, ArrowRight } from "lucide-react";
import { useAccount } from "wagmi";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

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
        <Dashboard />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

function Dashboard() {
  const { address, isConnected } = useAccount();
  const [userData, setUserData] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [userBets, setUserBets] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState({
    user: false,
    matches: false,
    questions: false,
    bets: false,
    leaderboard: false,
  });

  // Fetch user data when connected
  useEffect(() => {
    if (isConnected && address) {
      // In a real app, you would authenticate with the backend
      // and get the user data
      setLoading((prev) => ({ ...prev, user: true }));

      // Mock user data for demo
      setTimeout(() => {
        setUserData({
          id: "user-1",
          name: "John Doe",
          email: "john@example.com",
          balance: 1250,
          totalBets: 15,
          totalWins: 8,
          totalLosses: 7,
          totalEarnings: 350,
        });
        setLoading((prev) => ({ ...prev, user: false }));
      }, 1000);
    }
  }, [isConnected, address]);

  // Fetch matches
  useEffect(() => {
    setLoading((prev) => ({ ...prev, matches: true }));

    // Mock API call for demo
    setTimeout(() => {
      setMatches([
        {
          id: "match-1",
          title: "India vs Australia",
          shortTitle: "IND vs AUS",
          status: "live",
          format: "T20",
          startTime: new Date(),
          venue: "Melbourne Cricket Ground",
          teams: [
            { id: "IND", name: "India", shortName: "IND" },
            { id: "AUS", name: "Australia", shortName: "AUS" },
          ],
          scores: {
            team1: "IND: 185/4 (20)",
            team2: "AUS: 120/3 (15.2)",
          },
        },
        {
          id: "match-2",
          title: "England vs South Africa",
          shortTitle: "ENG vs SA",
          status: "upcoming",
          format: "ODI",
          startTime: new Date(Date.now() + 86400000), // Tomorrow
          venue: "Lord's, London",
          teams: [
            { id: "ENG", name: "England", shortName: "ENG" },
            { id: "SA", name: "South Africa", shortName: "SA" },
          ],
        },
        {
          id: "match-3",
          title: "New Zealand vs Pakistan",
          shortTitle: "NZ vs PAK",
          status: "completed",
          format: "Test",
          startTime: new Date(Date.now() - 86400000), // Yesterday
          venue: "Eden Park, Auckland",
          teams: [
            { id: "NZ", name: "New Zealand", shortName: "NZ" },
            { id: "PAK", name: "Pakistan", shortName: "PAK" },
          ],
          scores: {
            team1: "NZ: 350 & 250/8d",
            team2: "PAK: 275 & 220",
          },
          result: "New Zealand won by 105 runs",
        },
      ]);
      setLoading((prev) => ({ ...prev, matches: false }));
    }, 1000);
  }, []);

  // Fetch questions
  useEffect(() => {
    setLoading((prev) => ({ ...prev, questions: true }));

    // Mock API call for demo
    setTimeout(() => {
      setQuestions([
        {
          id: "q-1",
          question: "Will Virat Kohli score a century?",
          match: { id: "match-1", shortTitle: "IND vs AUS" },
          options: [
            { text: "Yes", odds: 3.5 },
            { text: "No", odds: 1.3 },
          ],
          isActive: true,
          category: "player",
          minBet: 10,
          maxBet: 500,
        },
        {
          id: "q-2",
          question: "Total sixes in the match > 12?",
          match: { id: "match-1", shortTitle: "IND vs AUS" },
          options: [
            { text: "Yes", odds: 2.1 },
            { text: "No", odds: 1.8 },
          ],
          isActive: true,
          category: "match",
          minBet: 10,
          maxBet: 500,
        },
        {
          id: "q-3",
          question: "Which team will win the toss?",
          match: { id: "match-2", shortTitle: "ENG vs SA" },
          options: [
            { text: "England", odds: 1.9 },
            { text: "South Africa", odds: 1.9 },
          ],
          isActive: true,
          category: "match",
          minBet: 10,
          maxBet: 500,
        },
        {
          id: "q-4",
          question: "Will there be a century in the match?",
          match: { id: "match-2", shortTitle: "ENG vs SA" },
          options: [
            { text: "Yes", odds: 2.5 },
            { text: "No", odds: 1.5 },
          ],
          isActive: true,
          category: "match",
          minBet: 10,
          maxBet: 500,
        },
      ]);
      setLoading((prev) => ({ ...prev, questions: false }));
    }, 1000);
  }, []);

  // Fetch user bets
  useEffect(() => {
    if (isConnected && address) {
      setLoading((prev) => ({ ...prev, bets: true }));

      // Mock API call for demo
      setTimeout(() => {
        setUserBets([
          {
            id: "bet-1",
            question: {
              id: "q-2",
              question: "Total sixes in the match > 12?",
              match: { id: "match-1", shortTitle: "IND vs AUS" },
            },
            selectedOption: "Yes",
            amount: 100,
            potentialWinnings: 210,
            status: "pending",
            createdAt: new Date(),
          },
          {
            id: "bet-2",
            question: {
              id: "q-1",
              question: "Will Virat Kohli score a century?",
              match: { id: "match-1", shortTitle: "IND vs AUS" },
            },
            selectedOption: "No",
            amount: 50,
            potentialWinnings: 65,
            status: "pending",
            createdAt: new Date(),
          },
        ]);
        setLoading((prev) => ({ ...prev, bets: false }));
      }, 1000);
    }
  }, [isConnected, address]);

  // Fetch leaderboard
  useEffect(() => {
    setLoading((prev) => ({ ...prev, leaderboard: true }));

    // Mock API call for demo
    setTimeout(() => {
      setLeaderboard([
        {
          rank: 1,
          id: "user-2",
          name: "Alice Smith",
          profilePicture: "/placeholder.svg?height=40&width=40",
          balance: 2500,
          totalBets: 25,
          totalWins: 18,
          totalEarnings: 1200,
        },
        {
          rank: 2,
          id: "user-3",
          name: "Bob Johnson",
          profilePicture: "/placeholder.svg?height=40&width=40",
          balance: 1800,
          totalBets: 20,
          totalWins: 12,
          totalEarnings: 800,
        },
        {
          rank: 3,
          id: "user-1",
          name: "John Doe",
          profilePicture: "/placeholder.svg?height=40&width=40",
          balance: 1250,
          totalBets: 15,
          totalWins: 8,
          totalEarnings: 350,
        },
        {
          rank: 4,
          id: "user-4",
          name: "Charlie Brown",
          profilePicture: "/placeholder.svg?height=40&width=40",
          balance: 950,
          totalBets: 12,
          totalWins: 5,
          totalEarnings: 150,
        },
        {
          rank: 5,
          id: "user-5",
          name: "Diana Prince",
          profilePicture: "/placeholder.svg?height=40&width=40",
          balance: 800,
          totalBets: 10,
          totalWins: 4,
          totalEarnings: 100,
        },
      ]);
      setLoading((prev) => ({ ...prev, leaderboard: false }));
    }, 1000);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-30 h-screen w-64 border-r border-zinc-800 bg-zinc-900/95 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/75">
        <div className="flex h-14 items-center border-b border-zinc-800 px-4">
          <span className="flex items-center gap-2 font-semibold">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Cricket Prophet
          </span>
        </div>
        <div className="p-4">
          {isConnected && userData ? (
            <div className="mb-4 flex items-center gap-3 rounded-lg bg-zinc-800/50 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-700">
                <User className="h-5 w-5 text-zinc-400" />
              </div>
              <div>
                <p className="text-sm font-medium">{userData.name}</p>
                <div className="flex items-center gap-1">
                  <Coins className="h-3.5 w-3.5 text-yellow-500" />
                  <p className="text-xs text-zinc-400">
                    {formatCurrency(userData.balance)} coins
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-4 flex items-center justify-center rounded-lg bg-zinc-800/50 p-3">
              <ConnectButton />
            </div>
          )}
          <nav className="space-y-1">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <a href="#live" className="text-white">
                Live Matches
              </a>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <a href="#mybets" className="text-zinc-400 hover:text-white">
                My Bets
              </a>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <a href="#leaderboard" className="text-zinc-400 hover:text-white">
                Leaderboard
              </a>
            </Button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pl-64">
        <div className="border-b border-zinc-800 bg-zinc-900/95 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/75">
          <div className="flex h-14 items-center px-6 justify-between">
            <h1 className="text-lg font-semibold">Cricket Predictions</h1>
            <ConnectButton />
          </div>
        </div>

        <div className="p-6">
          <Tabs defaultValue="live" className="space-y-6">
            <TabsList className="bg-zinc-800/50">
              <TabsTrigger value="live">Live Matches</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="mybets">My Bets</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            </TabsList>

            <TabsContent value="live" className="space-y-6">
              {loading.matches ? (
                <div className="text-center py-10">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                  <p className="mt-2 text-zinc-400">Loading matches...</p>
                </div>
              ) : (
                <>
                  {matches
                    .filter((m) => m.status === "live")
                    .map((match) => (
                      <div key={match.id} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="text-xl font-semibold">
                              {match.title}
                            </h2>
                            <div className="flex items-center gap-2 text-sm text-zinc-400">
                              <Badge
                                variant="outline"
                                className="bg-zinc-800 text-zinc-300 border-zinc-700"
                              >
                                {match.format}
                              </Badge>
                              <span>{match.venue}</span>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className="border-emerald-500 text-emerald-500"
                          >
                            LIVE
                          </Badge>
                        </div>

                        {match.scores && (
                          <div className="grid grid-cols-2 gap-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                            <div>
                              <p className="text-lg font-medium">
                                {match.teams[0].name}
                              </p>
                              <p className="text-xl font-bold">
                                {match.scores.team1}
                              </p>
                            </div>
                            <div>
                              <p className="text-lg font-medium">
                                {match.teams[1].name}
                              </p>
                              <p className="text-xl font-bold">
                                {match.scores.team2 || "Yet to bat"}
                              </p>
                            </div>
                          </div>
                        )}

                        <div>
                          <div className="mb-3 flex items-center justify-between">
                            <h3 className="font-semibold">Betting Questions</h3>
                            <Link href={`/matches/${match.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1"
                              >
                                View All <ArrowRight className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {questions
                              .filter((q) => q.match.id === match.id)
                              .map((question) => (
                                <BettingQuestion
                                  key={question.id}
                                  question={question}
                                  userBets={userBets}
                                  isConnected={isConnected}
                                />
                              ))}
                          </div>
                        </div>
                      </div>
                    ))}

                  {matches.filter((m) => m.status === "live").length === 0 && (
                    <div className="text-center py-10">
                      <p className="text-zinc-400">
                        No live matches at the moment
                      </p>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-6">
              {loading.matches ? (
                <div className="text-center py-10">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                  <p className="mt-2 text-zinc-400">Loading matches...</p>
                </div>
              ) : (
                <>
                  {matches
                    .filter((m) => m.status === "upcoming")
                    .map((match) => (
                      <div
                        key={match.id}
                        className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h2 className="text-lg font-semibold">
                            {match.title}
                          </h2>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="bg-zinc-800 text-zinc-300 border-zinc-700"
                            >
                              {match.format}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="border-blue-500 text-blue-500"
                            >
                              UPCOMING
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-zinc-400 mb-4">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(match.startTime).toLocaleDateString()}
                          </span>
                          <Clock className="h-4 w-4 ml-2" />
                          <span>
                            {new Date(match.startTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 rounded-lg bg-zinc-800/50">
                            <p className="font-medium">{match.teams[0].name}</p>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-zinc-800/50">
                            <p className="font-medium">{match.teams[1].name}</p>
                          </div>
                        </div>

                        {questions.filter((q) => q.match.id === match.id)
                          .length > 0 && (
                          <div className="mt-4">
                            <h3 className="font-semibold mb-3">
                              Pre-Match Questions
                            </h3>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                              {questions
                                .filter((q) => q.match.id === match.id)
                                .map((question) => (
                                  <BettingQuestion
                                    key={question.id}
                                    question={question}
                                    userBets={userBets}
                                    isConnected={isConnected}
                                  />
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                  {matches.filter((m) => m.status === "upcoming").length ===
                    0 && (
                    <div className="text-center py-10">
                      <p className="text-zinc-400">No upcoming matches</p>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="mybets">
              {!isConnected ? (
                <div className="text-center py-10">
                  <p className="text-zinc-400 mb-4">
                    Connect your wallet to view your bets
                  </p>
                  <ConnectButton />
                </div>
              ) : loading.bets ? (
                <div className="text-center py-10">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                  <p className="mt-2 text-zinc-400">Loading your bets...</p>
                </div>
              ) : (
                <div className="rounded-lg border border-zinc-800 bg-zinc-900">
                  <div className="border-b border-zinc-800 p-4">
                    <h3 className="font-semibold">Your Active Bets</h3>
                  </div>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2 p-4">
                      {userBets.length > 0 ? (
                        userBets.map((bet) => (
                          <div
                            key={bet.id}
                            className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 p-4"
                          >
                            <div className="space-y-1">
                              <p className="text-sm font-medium">
                                {bet.question.question}
                              </p>
                              <div className="flex items-center gap-2">
                                <p className="text-xs text-zinc-400">
                                  {bet.question.match.shortTitle}
                                </p>
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/20"
                                >
                                  {bet.selectedOption}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                {formatCurrency(bet.amount)} coins
                              </p>
                              <p className="text-xs text-emerald-400">
                                Potential:{" "}
                                {formatCurrency(bet.potentialWinnings)}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-zinc-400">
                            You have no active bets
                          </p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </TabsContent>

            <TabsContent value="leaderboard">
              {loading.leaderboard ? (
                <div className="text-center py-10">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                  <p className="mt-2 text-zinc-400">Loading leaderboard...</p>
                </div>
              ) : (
                <div className="rounded-lg border border-zinc-800 bg-zinc-900">
                  <div className="border-b border-zinc-800 p-4">
                    <h3 className="font-semibold">Top Predictors</h3>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-12 gap-4 border-b border-zinc-800 pb-2 text-sm font-medium text-zinc-400">
                      <div className="col-span-1">Rank</div>
                      <div className="col-span-4">User</div>
                      <div className="col-span-2 text-right">Balance</div>
                      <div className="col-span-2 text-right">Bets</div>
                      <div className="col-span-1 text-right">Wins</div>
                      <div className="col-span-2 text-right">Earnings</div>
                    </div>

                    {leaderboard.map((user) => (
                      <div
                        key={user.id}
                        className={`grid grid-cols-12 gap-4 py-3 text-sm ${
                          userData && user.id === userData.id
                            ? "bg-zinc-800/30 rounded-lg"
                            : ""
                        }`}
                      >
                        <div className="col-span-1 flex items-center">
                          {user.rank === 1 ? (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500/20 text-yellow-500">
                              1
                            </div>
                          ) : user.rank === 2 ? (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-400/20 text-zinc-400">
                              2
                            </div>
                          ) : user.rank === 3 ? (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-700/20 text-amber-700">
                              3
                            </div>
                          ) : (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 text-zinc-400">
                              {user.rank}
                            </div>
                          )}
                        </div>
                        <div className="col-span-4 flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-zinc-800 overflow-hidden">
                            <img
                              src={
                                user.profilePicture ||
                                "/placeholder.svg?height=32&width=32"
                              }
                              alt={user.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <span className="font-medium">{user.name}</span>
                        </div>
                        <div className="col-span-2 flex items-center justify-end gap-1">
                          <Coins className="h-4 w-4 text-yellow-500" />
                          <span>{formatCurrency(user.balance)}</span>
                        </div>
                        <div className="col-span-2 text-right">
                          {user.totalBets}
                        </div>
                        <div className="col-span-1 text-right text-emerald-400">
                          {user.totalWins}
                        </div>
                        <div className="col-span-2 text-right text-emerald-400">
                          +{formatCurrency(user.totalEarnings)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

function BettingQuestion({
  question,
  userBets,
  isConnected,
}: {
  question: any;
  userBets: any[];
  isConnected: boolean;
}) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState<number>(question.minBet);
  const [showBetForm, setShowBetForm] = useState<boolean>(false);

  // Check if user has already bet on this question
  const existingBet = userBets.find((bet) => bet.question.id === question.id);

  return (
    <Card
      className={`group relative overflow-hidden border-zinc-800 bg-zinc-900/50 transition-colors hover:bg-zinc-900 ${
        existingBet ? "ring-1 ring-purple-500/50" : ""
      }`}
    >
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <Badge variant="secondary" className="bg-zinc-800 text-zinc-400">
            {question.match.shortTitle}
          </Badge>
          {existingBet && (
            <Badge
              variant="secondary"
              className="bg-purple-500/10 text-purple-400"
            >
              Bet Placed
            </Badge>
          )}
        </div>
        <p className="mb-3 text-sm font-medium">{question.question}</p>

        {!showBetForm && !existingBet && (
          <div className="space-y-2">
            {question.options.map((option: any) => (
              <div
                key={option.text}
                className="flex items-center justify-between text-sm"
              >
                <span>{option.text}</span>
                <Badge
                  variant="outline"
                  className="bg-zinc-800 border-zinc-700"
                >
                  {option.odds}x
                </Badge>
              </div>
            ))}
            <Button
              size="sm"
              className="w-full mt-2"
              onClick={() => setShowBetForm(true)}
              disabled={!isConnected}
            >
              {isConnected ? "Place Bet" : "Connect to Bet"}
            </Button>
          </div>
        )}

        {showBetForm && !existingBet && (
          <div className="space-y-2">
            <div className="space-y-1">
              <label className="text-xs text-zinc-400">Select Option</label>
              <div className="grid grid-cols-2 gap-2">
                {question.options.map((option: any) => (
                  <Button
                    key={option.text}
                    variant={
                      selectedOption === option.text ? "default" : "outline"
                    }
                    size="sm"
                    className="w-full"
                    onClick={() => setSelectedOption(option.text)}
                  >
                    {option.text} ({option.odds}x)
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs text-zinc-400">Bet Amount</label>
                <span className="text-xs text-zinc-400">
                  Min: {question.minBet} | Max: {question.maxBet}
                </span>
              </div>
              <input
                type="range"
                min={question.minBet}
                max={question.maxBet}
                step={10}
                value={betAmount}
                onChange={(e) => setBetAmount(Number.parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex items-center justify-between">
                <span className="text-sm">{betAmount} coins</span>
                <span className="text-sm text-emerald-400">
                  Potential:{" "}
                  {selectedOption
                    ? (
                        betAmount *
                        (question.options.find(
                          (o: any) => o.text === selectedOption
                        )?.odds || 1)
                      ).toFixed(0)
                    : "0"}{" "}
                  coins
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                className="w-1/2"
                onClick={() => setShowBetForm(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="w-1/2"
                disabled={!selectedOption}
                onClick={() => {
                  // In a real app, this would call the API to place the bet
                  alert(`Bet placed: ${selectedOption} for ${betAmount} coins`);
                  setShowBetForm(false);
                }}
              >
                Confirm Bet
              </Button>
            </div>
          </div>
        )}

        {existingBet && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Your bet:</span>
              <Badge className="bg-purple-500/20 text-purple-400 border-none">
                {existingBet.selectedOption}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Amount:</span>
              <span>{formatCurrency(existingBet.amount)} coins</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Potential win:</span>
              <span className="text-emerald-400">
                {formatCurrency(existingBet.potentialWinnings)} coins
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
