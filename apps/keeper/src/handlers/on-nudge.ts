/**
 * Handler: Nudge (contribution) submitted.
 * Downloads nudge content, evaluates quality, optionally integrates into draft.
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

export function createOnNudgeHandler(deps: Deps) {
  return async (_log: ethers.Log, parsed: ethers.LogDescription): Promise<void> => {
    const nudgeId = Number(parsed.args[0]);
    const challengeId = Number(parsed.args[1]);
    const nudger = parsed.args[2] as string;
    const contentHash = parsed.args[3] as string;

    console.log(`Nudge #${nudgeId} on challenge #${challengeId} from ${nudger}`);

    await deps.thoughts.emit({
      id: crypto.randomUUID(),
      challengeId,
      timestamp: Date.now(),
      type: "nudge_analysis",
      content: `Received nudge #${nudgeId} from ${nudger.slice(0, 8)}... Evaluating...`,
    });

    // 1. Get current draft
    const challenge = await deps.chain.getChallenge(challengeId);
    let currentDraft = "";
    try {
      currentDraft = (await deps.storage.downloadJson<string>(challenge.submissionHash)) || "";
    } catch {
      currentDraft = "No current draft available";
    }

    // 2. Download nudge content
    let nudgeContent = "";
    try {
      nudgeContent = (await deps.storage.downloadJson<string>(contentHash)) || "";
    } catch {
      nudgeContent = "Could not download nudge content";
    }

    // 3. Evaluate nudge via 0G Compute
    const genome = deps.genome.load();
    const evaluation = await deps.compute.evaluateNudge(challengeId, currentDraft, nudgeContent, genome);

    // 4. Set nudge weight on-chain (score * 100 for precision)
    const weight = Math.round(evaluation.score * 100);
    await deps.chain.setNudgeWeight(nudgeId, weight);

    // 5. If should integrate, merge and upload new draft
    if (evaluation.shouldIntegrate && evaluation.mergedContent) {
      const newRootHash = await deps.storage.uploadData(evaluation.mergedContent);
      await deps.chain.updateStatus(challengeId, 2, newRootHash); // 2 = Working

      await deps.thoughts.emit({
        id: crypto.randomUUID(),
        challengeId,
        timestamp: Date.now(),
        type: "nudge_analysis",
        content: `Integrated nudge #${nudgeId} (score: ${evaluation.score}/10). New draft: ${newRootHash}. Analysis: ${evaluation.analysis}`,
      });
    } else {
      await deps.thoughts.emit({
        id: crypto.randomUUID(),
        challengeId,
        timestamp: Date.now(),
        type: "nudge_analysis",
        content: `Nudge #${nudgeId} scored ${evaluation.score}/10 but not integrated. Analysis: ${evaluation.analysis}`,
      });
    }
  };
}
