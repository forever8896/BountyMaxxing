/**
 * GenomeViewer — displays The Creature's current genome in a structured layout.
 *
 * Server component (no "use client" needed — purely presentational).
 *
 * Usage:
 *   <GenomeViewer genome={genomeData} />
 */

export interface Genome {
  generation: number;
  systemPrompt: string;
  learnings: string[];
  strengths: string[];
  weaknesses: string[];
  strategies: Record<string, string>;
  lastUpdated: number;
}

interface GenomeViewerProps {
  genome: Genome;
}

export default function GenomeViewer({ genome }: GenomeViewerProps) {
  const lastUpdated = new Date(genome.lastUpdated).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: "20px" }}
      aria-label={`Genome generation ${genome.generation}`}
    >
      {/* Generation header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          padding: "24px",
          background: "rgba(0,255,136,0.03)",
          border: "1px solid rgba(0,255,136,0.15)",
          borderRadius: "4px",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
          <span
            style={{
              fontSize: "40px",
              fontWeight: 800,
              color: "#00ff88",
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
            className="glow-text"
          >
            GEN {genome.generation}
          </span>
          <span style={{ fontSize: "12px", color: "#555566" }}>
            / CURRENT
          </span>
        </div>
        <div
          style={{
            fontSize: "10px",
            color: "#555566",
            letterSpacing: "0.08em",
          }}
        >
          LAST UPDATED: {lastUpdated}
        </div>
      </div>

      {/* System prompt */}
      <Panel label="SYSTEM PROMPT">
        <pre
          style={{
            margin: 0,
            fontSize: "12px",
            color: "#c8c8d8",
            fontFamily: "inherit",
            whiteSpace: "pre-wrap",
            lineHeight: 1.6,
            background: "#0d0d14",
            border: "1px solid #1a1a2e",
            borderRadius: "2px",
            padding: "16px",
            overflowX: "auto",
          }}
        >
          {genome.systemPrompt}
        </pre>
      </Panel>

      {/* Learnings */}
      {genome.learnings.length > 0 && (
        <Panel label={`LEARNINGS (${genome.learnings.length})`}>
          <ul
            style={{
              margin: 0,
              padding: 0,
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {genome.learnings.map((learning, idx) => (
              <li
                key={idx}
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                  fontSize: "12px",
                  color: "#c8c8d8",
                  lineHeight: 1.5,
                  paddingLeft: "12px",
                  borderLeft: "2px solid rgba(0,255,136,0.3)",
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    fontSize: "10px",
                    color: "#444455",
                    paddingTop: "2px",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {String(idx + 1).padStart(2, "0")}
                </span>
                {learning}
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {/* Strengths & Weaknesses */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
        }}
        className="sw-grid"
      >
        <Panel label="STRENGTHS">
          {genome.strengths.length === 0 ? (
            <EmptyNote>None identified yet.</EmptyNote>
          ) : (
            <ul
              style={{
                margin: 0,
                padding: 0,
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              {genome.strengths.map((s, i) => (
                <li
                  key={i}
                  style={{ fontSize: "12px", color: "#c8c8d8", lineHeight: 1.4 }}
                >
                  <span style={{ color: "#00ff88", marginRight: "8px" }}>+</span>
                  {s}
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel label="WEAKNESSES">
          {genome.weaknesses.length === 0 ? (
            <EmptyNote>None identified yet.</EmptyNote>
          ) : (
            <ul
              style={{
                margin: 0,
                padding: 0,
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              {genome.weaknesses.map((w, i) => (
                <li
                  key={i}
                  style={{ fontSize: "12px", color: "#c8c8d8", lineHeight: 1.4 }}
                >
                  <span style={{ color: "#ff4444", marginRight: "8px" }}>−</span>
                  {w}
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* Domain strategies */}
      {Object.keys(genome.strategies).length > 0 && (
        <Panel label="DOMAIN STRATEGIES">
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {Object.entries(genome.strategies).map(([domain, strategy]) => (
              <div key={domain}>
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    color: "#4488ff",
                    marginBottom: "4px",
                    textTransform: "uppercase",
                  }}
                >
                  {domain}
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "12px",
                    color: "#888899",
                    lineHeight: 1.55,
                    paddingLeft: "12px",
                    borderLeft: "1px solid #222238",
                  }}
                >
                  {strategy}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      )}

      <style>{`
        @media (max-width: 600px) {
          .sw-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Panel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        background: "#12121a",
        border: "1px solid #1a1a2e",
        borderRadius: "4px",
        padding: "20px",
      }}
    >
      <h2
        style={{
          margin: "0 0 16px",
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.15em",
          color: "#555566",
        }}
      >
        {label}
      </h2>
      {children}
    </section>
  );
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ margin: 0, fontSize: "12px", color: "#444455", fontStyle: "italic" }}>
      {children}
    </p>
  );
}
