import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Coins, Trophy, User } from "lucide-react"

export default function Dashboard() {
  // Redirect to login if not authenticated
  // const session = await getSession()
  // if (!session) redirect('/login')

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
          <div className="mb-4 flex items-center gap-3 rounded-lg bg-zinc-800/50 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-700">
              <User className="h-5 w-5 text-zinc-400" />
            </div>
            <div>
              <p className="text-sm font-medium">John Doe</p>
              <div className="flex items-center gap-1">
                <Coins className="h-3.5 w-3.5 text-yellow-500" />
                <p className="text-xs text-zinc-400">1,234 coins</p>
              </div>
            </div>
          </div>
          <nav className="space-y-1">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <a href="#live" className="text-zinc-400 hover:text-white">
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
          <div className="flex h-14 items-center px-6">
            <h1 className="text-lg font-semibold">Live Betting</h1>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">India vs Australia</h2>
              <Badge variant="outline" className="border-emerald-500 text-emerald-500">
                LIVE
              </Badge>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <BettingQuestions />
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900">
            <div className="border-b border-zinc-800 p-4">
              <h3 className="font-semibold">Your Active Bets</h3>
            </div>
            <ScrollArea className="h-[300px]">
              <ActiveBets />
            </ScrollArea>
          </div>
        </div>
      </main>
    </div>
  )
}

function BettingQuestions() {
  const questions = [
    {
      id: 1,
      question: "Will Virat Kohli score a century?",
      odds: "3.5x",
      timeLeft: "45m",
      alreadyBet: false,
    },
    {
      id: 2,
      question: "Total sixes in the match > 12?",
      odds: "2.1x",
      timeLeft: "30m",
      alreadyBet: true,
    },
    // Add more questions up to 16
  ].slice(0, 16) // Ensure max 16 questions

  return (
    <>
      {questions.map((q) => (
        <Card
          key={q.id}
          className={`group relative overflow-hidden border-zinc-800 bg-zinc-900/50 transition-colors hover:bg-zinc-900 ${
            q.alreadyBet ? "ring-1 ring-purple-500/50" : ""
          }`}
        >
          <CardContent className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <Badge variant="secondary" className="bg-zinc-800 text-zinc-400">
                {q.odds}
              </Badge>
              {q.alreadyBet && (
                <Badge variant="secondary" className="bg-purple-500/10 text-purple-400">
                  Bet Placed
                </Badge>
              )}
            </div>
            <p className="mb-3 text-sm">{q.question}</p>
            <div className="flex items-center justify-between">
              <Button
                size="sm"
                className={`w-full ${
                  q.alreadyBet
                    ? "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20"
                    : "bg-emerald-500 text-white hover:bg-emerald-600"
                }`}
                disabled={q.alreadyBet}
              >
                {q.alreadyBet ? "Bet Placed" : "Place Bet"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  )
}

function ActiveBets() {
  const bets = [
    {
      id: 1,
      question: "Total sixes in the match > 12?",
      amount: 100,
      potential: 210,
      match: "IND vs AUS",
      status: "live",
    },
    {
      id: 2,
      question: "Will there be a wicket in the next over?",
      amount: 50,
      potential: 125,
      match: "IND vs AUS",
      status: "live",
    },
  ]

  return (
    <div className="space-y-2 p-4">
      {bets.map((bet) => (
        <div
          key={bet.id}
          className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 p-4"
        >
          <div className="space-y-1">
            <p className="text-sm font-medium">{bet.question}</p>
            <p className="text-xs text-zinc-400">{bet.match}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">{bet.amount} coins</p>
            <p className="text-xs text-emerald-400">Potential: {bet.potential}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

