"use client"

import { useState } from "react"
import { useAccount, useWriteContract } from "wagmi"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { motion } from "framer-motion"
import { User, Mail, Coins } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

import abi from "../abis/Vote.json"

// Form validation schema
const signupFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(50, { message: "Name must be less than 50 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
})

type SignupFormValues = z.infer<typeof signupFormSchema>

export default function SignupForm() {
  const { address, isConnected } = useAccount()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showClaimDialog, setShowClaimDialog] = useState(false)
  const { writeContractAsync, isPending } = useWriteContract()

  // Initialize form with default values
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  })

  // Handle form submission
  async function onSubmit(data: SignupFormValues) {
    if (!isConnected) {
      toast.error("Please connect your wallet first")
      return
    }

    setIsSubmitting(true)

    try {
      // Call your API endpoint to create a user
      const response = await fetch("/api/users/signUp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          address: address,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create account")
      }

      // Show success message
      toast.success("Account created successfully!")
      setShowClaimDialog(true)
    } catch (error) {
      console.error("Error creating account:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create account. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle claiming welcome tokens
  async function handleClaimTokens() {
    try {
      await writeContractAsync({
        address: "0x66f8ECD191AF7F90bc4Fe82629d525e5AB9FDf4C",
        abi: abi,
        functionName: "claimInitialTokens",
      })

      toast.success("Successfully claimed 10 CPT tokens!")
      setShowClaimDialog(false)
      // Refresh the page after a short delay
      setTimeout(() => window.location.reload(), 2000)
    } catch (error) {
      console.error("Error claiming tokens:", error)
      toast.error("Failed to claim tokens. Please try again.")
    }
  }

  return (
    <>
      <Card className="w-full max-w-md overflow-hidden border-primary/20">
        <CardHeader className="bg-primary/5">
          <CardTitle className="text-2xl text-center">Create Your Account</CardTitle>
          <CardDescription className="text-center">
            Sign up to start making predictions and earning rewards
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
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
                        <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input className="pl-10" placeholder="John Doe" {...field} />
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
        </CardContent>
      </Card>

      <Dialog open={showClaimDialog} onOpenChange={setShowClaimDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Claim Your Welcome Bonus</DialogTitle>
            <DialogDescription>
              Congratulations on creating your account! Claim your 10 CPT tokens to start predicting.
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

