/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, Clock, Plus, Edit, Save, Trash2, AlertTriangle, Check, X, PlusCircle, Pencil } from 'lucide-react'
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { motion, AnimatePresence } from "framer-motion"

interface Match {
  _id: string
  teamA: string
  teamB: string
  matchDate: string
}

interface Question {
  _id: string
  question: string
  options: string[]
  isActive: boolean
  closedAt: string
  answer?: string
  matchId: string
}

export default function AdminDashboard() {
  const [matches, setMatches] = useState<Match[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [isLoadingMatches, setIsLoadingMatches] = useState(true)
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false)
  const [activeTab, setActiveTab] = useState("questions")
  
  // New question form state
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    options: ["", ""],
    isActive: true,
    closedAt: "",
    matchId: "",
  })
  
  // Edit question state
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  
  // Answer setting state
  const [answerQuestion, setAnswerQuestion] = useState<Question | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState("")
  const [showAnswerDialog, setShowAnswerDialog] = useState(false)

  // Fetch matches
  useEffect(() => {
    const fetchMatches = async () => {
      setIsLoadingMatches(true)
      try {
        const response = await fetch("/api/layout/matches")
        const data = await response.json()
        if (data.matches && data.matches.length > 0) {
          setMatches(data.matches)
          // Select the first match by default
          setSelectedMatch(data.matches[0])
          setNewQuestion(prev => ({ ...prev, matchId: data.matches[0]._id }))
        }
      } catch (error) {
        console.error("Error fetching matches:", error)
        toast.error("Failed to load matches")
      } finally {
        setIsLoadingMatches(false)
      }
    }

    fetchMatches()
  }, [])

  // Fetch questions for selected match
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!selectedMatch) return
      
      setIsLoadingQuestions(true)
      try {
        const response = await fetch(`/api/layout/questions?id=${selectedMatch._id}`)
        const data = await response.json()
        if (data.questions) {
          setQuestions(data.questions)
        }
      } catch (error) {
        console.error("Error fetching questions:", error)
        toast.error("Failed to load questions")
      } finally {
        setIsLoadingQuestions(false)
      }
    }

    fetchQuestions()
  }, [selectedMatch])

  // Handle match selection
  const handleMatchSelect = (matchId: string) => {
    const match = matches.find(m => m._id === matchId)
    if (match) {
      setSelectedMatch(match)
      setNewQuestion(prev => ({ ...prev, matchId: match._id }))
    }
  }

  // Add option to new question
  const addOption = () => {
    setNewQuestion(prev => ({
      ...prev,
      options: [...prev.options, ""]
    }))
  }

  // Remove option from new question
  const removeOption = (index: number) => {
    if (newQuestion.options.length <= 2) {
      toast.error("A question must have at least 2 options")
      return
    }
    
    setNewQuestion(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }))
  }

  // Update option in new question
  const updateOption = (index: number, value: string) => {
    const updatedOptions = [...newQuestion.options]
    updatedOptions[index] = value
    setNewQuestion(prev => ({
      ...prev,
      options: updatedOptions
    }))
  }

  // Handle creating a new question
  const handleCreateQuestion = async () => {
    // Validate form
    if (!newQuestion.question.trim()) {
      toast.error("Question text is required")
      return
    }
    
    if (!newQuestion.matchId) {
      toast.error("Please select a match")
      return
    }
    
    if (!newQuestion.closedAt) {
      toast.error("Please set a closing date")
      return
    }
    
    if (newQuestion.options.some(opt => !opt.trim())) {
      toast.error("All options must have text")
      return
    }
    
    try {
      const response = await fetch("/api/admin/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newQuestion),
      })
      
      if (!response.ok) {
        throw new Error("Failed to create question")
      }
      
      const data = await response.json()
      
      // Add the new question to the list
      setQuestions(prev => [...prev, data.question])
      
      // Reset form
      setNewQuestion({
        question: "",
        options: ["", ""],
        isActive: true,
        closedAt: "",
        matchId: selectedMatch?._id || "",
      })
      
      toast.success("Question created successfully")
    } catch (error) {
      console.error("Error creating question:", error)
      toast.error("Failed to create question")
    }
  }

  // Handle editing a question
  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question)
    setShowEditDialog(true)
  }

  // Save edited question
  const saveEditedQuestion = async () => {
    if (!editingQuestion) return
    
    try {
      const response = await fetch(`/api/admin/questions/${editingQuestion._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingQuestion),
      })
      
      if (!response.ok) {
        throw new Error("Failed to update question")
      }
      
      setQuestions(prev => 
        prev.map(q => q._id === editingQuestion._id ? editingQuestion : q)
      )
      
      setShowEditDialog(false)
      toast.success("Question updated successfully")
    } catch (error) {
      console.error("Error updating question:", error)
      toast.error("Failed to update question")
    }
  }

  // Handle setting an answer
  const handleSetAnswer = (question: Question) => {
    setAnswerQuestion(question)
    setSelectedAnswer(question.answer || "")
    setShowAnswerDialog(true)
  }

  // Save answer
  const saveAnswer = async () => {
    if (!answerQuestion || !selectedAnswer) return
    
    try {
      const response = await fetch(`/api/admin/questions/${answerQuestion._id}/answer`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answer: selectedAnswer }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to set answer")
      }
      
      // Update the question in the list
      setQuestions(prev => 
        prev.map(q => q._id === answerQuestion._id ? { ...q, answer: selectedAnswer } : q)
      )
      
      setShowAnswerDialog(false)
      toast.success("Answer set successfully")
    } catch (error) {
      console.error("Error setting answer:", error)
      toast.error("Failed to set answer")
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Get time remaining
  const getTimeRemaining = (dateString: string) => {
    const targetDate = new Date(dateString)
    const now = new Date()
    const diff = targetDate.getTime() - now.getTime()

    if (diff <= 0) return "Closed"

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days}d ${hours}h remaining`
    if (hours > 0) return `${hours}h ${minutes}m remaining`
    return `${minutes}m remaining`
  }

  return (
    <div className="py-6">
      <Card className="border-primary/20">
        <CardHeader className="bg-primary/5">
          <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
          <CardDescription>Manage matches, questions, and answers</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <Card>
                <CardHeader className="bg-primary/5 pb-2">
                  <CardTitle className="text-lg">Matches</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[400px]">
                    {isLoadingMatches ? (
                      <div className="p-4 space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                      </div>
                    ) : (
                      <div className="divide-y">
                        {matches.map((match) => (
                          <div
                            key={match._id}
                            className={`p-3 cursor-pointer hover:bg-muted/30 transition-colors ${
                              selectedMatch?._id === match._id ? "bg-primary/10" : ""
                            }`}
                            onClick={() => handleMatchSelect(match._id)}
                          >
                            <div className="font-medium">
                              {match.teamA} vs {match.teamB}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(match.matchDate)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="md:col-span-3">
              <Tabs defaultValue="questions" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="questions">Manage Questions</TabsTrigger>
                  <TabsTrigger value="add">Add New Question</TabsTrigger>
                </TabsList>

                {/* Questions Tab */}
                <TabsContent value="questions" className="mt-4">
                  <Card>
                    <CardHeader className="bg-primary/5">
                      <CardTitle className="flex items-center justify-between">
                        <span>
                          Questions for {selectedMatch ? `${selectedMatch.teamA} vs ${selectedMatch.teamB}` : "Match"}
                        </span>
                        <Badge variant="outline">
                          {questions.length} {questions.length === 1 ? "Question" : "Questions"}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <ScrollArea className="h-[500px]">
                        {isLoadingQuestions ? (
                          <div className="p-4 space-y-4">
                            <Skeleton className="h-32 w-full" />
                            <Skeleton className="h-32 w-full" />
                            <Skeleton className="h-32 w-full" />
                          </div>
                        ) : questions.length > 0 ? (
                          <div className="divide-y">
                            {questions.map((question) => (
                              <div key={question._id} className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h3 className="font-medium text-lg">{question.question}</h3>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                      <Clock className="h-3 w-3" />
                                      <span>Closes: {formatDate(question.closedAt)}</span>
                                      <Badge variant="outline" className="ml-2">
                                        {getTimeRemaining(question.closedAt)}
                                      </Badge>
                                    </div>
                                  </div>
                                  <Badge variant={question.isActive ? "default" : "destructive"}>
                                    {question.isActive ? "Active" : "Inactive"}
                                  </Badge>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-3">
                                  {question.options.map((option, index) => (
                                    <div
                                      key={index}
                                      className={`p-2 rounded-md border ${
                                        question.answer === option
                                          ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                          : "border-muted"
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <div
                                          className={`h-4 w-4 rounded-full border ${
                                            question.answer === option
                                              ? "border-green-500 bg-green-500"
                                              : "border-muted-foreground"
                                          }`}
                                        >
                                          {question.answer === option && (
                                            <div className="h-2 w-2 m-[3px] rounded-full bg-white" />
                                          )}
                                        </div>
                                        <span>{option}</span>
                                        {question.answer === option && (
                                          <Badge
                                            variant="outline"
                                            className="ml-auto text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                          >
                                            Correct Answer
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                <div className="flex justify-end gap-2 mt-4">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditQuestion(question)}
                                  >
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                  </Button>
                                  <Button
                                    variant={question.answer ? "outline" : "default"}
                                    size="sm"
                                    onClick={() => handleSetAnswer(question)}
                                  >
                                    {question.answer ? (
                                      <>
                                        <Pencil className="h-4 w-4 mr-1" />
                                        Change Answer
                                      </>
                                    ) : (
                                      <>
                                        <Check className="h-4 w-4 mr-1" />
                                        Set Answer
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-64">
                            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground text-center">
                              No questions found for this match.
                              <br />
                              Create a new question using the &quot;Add New Question&quot; tab.
                            </p>
                          </div>
                        )}
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Add New Question Tab */}
                <TabsContent value="add" className="mt-4">
                  <Card>
                    <CardHeader className="bg-primary/5">
                      <CardTitle>Add New Question</CardTitle>
                      <CardDescription>
                        Create a new prediction question for {selectedMatch ? `${selectedMatch.teamA} vs ${selectedMatch.teamB}` : "the selected match"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="question">Question</Label>
                          <Textarea
                            id="question"
                            placeholder="Enter your question here..."
                            value={newQuestion.question}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="match">Match</Label>
                          <Select
                            value={newQuestion.matchId}
                            onValueChange={(value: string) => handleMatchSelect(value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a match" />
                            </SelectTrigger>
                            <SelectContent>
                              {matches.map((match) => (
                                <SelectItem key={match._id} value={match._id}>
                                  {match.teamA} vs {match.teamB} ({formatDate(match.matchDate)})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="closedAt">Closing Date</Label>
                          <Input
                            id="closedAt"
                            type="datetime-local"
                            value={newQuestion.closedAt}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewQuestion(prev => ({ ...prev, closedAt: e.target.value }))}
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="isActive"
                            checked={newQuestion.isActive}
                            onCheckedChange={(checked: any) => setNewQuestion(prev => ({ ...prev, isActive: checked }))}
                          />
                          <Label htmlFor="isActive">Active</Label>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Options</Label>
                            <Button variant="outline" size="sm" onClick={addOption}>
                              <Plus className="h-4 w-4 mr-1" />
                              Add Option
                            </Button>
                          </div>
                          <div className="space-y-2">
                            <AnimatePresence>
                              {newQuestion.options.map((option, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="flex items-center gap-2"
                                >
                                  <Input
                                    placeholder={`Option ${index + 1}`}
                                    value={option}
                                    onChange={(e) => updateOption(index, e.target.value)}
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeOption(index)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="bg-primary/5 flex justify-end">
                      <Button onClick={handleCreateQuestion}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Create Question
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Question Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
            <DialogDescription>Make changes to the question details</DialogDescription>
          </DialogHeader>
          {editingQuestion && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-question">Question</Label>
                <Textarea
                  id="edit-question"
                  value={editingQuestion.question}
                  onChange={(e: { target: { value: any } }) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-closedAt">Closing Date</Label>
                <Input
                  id="edit-closedAt"
                  type="datetime-local"
                  value={editingQuestion.closedAt}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, closedAt: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isActive"
                  checked={editingQuestion.isActive}
                  onCheckedChange={(checked: any) => setEditingQuestion({ ...editingQuestion, isActive: checked })}
                />
                <Label htmlFor="edit-isActive">Active</Label>
              </div>

              <div className="space-y-2">
                <Label>Options</Label>
                <div className="space-y-2">
                  {editingQuestion.options.map((option, index) => (
                    <Input
                      key={index}
                      value={option}
                      onChange={(e) => {
                        const updatedOptions = [...editingQuestion.options]
                        updatedOptions[index] = e.target.value
                        setEditingQuestion({ ...editingQuestion, options: updatedOptions })
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveEditedQuestion}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Set Answer Dialog */}
      <Dialog open={showAnswerDialog} onOpenChange={setShowAnswerDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Correct Answer</DialogTitle>
            <DialogDescription>Select the correct answer for this question</DialogDescription>
          </DialogHeader>
          {answerQuestion && (
            <div className="py-4">
              <h3 className="font-medium mb-4">{answerQuestion.question}</h3>
              <div className="space-y-2">
                {answerQuestion.options.map((option, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedAnswer === option
                        ? "border-primary bg-primary/10"
                        : "border-muted hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedAnswer(option)}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-4 w-4 rounded-full border ${
                          selectedAnswer === option ? "border-primary bg-primary" : "border-muted-foreground"
                        }`}
                      >
                        {selectedAnswer === option && <div className="h-2 w-2 m-[3px] rounded-full bg-white" />}
                      </div>
                      <span className="font-medium">{option}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAnswerDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveAnswer} disabled={!selectedAnswer}>
              <Check className="h-4 w-4 mr-2" />
              Set Answer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
