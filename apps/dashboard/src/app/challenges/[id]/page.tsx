import Link from "next/link";
import StatusBadge, { type ChallengeStatus } from "@/components/StatusBadge";
import LiveThoughtStream from "@/components/LiveThoughtStream";
import NudgeForm from "@/components/NudgeForm";

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
  iterations?: number;
  platformSubmissions?: number;
  evalType?: string;
  evalSummary?: string;
  deadline?: string;
  numWinners?: number;
  currentDraft?: string;
  createdAt?: string | number;
  description?: string;
  title?: string;
}

// ── Data fetching ──────────────────────────────────────────────────────────────

const KEEPER_BASE = process.env.KEEPER_URL || "http://localhost:3001";

async function getChallenge(id: string): Promise<KeeperChallenge | null> {
  try {
    const res = await fetch(`${KEEPER_BASE}/challenges/${id}`, {
      next: { revalidate: 10 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const challenge = await getChallenge(id);

  if (!challenge) {
    return (
      <div style={{ minHeight: "100vh", background: "#FFFEF2", color: "#000000" }}>
        <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px 64px" }}>
          {/* Breadcrumb */}
          <div
            style={{
              fontSize: "10px",
              color: "#000000",
              fontWeight: 700,
              letterSpacing: "0.12em",
              marginBottom: "24px",
            }}
          >
            <Link href="/" style={{ color: "#000000", textDecoration: "none", fontWeight: 700 }}>HOME</Link>
            {" / "}
            <Link href="/challenges" style={{ color: "#000000", textDecoration: "none", fontWeight: 700 }}>CHALLENGES</Link>
            {" / "}
            <span style={{ color: "#000000", fontWeight: 800 }}>{id.toUpperCase()}</span>
          </div>

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
              [ — ]
            </div>
            <p style={{ margin: 0, fontSize: "12px", color: "#000000", fontWeight: 600 }}>
              Challenge not found. Keeper may be offline.
            </p>
          </div>
        </main>
      </div>
    );
  }

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
    <div style={{ minHeight: "100vh", background: "#FFFEF2", color: "#000000" }}>
      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px 64px" }}>

        {/* Breadcrumb */}
        <div
          style={{
            fontSize: "10px",
            color: "#000000",
            fontWeight: 700,
            letterSpacing: "0.12em",
            marginBottom: "24px",
          }}
        >
          <Link href="/" style={{ color: "#000000", textDecoration: "none", fontWeight: 700 }}>HOME</Link>
          {" / "}
          <Link href="/challenges" style={{ color: "#000000", textDecoration: "none", fontWeight: 700 }}>CHALLENGES</Link>
          {" / "}
          <span style={{ color: "#000000", fontWeight: 800 }}>{id.toUpperCase()}</span>
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
                fontWeight: 800,
                color: "#000000",
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
                color: "#5856D6",
                textDecoration: "none",
                fontWeight: 700,
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
                background: "#FFFFFF",
                border: "3px solid #000000",
                borderRadius: 0,
                padding: "20px",
                boxShadow: "4px 4px 0px #000000",
              }}
            >
              <SectionLabel>DETAILS</SectionLabel>
              <dl style={{ margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                <Row label="CHALLENGE ID" value={id} mono />
                <Row label="STATUS" value={status} />
                <Row label="PRIZE" value={prize} accent="#BFFF00" />
                <Row label="FEE" value={challenge.fee ?? "—"} />
                <Row label="ITERATIONS" value={String(challenge.iterations ?? 0)} />
                <Row label="NUDGES" value={String(challenge.nudgeCount ?? 0)} />
                <Row label="REQUESTER" value={challenge.requester ?? "—"} mono />
                <Row label="OPENED" value={createdAt} />
              </dl>
            </div>

            {/* Description */}
            {challenge.description && (
              <div
                style={{
                  background: "#FFFFFF",
                  border: "3px solid #000000",
                  borderRadius: 0,
                  padding: "20px",
                  boxShadow: "4px 4px 0px #000000",
                }}
              >
                <SectionLabel>DESCRIPTION</SectionLabel>
                <p
                  style={{
                    margin: 0,
                    fontSize: "12px",
                    color: "#000000",
                    lineHeight: 1.6,
                    fontWeight: 500,
                  }}
                >
                  {challenge.description}
                </p>
              </div>
            )}

            {/* Nudge form */}
            <NudgeForm bountyId={id} />
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
                borderBottom: "3px solid #000000",
              }}
            >
              <SectionLabel as="h2">THOUGHT STREAM</SectionLabel>
              <span style={{ fontSize: "10px", color: "#000000", fontWeight: 600 }}>
                filtered to challenge {id}
              </span>
            </div>
            <LiveThoughtStream
              sseUrl="/api/thoughts"
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
        fontWeight: 800,
        letterSpacing: "0.15em",
        color: "#000000",
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
      <dt style={{ fontSize: "10px", color: "#000000", fontWeight: 700, letterSpacing: "0.08em", flexShrink: 0 }}>
        {label}
      </dt>
      <dd
        style={{
          margin: 0,
          fontSize: "11px",
          fontWeight: 700,
          color: "#000000",
          fontFamily: mono ? "inherit" : undefined,
          textAlign: "right",
          wordBreak: "break-all",
          background: accent ?? "transparent",
          padding: accent ? "0 4px" : undefined,
        }}
      >
        {value}
      </dd>
    </div>
  );
}
