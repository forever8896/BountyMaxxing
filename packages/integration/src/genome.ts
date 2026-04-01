/**
 * Genome Store — manages the creature's self-modifying strategy.
 * Current genome cached in memory, snapshots stored on 0G Storage.
 */

import type { Genome } from "./types.js";
import { SEED_GENOME } from "./types.js";
import type { CreatureStorage } from "./storage.js";

export class GenomeStore {
  private storage: CreatureStorage;
  private current: Genome;
  private rootHashes: Map<number, string> = new Map(); // generation => rootHash

  constructor(storage: CreatureStorage) {
    this.storage = storage;
    this.current = { ...SEED_GENOME };
  }

  /**
   * Load the current genome (from memory cache).
   */
  load(): Genome {
    return { ...this.current };
  }

  /**
   * Save a new genome version to 0G Storage.
   * Returns the root hash for on-chain recording.
   */
  async save(genome: Genome): Promise<string> {
    const rootHash = await this.storage.uploadJson(genome);
    this.current = { ...genome };
    this.rootHashes.set(genome.generation, rootHash);
    console.log(`Genome gen ${genome.generation} saved to 0G Storage: ${rootHash}`);
    return rootHash;
  }

  /**
   * Load a genome from 0G Storage by root hash.
   */
  async loadFromStorage(rootHash: string): Promise<Genome> {
    const genome = await this.storage.downloadJson<Genome>(rootHash);
    this.current = { ...genome };
    return genome;
  }

  /**
   * Initialize with the seed genome and upload to 0G Storage.
   */
  async seed(): Promise<string> {
    return this.save(SEED_GENOME);
  }

  /**
   * Get the root hash for a specific generation.
   */
  getRootHash(generation: number): string | undefined {
    return this.rootHashes.get(generation);
  }
}
