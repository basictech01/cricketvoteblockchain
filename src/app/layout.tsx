import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Cricket Prophet | Predict & Win",
  description: "Make predictions on cricket matches and earn rewards with Cricket Prophet",
  keywords: "cricket, betting, predictions, blockchain, web3, cricket prophet",
  authors: [{ name: "Cricket Prophet Team" }],
  openGraph: {
    type: "website",
    title: "Cricket Prophet | Predict & Win",
    description: "Make predictions on cricket matches and earn rewards with Cricket Prophet",
    images: ["/og-image.png"],
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased min-h-screen bg-gradient-to-b from-background to-background/95 dark:from-background dark:to-background/90`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  )
}

