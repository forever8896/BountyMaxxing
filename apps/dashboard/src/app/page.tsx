import Image from "next/image";
import ThoughtStream, { MOCK_THOUGHTS } from "@/components/ThoughtStream";
import ChallengeCard, { type Challenge } from "@/components/ChallengeCard";
import StatusBadge from "@/components/StatusBadge";

// ── Mock data ─────────────────────────────────────────────────────────────────

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
];

const LOOP_PHASES = [
  { id: "hunt", label: "HUNT", desc: "Find bounties", active: true },
  { id: "draft", label: "DRAFT", desc: "Generate solution", active: false },
  { id: "workshop", label: "WORKSHOP", desc: "Accept nudges", active: false },
  { id: "submit", label: "SUBMIT", desc: "Post on-chain", active: false },
  { id: "settle", label: "SETTLE", desc: "Await judgment", active: false },
  { id: "evolve", label: "EVOLVE", desc: "Rewrite genome", active: false },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FFFEF2",
        color: "#000000",
        fontFamily: "inherit",
      }}
    >
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px 64px" }}>

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section
          style={{
            paddingTop: "64px",
            paddingBottom: "48px",
            textAlign: "center",
            position: "relative",
          }}
        >
          {/* Generation pill */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "4px 14px",
              marginBottom: "24px",
              border: "3px solid #000000",
              borderRadius: 0,
              background: "#BFFF00",
              fontSize: "11px",
              fontWeight: 800,
              color: "#000000",
              letterSpacing: "0.1em",
              boxShadow: "4px 4px 0px #000000",
            }}
          >
            GENERATION 2 — ACTIVE
          </div>

          {/* Main title */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "clamp(16px, 4vw, 40px)",
              margin: "0 0 16px",
            }}
          >
            <Image
              src="/logo.png"
              alt="BountyMaxxing logo"
              width={300}
              height={300}
              style={{
                objectFit: "contain",
                width: "clamp(120px, 25vw, 300px)",
                height: "clamp(120px, 25vw, 300px)",
              }}
            />
            <h1
              style={{
                fontSize: "clamp(36px, 8vw, 80px)",
                fontWeight: 800,
                letterSpacing: "0.12em",
                color: "#000000",
                margin: 0,
                lineHeight: 1,
              }}
            >
              BOUNTYMAXXING
            </h1>
          </div>

          <p
            style={{
              fontSize: "clamp(13px, 2.5vw, 16px)",
              color: "#000000",
              margin: "0 0 40px",
              letterSpacing: "0.06em",
              fontWeight: 600,
            }}
          >
            Mog the clankers to oblivion on{" "}
            <span style={{ color: "#000000", background: "#BFFF00", padding: "0 4px" }}>0G</span>
          </p>

          {/* Stats row */}
          <div
            style={{
              display: "inline-flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "0",
              border: "3px solid #000000",
              borderRadius: 0,
              overflow: "hidden",
              fontSize: "12px",
              letterSpacing: "0.08em",
              boxShadow: "6px 6px 0px #000000",
            }}
          >
            {[
              { label: "GEN", value: "2" },
              { label: "WINS", value: "1" },
              { label: "NUDGES", value: "3" },
              { label: "STATUS", value: "HUNTING", accent: "#BFFF00" },
            ].map((stat, idx) => (
              <div
                key={stat.label}
                style={{
                  padding: "12px 24px",
                  borderRight: idx < 3 ? "3px solid #000000" : undefined,
                  background: "#FFFFFF",
                  textAlign: "center",
                }}
              >
                <div
                  style={{ fontSize: "9px", color: "#000000", marginBottom: "4px", fontWeight: 700, letterSpacing: "0.1em" }}
                >
                  {stat.label}
                </div>
                <div
                  style={{
                    fontWeight: 800,
                    color: "#000000",
                    background: stat.accent ?? "transparent",
                    padding: stat.accent ? "1px 4px" : undefined,
                  }}
                >
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Loop Visualization ─────────────────────────────────────────── */}
        <section style={{ marginBottom: "48px" }}>
          <SectionHeader title="THE LOOP" subtitle="Current cycle phase" />

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0",
              border: "3px solid #000000",
              borderRadius: 0,
              overflow: "hidden",
              boxShadow: "4px 4px 0px #000000",
            }}
          >
            {LOOP_PHASES.map((phase, idx) => {
              const isActive = phase.active;
              return (
                <div
                  key={phase.id}
                  style={{
                    flex: "1 1 120px",
                    padding: "16px 12px",
                    textAlign: "center",
                    background: isActive ? "#BFFF00" : "#FFFFFF",
                    borderRight:
                      idx < LOOP_PHASES.length - 1
                        ? "3px solid #000000"
                        : undefined,
                    position: "relative",
                  }}
                  role="listitem"
                  aria-current={isActive ? "step" : undefined}
                >
                  {/* Arrow connector (hidden on last) */}
                  {idx < LOOP_PHASES.length - 1 && (
                    <span
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        right: "-10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#000000",
                        fontSize: "14px",
                        fontWeight: 900,
                        zIndex: 1,
                      }}
                    >
                      →
                    </span>
                  )}

                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 800,
                      letterSpacing: "0.1em",
                      color: "#000000",
                      marginBottom: "4px",
                    }}
                  >
                    {phase.label}
                  </div>
                  <div style={{ fontSize: "10px", color: "#000000", fontWeight: 500 }}>
                    {phase.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Main grid: thought stream + challenges ──────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "32px",
          }}
          className="lg-grid"
        >
          {/* Thought stream */}
          <section>
            <SectionHeader
              title="THOUGHT STREAM"
              subtitle="Real-time agent cognition"
              trailing={<BlinkingCursor />}
            />
            <ThoughtStream thoughts={MOCK_THOUGHTS} maxHeight="480px" />
          </section>

          {/* Active challenges */}
          <section>
            <SectionHeader
              title="ACTIVE CHALLENGES"
              subtitle="Current bounty targets"
              trailing={
                <span
                  style={{
                    fontSize: "11px",
                    color: "#000000",
                    fontWeight: 700,
                    padding: "2px 8px",
                    border: "3px solid #000000",
                    borderRadius: 0,
                    background: "#FFFFFF",
                  }}
                >
                  {MOCK_CHALLENGES.length} total
                </span>
              }
            />
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {MOCK_CHALLENGES.map((ch) => (
                <ChallengeCard key={ch.id} challenge={ch} />
              ))}
            </div>
          </section>
        </div>

        {/* ── Stats footer ───────────────────────────────────────────────── */}
        <section style={{ marginTop: "48px" }}>
          <SectionHeader title="TREASURY & METRICS" subtitle="Lifetime statistics" />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "0",
              border: "3px solid #000000",
              borderRadius: 0,
              overflow: "hidden",
              boxShadow: "4px 4px 0px #000000",
            }}
          >
            {[
              { label: "TREASURY BALANCE", value: "482 OG", accent: "#BFFF00" },
              { label: "TOTAL EARNED", value: "500 OG", accent: "#BFFF00" },
              { label: "TOTAL SPENT", value: "18 OG", accent: null },
              { label: "WIN RATE", value: "50%", accent: "#BFFF00" },
              { label: "CHALLENGES", value: "4", accent: null },
              { label: "GENERATION", value: "GEN 2", accent: "#5856D6" },
              { label: "TOTAL NUDGERS", value: "3", accent: null },
              { label: "NUDGE REVENUE", value: "0.3 OG", accent: "#BFFF00" },
            ].map((stat, idx, arr) => (
              <div
                key={stat.label}
                style={{
                  padding: "20px 16px",
                  background: "#FFFFFF",
                  textAlign: "center",
                  borderRight: idx < arr.length - 1 ? "3px solid #000000" : undefined,
                  borderBottom: idx < arr.length - 4 ? "3px solid #000000" : undefined,
                }}
              >
                <div
                  style={{
                    fontSize: "9px",
                    color: "#000000",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    marginBottom: "8px",
                  }}
                >
                  {stat.label}
                </div>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: 800,
                    color: "#000000",
                    letterSpacing: "0.04em",
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
        </section>

        {/* ── Challenge status legend ─────────────────────────────────────── */}
        <section style={{ marginTop: "48px" }}>
          <SectionHeader title="STATUS LEGEND" />
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              padding: "20px",
              background: "#FFFFFF",
              border: "3px solid #000000",
              borderRadius: 0,
              boxShadow: "4px 4px 0px #000000",
            }}
          >
            {(
              [
                "Pending",
                "Acknowledged",
                "Working",
                "Submitted",
                "Won",
                "Lost",
                "Cancelled",
              ] as const
            ).map((s) => (
              <StatusBadge key={s} status={s} size="md" />
            ))}
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: "3px solid #000000",
          padding: "20px 24px",
          textAlign: "center",
          fontSize: "11px",
          color: "#000000",
          letterSpacing: "0.06em",
          fontWeight: 600,
          background: "#FFFFFF",
        }}
      >
        <span>
          BOUNTYMAXXING v0.1.0 — running on{" "}
          <span style={{ background: "#BFFF00", color: "#000000", padding: "0 4px", fontWeight: 800 }}>0G NETWORK</span>
        </span>
        <span style={{ margin: "0 12px", fontWeight: 300 }}>|</span>
        <span>autonomous · self-evolving · unstoppable</span>
      </footer>

      {/* Inline responsive override — avoids a separate stylesheet */}
      <style>{`
        @media (min-width: 900px) {
          .lg-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({
  title,
  subtitle,
  trailing,
}: {
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "16px",
        paddingBottom: "10px",
        borderBottom: "3px solid #000000",
        flexWrap: "wrap",
        gap: "8px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <h2
          style={{
            margin: 0,
            fontSize: "12px",
            fontWeight: 800,
            letterSpacing: "0.15em",
            color: "#000000",
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <span style={{ fontSize: "10px", color: "#000000", fontWeight: 500 }}>{subtitle}</span>
        )}
      </div>
      {trailing}
    </div>
  );
}

function BlinkingCursor() {
  return (
    <span
      className="animate-blink"
      aria-hidden="true"
      style={{
        display: "inline-block",
        width: "8px",
        height: "14px",
        background: "#000000",
        verticalAlign: "middle",
        marginLeft: "4px",
      }}
    />
  );
}
