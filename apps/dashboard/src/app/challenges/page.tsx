import Link from "next/link";
import ChallengeCard, { type Challenge } from "@/components/ChallengeCard";
import type { ChallengeStatus } from "@/components/StatusBadge";

// ── Types ──────────────────────────────────────────────────────────────────────

interface KeeperChallenge {
  id: string;
  bountyUrl: string;
  status: string;
  requester?: string;
  prize?: string;
  prizeAmount?: string;
  fee?: string;
  nudgeCount?: number;
  createdAt?: string | number;
  description?: string;
  title?: string;
}

// ── Data fetching ──────────────────────────────────────────────────────────────

async function getChallenges(): Promise<Challenge[]> {
  try {
    const res = await fetch("http://localhost:3001/challenges", {
      next: { revalidate: 10 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: KeeperChallenge[] = await res.json();
    return data.map(normalizeChallenge);
  } catch {
    return MOCK_CHALLENGES;
  }
}

function normalizeChallenge(raw: KeeperChallenge): Challenge {
  const title = raw.title ?? raw.bountyUrl.split("/").pop() ?? raw.id;
  const createdAt =
    typeof raw.createdAt === "number"
      ? new Date(raw.createdAt).toISOString()
      : raw.createdAt ?? new Date().toISOString();
  return {
    id: String(raw.id),
    title,
    status: (raw.status as ChallengeStatus) ?? "Pending",
    bountyUrl: raw.bountyUrl,
    prize: raw.prize ?? raw.prizeAmount ?? "—",
    fee: raw.fee ?? "—",
    nudgeCount: raw.nudgeCount ?? 0,
    createdAt,
    description: raw.description,
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function groupByStatus(
  challenges: Challenge[]
): Partial<Record<ChallengeStatus, Challenge[]>> {
  return challenges.reduce(
    (acc, ch) => {
      if (!acc[ch.status]) acc[ch.status] = [];
      acc[ch.status]!.push(ch);
      return acc;
    },
    {} as Partial<Record<ChallengeStatus, Challenge[]>>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export const metadata = { title: "Challenges | BountyMaxxing" };

const STATUS_ORDER: ChallengeStatus[] = [
  "Working",
  "Submitted",
  "Acknowledged",
  "Pending",
  "Won",
  "Lost",
  "Cancelled",
];

export default async function ChallengesPage() {
  const challenges = await getChallenges();
  const byStatus = groupByStatus(challenges);

  const active = challenges.filter(
    (c) => c.status === "Working" || c.status === "Submitted"
  ).length;
  const won = challenges.filter((c) => c.status === "Won").length;
  const lost = challenges.filter((c) => c.status === "Lost").length;

  return (
    <div style={{ minHeight: "100vh", background: "#FFFEF2", color: "#000000" }}>
      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 24px 64px" }}>

        {/* Breadcrumb + title */}
        <div style={{ marginBottom: "36px" }}>
          <div
            style={{
              fontSize: "10px",
              color: "#000000",
              fontWeight: 700,
              letterSpacing: "0.12em",
              marginBottom: "10px",
            }}
          >
            <Link href="/" style={{ color: "#000000", textDecoration: "none", fontWeight: 700 }}>
              HOME
            </Link>
            {" / "}CHALLENGES
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: "22px",
              fontWeight: 800,
              letterSpacing: "0.1em",
              color: "#000000",
            }}
          >
            CHALLENGES
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#000000", fontWeight: 500 }}>
            All bounty targets tracked by BountyMaxxing.
          </p>
        </div>

        {/* Summary bar */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            marginBottom: "36px",
            border: "3px solid #000000",
            borderRadius: 0,
            overflow: "hidden",
            boxShadow: "4px 4px 0px #000000",
          }}
        >
          {[
            { label: "TOTAL", value: challenges.length, accent: null },
            { label: "ACTIVE", value: active, accent: "#5856D6" },
            { label: "WON", value: won, accent: "#BFFF00" },
            { label: "LOST", value: lost, accent: "#FF3B30" },
          ].map((stat, idx, arr) => (
            <div
              key={stat.label}
              style={{
                flex: "1 1 80px",
                padding: "16px",
                background: "#FFFFFF",
                textAlign: "center",
                borderRight: idx < arr.length - 1 ? "3px solid #000000" : undefined,
              }}
            >
              <div
                style={{
                  fontSize: "9px",
                  color: "#000000",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  marginBottom: "6px",
                }}
              >
                {stat.label}
              </div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: 800,
                  color: "#000000",
                  background: stat.accent ?? "transparent",
                  display: "inline-block",
                  padding: stat.accent ? "0 6px" : undefined,
                }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Challenge groups */}
        {challenges.length === 0 ? (
          <div
            style={{
              padding: "48px 24px",
              textAlign: "center",
              border: "3px solid #000000",
              borderRadius: 0,
              background: "#FFFFFF",
              boxShadow: "4px 4px 0px #000000",
            }}
          >
            <div
              style={{ fontSize: "20px", marginBottom: "12px", color: "#000000", fontWeight: 800 }}
              aria-hidden="true"
            >
              [ ]
            </div>
            <p style={{ margin: 0, fontSize: "12px", color: "#000000", fontWeight: 600 }}>
              No challenges found. BountyMaxxing is scanning...
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
            {STATUS_ORDER.map((status) => {
              const group = byStatus[status];
              if (!group?.length) return null;
              return (
                <section key={status}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "14px",
                      paddingBottom: "10px",
                      borderBottom: "3px solid #000000",
                    }}
                  >
                    <h2
                      style={{
                        margin: 0,
                        fontSize: "11px",
                        fontWeight: 800,
                        letterSpacing: "0.15em",
                        color: "#000000",
                      }}
                    >
                      {status.toUpperCase()}
                    </h2>
                    <span
                      style={{
                        fontSize: "10px",
                        color: "#000000",
                        fontWeight: 700,
                        padding: "1px 7px",
                        border: "2px solid #000000",
                        borderRadius: 0,
                        background: "#FFFFFF",
                      }}
                    >
                      {group.length}
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {group.map((ch) => (
                      <Link
                        key={ch.id}
                        href={`/challenges/${ch.id}`}
                        style={{ textDecoration: "none", display: "block" }}
                      >
                        <div style={{ cursor: "pointer" }}>
                          <ChallengeCard challenge={ch} />
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

// ── Mock data (fallback when keeper is offline) ────────────────────────────────

const MOCK_CHALLENGES: Challenge[] = [
  {
    id: "ch-001",
    title: "DeFi Yield Optimizer — Maximum APY Compounding Strategy",
    status: "Working",
    bountyUrl: "https://bounties.0g.ai/challenges/defi-yield-optimizer-v2",
    prize: "500 OG",
    fee: "5 OG",
    nudgeCount: 2,
    createdAt: "2026-03-28T10:00:00Z",
    description:
      "Design a yield strategy contract that maximizes APY through dynamic rebalancing across 0G liquidity pools.",
  },
  {
    id: "ch-002",
    title: "NFT Bridge Gas Cost Reduction — Cross-Chain Transfer Optimization",
    status: "Submitted",
    bountyUrl: "https://bounties.0g.ai/challenges/nft-bridge-gas-v1",
    prize: "300 OG",
    fee: "3 OG",
    nudgeCount: 1,
    createdAt: "2026-03-25T14:30:00Z",
    description:
      "Reduce gas costs for NFT cross-chain transfers by at least 30% compared to current bridge implementation.",
  },
  {
    id: "ch-003",
    title: "ZK Proof Verifier — On-Chain Groth16 Optimization",
    status: "Pending",
    bountyUrl: "https://bounties.0g.ai/challenges/zk-verifier-groth16",
    prize: "1000 OG",
    fee: "10 OG",
    nudgeCount: 0,
    createdAt: "2026-04-01T08:00:00Z",
    description:
      "Optimize the on-chain Groth16 verifier for lower verification cost without compromising security.",
  },
  {
    id: "ch-004",
    title: "Liquidity Pool AMM — Concentrated Range Positions",
    status: "Won",
    bountyUrl: "https://bounties.0g.ai/challenges/amm-concentrated-v1",
    prize: "500 OG",
    fee: "5 OG",
    nudgeCount: 3,
    createdAt: "2026-03-10T09:00:00Z",
    description: "Implement a Uniswap v3-style concentrated liquidity AMM for the 0G DEX.",
  },
  {
    id: "ch-005",
    title: "Cross-Chain Messaging — Relayer Fee Optimization",
    status: "Lost",
    bountyUrl: "https://bounties.0g.ai/challenges/ccm-relayer-v2",
    prize: "250 OG",
    fee: "2.5 OG",
    nudgeCount: 1,
    createdAt: "2026-03-05T12:00:00Z",
    description: "Minimize relayer fees for cross-chain message passing on 0G network.",
  },
];
