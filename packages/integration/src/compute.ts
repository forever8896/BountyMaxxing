/**
 * 0G Compute integration — adapted from @0gfoundation/0g-cc's ZeroGBrokerService.
 * Handles wallet init, provider discovery, inference, TEE verification, and fee settlement.
 */

import { ethers } from "ethers";
import { createZGComputeNetworkBroker } from "@0glabs/0g-serving-broker";
import type { Genome, ThoughtResult, NudgeEvaluation } from "./types.js";
import type { ThoughtStream } from "./thought-stream.js";

interface ComputeConfig {
  rpcUrl: string;
  privateKey: string;
}

interface ServiceInfo {
  providerAddress: string;
  endpoint: string;
  model: string;
  inputPrice: string;
  outputPrice: string;
}

export class CreatureCompute {
  private broker: ReturnType<typeof createZGComputeNetworkBroker> extends Promise<infer T> ? T : never;
  private wallet: ethers.Wallet;
  private config: ComputeConfig;
  private initialized = false;
  private acknowledgedProviders = new Set<string>();
  private thoughtStream: ThoughtStream | null = null;

  private constructor(config: ComputeConfig) {
    this.config = config;
    const provider = new ethers.JsonRpcProvider(config.rpcUrl);
    this.wallet = new ethers.Wallet(config.privateKey, provider);
    this.broker = null as never;
  }

  static async create(config: ComputeConfig, thoughtStream?: ThoughtStream): Promise<CreatureCompute> {
    const instance = new CreatureCompute(config);
    instance.thoughtStream = thoughtStream ?? null;
    await instance.initialize();
    return instance;
  }

  private async initialize(): Promise<void> {
    // @ts-expect-error SDK types may not match exactly
    this.broker = await createZGComputeNetworkBroker(this.wallet);
    this.initialized = true;
  }

  async ensureAccountReady(): Promise<boolean> {
    if (!this.initialized) return false;

    try {
      // Check if ledger exists
      let hasLedger = false;
      try {
        await this.broker.ledger.getLedger();
        hasLedger = true;
      } catch {
        hasLedger = false;
      }

      if (!hasLedger) {
        await this.broker.ledger.addLedger(3); // Minimum 3 OG
      }

      // Fund sub-accounts for available providers
      const services = await this.listServices();
      for (const svc of services) {
        try {
          await this.broker.inference.acknowledgeProviderSigner(svc.providerAddress);
          this.acknowledgedProviders.add(svc.providerAddress);
        } catch {
          // May already be acknowledged
        }

        try {
          const account = await this.broker.inference.getAccount(svc.providerAddress);
          const balance = parseFloat(ethers.formatEther(BigInt(account.balance)));
          if (balance < 0.3) {
            const amount = ethers.parseEther("0.5") - BigInt(account.balance);
            await this.broker.ledger.transferFund(svc.providerAddress, "inference", amount);
          }
        } catch {
          // Account doesn't exist yet, fund it
          await this.broker.ledger.transferFund(
            svc.providerAddress,
            "inference",
            ethers.parseEther("0.5")
          );
        }
      }

      return true;
    } catch (error) {
      console.error("Failed to ensure account ready:", error);
      return false;
    }
  }

  async listServices(): Promise<ServiceInfo[]> {
    if (!this.initialized) return [];
    const services = await this.broker.inference.listService();
    return services.map((svc: Record<string, unknown>) => ({
      providerAddress: (svc.provider || svc.providerAddress) as string,
      endpoint: (svc.url || svc.endpoint) as string,
      model: (svc.model || svc.name) as string,
      inputPrice: (svc.inputPrice || "0") as string,
      outputPrice: (svc.outputPrice || "0") as string,
    }));
  }

  private async selectProvider(): Promise<ServiceInfo | null> {
    const services = await this.listServices();
    if (services.length === 0) return null;
    // Pick first available chatbot service
    return services[0];
  }

