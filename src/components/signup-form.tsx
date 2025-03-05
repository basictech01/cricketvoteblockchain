"use client"

import { useState } from "react"
import { useAccount, useWriteContract } from "wagmi"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { User, Mail, Check, Coins, ArrowRight, UserCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import abi from "@/abis/Vote.json"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

const signupFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(50, { message: "Name must be less than 50 characters" }),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(20, { message: "Username must be less than 20 characters" })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers, and underscores" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
})

type SignupFormValues = z.infer<typeof signupFormSchema>

export default function SignupForm() {
  const { address, isConnected } = useAccount()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showClaimDialog, setShowClaimDialog] = useState(false)
  const [tokensClaimed, setTokensClaimed] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [registeredUsername, setRegisteredUsername] = useState("")
  const [registeredName, setRegisteredName] = useState("")
  const { isPending, writeContractAsync } = useWriteContract()
  const [signupProgress, setSignupProgress] = useState(0)

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: { name: "", username: "", email: "" },
  })

  function handleInitialSignUp() {
    if (!isConnected) {
      toast.error("Please connect your wallet first")
      return
    }
    setShowClaimDialog(true)
    setSignupProgress(25)
  }

  async function handleClaimTokens() {
    try {
      await writeContractAsync({
        address: "0x66f8ECD191AF7F90bc4Fe82629d525e5AB9FDf4C",
        abi: abi,
        functionName: "claimInitialTokens",
      })
      toast.success("Successfully claimed 10 CPT tokens!")
      setTokensClaimed(true)
      setShowClaimDialog(false)
      setSignupProgress(50)
    } catch (error) {
      console.error("Error claiming tokens:", error)
      toast.error("Failed to claim tokens. Please try again.")
    }
  }

  async function onSubmit(data: SignupFormValues) {
    if (!tokensClaimed) {
      toast.error("Please claim your tokens before signing up")
      return
    }

    setIsSubmitting(true)
    setSignupProgress(75)

    try {
      const response = await fetch("/api/users/signUp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, address }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create account")
      }

      toast.success("Account created successfully!")
      setIsRegistered(true)
      setRegisteredUsername(data.username)
      setRegisteredName(data.name)
      setSignupProgress(100)
      setTimeout(() => window.location.reload(), 3000)
    } catch (error) {
      console.error("Error creating account:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create account. Please try again.")
      setSignupProgress(50)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatAddress = (address: string | undefined) =>
    address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ""

  return (
    <>
      <Card className="w-full max-w-md overflow-hidden border-primary/20 shadow-lg">
        <CardHeader className="bg-primary/5 p-6 sm:p-8">
          <CardTitle className="text-2xl sm:text-3xl text-center mb-2">Create Your Account</CardTitle>
          <CardDescription className="text-center text-sm sm:text-base">
            Claim your tokens and sign up to start making predictions
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <Progress value={signupProgress} className="mb-6" />
          <AnimatePresence mode="wait">
            {!isRegistered ? (
              !tokensClaimed ? (
                <motion.div
                  key="claim"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Button onClick={handleInitialSignUp} className="w-full py-6 text-lg">
                    Start Sign Up Process
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      {["name", "username", "email"].map((field) => (
                        <FormField
                          key={field}
                          control={form.control}
                          name={field as keyof SignupFormValues}
                          render={({ field: fieldProps }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">
                                {field.charAt(0).toUpperCase() + field.slice(1)}
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  {field === "name" && (
                                    <UserCircle className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                  )}
                                  {field === "username" && (
                                    <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                  )}
                                  {field === "email" && (
                                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                  )}
                                  <Input
                                    className="pl-10 py-5 text-base"
                                    placeholder={field === "email" ? "john@example.com" : `Enter your ${field}`}
                                    {...fieldProps}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      ))}
                      <Button
                        type="submit"
                        className="w-full py-6 text-lg relative overflow-hidden"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="opacity-0">Create Account</span>
                            <Loader2 className="h-6 w-6 animate-spin absolute inset-0 m-auto" />
                          </>
                        ) : (
                          "Create Account"
                        )}
                      </Button>
                    </form>
                  </Form>
                </motion.div>
              )
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-6 text-center"
              >
                <Check className="h-16 w-16 text-green-500 mx-auto" />
                <h3 className="text-2xl font-semibold">Registration Successful!</h3>
                <p className="text-lg">
                  Welcome, <span className="font-semibold">{registeredName}</span>!
                </p>
                <p className="text-sm text-muted-foreground">Your account has been created successfully.</p>
                <div className="flex flex-col items-center space-y-3">
                  {[
                    { label: "Name", value: registeredName },
                    { label: "Username", value: registeredUsername },
                    { label: "Wallet", value: formatAddress(address) },
                  ].map(({ label, value }) => (
                    <Badge key={label} variant="outline" className="text-sm py-2 px-3">
                      {label}: {value}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
        {tokensClaimed && !isRegistered && (
          <CardFooter className="bg-primary/5 p-4">
            <div className="flex items-center justify-center w-full text-sm text-muted-foreground">
              <Check className="mr-2 h-4 w-4 text-green-500" />
              10 CPT tokens claimed successfully
            </div>
          </CardFooter>
        )}
      </Card>

      <Dialog open={showClaimDialog} onOpenChange={setShowClaimDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl mb-2">Claim Your Welcome Bonus</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Before signing up, you need to claim your 10 CPT tokens. This is a required step to create your account.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-6">
            <div className="rounded-full bg-primary/10 p-4">
              <Coins className="h-12 w-12 text-primary" />
            </div>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button onClick={handleClaimTokens} disabled={isPending} className="w-full sm:w-auto py-6 text-lg">
              {isPending ? (
                <motion.div
                  className="flex items-center justify-center gap-2"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Claiming...
                </motion.div>
              ) : (
                <>
                  <Coins className="mr-2 h-5 w-5" />
                  Claim 10 CPT Tokens
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

