import { ZG_CONFIG } from "@creature/integration";

export interface KeeperConfig {
  // 0G Network
  network: "testnet" | "mainnet";
  rpcUrl: string;
  privateKey: string;

  // 0G Storage
  indexerUrl: string;
  storageContracts: { flow: string; mine: string };

  // Contracts
  contracts: {
    registry: string;
    nudgeTracker: string;
    payoutSplitter: string;
    evolutionLedger: string;
    treasury: string;
  };

  // Keeper
  pollIntervalMs: number;
  port: number;
}

export function loadConfig(): KeeperConfig {
  const network = (process.env.ZG_NETWORK || "testnet") as "testnet" | "mainnet";
  const zgConfig = ZG_CONFIG[network];

  const privateKey = process.env.ZG_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("ZG_PRIVATE_KEY is required");
  }

  return {
    network,
    rpcUrl: process.env.ZG_RPC_URL || zgConfig.rpcUrl,
    privateKey,
    indexerUrl: process.env.ZG_INDEXER_RPC || zgConfig.indexerUrl,
    storageContracts: zgConfig.storageContracts,
    contracts: {
      registry: process.env.CONTRACT_REGISTRY || "",
      nudgeTracker: process.env.CONTRACT_NUDGE_TRACKER || "",
      payoutSplitter: process.env.CONTRACT_PAYOUT_SPLITTER || "",
      evolutionLedger: process.env.CONTRACT_EVOLUTION_LEDGER || "",
      treasury: process.env.CONTRACT_TREASURY || "",
    },
    pollIntervalMs: parseInt(process.env.KEEPER_POLL_INTERVAL_MS || "12000"),
    port: parseInt(process.env.KEEPER_PORT || "3001"),
  };
}
