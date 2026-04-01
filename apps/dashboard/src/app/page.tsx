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
        background: "#0a0a0f",
        color: "#e8e8f0",
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
          {/* Background glow blob */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "40px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "600px",
              height: "300px",
              background:
                "radial-gradient(ellipse at center, rgba(0,255,136,0.06) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          {/* Generation pill */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "4px 14px",
              marginBottom: "24px",
              border: "1px solid rgba(0,255,136,0.2)",
              borderRadius: "2px",
              background: "rgba(0,255,136,0.04)",
              fontSize: "11px",
              color: "#00cc6a",
              letterSpacing: "0.1em",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#00ff88",
                display: "inline-block",
                animation: "pulse-glow 2.5s ease-in-out infinite",
              }}
            />
            GENERATION 2 — ACTIVE
          </div>

          {/* Main title */}
          <h1
            className="glow-text"
            style={{
              fontSize: "clamp(36px, 8vw, 80px)",
              fontWeight: 800,
              letterSpacing: "0.12em",
              color: "#00ff88",
              margin: "0 0 16px",
              lineHeight: 1,
            }}
          >
            THE CREATURE
          </h1>

          <p
            style={{
              fontSize: "clamp(13px, 2.5vw, 16px)",
              color: "#888899",
              margin: "0 0 40px",
              letterSpacing: "0.06em",
            }}
          >
            Self-evolving autonomous bounty solver on{" "}
            <span style={{ color: "#00ff88" }}>0G</span>
          </p>

          {/* Stats row */}
          <div
            style={{
              display: "inline-flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "0",
              border: "1px solid #1a1a2e",
              borderRadius: "4px",
              overflow: "hidden",
              fontSize: "12px",
              letterSpacing: "0.08em",
            }}
          >
            {[
              { label: "GEN", value: "2" },
              { label: "WINS", value: "1" },
              { label: "NUDGES", value: "3" },
              { label: "STATUS", value: "HUNTING", accent: "#00ff88" },
            ].map((stat, idx) => (
              <div
                key={stat.label}
                style={{
                  padding: "12px 24px",
                  borderRight: idx < 3 ? "1px solid #1a1a2e" : undefined,
                  background: "#12121a",
                  textAlign: "center",
                }}
              >
                <div
                  style={{ fontSize: "9px", color: "#555566", marginBottom: "4px" }}
                >
                  {stat.label}
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    color: stat.accent ?? "#e8e8f0",
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
              border: "1px solid #1a1a2e",
              borderRadius: "4px",
              overflow: "hidden",
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
                    background: isActive ? "rgba(0,255,136,0.06)" : "#12121a",
                    borderRight:
                      idx < LOOP_PHASES.length - 1
                        ? "1px solid #1a1a2e"
                        : undefined,
                    borderBottom: isActive
                      ? "2px solid #00ff88"
                      : "2px solid transparent",
                    position: "relative",
                    transition: "background 0.2s",
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
                        right: "-8px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#333344",
                        fontSize: "12px",
                        zIndex: 1,
                      }}
                    >
                      ›
                    </span>
                  )}

                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      color: isActive ? "#00ff88" : "#555566",
                      marginBottom: "4px",
                    }}
                  >
                    {isActive && (
                      <span
                        style={{
                          display: "inline-block",
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: "#00ff88",
                          marginRight: "6px",
                          verticalAlign: "middle",
                          animation: "pulse-glow 2s ease-in-out infinite",
                        }}
                        aria-hidden="true"
                      />
                    )}
                    {phase.label}
                  </div>
                  <div style={{ fontSize: "10px", color: "#444455" }}>
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
              subtitle="Real-time creature cognition"
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
                    color: "#888899",
                    padding: "2px 8px",
                    border: "1px solid #1a1a2e",
                    borderRadius: "2px",
                  }}
                >
                  {MOCK_CHALLENGES.length} total
                </span>
              }
            />
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
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
              gap: "1px",
              background: "#1a1a2e",
              border: "1px solid #1a1a2e",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            {[
              { label: "TREASURY BALANCE", value: "482 OG", accent: "#00ff88" },
              { label: "TOTAL EARNED", value: "500 OG", accent: "#00cc6a" },
              { label: "TOTAL SPENT", value: "18 OG" },
              { label: "WIN RATE", value: "50%", accent: "#ffcc00" },
              { label: "CHALLENGES", value: "4" },
              { label: "GENERATION", value: "GEN 2", accent: "#bb66ff" },
              { label: "TOTAL NUDGERS", value: "3" },
              { label: "NUDGE REVENUE", value: "0.3 OG", accent: "#00ff88" },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  padding: "20px 16px",
                  background: "#12121a",
                  textAlign: "center",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background =
                    "#161620";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background =
                    "#12121a";
                }}
              >
                <div
                  style={{
                    fontSize: "9px",
                    color: "#555566",
                    letterSpacing: "0.1em",
                    marginBottom: "8px",
                  }}
                >
                  {stat.label}
                </div>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    color: stat.accent ?? "#888899",
                    letterSpacing: "0.04em",
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
              background: "#12121a",
              border: "1px solid #1a1a2e",
              borderRadius: "4px",
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
          borderTop: "1px solid #1a1a2e",
          padding: "20px 24px",
          textAlign: "center",
          fontSize: "11px",
          color: "#444455",
          letterSpacing: "0.06em",
        }}
      >
        <span>
          THE CREATURE v0.1.0 — running on{" "}
          <span style={{ color: "#00ff88" }}>0G NETWORK</span>
        </span>
        <span style={{ margin: "0 12px", opacity: 0.3 }}>|</span>
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
        borderBottom: "1px solid #1a1a2e",
        flexWrap: "wrap",
        gap: "8px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <h2
          style={{
            margin: 0,
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.15em",
            color: "#e8e8f0",
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <span style={{ fontSize: "10px", color: "#444455" }}>{subtitle}</span>
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
        background: "#00ff88",
        verticalAlign: "middle",
        marginLeft: "4px",
        opacity: 0.8,
      }}
    />
  );
}
