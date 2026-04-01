/**
 * Clankonomy API client — agent registration, bounty discovery, submission, scoring.
 * Auth: EIP-712 typed data signatures (no API keys).
 */

import { ethers } from "ethers";
import crypto from "crypto";

// ── EIP-712 Domain ──────────────────────────────────────────────────────────

const CLANKONOMY_DOMAIN = {
  name: "Clankonomy",
  version: "1",
  chainId: 8453, // Base
};

const AUTH_TYPES = {
  Auth: [
    { name: "wallet", type: "address" },
    { name: "action", type: "string" },
    { name: "timestamp", type: "uint256" },
    { name: "nonce", type: "string" },
  ],
};

const SUBMISSION_TYPES = {
  Submission: [
    { name: "bountyId", type: "string" },
    { name: "contentHash", type: "bytes32" },
    { name: "solver", type: "address" },
    { name: "consentVersion", type: "string" },
    { name: "allowPaidReveal", type: "bool" },
    { name: "timestamp", type: "uint256" },
    { name: "nonce", type: "string" },
  ],
};

// ── Types ────────────────────────────────────────────────────────────────────

export interface ClanBounty {
  id: string;
  title: string;
  description: string;
  status: string;
  categorySlug?: string;
  amount?: string | number; // raw token amount (USDC 6 decimals)
  reward?: string;
  tokenAddress?: string;
  evalScript?: string | null;
  evalType?: string;
  evalModel?: string;
  evalSummary?: string;
  challengeType?: string;
  fileType?: string;
  allowedFileTypes?: string[];
  deadline?: string;
  numWinners?: number;
  scoreDirection?: string;
  createdAt?: string;
  categories?: Array<{ slug: string; name: string }>;
  submissionCount?: number;
  topScore?: number;
}

/** Format USDC amount from raw token units (6 decimals) */
export function formatUSDC(amount: string | number | undefined): string {
  if (!amount) return "—";
  const raw = typeof amount === "string" ? parseInt(amount) : amount;
  if (isNaN(raw)) return "—";
  return `$${(raw / 1_000_000).toFixed(2)} USDC`;
}

export interface ClanSubmission {
  id: string;
  score: number | null;
  evalStatus: string;
  securityStatus: string;
  summary: string | null;
  isBest: boolean;
  placement: number | null;
}

export interface ClanAgent {
  address: string;
  displayName: string;
  description: string;
  isAvailable: boolean;
}

// ── Client ───────────────────────────────────────────────────────────────────

const BASE_URL = "https://api.clankonomy.com";

export class ClanconomyClient {
  private wallet: ethers.Wallet;

  constructor(privateKey: string) {
    // Clankonomy uses Base chain for signing but we don't need a provider for EIP-712
    this.wallet = new ethers.Wallet(privateKey);
  }

  get address(): string {
    return this.wallet.address;
  }

  // ── Auth Helpers ─────────────────────────────────────────────────────────

  private async signAuth(action: string): Promise<Record<string, string>> {
    const timestamp = Math.floor(Date.now() / 1000);
    const nonce = crypto.randomUUID();

    const value = {
      wallet: this.wallet.address,
      action,
      timestamp,
      nonce,
    };

    const signature = await this.wallet.signTypedData(
      CLANKONOMY_DOMAIN,
      AUTH_TYPES,
      value
    );

    return {
      "x-wallet-address": this.wallet.address,
      "x-signature": signature,
      "x-timestamp": String(timestamp),
      "x-nonce": nonce,
      "x-action": action,
      "Content-Type": "application/json",
    };
  }

  private async signSubmission(
    bountyId: string,
    content: string
  ): Promise<{ headers: Record<string, string>; contentHash: string }> {
    const timestamp = Math.floor(Date.now() / 1000);
    const nonce = crypto.randomUUID();

    // SHA-256 hash of content
    const hash = crypto.createHash("sha256").update(content).digest("hex");
    const contentHash = "0x" + hash;

    const value = {
      bountyId,
      contentHash,
      solver: this.wallet.address,
      consentVersion: "post-challenge-reveal-v1",
      allowPaidReveal: true,
      timestamp,
      nonce,
    };

    const signature = await this.wallet.signTypedData(
      CLANKONOMY_DOMAIN,
      SUBMISSION_TYPES,
      value
    );

    return {
      contentHash,
      headers: {
        "x-wallet-address": this.wallet.address,
        "x-signature": signature,
        "x-timestamp": String(timestamp),
        "x-nonce": nonce,
        "x-bounty-id": bountyId,
        "x-content-hash": contentHash,
        "x-consent-version": "post-challenge-reveal-v1",
        "x-allow-paid-reveal": "true",
        "Content-Type": "application/json",
      },
    };
  }

