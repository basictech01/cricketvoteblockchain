"use client"

import { useState } from "react"
import { useAccount, useWriteContract } from "wagmi"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { motion } from "framer-motion"
import { User, Mail, Check, Coins, ArrowRight, UserCircle } from "lucide-react"
import { toast } from "sonner"

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

// Form validation schema
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
  const { isPending } = useWriteContract()
  const [signupProgress, setSignupProgress] = useState(0)

  // Initialize form with default values
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
    },
  })

  // Handle initial sign up button click
  function handleInitialSignUp() {
    if (!isConnected) {
      toast.error("Please connect your wallet first")
      return
    }
    setShowClaimDialog(true)
    setSignupProgress(25)
  }

  // Handle claiming welcome tokens
  async function handleClaimTokens() {
    try {
      // Uncomment this when the contract is ready
      // await writeContractAsync({
      //   address: "0x66f8ECD191AF7F90bc4Fe82629d525e5AB9FDf4C",
      //   abi: abi,
      //   functionName: "claimInitialTokens",
      // })

      toast.success("Successfully claimed 10 CPT tokens!")
      setTokensClaimed(true)
      setShowClaimDialog(false)
      setSignupProgress(50)
    } catch (error) {
      console.error("Error claiming tokens:", error)
      toast.error("Failed to claim tokens. Please try again.")
    }
  }

  // Handle form submission (only after tokens are claimed)
  async function onSubmit(data: SignupFormValues) {
    if (!tokensClaimed) {
      toast.error("Please claim your tokens before signing up")
      return
    }

    setIsSubmitting(true)
    setSignupProgress(75)

    try {
      // Call your API endpoint to create a user
      const response = await fetch("/api/users/signUp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          username: data.username,
          email: data.email,
          address: address, // Include the wallet address
        }),
      })

      if (!response.ok) {
        const errorData = await response.json();
        console.log(errorData);
        toast.error(errorData.message || "Failed to create account")
        setSignupProgress(50)
        return
      }

      // Show success message
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

  // Format address for display
  const formatAddress = (address: string | undefined) => {
    if (!address) return ""
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <>
      <Card className="w-full max-w-md overflow-hidden border-primary/20">
        <CardHeader className="bg-primary/5">
          <CardTitle className="text-2xl text-center">Create Your Account</CardTitle>
          <CardDescription className="text-center">
            Claim your tokens and sign up to start making predictions
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Progress value={signupProgress} className="mb-4" />
          {!isRegistered ? (
            !tokensClaimed ? (
              <Button onClick={handleInitialSignUp} className="w-full">
                Start Sign Up Process
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <UserCircle className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <Input className="pl-10" placeholder="John Doe" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <Input className="pl-10" placeholder="johndoe" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <Input className="pl-10" placeholder="john@example.com" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="pt-2">
                    <Button type="submit" className="w-full relative overflow-hidden" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <span className="opacity-0">Create Account</span>
                          <motion.div
                            className="absolute inset-0 flex items-center justify-center"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                          >
                            <Coins className="h-5 w-5" />
                          </motion.div>
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            )
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <Check className="h-12 w-12 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold text-center">Registration Successful!</h3>
              <div className="space-y-2">
                <p className="text-center">
                  Welcome, <span className="font-semibold">{registeredName}</span>!
                </p>
                <p className="text-center text-sm text-muted-foreground">Your account has been created successfully.</p>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <Badge variant="outline" className="text-sm">
                  Name: {registeredName}
                </Badge>
                <Badge variant="outline" className="text-sm">
                  Username: {registeredUsername}
                </Badge>
                <Badge variant="outline" className="text-sm">
                  Wallet: {formatAddress(address)}
                </Badge>
              </div>
            </div>
          )}
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
            <DialogTitle>Claim Your Welcome Bonus</DialogTitle>
            <DialogDescription>
              Before signing up, you need to claim your 10 CPT tokens. This is a required step to create your account.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Coins className="h-8 w-8 text-primary" />
            </div>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button onClick={handleClaimTokens} disabled={isPending} className="w-full sm:w-auto">
              {isPending ? (
                <motion.div
                  className="flex items-center justify-center gap-2"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <Coins className="h-4 w-4" />
                  Claiming...
                </motion.div>
              ) : (
                <>
                  <Coins className="mr-2 h-4 w-4" />
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

