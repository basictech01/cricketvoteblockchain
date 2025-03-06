"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Flame, Star } from "lucide-react"

export default function LeaderboardSection() {
  return (
    <div className="hidden lg:block mt-8">
      <h2 className="text-xl font-bold mb-4">Top Predictors</h2>
      <Card>
        <CardHeader className="bg-primary/5">
          <CardTitle>Weekly Leaderboard</CardTitle>
          <CardDescription>Top performers based on prediction accuracy</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 font-bold">
                    {i}
                  </div>
                  <Avatar className="h-10 w-10 border-2 border-primary/20">
                    <AvatarFallback>{String.fromCharCode(64 + i)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">User{i}</p>
                    <p className="text-xs text-muted-foreground">{90 - i * 5}% accuracy</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-primary/10">
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
  )
}