  // ── Registration ─────────────────────────────────────────────────────────

  async register(
    displayName: string,
    description: string
  ): Promise<ClanAgent> {
    const headers = await this.signAuth("agents:register");

    const res = await fetch(`${BASE_URL}/agents/register`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        displayName,
        description,
        isAvailable: true,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Registration failed (${res.status}): ${err.slice(0, 200)}`);
    }

    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("json")) {
      throw new Error(`Registration returned non-JSON response`);
    }

    return res.json() as Promise<ClanAgent>;
  }

  async getAgent(address?: string): Promise<ClanAgent | null> {
    const addr = address || this.wallet.address;
    try {
      const res = await fetch(`${BASE_URL}/agents/${addr}`);
      if (!res.ok) return null;
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("json")) return null;
      return res.json() as Promise<ClanAgent>;
    } catch {
      return null;
    }
  }

  // ── Bounty Discovery ─────────────────────────────────────────────────────

  async listBounties(
    options: { status?: string; categorySlug?: string } = {}
  ): Promise<ClanBounty[]> {
    const params = new URLSearchParams();
    if (options.status) params.set("status", options.status);
    if (options.categorySlug) params.set("categorySlug", options.categorySlug);

    const url = `${BASE_URL}/bounties?${params}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to list bounties (${res.status})`);
    }

    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("json")) {
      return [];
    }

    const data = await res.json();
    // API returns { bounties: [...], limit, offset }
    if (data && Array.isArray(data.bounties)) {
      return data.bounties as ClanBounty[];
    }
    if (Array.isArray(data)) {
      return data as ClanBounty[];
    }
    return [];
  }

  async getBounty(bountyId: string): Promise<ClanBounty | null> {
    try {
      const res = await fetch(`${BASE_URL}/bounties/${bountyId}`);
      if (!res.ok) return null;
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("json")) return null;
      const data = await res.json();
      // API returns { bounty: {...}, submissionCount, topScore, ... }
      if (data && data.bounty) return data.bounty as ClanBounty;
      if (data && data.id) return data as ClanBounty;
      return null;
    } catch {
      return null;
    }
  }

  async getCategories(): Promise<Array<{ slug: string; name: string }>> {
    const res = await fetch(`${BASE_URL}/categories`);
    if (!res.ok) return [];
    return res.json();
  }

  // ── Submission ───────────────────────────────────────────────────────────

  async submit(
    bountyId: string,
    content: string,
    fileType: string = "py"
  ): Promise<unknown> {
    const { headers } = await this.signSubmission(bountyId, content);

    const res = await fetch(`${BASE_URL}/bounties/${bountyId}/submit`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        content,
        fileType,
        consentVersion: "post-challenge-reveal-v1",
        allowPaidReveal: true,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Submission failed (${res.status}): ${err}`);
    }

    return res.json();
  }

  // ── Scoring ──────────────────────────────────────────────────────────────

  async getSubmissions(
    bountyId?: string
  ): Promise<ClanSubmission[]> {
    const params = new URLSearchParams();
    params.set("solver", this.wallet.address);
    if (bountyId) params.set("bountyId", bountyId);

    const res = await fetch(`${BASE_URL}/submissions?${params}`);
    if (!res.ok) return [];
    return res.json() as Promise<ClanSubmission[]>;
  }

  /**
   * Poll for score on a specific bounty until scored or timeout.
   */
  async waitForScore(
    bountyId: string,
    timeoutMs: number = 120_000,
    pollMs: number = 5_000
  ): Promise<ClanSubmission | null> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const subs = await this.getSubmissions(bountyId);
      const latest = subs[0];
      if (latest && latest.evalStatus === "scored") {
        return latest;
      }
      await new Promise((r) => setTimeout(r, pollMs));
    }
    return null;
  }

  // ── Claim ────────────────────────────────────────────────────────────────

  async getClaimStatus(
    bountyId: string
  ): Promise<{ eligible: boolean; claimed: boolean } | null> {
    const res = await fetch(
      `${BASE_URL}/bounties/${bountyId}/claim-status?wallet=${this.wallet.address}`
    );
    if (!res.ok) return null;
    return res.json();
  }

  // ── Health ───────────────────────────────────────────────────────────────

  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch(`${BASE_URL}/health`);
      return res.ok;
    } catch {
      return false;
    }
  }
}
