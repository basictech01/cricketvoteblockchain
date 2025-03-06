"use client"

import type React from "react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle, Calendar, Clock, Loader2, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import type { Match, Question } from "@/types/cricket"
import { formatDate, getTimeRemaining, getTeamLogo } from "@/lib/utils"

interface MatchDetailsProps {
  selectedMatch: Match | null
  setSelectedMatch: (match: Match | null) => void
  isQuestionLoading: boolean
  questions: Question[]
  selectedOption: { [key: string]: string }
  setSelectedOption: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>
  isPlacingBet: { [key: string]: boolean }
  handleBet: (questionId: string) => Promise<void>
  address?: string
}

export default function MatchDetails({
  selectedMatch,
  setSelectedMatch,
  isQuestionLoading,
  questions,
  selectedOption,
  setSelectedOption,
  isPlacingBet,
  handleBet,
  address,
}: MatchDetailsProps) {
  return (
    <Dialog open={!!selectedMatch} onOpenChange={(open) => !open && setSelectedMatch(null)}>
      <DialogContent className="max-w-4xl overflow-hidden">
        <DialogHeader className="bg-primary/5 p-4 rounded-t-lg">
          <DialogTitle className="text-2xl flex items-center justify-center gap-4">
            {selectedMatch && (
              <>
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
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-center flex items-center justify-center gap-2">
            <Calendar className="h-4 w-4" />
            {selectedMatch && formatDate(selectedMatch.matchDate)}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 p-6">
            {isQuestionLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-32 w-full rounded-lg" />
              </div>
            ) : selectedMatch && questions && questions.length > 0 ? (
              questions.map((question) => (
                <Card key={question._id} className="overflow-hidden border-primary/20">
                  <CardHeader className="bg-primary/5">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{question.question}</CardTitle>
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
                      disabled={!address || !selectedOption[question._id] || isPlacingBet[question._id]}
                      className="relative overflow-hidden"
                    >
                      {isPlacingBet[question._id] ? (
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
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-center text-muted-foreground">
                  No prediction questions available for this match yet.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
        <DialogFooter className="bg-primary/5 p-4 rounded-b-lg">
          <Button variant="outline" onClick={() => setSelectedMatch(null)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

