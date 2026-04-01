/**
 * Hunt loop — discovers Clankonomy bounties, generates solutions, submits, iterates.
 * This is the creature's autonomous bounty-hunting brain.
 */

import {
  formatUSDC,
  type CreatureCompute,
  type CreatureStorage,
  type ThoughtStream,
  type GenomeStore,
  type ClanconomyClient,
  type ClanBounty,
  type ClanSubmission,
} from "@creature/integration";

interface HuntDeps {
  compute: CreatureCompute;
  storage: CreatureStorage;
  thoughts: ThoughtStream;
  genome: GenomeStore;
  clan: ClanconomyClient;
}

interface ActiveHunt {
  bounty: ClanBounty;
  currentDraft: string;
  submissions: ClanSubmission[];
  iteration: number;
}

export class HuntLoop {
  private deps: HuntDeps;
  private activeHunts: Map<string, ActiveHunt> = new Map();
  private running = false;
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(deps: HuntDeps) {
    this.deps = deps;
  }

  async start(pollIntervalMs: number = 60_000): Promise<void> {
    this.running = true;

    // Register agent on Clankonomy if not already
    try {
      await this.ensureRegistered();
    } catch (err) {
      console.error("Registration failed (non-fatal):", err);
      await this.emit(0, "system", `Clankonomy registration failed: ${err}. Will try hunting anyway.`);
    }

    // Initial hunt
    await this.hunt().catch((err) => console.error("Initial hunt error:", err));

    // Poll for new bounties periodically
    this.timer = setInterval(() => this.hunt(), pollIntervalMs);
  }

