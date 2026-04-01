/**
 * 0G Storage integration — wraps @0glabs/0g-ts-sdk for file and KV operations.
 */

import { ethers } from "ethers";
import { Indexer, ZgFile, MemData } from "@0gfoundation/0g-ts-sdk";
import type { ZG_CONFIG } from "./types.js";

interface StorageConfig {
  rpcUrl: string;
  privateKey: string;
  indexerUrl: string;
  storageContracts: { flow: string; mine: string };
}

export class CreatureStorage {
  private indexer: InstanceType<typeof Indexer>;
  private signer: ethers.Wallet;
  private config: StorageConfig;

  constructor(config: StorageConfig) {
    this.config = config;
    const provider = new ethers.JsonRpcProvider(config.rpcUrl);
    this.signer = new ethers.Wallet(config.privateKey, provider);
    this.indexer = new Indexer(config.indexerUrl);
  }

  /**
   * Upload in-memory data to 0G Storage.
   * Returns the merkle root hash for retrieval.
   */
  async uploadData(data: string | Buffer): Promise<string> {
    const buffer = typeof data === "string" ? Buffer.from(data) : data;
    const memData = new MemData(buffer);

    const [tree, treeErr] = await memData.merkleTree();
    if (treeErr !== null) {
      throw new Error(`Merkle tree error: ${treeErr}`);
    }

    const rootHash = tree!.rootHash();

    const [tx, uploadErr] = await this.indexer.upload(
      memData,
      this.config.rpcUrl,
      this.signer
    );
    if (uploadErr !== null) {
      throw new Error(`Upload error: ${uploadErr}`);
    }

    console.log(`Uploaded to 0G Storage: ${rootHash} (tx: ${tx})`);
    return rootHash;
  }

  /**
   * Upload a file from disk to 0G Storage.
   */
  async uploadFile(filePath: string): Promise<string> {
    const file = await ZgFile.fromFilePath(filePath);

    const [tree, treeErr] = await file.merkleTree();
    if (treeErr !== null) {
      await file.close();
      throw new Error(`Merkle tree error: ${treeErr}`);
    }

    const rootHash = tree!.rootHash();

    const [tx, uploadErr] = await this.indexer.upload(
      file,
      this.config.rpcUrl,
      this.signer
    );
    await file.close();

    if (uploadErr !== null) {
      throw new Error(`Upload error: ${uploadErr}`);
    }

    console.log(`Uploaded file to 0G Storage: ${rootHash} (tx: ${tx})`);
    return rootHash;
  }

  /**
   * Download data from 0G Storage by root hash.
   */
  async download(rootHash: string, outputPath: string): Promise<void> {
    const err = await this.indexer.download(rootHash, outputPath, true);
    if (err !== null) {
      throw new Error(`Download error: ${err}`);
    }
  }

  /**
   * Upload JSON data and return the root hash.
   */
  async uploadJson(data: unknown): Promise<string> {
    const json = JSON.stringify(data, null, 2);
    return this.uploadData(json);
  }

  /**
   * Download and parse JSON data from 0G Storage.
   */
  async downloadJson<T>(rootHash: string): Promise<T> {
    const tmpPath = `/tmp/creature-${rootHash.slice(0, 16)}.json`;
    await this.download(rootHash, tmpPath);
    const fs = await import("fs/promises");
    const content = await fs.readFile(tmpPath, "utf-8");
    await fs.unlink(tmpPath).catch(() => {}); // cleanup
    return JSON.parse(content) as T;
  }
}
