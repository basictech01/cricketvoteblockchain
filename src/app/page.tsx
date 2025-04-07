"use client";

import {
  WagmiProvider,
  createConfig,
  http,
  useReadContract,
  useAccount,
} from "wagmi";
import { coinbaseWallet, walletConnect } from "wagmi/connectors";
import { sepolia, mainnet, polygon } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Web3AuthConnectorInstance from "./Web3AuthConnectorInstance";
import AdminDashboard from "@/components/admin";
import DashBoard from "@/components/dashboard";
import { Toaster } from "sonner";
import abi from "../abis/Vote.json";

// Contract address for the CricketVoteToken contract
const CONTRACT_ADDRESS = "0x16B81D58b7312B452d8198C57629586260Db0ee0";

// Create a client
const queryClient = new QueryClient();

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
});

export default function Home() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Toaster position="top-right" richColors />
        <MainApp />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

function MainApp() {
  const { address } = useAccount();

  const { data: isAdmin } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi,
    functionName: "checkAdmin",
    args: [address],
  });

  return isAdmin ? <AdminDashboard /> : <DashBoard />;
}
