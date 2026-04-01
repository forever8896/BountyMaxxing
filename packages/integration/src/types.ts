export interface Genome {
  generation: number;
  systemPrompt: string;
  learnings: string[];
  strengths: string[];
  weaknesses: string[];
  strategies: Record<string, string>;
  lastUpdated: number;
}

export interface Thought {
  id: string;
  challengeId: number;
  timestamp: number;
  type: "reasoning" | "draft" | "evaluation" | "nudge_analysis" | "evolution" | "system";
  content: string;
  metadata?: Record<string, unknown>;
}

export interface ChallengeInfo {
  id: number;
  requester: string;
  bountyUrl: string;
  context: string;
  fee: bigint;
  status: number;
  submissionHash: string;
  prizeAmount: bigint;
  createdAt: number;
}

export interface NudgeInfo {
  id: number;
  challengeId: number;
  nudger: string;
  contentHash: string;
  parentNudgeId: number;
  weight: number;
  timestamp: number;
}

export interface NudgeEvaluation {
  score: number;
  analysis: string;
  shouldIntegrate: boolean;
  mergedContent?: string;
}

export interface ThoughtResult {
  content: string;
  inputTokens: number;
  outputTokens: number;
}

export const SEED_GENOME: Genome = {
  generation: 0,
  systemPrompt: `You are The Creature, an autonomous AI entity that solves coding bounties and hackathon challenges.

Your work is public. Humans can see your thoughts and improve your submissions.

Core traits:
- You think step by step, breaking problems into manageable parts
- You write clean, well-tested code
- You read bounty requirements carefully and address every criterion
- You learn from every attempt, win or lose
- You are resourceful, creative, and methodical

When generating a solution:
1. Analyze the requirements thoroughly
2. Plan your approach before coding
3. Write the implementation
4. Include tests and documentation
5. Self-evaluate against the bounty criteria`,
  learnings: [],
  strengths: [],
  weaknesses: [],
  strategies: {},
  lastUpdated: Date.now(),
};

export const ZG_CONFIG = {
  testnet: {
    chainId: 16602,
    rpcUrl: "https://evmrpc-testnet.0g.ai",
    indexerUrl: "https://indexer-storage-testnet-turbo.0g.ai",
    explorerUrl: "https://chainscan-galileo.0g.ai",
    storageExplorerUrl: "https://storagescan-galileo.0g.ai",
    storageContracts: {
      flow: "0x22E03a6A89B950F1c82ec5e74F8eCa321a105296",
      mine: "0x00A9E9604b0538e06b268Fb297Df333337f9593b",
    },
  },
  mainnet: {
    chainId: 16661,
    rpcUrl: "https://evmrpc.0g.ai",
    indexerUrl: "", // TBD
    explorerUrl: "https://chainscan.0g.ai",
    storageExplorerUrl: "https://storagescan.0g.ai",
    storageContracts: {
      flow: "",
      mine: "",
    },
  },
};
