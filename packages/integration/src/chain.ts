/**
 * 0G Chain interaction layer — typed wrappers around deployed contracts.
 */

import { ethers } from "ethers";
import type { ChallengeInfo, NudgeInfo } from "./types.js";

// ABI fragments for the contracts we interact with
const REGISTRY_ABI = [
  "function challengeCount() view returns (uint256)",
  "function challenges(uint256) view returns (uint256 id, address requester, string bountyUrl, string context, uint256 fee, uint8 status, bytes32 submissionHash, uint256 prizeAmount, uint256 createdAt, uint256 acknowledgedAt)",
  "function getChallenge(uint256) view returns (tuple(uint256 id, address requester, string bountyUrl, string context, uint256 fee, uint8 status, bytes32 submissionHash, uint256 prizeAmount, uint256 createdAt, uint256 acknowledgedAt))",
  "function getActiveChallenges() view returns (uint256[])",
  "function submitRequest(string, string) payable returns (uint256)",
  "function acknowledge(uint256)",
  "function updateStatus(uint256, uint8, bytes32)",
  "function settleWin(uint256) payable",
  "function settleLoss(uint256)",
  "event RequestSubmitted(uint256 indexed challengeId, address indexed requester, string bountyUrl, uint256 fee)",
  "event ChallengeAcknowledged(uint256 indexed challengeId)",
  "event StatusUpdated(uint256 indexed challengeId, uint8 newStatus, bytes32 submissionHash)",
  "event ChallengeWon(uint256 indexed challengeId, uint256 prizeAmount)",
  "event ChallengeLost(uint256 indexed challengeId)",
];

const NUDGE_TRACKER_ABI = [
  "function submitNudge(uint256, bytes32, uint256) returns (uint256)",
  "function setNudgeWeight(uint256, uint256)",
  "function getNudgesForChallenge(uint256) view returns (tuple(uint256 id, uint256 challengeId, address nudger, bytes32 contentHash, uint256 parentNudgeId, uint256 weight, uint256 timestamp)[])",
  "function getContributionWeight(uint256, address) view returns (uint256)",
  "function getTotalWeight(uint256) view returns (uint256)",
  "event NudgeSubmitted(uint256 indexed nudgeId, uint256 indexed challengeId, address indexed nudger, bytes32 contentHash, uint256 parentNudgeId)",
  "event NudgeWeighted(uint256 indexed nudgeId, uint256 weight)",
];

const EVOLUTION_LEDGER_ABI = [
  "function generation() view returns (uint256)",
  "function recordEvolution(bytes32, uint256, uint8)",
  "function getGenome(uint256) view returns (tuple(uint256 generation, bytes32 genomeHash, uint256 challengeId, uint8 outcome, uint256 timestamp))",
  "function getEvolutionHistory(uint256, uint256) view returns (tuple(uint256 generation, bytes32 genomeHash, uint256 challengeId, uint8 outcome, uint256 timestamp)[])",
  "event Evolved(uint256 indexed generation, bytes32 genomeHash, uint256 indexed challengeId, uint8 outcome)",
];

const TREASURY_ABI = [
  "function getBalance() view returns (uint256)",
  "function fundKeeper(address, uint256)",
  "event FundsReceived(address indexed from, uint256 amount)",
];

interface ChainConfig {
  rpcUrl: string;
  privateKey: string;
  contracts: {
    registry: string;
    nudgeTracker: string;
    payoutSplitter: string;
    evolutionLedger: string;
    treasury: string;
  };
}

export class CreatureChain {
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet;
  readonly registry: ethers.Contract;
  readonly nudgeTracker: ethers.Contract;
  readonly evolutionLedger: ethers.Contract;
  readonly treasury: ethers.Contract;

  constructor(config: ChainConfig) {
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    this.signer = new ethers.Wallet(config.privateKey, this.provider);

    this.registry = new ethers.Contract(config.contracts.registry, REGISTRY_ABI, this.signer);
    this.nudgeTracker = new ethers.Contract(config.contracts.nudgeTracker, NUDGE_TRACKER_ABI, this.signer);
    this.evolutionLedger = new ethers.Contract(config.contracts.evolutionLedger, EVOLUTION_LEDGER_ABI, this.signer);
    this.treasury = new ethers.Contract(config.contracts.treasury, TREASURY_ABI, this.signer);
  }

  // --- Registry ---

  async acknowledge(challengeId: number): Promise<void> {
    const tx = await this.registry.acknowledge(challengeId);
    await tx.wait();
  }

  async updateStatus(challengeId: number, status: number, submissionHash: string): Promise<void> {
    const tx = await this.registry.updateStatus(challengeId, status, submissionHash);
    await tx.wait();
  }

  async getChallenge(challengeId: number): Promise<ChallengeInfo> {
    const c = await this.registry.getChallenge(challengeId);
    return {
      id: Number(c.id),
      requester: c.requester,
      bountyUrl: c.bountyUrl,
      context: c.context,
      fee: c.fee,
      status: Number(c.status),
      submissionHash: c.submissionHash,
      prizeAmount: c.prizeAmount,
      createdAt: Number(c.createdAt),
    };
  }

  async getActiveChallenges(): Promise<number[]> {
    const ids = await this.registry.getActiveChallenges();
    return ids.map((id: bigint) => Number(id));
  }

  // --- Nudge Tracker ---

  async setNudgeWeight(nudgeId: number, weight: number): Promise<void> {
    const tx = await this.nudgeTracker.setNudgeWeight(nudgeId, weight);
    await tx.wait();
  }

  async getNudges(challengeId: number): Promise<NudgeInfo[]> {
    const nudges = await this.nudgeTracker.getNudgesForChallenge(challengeId);
    return nudges.map((n: Record<string, unknown>) => ({
      id: Number(n.id),
      challengeId: Number(n.challengeId),
      nudger: n.nudger as string,
      contentHash: n.contentHash as string,
      parentNudgeId: Number(n.parentNudgeId),
      weight: Number(n.weight),
      timestamp: Number(n.timestamp),
    }));
  }

  // --- Evolution Ledger ---

  async recordEvolution(genomeHash: string, challengeId: number, outcome: "win" | "loss"): Promise<void> {
    const outcomeEnum = outcome === "win" ? 0 : 1;
    const tx = await this.evolutionLedger.recordEvolution(genomeHash, challengeId, outcomeEnum);
    await tx.wait();
  }

  async getCurrentGeneration(): Promise<number> {
    return Number(await this.evolutionLedger.generation());
  }

  // --- Event Polling ---

  async getEvents(
    contract: ethers.Contract,
    eventName: string,
    fromBlock: number,
    toBlock: number | "latest" = "latest"
  ): Promise<ethers.Log[]> {
    const filter = contract.filters[eventName]();
    return this.provider.getLogs({
      ...filter,
      fromBlock,
      toBlock,
    });
  }

  async getBlockNumber(): Promise<number> {
    return this.provider.getBlockNumber();
  }

  getRegistryAddress(): string {
    return this.registry.target as string;
  }
}
