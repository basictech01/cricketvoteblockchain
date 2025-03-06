"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Calendar } from "lucide-react"
import type { Match, Question } from "@/types/cricket"
import { formatDate, getTimeRemaining } from "@/lib/utils"

interface TrendingMatchesSectionProps {
  isLoading: boolean
  matches: Match[]
  questions: Question[]
  setSelectedMatch: (match: Match) => void
}

export default function TrendingMatchesSection({
  isLoading,
  matches,
  questions,
  setSelectedMatch,
}: TrendingMatchesSectionProps) {
  return (
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
                  {questions?.length > 0
                    ? `${questions.length} prediction questions available`
                    : "Questions coming soon"}
                </div>
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex -space-x-2">
                          <Avatar className="border-2 border-background h-8 w-8">
                            <AvatarFallback className="bg-primary/20 text-xs">{match.teamA.slice(0, 2)}</AvatarFallback>
                          </Avatar>
                          <Avatar className="border-2 border-background h-8 w-8">
                            <AvatarFallback className="bg-primary/20 text-xs">{match.teamB.slice(0, 2)}</AvatarFallback>
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
                    <span className="text-primary font-medium">250+</span> users predicting
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/20 p-3">
                <Button variant="ghost" className="w-full" onClick={() => setSelectedMatch(match)}>
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
      </div>
    </div>
  )
}

