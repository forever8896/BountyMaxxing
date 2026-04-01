/**
 * Thought Stream — dual-layer broadcasting.
 * Layer 1: In-memory EventEmitter for real-time SSE to dashboard
 * Layer 2: 0G Storage for persistent, decentralized thought log
 */

import { EventEmitter } from "events";
import type { Thought } from "./types.js";
import type { CreatureStorage } from "./storage.js";

export class ThoughtStream extends EventEmitter {
  private storage: CreatureStorage | null;
  private buffer: Thought[] = [];
  private maxBuffer = 500;

  constructor(storage?: CreatureStorage) {
    super();
    this.storage = storage ?? null;
  }

  /**
   * Emit a thought to all subscribers and persist to 0G Storage.
   */
  async emit(event: "thought", thought: Thought): Promise<boolean>;
  async emit(thought: Thought): Promise<boolean>;
  async emit(eventOrThought: string | Thought, maybeThought?: Thought): Promise<boolean> {
    const thought = typeof eventOrThought === "string" ? maybeThought! : eventOrThought;

    // Layer 1: In-memory broadcast (real-time)
    super.emit("thought", thought);

    // Buffer for recent history
    this.buffer.push(thought);
    if (this.buffer.length > this.maxBuffer) {
      this.buffer = this.buffer.slice(-this.maxBuffer);
    }

    // Layer 2: Persist to 0G Storage (async, non-blocking)
    if (this.storage) {
      this.persistThought(thought).catch((err) => {
        console.error("Failed to persist thought to 0G:", err);
      });
    }

    return true;
  }

  /**
   * Get recent thoughts from the in-memory buffer.
   */
  getRecent(count = 50, challengeId?: number): Thought[] {
    let thoughts = this.buffer;
    if (challengeId !== undefined) {
      thoughts = thoughts.filter((t) => t.challengeId === challengeId);
    }
    return thoughts.slice(-count);
  }

  /**
   * Subscribe to real-time thoughts.
   */
  subscribe(callback: (thought: Thought) => void): () => void {
    this.on("thought", callback);
    return () => this.off("thought", callback);
  }

  private async persistThought(thought: Thought): Promise<void> {
    if (!this.storage) return;
    await this.storage.uploadJson(thought);
  }
}
