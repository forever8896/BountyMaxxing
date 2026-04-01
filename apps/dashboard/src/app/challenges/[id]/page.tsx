import Link from "next/link";
import StatusBadge, { type ChallengeStatus } from "@/components/StatusBadge";
import LiveThoughtStream from "@/components/LiveThoughtStream";

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

async function getChallenge(id: string): Promise<KeeperChallenge | null> {
  try {
    const res = await fetch(`http://localhost:3001/challenges/${id}`, {
      next: { revalidate: 10 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return MOCK_DETAIL[id] ?? null;
  }
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const raw = await getChallenge(id);

  // Fall back to a placeholder if nothing found
  const challenge = raw ?? {
    id,
    bountyUrl: `https://bounties.0g.ai/challenges/${id}`,
    status: "Pending",
    requester: "unknown",
    prize: "—",
    fee: "—",
    nudgeCount: 0,
    createdAt: new Date().toISOString(),
    description: undefined,
    title: `Challenge ${id}`,
  };

  const title = challenge.title ?? challenge.bountyUrl.split("/").pop() ?? id;
  const status = (challenge.status as ChallengeStatus) ?? "Pending";
  const prize = challenge.prize ?? challenge.prizeAmount ?? "—";
  const createdAt =
    typeof challenge.createdAt === "number"
      ? new Date(challenge.createdAt).toLocaleDateString()
      : challenge.createdAt
        ? new Date(challenge.createdAt).toLocaleDateString()
        : "—";

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#e8e8f0" }}>
      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px 64px" }}>

        {/* Breadcrumb */}
        <div
          style={{
            fontSize: "10px",
            color: "#555566",
            letterSpacing: "0.12em",
            marginBottom: "24px",
          }}
        >
          <Link href="/" style={{ color: "#555566", textDecoration: "none" }}>HOME</Link>
          {" / "}
          <Link href="/challenges" style={{ color: "#555566", textDecoration: "none" }}>CHALLENGES</Link>
          {" / "}
          <span style={{ color: "#888899" }}>{id.toUpperCase()}</span>
        </div>

        {/* Title row */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "32px",
          }}
        >
          <div>
            <h1
              style={{
                margin: "0 0 6px",
                fontSize: "20px",
                fontWeight: 700,
                color: "#e8e8f0",
                letterSpacing: "0.04em",
                lineHeight: 1.3,
              }}
            >
              {title}
            </h1>
            <a
              href={challenge.bountyUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "11px",
                color: "#4488ff",
                textDecoration: "none",
                opacity: 0.8,
              }}
            >
              {challenge.bountyUrl}
            </a>
          </div>
          <StatusBadge status={status} size="md" />
        </div>

        {/* Main grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "24px",
          }}
          className="detail-grid"
        >
          {/* Left column: info + nudge */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Info card */}
            <div
              style={{
                background: "#12121a",
                border: "1px solid #1a1a2e",
                borderRadius: "4px",
                padding: "20px",
              }}
            >
              <SectionLabel>DETAILS</SectionLabel>
              <dl style={{ margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                <Row label="CHALLENGE ID" value={id} mono />
                <Row label="STATUS" value={status} />
                <Row label="PRIZE" value={prize} accent="#00ff88" />
                <Row label="FEE" value={challenge.fee ?? "—"} />
                <Row label="NUDGES" value={String(challenge.nudgeCount ?? 0)} />
                <Row label="REQUESTER" value={challenge.requester ?? "—"} mono />
                <Row label="OPENED" value={createdAt} />
              </dl>
            </div>

            {/* Description */}
            {challenge.description && (
              <div
                style={{
                  background: "#12121a",
                  border: "1px solid #1a1a2e",
                  borderRadius: "4px",
                  padding: "20px",
                }}
              >
                <SectionLabel>DESCRIPTION</SectionLabel>
                <p
                  style={{
                    margin: 0,
                    fontSize: "12px",
                    color: "#888899",
                    lineHeight: 1.6,
                  }}
                >
                  {challenge.description}
                </p>
              </div>
            )}

            {/* Nudge submission placeholder */}
            <div
              style={{
                background: "#12121a",
                border: "1px solid #1a1a2e",
                borderRadius: "4px",
                padding: "20px",
              }}
            >
              <SectionLabel>SUBMIT A NUDGE</SectionLabel>
              <p
                style={{
                  margin: "0 0 12px",
                  fontSize: "11px",
                  color: "#555566",
                  lineHeight: 1.5,
                }}
              >
                Upload your improvement suggestion to 0G Storage, then submit
                the content hash on-chain to steer The Creature.
              </p>
              <textarea
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  background: "#0d0d14",
                  border: "1px solid #222238",
                  borderRadius: "2px",
                  padding: "10px 12px",
                  fontSize: "12px",
                  color: "#888899",
                  fontFamily: "inherit",
                  resize: "vertical",
                  outline: "none",
                  cursor: "not-allowed",
                }}
                rows={4}
                placeholder="Paste your improvement hint here..."
                disabled
                aria-label="Nudge input (read-only dashboard)"
              />
              <button
                style={{
                  marginTop: "10px",
                  width: "100%",
                  background: "#161620",
                  border: "1px solid #222238",
                  borderRadius: "2px",
                  padding: "10px",
                  fontSize: "11px",
                  color: "#555566",
                  fontFamily: "inherit",
                  letterSpacing: "0.08em",
                  cursor: "not-allowed",
                }}
                disabled
                aria-disabled="true"
              >
                CONNECT WALLET TO NUDGE
              </button>
              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: "10px",
                  color: "#444455",
                  textAlign: "center",
                }}
              >
                Read-only dashboard — wallet integration coming soon
              </p>
            </div>
          </div>

          {/* Right column: thought stream */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "12px",
                paddingBottom: "10px",
                borderBottom: "1px solid #1a1a2e",
              }}
            >
              <SectionLabel as="h2">THOUGHT STREAM</SectionLabel>
              <span style={{ fontSize: "10px", color: "#555566" }}>
                filtered to challenge {id}
              </span>
            </div>
            <LiveThoughtStream
              sseUrl="http://localhost:3001/thoughts"
              filterChallengeId={id}
              maxHeight="520px"
            />
          </div>
        </div>
      </main>

      {/* Responsive grid override */}
      <style>{`
        @media (min-width: 860px) {
          .detail-grid {
            grid-template-columns: 320px 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function SectionLabel({
  children,
  as: Tag = "h3",
}: {
  children: React.ReactNode;
  as?: "h2" | "h3";
}) {
  return (
    <Tag
      style={{
        margin: "0 0 14px",
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "0.15em",
        color: "#555566",
      }}
    >
      {children}
    </Tag>
  );
}

function Row({
  label,
  value,
  accent,
  mono,
}: {
  label: string;
  value: string;
  accent?: string;
  mono?: boolean;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
      <dt style={{ fontSize: "10px", color: "#555566", letterSpacing: "0.08em", flexShrink: 0 }}>
        {label}
      </dt>
      <dd
        style={{
          margin: 0,
          fontSize: "11px",
          color: accent ?? "#c8c8d8",
          fontFamily: mono ? "inherit" : undefined,
          textAlign: "right",
          wordBreak: "break-all",
        }}
      >
        {value}
      </dd>
    </div>
  );
}

// ── Mock fallback ──────────────────────────────────────────────────────────────

const MOCK_DETAIL: Record<string, KeeperChallenge> = {
  "ch-001": {
    id: "ch-001",
    title: "DeFi Yield Optimizer — Maximum APY Compounding Strategy",
    status: "Working",
    bountyUrl: "https://bounties.0g.ai/challenges/defi-yield-optimizer-v2",
    prize: "500 OG",
    fee: "5 OG",
    nudgeCount: 2,
    requester: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
    createdAt: "2026-03-28T10:00:00Z",
    description:
      "Design a yield strategy contract that maximizes APY through dynamic rebalancing across 0G liquidity pools.",
  },
  "ch-002": {
    id: "ch-002",
    title: "NFT Bridge Gas Cost Reduction — Cross-Chain Transfer Optimization",
    status: "Submitted",
    bountyUrl: "https://bounties.0g.ai/challenges/nft-bridge-gas-v1",
    prize: "300 OG",
    fee: "3 OG",
    nudgeCount: 1,
    requester: "0x9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e",
    createdAt: "2026-03-25T14:30:00Z",
    description:
      "Reduce gas costs for NFT cross-chain transfers by at least 30% compared to current bridge implementation.",
  },
};
