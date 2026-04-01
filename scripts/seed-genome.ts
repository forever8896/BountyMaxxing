/**
 * Seed the creature's initial genome to 0G Storage.
 * Run once after deploying contracts.
 */

import { CreatureStorage } from "../packages/integration/src/storage.js";
import { GenomeStore } from "../packages/integration/src/genome.js";
import { ZG_CONFIG, SEED_GENOME } from "../packages/integration/src/types.js";

async function main() {
  const network = (process.env.ZG_NETWORK || "testnet") as "testnet" | "mainnet";
  const privateKey = process.env.ZG_PRIVATE_KEY;
  if (!privateKey) {
    console.error("ZG_PRIVATE_KEY required");
    process.exit(1);
  }

  const zgConfig = ZG_CONFIG[network];
  const storage = new CreatureStorage({
    rpcUrl: zgConfig.rpcUrl,
    privateKey,
    indexerUrl: zgConfig.indexerUrl,
    storageContracts: zgConfig.storageContracts,
  });

  const genomeStore = new GenomeStore(storage);

  console.log("Seeding genome to 0G Storage...");
  console.log("Genome:", JSON.stringify(SEED_GENOME, null, 2));

  const rootHash = await genomeStore.seed();

  console.log("\nGenome seeded successfully!");
  console.log("Root hash:", rootHash);
  console.log(`View on StorageScan: ${zgConfig.storageExplorerUrl}`);
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
