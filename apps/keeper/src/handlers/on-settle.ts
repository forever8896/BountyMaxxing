/**
 * Handler: Challenge settled (won or lost).
 * Triggers evolution after outcome.
 */

import type { ethers } from "ethers";
import type { CreatureCompute, CreatureStorage, CreatureChain, ThoughtStream, GenomeStore } from "@creature/integration";

interface Deps {
  compute: CreatureCompute;
  storage: CreatureStorage;
  chain: CreatureChain;
  thoughts: ThoughtStream;
  genome: GenomeStore;
}

export function createOnWonHandler(deps: Deps) {
  return async (_log: ethers.Log, parsed: ethers.LogDescription): Promise<void> => {
    const challengeId = Number(parsed.args[0]);
    const prizeAmount = parsed.args[1] as bigint;

    console.log(`Challenge #${challengeId} WON! Prize: ${prizeAmount}`);

    await deps.thoughts.emit({
      id: crypto.randomUUID(),
      challengeId,
      timestamp: Date.now(),
      type: "system",
      content: `Challenge #${challengeId} WON! Prize: ${prizeAmount} distributed to contributors.`,
    });

    // Trigger evolution
    await evolve(deps, challengeId, "win");
  };
}

export function createOnLostHandler(deps: Deps) {
  return async (_log: ethers.Log, parsed: ethers.LogDescription): Promise<void> => {
    const challengeId = Number(parsed.args[0]);

    console.log(`Challenge #${challengeId} lost.`);

    await deps.thoughts.emit({
      id: crypto.randomUUID(),
      challengeId,
      timestamp: Date.now(),
      type: "system",
      content: `Challenge #${challengeId} lost. Learning from this...`,
    });

    // Trigger evolution
    await evolve(deps, challengeId, "loss");
  };
}

async function evolve(deps: Deps, challengeId: number, outcome: "win" | "loss"): Promise<void> {
  const genome = deps.genome.load();
  const challenge = await deps.chain.getChallenge(challengeId);

  // Get submission summary
  let submissionSummary = "";
  try {
    submissionSummary = (await deps.storage.downloadJson<string>(challenge.submissionHash)) || "";
    submissionSummary = submissionSummary.slice(0, 2000); // Truncate for prompt
  } catch {
    submissionSummary = "Submission not available";
  }

  // Evolve via 0G Compute
  const newGenome = await deps.compute.evolve(challengeId, genome, outcome, submissionSummary);

  // Save to 0G Storage
  const genomeHash = await deps.genome.save(newGenome);

  // Record on-chain
  await deps.chain.recordEvolution(genomeHash, challengeId, outcome);

  await deps.thoughts.emit({
    id: crypto.randomUUID(),
    challengeId,
    timestamp: Date.now(),
    type: "evolution",
    content: `Evolved to generation ${newGenome.generation}. Genome hash: ${genomeHash}`,
  });
}
