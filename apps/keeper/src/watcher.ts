/**
 * Event watcher — polls 0G Chain for contract events and dispatches to handlers.
 */

import { ethers } from "ethers";
import type { CreatureChain } from "@creature/integration";

export type EventHandler = (log: ethers.Log, parsed: ethers.LogDescription) => Promise<void>;

interface WatcherConfig {
  chain: CreatureChain;
  pollIntervalMs: number;
  handlers: {
    onRequestSubmitted: EventHandler;
    onNudgeSubmitted: EventHandler;
    onChallengeWon: EventHandler;
    onChallengeLost: EventHandler;
  };
}

export class EventWatcher {
  private config: WatcherConfig;
  private lastBlock: number = 0;
  private running = false;
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(config: WatcherConfig) {
    this.config = config;
  }

  async start(): Promise<void> {
    this.lastBlock = await this.config.chain.getBlockNumber();
    this.running = true;
    console.log(`Watcher started at block ${this.lastBlock}`);

    this.timer = setInterval(() => this.poll(), this.config.pollIntervalMs);
  }

  stop(): void {
    this.running = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    console.log("Watcher stopped");
  }

  private async poll(): Promise<void> {
    if (!this.running) return;

    try {
      const currentBlock = await this.config.chain.getBlockNumber();
      if (currentBlock <= this.lastBlock) return;

      const fromBlock = this.lastBlock + 1;
      const toBlock = currentBlock;

      // Poll all event types in parallel
      await Promise.all([
        this.pollEvent("registry", "RequestSubmitted", fromBlock, toBlock, this.config.handlers.onRequestSubmitted),
        this.pollEvent("nudgeTracker", "NudgeSubmitted", fromBlock, toBlock, this.config.handlers.onNudgeSubmitted),
        this.pollEvent("registry", "ChallengeWon", fromBlock, toBlock, this.config.handlers.onChallengeWon),
        this.pollEvent("registry", "ChallengeLost", fromBlock, toBlock, this.config.handlers.onChallengeLost),
      ]);

      this.lastBlock = toBlock;
    } catch (error) {
      console.error("Poll error:", error);
    }
  }

  private async pollEvent(
    contractName: "registry" | "nudgeTracker",
    eventName: string,
    fromBlock: number,
    toBlock: number,
    handler: EventHandler
  ): Promise<void> {
    const contract = this.config.chain[contractName];
    const iface = contract.interface;

    try {
      const logs = await this.config.chain.getEvents(contract, eventName, fromBlock, toBlock);

      for (const log of logs) {
        try {
          const parsed = iface.parseLog({ topics: log.topics as string[], data: log.data });
          if (parsed) {
            await handler(log, parsed);
          }
        } catch (err) {
          console.error(`Failed to handle ${eventName} event:`, err);
        }
      }
    } catch (err) {
      console.error(`Failed to poll ${eventName}:`, err);
    }
  }
}
