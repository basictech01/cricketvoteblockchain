"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Trophy } from "lucide-react"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setIsLoading(true)

    // Add custom login logic here
    setTimeout(() => {
      setIsLoading(false)
    }, 3000)
  }

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md border-zinc-800 bg-zinc-900/95 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/75">
          <CardHeader className="space-y-1">
            <div className="flex justify-center">
              <Trophy className="mb-4 h-12 w-12 text-yellow-500" />
            </div>
            <CardTitle className="text-center text-2xl font-bold text-white">Welcome back</CardTitle>
            <CardDescription className="text-center text-zinc-400">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-400">
                  Email
                </Label>
                <Input
                  id="email"
                  placeholder="name@example.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  disabled={isLoading}
                  className="border-zinc-800 bg-zinc-900 text-white placeholder:text-zinc-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-zinc-400">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  disabled={isLoading}
                  className="border-zinc-800 bg-zinc-900 text-white"
                />
              </div>
              <Button className="w-full bg-emerald-500 text-white hover:bg-emerald-600" disabled={isLoading}>
                {isLoading ? (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : null}
                Sign In
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-zinc-400">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-emerald-400 hover:text-emerald-300">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

