import { http, createConfig } from "wagmi";
import { defineChain } from "viem";

export const zgTestnet = defineChain({
  id: 16602,
  name: "0G Galileo Testnet",
  nativeCurrency: { name: "0G", symbol: "OG", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://evmrpc-testnet.0g.ai"] },
  },
  blockExplorers: {
    default: { name: "ChainScan", url: "https://chainscan-galileo.0g.ai" },
  },
  testnet: true,
});

export const config = createConfig({
  chains: [zgTestnet],
  transports: {
    [zgTestnet.id]: http(),
  },
});

// Contract addresses — loaded from keeper health endpoint
export const KEEPER_URL = "http://localhost:3001";
