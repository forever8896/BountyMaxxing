/**
 * Handler: New bounty request submitted.
 * Acknowledges, generates v0 draft, uploads to 0G Storage, updates status.
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

export function createOnRequestHandler(deps: Deps) {
  return async (_log: ethers.Log, parsed: ethers.LogDescription): Promise<void> => {
    const challengeId = Number(parsed.args[0]);
    const requester = parsed.args[1] as string;
    const bountyUrl = parsed.args[2] as string;
    const fee = parsed.args[3] as bigint;

    console.log(`New request #${challengeId} from ${requester}: ${bountyUrl} (fee: ${fee})`);

    // 1. Acknowledge the challenge on-chain
    await deps.chain.acknowledge(challengeId);

    await deps.thoughts.emit({
      id: crypto.randomUUID(),
      challengeId,
      timestamp: Date.now(),
      type: "system",
      content: `New challenge received: ${bountyUrl}. Fee: ${fee}. Acknowledged.`,
    });

    // 2. Load genome and get challenge context
    const genome = deps.genome.load();
    const challenge = await deps.chain.getChallenge(challengeId);

    // 3. Generate v0 draft via 0G Compute
    const result = await deps.compute.think(challengeId, [
      {
        role: "user",
        content: `You have been asked to participate in a bounty/hackathon challenge.

BOUNTY URL: ${bountyUrl}
CONTEXT FROM REQUESTER: ${challenge.context}

Generate a complete solution draft. Include:
1. Analysis of requirements
2. Your approach
3. Complete implementation code
4. Tests if applicable
5. Documentation/README

Think step by step and be thorough.`,
      },
    ], genome);

    // 4. Upload draft to 0G Storage
    const rootHash = await deps.storage.uploadData(result.content);

    // 5. Update status to Working with submission hash
    await deps.chain.updateStatus(challengeId, 2, rootHash); // 2 = Working

    await deps.thoughts.emit({
      id: crypto.randomUUID(),
      challengeId,
      timestamp: Date.now(),
      type: "system",
      content: `v0 draft generated and uploaded. Storage hash: ${rootHash}. Used ${result.inputTokens + result.outputTokens} tokens.`,
    });
  };
}
