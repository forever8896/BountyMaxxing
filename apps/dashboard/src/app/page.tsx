import Image from "next/image";
import LiveThoughtStream from "@/components/LiveThoughtStream";
import ChallengeCard, { type Challenge } from "@/components/ChallengeCard";
import StatusBadge from "@/components/StatusBadge";
import type { ChallengeStatus } from "@/components/StatusBadge";

// ── Types ──────────────────────────────────────────────────────────────────────

interface KeeperHealth {
  status: string;
  generation: number;
  activeHunts: number;
  clanconomyAgent: string;
}

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

async function getHealth(): Promise<KeeperHealth | null> {
  try {
    const res = await fetch("http://localhost:3001/health", {
      next: { revalidate: 10 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getChallenges(): Promise<Challenge[]> {
  try {
    const res = await fetch("http://localhost:3001/challenges", {
      next: { revalidate: 10 },
    });
    if (!res.ok) return [];
    const data: KeeperChallenge[] = await res.json();
    return data.map(normalizeChallenge);
  } catch {
    return [];
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

// ── Constants ──────────────────────────────────────────────────────────────────

const LOOP_PHASES = [
  { id: "hunt", label: "HUNT", desc: "Find bounties", active: true },
  { id: "draft", label: "DRAFT", desc: "Generate solution", active: false },
  { id: "workshop", label: "WORKSHOP", desc: "Accept nudges", active: false },
  { id: "submit", label: "SUBMIT", desc: "Post on-chain", active: false },
  { id: "settle", label: "SETTLE", desc: "Await judgment", active: false },
  { id: "evolve", label: "EVOLVE", desc: "Rewrite genome", active: false },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const [health, challenges] = await Promise.all([getHealth(), getChallenges()]);

  const generation = health?.generation ?? "—";
  const activeHunts = health?.activeHunts ?? 0;
  const won = challenges.filter((c) => c.status === "Won").length;
  const totalNudges = challenges.reduce((sum, c) => sum + (c.nudgeCount ?? 0), 0);
  const keeperStatus = health ? "HUNTING" : "OFFLINE";

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
            {health ? `GENERATION ${generation} — ACTIVE` : "KEEPER OFFLINE"}
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
              { label: "GEN", value: String(generation) },
              { label: "WINS", value: String(won) },
              { label: "NUDGES", value: String(totalNudges) },
              { label: "STATUS", value: keeperStatus, accent: health ? "#BFFF00" : undefined },
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
            <LiveThoughtStream
              sseUrl="http://localhost:3001/thoughts"
              maxHeight="480px"
            />
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
                  {challenges.length} total
                </span>
              }
            />
            {challenges.length === 0 ? (
              <div
                style={{
                  padding: "32px 24px",
                  textAlign: "center",
                  border: "3px solid #000000",
                  borderRadius: 0,
                  background: "#FFFFFF",
                  boxShadow: "4px 4px 0px #000000",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#000000",
                }}
              >
                {health ? "No active challenges." : "Keeper offline — no data available."}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {challenges.map((ch) => (
                  <ChallengeCard key={ch.id} challenge={ch} />
                ))}
              </div>
            )}
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
              { label: "ACTIVE HUNTS", value: health ? String(activeHunts) : "—", accent: null },
              { label: "CHALLENGES", value: health ? String(challenges.length) : "—", accent: null },
              { label: "WON", value: health ? String(won) : "—", accent: won > 0 ? "#BFFF00" : null },
              { label: "TOTAL NUDGES", value: health ? String(totalNudges) : "—", accent: null },
              { label: "GENERATION", value: health ? `GEN ${generation}` : "—", accent: health ? "#5856D6" : null },
              { label: "STATUS", value: keeperStatus, accent: health ? "#BFFF00" : null },
            ].map((stat, idx, arr) => (
              <div
                key={stat.label}
                style={{
                  padding: "20px 16px",
                  background: "#FFFFFF",
                  textAlign: "center",
                  borderRight: idx < arr.length - 1 ? "3px solid #000000" : undefined,
                  borderBottom: idx < arr.length - 3 ? "3px solid #000000" : undefined,
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