  private async inference(
    providerAddress: string,
    messages: Array<{ role: string; content: string }>,
    options: { maxTokens?: number; temperature?: number } = {}
  ): Promise<{ content: string; usage: { inputTokens: number; outputTokens: number }; chatID?: string } | null> {
    const metadata = await this.broker.inference.getServiceMetadata(providerAddress);
    if (!metadata) return null;

    const lastMessage = messages[messages.length - 1]?.content || "";
    const headers = await this.broker.inference.getRequestHeaders(providerAddress, lastMessage);
    if (!headers) return null;

    const endpoint = metadata.endpoint || metadata.url;
    const response = await fetch(`${endpoint}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({
        model: metadata.model,
        messages,
        max_tokens: options.maxTokens || 2000,
        temperature: options.temperature || 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Inference failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as Record<string, unknown>;
    const choices = data.choices as Array<{ message?: { content?: string; reasoning?: string } }>;
    const content = choices?.[0]?.message?.content || choices?.[0]?.message?.reasoning || "";
    const usage = data.usage as { prompt_tokens?: number; completion_tokens?: number } | undefined;
    const chatID = (response.headers.get("ZG-Res-Key") || (data as Record<string, unknown>).id || undefined) as string | undefined;

    // Fee settlement
    await this.broker.inference.processResponse(providerAddress, chatID, JSON.stringify(usage));

    return {
      content,
      usage: {
        inputTokens: usage?.prompt_tokens || 0,
        outputTokens: usage?.completion_tokens || 0,
      },
      chatID,
    };
  }

  /**
   * Generate a draft solution for a bounty challenge.
   */
  async think(
    challengeId: number,
    messages: Array<{ role: string; content: string }>,
    genome: Genome
  ): Promise<ThoughtResult> {
    const provider = await this.selectProvider();
    if (!provider) throw new Error("No compute providers available");

    // Prepend genome system prompt
    const fullMessages = [
      { role: "system", content: genome.systemPrompt },
      ...messages,
    ];

    await this.thoughtStream?.emit({
      id: crypto.randomUUID(),
      challengeId,
      timestamp: Date.now(),
      type: "reasoning",
      content: `Thinking about challenge #${challengeId} using ${provider.model}...`,
    });

    const result = await this.inference(provider.providerAddress, fullMessages, {
      maxTokens: 4000,
      temperature: 0.7,
    });

    if (!result) throw new Error("Inference returned no result");

    await this.thoughtStream?.emit({
      id: crypto.randomUUID(),
      challengeId,
      timestamp: Date.now(),
      type: "draft",
      content: result.content,
      metadata: { tokens: result.usage },
    });

    return {
      content: result.content,
      inputTokens: result.usage.inputTokens,
      outputTokens: result.usage.outputTokens,
    };
  }

  /**
   * Evaluate a nudge against the current draft.
   */
  async evaluateNudge(
    challengeId: number,
    currentDraft: string,
    nudgeContent: string,
    genome: Genome
  ): Promise<NudgeEvaluation> {
    const provider = await this.selectProvider();
    if (!provider) throw new Error("No compute providers available");

    const messages = [
      { role: "system", content: genome.systemPrompt },
      {
        role: "user",
        content: `Evaluate this contribution to the current draft.

CURRENT DRAFT:
${currentDraft}

PROPOSED IMPROVEMENT:
${nudgeContent}

Respond with JSON:
{
  "score": <1-10>,
  "analysis": "<brief analysis>",
  "shouldIntegrate": <true/false>,
  "mergedContent": "<if shouldIntegrate, the merged result>"
}`,
      },
    ];

    const result = await this.inference(provider.providerAddress, messages, {
      maxTokens: 4000,
      temperature: 0.3,
    });

    if (!result) throw new Error("Evaluation failed");

    try {
      const jsonMatch = result.content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON in response");
      return JSON.parse(jsonMatch[0]) as NudgeEvaluation;
    } catch {
      return {
        score: 5,
        analysis: result.content,
        shouldIntegrate: false,
      };
    }
  }

  /**
   * Evolve the genome based on challenge outcome.
   */
  async evolve(
    challengeId: number,
    genome: Genome,
    outcome: "win" | "loss",
    submissionSummary: string
  ): Promise<Genome> {
    const provider = await this.selectProvider();
    if (!provider) throw new Error("No compute providers available");

    const messages = [
      {
        role: "system",
        content: "You are performing self-reflection on your most recent challenge attempt. Return ONLY valid JSON.",
      },
      {
        role: "user",
        content: `CURRENT GENOME (generation ${genome.generation}):
${JSON.stringify(genome, null, 2)}

CHALLENGE #${challengeId} OUTCOME: ${outcome.toUpperCase()}

SUBMISSION SUMMARY:
${submissionSummary}

Analyze what worked and what didn't. Return an updated genome JSON with:
1. New learnings added to the learnings array
2. Updated strengths/weaknesses
3. Any new domain strategies
4. Optionally refine the systemPrompt if you see a fundamental improvement
5. Increment generation by 1
6. Set lastUpdated to ${Date.now()}`,
      },
    ];

    const result = await this.inference(provider.providerAddress, messages, {
      maxTokens: 4000,
      temperature: 0.5,
    });

    if (!result) throw new Error("Evolution inference failed");

    try {
      const jsonMatch = result.content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON in response");
      const newGenome = JSON.parse(jsonMatch[0]) as Genome;

      await this.thoughtStream?.emit({
        id: crypto.randomUUID(),
        challengeId,
        timestamp: Date.now(),
        type: "evolution",
        content: `Evolved to generation ${newGenome.generation}. New learnings: ${newGenome.learnings.slice(-3).join("; ")}`,
      });

      return newGenome;
    } catch {
      // If parsing fails, just add the outcome as a learning
      return {
        ...genome,
        generation: genome.generation + 1,
        learnings: [...genome.learnings, `Challenge #${challengeId}: ${outcome}. ${result.content.slice(0, 200)}`],
        lastUpdated: Date.now(),
      };
    }
  }
}
