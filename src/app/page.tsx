/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { WagmiProvider, createConfig, http, useReadContract, useWriteContract, useAccount, useSwitchChain } from "wagmi"
import { coinbaseWallet, walletConnect } from "wagmi/connectors"
import { sepolia, mainnet, polygon } from "wagmi/chains"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import Web3AuthConnectorInstance from "./Web3AuthConnectorInstance"
import AdminDashboard from "@/components/admin"
import DashBoard from "@/components/dashboard"


// Create a client
const queryClient = new QueryClient()

// Set up wagmi config
const config = createConfig({
  chains: [mainnet, sepolia, polygon],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
  },
  connectors: [
    walletConnect({
      projectId: "3314f39613059cb687432d249f1658d2",
      showQrModal: true,
    }),
    coinbaseWallet({ appName: "Cricket Prophet" }),
    Web3AuthConnectorInstance([mainnet, sepolia, polygon]),
  ],
})

export default function Home() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {/* <AdminDashboard /> */}
        <DashBoard />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