  stop(): void {
    this.running = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  getActiveHunts(): ActiveHunt[] {
    return Array.from(this.activeHunts.values());
  }

  private async ensureRegistered(): Promise<void> {
    const existing = await this.deps.clan.getAgent();
    if (existing) {
      await this.emit(0, "system", `Already registered on Clankonomy as "${existing.displayName}"`);
      return;
    }

    try {
      const agent = await this.deps.clan.register(
        "The Creature",
        "Self-evolving autonomous bounty solver on 0G. My work is public. Nudge me to improve my submissions."
      );
      await this.emit(0, "system", `Registered on Clankonomy as "${agent.displayName}"`);
    } catch (err) {
      await this.emit(0, "system", `Failed to register on Clankonomy: ${err}`);
    }
  }

  async hunt(): Promise<void> {
    if (!this.running) return;

    try {
      await this.emit(0, "system", "Scanning Clankonomy for active bounties...");

      const bounties = await this.deps.clan.listBounties({ status: "active" });
      await this.emit(0, "system", `Found ${bounties.length} active bounties`);

      if (bounties.length === 0) return;

      // Work on bounties we haven't started yet (up to 3 concurrent)
      for (const bounty of bounties) {
        if (this.activeHunts.size >= 3) break;
        if (this.activeHunts.has(bounty.id)) continue;

        // Start working on this bounty
        this.workOnBounty(bounty).catch((err) => {
          console.error(`Hunt error on ${bounty.id}:`, err);
          this.emit(0, "system", `Error working on "${bounty.title}": ${err}`);
        });
      }
    } catch (err) {
      console.error("Hunt scan error:", err);
    }
  }

  /**
   * Work on a single bounty: analyze → draft → submit → score → iterate.
   */
  private async workOnBounty(bounty: ClanBounty): Promise<void> {
    const hunt: ActiveHunt = {
      bounty,
      currentDraft: "",
      submissions: [],
      iteration: 0,
    };
    this.activeHunts.set(bounty.id, hunt);

    const bid = bounty.id.slice(0, 8);
    await this.emit(0, "system", `Starting work on: "${bounty.title}" [${bid}...]`);

    // 1. Analyze the bounty
    const genome = this.deps.genome.load();
    const bountyContext = this.buildBountyContext(bounty);

    const rewardStr = formatUSDC(bounty.amount);
    const catStr = bounty.categorySlug || bounty.categories?.[0]?.slug || "general";
    await this.emit(0, "reasoning", `Analyzing bounty: ${bounty.title}\n\nReward: ${rewardStr}\nCategory: ${catStr}\nEval type: ${bounty.evalType || "unknown"}\nDeadline: ${bounty.deadline || "none"}\nTop score so far: ${bounty.topScore ?? "unknown"}`);

    // 2. Generate initial draft
    const result = await this.deps.compute.think(0, [
      {
        role: "user",
        content: `You are participating in a Clankonomy bounty challenge.

${bountyContext}

Generate a complete solution. The required file type is "${bounty.allowedFileTypes?.[0] || bounty.fileType || "md"}".
${(bounty.allowedFileTypes?.[0] || "md") === "md" ? "Write your response as a well-structured MARKDOWN document. Do NOT wrap it in code fences." : "Your response should be ONLY the code, no markdown fences, no explanation before/after."}

${bounty.evalScript ? `\nEVAL SCRIPT (this is exactly how your submission will be tested):\n${bounty.evalScript}` : ""}

Think step by step, then output ONLY the solution code.`,
      },
    ], genome);

    hunt.currentDraft = this.extractCode(result.content);
    hunt.iteration = 1;

    await this.emit(0, "draft", `Draft v${hunt.iteration} generated (${hunt.currentDraft.length} chars)`);

    // Store draft on 0G Storage
    try {
      const rootHash = await this.deps.storage.uploadData(hunt.currentDraft);
      await this.emit(0, "system", `Draft stored on 0G Storage: ${rootHash}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("0G Storage upload failed:", err);
      await this.emit(0, "system", `Failed to persist draft to 0G Storage: ${msg} (continuing anyway)`);
    }

    // 3. Submit to Clankonomy
    await this.submitAndIterate(hunt);
  }

  private async submitAndIterate(hunt: ActiveHunt, maxIterations: number = 3): Promise<void> {
    const bid = hunt.bounty.id.slice(0, 8);

    for (let i = 0; i < maxIterations; i++) {
      await this.emit(0, "system", `Submitting iteration ${hunt.iteration} for [${bid}...]`);

      try {
        await this.deps.clan.submit(
          hunt.bounty.id,
          hunt.currentDraft,
          hunt.bounty.allowedFileTypes?.[0] || hunt.bounty.fileType || "md"
        );
        await this.emit(0, "system", `Submitted! Waiting for score...`);
      } catch (err) {
        await this.emit(0, "system", `Submission failed: ${err}. Will retry.`);
        await new Promise((r) => setTimeout(r, 10_000));
        continue;
      }

      // 4. Wait for score
      const scored = await this.deps.clan.waitForScore(hunt.bounty.id, 120_000, 8_000);

      if (!scored) {
        await this.emit(0, "system", `Scoring timed out for [${bid}...]. Moving on.`);
        break;
      }

      hunt.submissions.push(scored);
      await this.emit(0, "evaluation", `Score: ${scored.score}/100 | Status: ${scored.evalStatus} | Best: ${scored.isBest}\n\nFeedback: ${scored.summary || "No summary"}`);

      // If score is good enough or we're out of iterations, stop
      if (scored.score !== null && scored.score >= 90) {
        await this.emit(0, "system", `Great score (${scored.score})! Keeping this submission.`);
        break;
      }

      // 5. Iterate — use feedback to improve
      if (i < maxIterations - 1) {
        await this.emit(0, "reasoning", `Score ${scored.score}/100 — iterating...`);

        const genome = this.deps.genome.load();
        const improveResult = await this.deps.compute.think(0, [
          {
            role: "user",
            content: `Your previous submission to a Clankonomy bounty scored ${scored.score}/100.

BOUNTY: ${hunt.bounty.title}
DESCRIPTION: ${hunt.bounty.description}

YOUR PREVIOUS SUBMISSION:
${hunt.currentDraft}

EVALUATOR FEEDBACK:
${scored.summary || "No detailed feedback provided"}

${hunt.bounty.evalScript ? `EVAL SCRIPT:\n${hunt.bounty.evalScript}` : ""}

Improve your solution based on the feedback. Output ONLY the improved code, no markdown fences.`,
          },
        ], genome);

        hunt.currentDraft = this.extractCode(improveResult.content);
        hunt.iteration++;

        // Store updated draft
        try {
          const rootHash = await this.deps.storage.uploadData(hunt.currentDraft);
          await this.emit(0, "draft", `Draft v${hunt.iteration} stored: ${rootHash}`);
        } catch {
          // Non-blocking
        }
      }
    }

    await this.emit(0, "system", `Finished working on "${hunt.bounty.title}" after ${hunt.iteration} iteration(s)`);
  }

  /**
   * Accept a nudge from a human and resubmit.
   */
  async applyNudge(bountyId: string, nudgeContent: string): Promise<void> {
    const hunt = this.activeHunts.get(bountyId);
    if (!hunt) {
      await this.emit(0, "system", `No active hunt for bounty ${bountyId}`);
      return;
    }

    await this.emit(0, "nudge_analysis", `Received nudge for "${hunt.bounty.title}". Evaluating...`);

    const genome = this.deps.genome.load();
    const evaluation = await this.deps.compute.evaluateNudge(
      0,
      hunt.currentDraft,
      nudgeContent,
      genome
    );

    if (evaluation.shouldIntegrate && evaluation.mergedContent) {
      hunt.currentDraft = evaluation.mergedContent;
      hunt.iteration++;

      await this.emit(0, "nudge_analysis", `Nudge integrated (score ${evaluation.score}/10). Resubmitting...`);

      // Resubmit with nudge
      await this.submitAndIterate(hunt, 1);
    } else {
      await this.emit(0, "nudge_analysis", `Nudge not integrated (score ${evaluation.score}/10): ${evaluation.analysis}`);
    }
  }

  private buildBountyContext(bounty: ClanBounty): string {
    return `BOUNTY: ${bounty.title}
DESCRIPTION: ${bounty.description}
CATEGORY: ${bounty.categorySlug || bounty.categories?.[0]?.slug || "general"}
REWARD: ${formatUSDC(bounty.amount)}
EVAL TYPE: ${bounty.evalType || "unknown"}
EVAL MODEL: ${bounty.evalModel || "unknown"}
FILE TYPE: ${bounty.challengeType || "code"}
NUM WINNERS: ${bounty.numWinners || 1}
${bounty.deadline ? `DEADLINE: ${bounty.deadline}` : ""}
${bounty.evalSummary ? `EVALUATION CRITERIA:\n${bounty.evalSummary}` : ""}`;
  }

  private extractCode(content: string): string {
    // Strip markdown code fences if the model wrapped the output
    const fenceMatch = content.match(/```(?:\w+)?\n([\s\S]*?)```/);
    if (fenceMatch) return fenceMatch[1].trim();
    return content.trim();
  }

  private async emit(
    challengeId: number,
    type: "reasoning" | "draft" | "evaluation" | "nudge_analysis" | "evolution" | "system",
    content: string
  ): Promise<void> {
    await this.deps.thoughts.emit({
      id: crypto.randomUUID(),
      challengeId,
      timestamp: Date.now(),
      type,
      content,
    });
  }
}
