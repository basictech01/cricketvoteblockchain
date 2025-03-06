"use client"

import { useState, useEffect } from "react"
import { useAccount, useSwitchChain, useReadContract, useWriteContract } from "wagmi"
import { sepolia } from "wagmi/chains"
import { toast } from "sonner"
import DashboardLayout from "./dashboard-layout"
import WelcomeScreen from "./welcome-screen"
import NetworkSwitchDialog from "./network-switch-dialog"
import MatchDetails from "./match-details"
import PredictionTabs from "./prediction-tabs"
import MobileAccountOverview from "./mobile-account-overview"
import TrendingMatchesSection from "./trending-matches-section"
import LeaderboardSection from "./leaderboard-section"
import LoadingOverlay from "./loading-overlay"

import abi from "@/abis/Vote.json"
import type { Match, Question, Prediction } from "@/types/cricket"

export default function Dashboard() {
  const { chains, switchChain } = useSwitchChain()
  const { chain } = useAccount()
  const { address, isConnected } = useAccount()
  const [showNetworkDialog, setShowNetworkDialog] = useState(false)
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [selectedOption, setSelectedOption] = useState<{ [key: string]: string }>({})
  const [isPlacingBet, setIsPlacingBet] = useState<{ [key: string]: boolean }>({})
  const [isQuestionLoading, setIsQuestionLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("upcoming")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])

  // Mock predictions data - in a real app, this would come from an API
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
  ])

  const { data: tokenBalance, isLoading: isBalanceLoading } = useReadContract({
    abi,
    address: "0x66f8ECD191AF7F90bc4Fe82629d525e5AB9FDf4C",
    functionName: "balanceOf",
    args: [address],
  })

  const { writeContractAsync, isPending } = useWriteContract()

  useEffect(() => {
    const fetchMatches = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/layout/matches")
        const data = await response.json()
        setMatches(data.matches)
      } catch (error) {
        console.error("Error fetching matches:", error)
        toast.error("Failed to load matches. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMatches()
  }, [])

  useEffect(() => {
    if (isConnected && chain && chain.id !== sepolia.id) {
      setShowNetworkDialog(true)
    } else {
      setShowNetworkDialog(false)
    }
  }, [chain, isConnected])

  // Handle network switch
  const handleSwitchToSepolia = async () => {
    try {
      switchChain({ chainId: sepolia.id })
    } catch (error) {
      console.error("Failed to switch network:", error)
      toast.error("Failed to switch network. Please try manually.")
    }
  }

  // Fetch questions when a match is selected
  useEffect(() => {
    async function fetchQuestions() {
      if (selectedMatch) {
        setIsQuestionLoading(true)
        try {
          const res = await fetch(`/api/layout/questions?id=${selectedMatch._id}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          })
          const data = await res.json()
          if (!res.ok) {
            toast.error(data.message)
            return
          }
          setQuestions(data.questions)
        } catch (error) {
          console.error("Error fetching questions:", error)
          toast.error("Failed to load match questions")
        } finally {
          setIsQuestionLoading(false)
        }
      } else {
        setQuestions([])
      }
    }
    fetchQuestions()
  }, [selectedMatch])

  const handleBet = async (questionId: string) => {
    if (!address) {
      toast.error("Please connect your wallet first")
      return
    }

    if (!selectedOption[questionId]) {
      toast.error("Please select an option first")
      return
    }

    // Track loading state for this specific question
    setIsPlacingBet((prev) => ({ ...prev, [questionId]: true }))

    try {
      await writeContractAsync({
        address: "0x66f8ECD191AF7F90bc4Fe82629d525e5AB9FDf4C",
        abi: abi,
        functionName: "vote",
      })

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
      })

      if (!response.ok) {
        throw new Error("Failed to create betting instance")
      }

      // Add to predictions
      if (selectedMatch) {
        const question = questions.find((q) => q._id === questionId)
        if (question) {
          const newPrediction: Prediction = {
            id: Date.now().toString(),
            match: `${selectedMatch.teamA} vs ${selectedMatch.teamB}`,
            question: question.question,
            selectedOption: selectedOption[questionId],
            date: new Date().toISOString(),
            status: "pending",
          }

          setPredictions((prev) => [newPrediction, ...prev])
        }
      }

      // Reset selected option for this question
      setSelectedOption((prev) => ({
        ...prev,
        [questionId]: "",
      }))

      toast.success("Prediction placed successfully!")
    } catch (error) {
      console.error("Error placing bet:", error)
      toast.error("Failed to place prediction. Please try again.")
    } finally {
      setIsPlacingBet((prev) => ({ ...prev, [questionId]: false }))
    }
  }

  // Check if any prediction is being placed
  const isAnyPredictionLoading = Object.values(isPlacingBet).some(Boolean)

  return (
    <>
      <DashboardLayout
        isConnected={isConnected}
        address={address}
        chain={chain}
        tokenBalance={tokenBalance}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        chains={chains}
      >
        {isConnected ? (
          <>
            {/* Mobile Account Overview */}
            <MobileAccountOverview
              address={address}
              chain={chain}
              chains={chains}
              tokenBalance={tokenBalance}
              isBalanceLoading={isBalanceLoading}
            />

            {/* Prediction Tabs */}
            <PredictionTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              isLoading={isLoading}
              matches={matches}
              currentMatchIndex={currentMatchIndex}
              setCurrentMatchIndex={setCurrentMatchIndex}
              setSelectedMatch={setSelectedMatch}
              predictions={predictions}
            />

            {/* Trending Matches - Desktop Only */}
            <TrendingMatchesSection
              isLoading={isLoading}
              matches={matches}
              questions={questions}
              setSelectedMatch={setSelectedMatch}
            />

            {/* Leaderboard - Desktop Only */}
            <LeaderboardSection />
          </>
        ) : (
          <WelcomeScreen />
        )}
      </DashboardLayout>

      {/* Match Detail Modal */}
      <MatchDetails
        selectedMatch={selectedMatch}
        setSelectedMatch={setSelectedMatch}
        isQuestionLoading={isQuestionLoading}
        questions={questions}
        selectedOption={selectedOption}
        setSelectedOption={setSelectedOption}
        isPlacingBet={isPlacingBet}
        handleBet={handleBet}
        address={address}
      />

      {/* Network switch dialog */}
      <NetworkSwitchDialog
        showNetworkDialog={showNetworkDialog}
        setShowNetworkDialog={setShowNetworkDialog}
        chain={chain}
        chains={chains}
        handleSwitchToSepolia={handleSwitchToSepolia}
      />

      {/* Loading Overlay */}
      {isAnyPredictionLoading && <LoadingOverlay />}
    </>
  )
}

