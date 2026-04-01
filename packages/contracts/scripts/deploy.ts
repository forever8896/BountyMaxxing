import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const keeperAddress = deployer.address; // Use deployer as keeper initially
  const minRequestFee = ethers.parseEther("0.001");

  // 1. Deploy Treasury
  const Treasury = await ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy();
  await treasury.waitForDeployment();
  const treasuryAddr = await treasury.getAddress();
  console.log("Treasury:", treasuryAddr);

  // 2. Deploy NudgeTracker
  const NudgeTracker = await ethers.getContractFactory("NudgeTracker");
  const nudgeTracker = await NudgeTracker.deploy(keeperAddress);
  await nudgeTracker.waitForDeployment();
  const nudgeTrackerAddr = await nudgeTracker.getAddress();
  console.log("NudgeTracker:", nudgeTrackerAddr);

  // 3. Deploy PayoutSplitter
  const PayoutSplitter = await ethers.getContractFactory("PayoutSplitter");
  const payoutSplitter = await PayoutSplitter.deploy(treasuryAddr, nudgeTrackerAddr);
  await payoutSplitter.waitForDeployment();
  const payoutSplitterAddr = await payoutSplitter.getAddress();
  console.log("PayoutSplitter:", payoutSplitterAddr);

  // 4. Deploy EvolutionLedger
  const EvolutionLedger = await ethers.getContractFactory("EvolutionLedger");
  const evolutionLedger = await EvolutionLedger.deploy(keeperAddress);
  await evolutionLedger.waitForDeployment();
  const evolutionLedgerAddr = await evolutionLedger.getAddress();
  console.log("EvolutionLedger:", evolutionLedgerAddr);

  // 5. Deploy CreatureRegistry
  const CreatureRegistry = await ethers.getContractFactory("CreatureRegistry");
  const registry = await CreatureRegistry.deploy(keeperAddress, minRequestFee);
  await registry.waitForDeployment();
  const registryAddr = await registry.getAddress();
  console.log("CreatureRegistry:", registryAddr);

  // 6. Wire contracts together
  await registry.setContracts(nudgeTrackerAddr, payoutSplitterAddr);
  await nudgeTracker.setRegistry(registryAddr);
  await payoutSplitter.setRegistry(registryAddr);

  console.log("\nAll contracts deployed and wired:");
  console.log({
    treasury: treasuryAddr,
    nudgeTracker: nudgeTrackerAddr,
    payoutSplitter: payoutSplitterAddr,
    evolutionLedger: evolutionLedgerAddr,
    registry: registryAddr,
    keeper: keeperAddress,
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
