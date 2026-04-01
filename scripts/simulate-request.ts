/**
 * Dev utility: Submit a test bounty request to the CreatureRegistry.
 * Usage: ZG_PRIVATE_KEY=... CONTRACT_REGISTRY=... tsx scripts/simulate-request.ts
 */

import { ethers } from "ethers";
import { ZG_CONFIG } from "../packages/integration/src/types.js";

async function main() {
  const network = (process.env.ZG_NETWORK || "testnet") as "testnet" | "mainnet";
  const privateKey = process.env.ZG_PRIVATE_KEY;
  const registryAddr = process.env.CONTRACT_REGISTRY;

  if (!privateKey || !registryAddr) {
    console.error("Required: ZG_PRIVATE_KEY, CONTRACT_REGISTRY");
    process.exit(1);
  }

  const zgConfig = ZG_CONFIG[network];
  const provider = new ethers.JsonRpcProvider(zgConfig.rpcUrl);
  const signer = new ethers.Wallet(privateKey, provider);

  const registry = new ethers.Contract(
    registryAddr,
    [
      "function submitRequest(string, string) payable returns (uint256)",
      "function minRequestFee() view returns (uint256)",
    ],
    signer
  );

  const minFee = await registry.minRequestFee();
  console.log(`Min request fee: ${ethers.formatEther(minFee)} OG`);

  const bountyUrl = "https://gitcoin.co/issue/example/test-bounty-123";
  const context = "This is a test bounty for developing a simple smart contract that implements ERC-20 with a custom vesting schedule. Prize: 500 USDC.";

  console.log(`Submitting request to ${registryAddr}...`);
  const tx = await registry.submitRequest(bountyUrl, context, { value: minFee });
  const receipt = await tx.wait();

  console.log(`Request submitted! Tx: ${receipt.hash}`);
  console.log(`View on ChainScan: ${zgConfig.explorerUrl}/tx/${receipt.hash}`);
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
