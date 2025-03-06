"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, ChevronLeft, ChevronRight, Clock, Coins, Trophy, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { Match, Prediction } from "@/types/cricket"
import { formatDate, getTimeRemaining, getTeamLogo, getStatusColor, getStatusText } from "@/lib/utils"

interface PredictionTabsProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  isLoading: boolean
  matches: Match[]
  currentMatchIndex: number
  setCurrentMatchIndex: (index: number) => void
  setSelectedMatch: (match: Match) => void
  predictions: Prediction[]
}

export default function PredictionTabs({
  activeTab,
  setActiveTab,
  isLoading,
  matches,
  currentMatchIndex,
  setCurrentMatchIndex,
  setSelectedMatch,
  predictions,
}: PredictionTabsProps) {
  return (
    <Tabs defaultValue="upcoming" className="mb-6" onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="upcoming" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Upcoming Matches
        </TabsTrigger>
        <TabsTrigger value="predictions" className="flex items-center gap-2">
          <Trophy className="h-4 w-4" />
          Your Predictions
        </TabsTrigger>
      </TabsList>

      {/* Upcoming Matches Tab */}
      <TabsContent value="upcoming" className="mt-4">
        <Card className="overflow-hidden border-primary/20">
          <CardHeader className="bg-primary/5">
            <CardTitle>Upcoming Matches</CardTitle>
            <CardDescription>Swipe or use arrows to navigate matches</CardDescription>
          </CardHeader>
          <CardContent className="relative p-0">
            {isLoading ? (
              <div className="p-6">
                <Skeleton className="h-64 w-full" />
              </div>
            ) : matches.length > 0 ? (
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
                            src={getTeamLogo(matches[currentMatchIndex]?.teamA) || "/placeholder.svg"}
                            alt={matches[currentMatchIndex].teamA}
                            className="h-auto max-h-20"
                          />
                          <span className="text-xl font-bold">{matches[currentMatchIndex].teamA}</span>
                        </div>
                        <span className="text-xl font-bold">vs</span>
                        <div className="flex items-center gap-4">
                          <span className="text-xl font-bold">{matches[currentMatchIndex].teamB}</span>
                          <img
                            src={getTeamLogo(matches[currentMatchIndex].teamB) || "/placeholder.svg"}
                            alt={matches[currentMatchIndex].teamB}
                            className="h-auto max-h-20"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-6 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(matches[currentMatchIndex].matchDate)}</span>
                        <Clock className="h-4 w-4 ml-2" />
                        <span>{getTimeRemaining(matches[currentMatchIndex].matchDate)}</span>
                      </div>

                      <div className="flex justify-center">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-medium flex items-center gap-2"
                          onClick={() => setSelectedMatch(matches[currentMatchIndex])}
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
                  onClick={() => setCurrentMatchIndex((prev) => (prev > 0 ? prev - 1 : matches.length - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-1/2 right-2 transform -translate-y-1/2 rounded-full h-10 w-10 bg-background/80 backdrop-blur-sm"
                  onClick={() => setCurrentMatchIndex((prev) => (prev < matches.length - 1 ? prev + 1 : 0))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-center text-muted-foreground">No upcoming matches available.</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-primary/5 py-3 px-6">
            <div className="flex justify-between items-center w-full">
              <span className="text-sm text-muted-foreground">
                {!isLoading && matches.length > 0 && `${currentMatchIndex + 1} of ${matches.length} matches`}
              </span>
              <div className="flex gap-1">
                {!isLoading &&
                  matches.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-2 w-2 rounded-full cursor-pointer ${
                        idx === currentMatchIndex ? "bg-primary" : "bg-primary/30"
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
            <CardDescription>Track your recent predictions and rewards</CardDescription>
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
                          <h3 className="font-medium">{prediction.match}</h3>
                          <p className="text-sm text-muted-foreground">{prediction.question}</p>
                        </div>
                        <Badge variant="outline" className={`${getStatusColor(prediction.status)} text-white`}>
                          {getStatusText(prediction.status)}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{prediction.selectedOption}</Badge>
                          <span className="text-xs text-muted-foreground">{formatDate(prediction.date)}</span>
                        </div>
                        {prediction.reward && (
                          <div className="flex items-center gap-1 text-green-500">
                            <Coins className="h-3 w-3" />
                            <span className="font-medium">+{prediction.reward} CPT</span>
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
  )
}

