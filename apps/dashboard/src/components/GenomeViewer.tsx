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
          background: "#BFFF00",
          border: "3px solid #000000",
          borderRadius: 0,
          boxShadow: "6px 6px 0px #000000",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
          <span
            style={{
              fontSize: "40px",
              fontWeight: 800,
              color: "#000000",
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            GEN {genome.generation}
          </span>
          <span style={{ fontSize: "12px", color: "#000000", fontWeight: 600 }}>
            / CURRENT
          </span>
        </div>
        <div
          style={{
            fontSize: "10px",
            color: "#000000",
            fontWeight: 700,
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
            color: "#000000",
            fontFamily: "inherit",
            whiteSpace: "pre-wrap",
            lineHeight: 1.6,
            background: "#FFFEF2",
            border: "3px solid #000000",
            borderRadius: 0,
            padding: "16px",
            overflowX: "auto",
            fontWeight: 500,
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
                  color: "#000000",
                  lineHeight: 1.5,
                  paddingLeft: "12px",
                  borderLeft: "3px solid #BFFF00",
                  fontWeight: 500,
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    fontSize: "10px",
                    color: "#000000",
                    paddingTop: "2px",
                    fontVariantNumeric: "tabular-nums",
                    fontWeight: 700,
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
                  style={{ fontSize: "12px", color: "#000000", lineHeight: 1.4, fontWeight: 500 }}
                >
                  <span style={{ background: "#BFFF00", color: "#000000", marginRight: "8px", fontWeight: 800, padding: "0 3px" }}>+</span>
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
                  style={{ fontSize: "12px", color: "#000000", lineHeight: 1.4, fontWeight: 500 }}
                >
                  <span style={{ background: "#FF3B30", color: "#FFFFFF", marginRight: "8px", fontWeight: 800, padding: "0 3px" }}>−</span>
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
                    fontWeight: 800,
                    letterSpacing: "0.1em",
                    color: "#5856D6",
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
                    color: "#000000",
                    lineHeight: 1.55,
                    paddingLeft: "12px",
                    borderLeft: "3px solid #5856D6",
                    fontWeight: 500,
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
        background: "#FFFFFF",
        border: "3px solid #000000",
        borderRadius: 0,
        padding: "20px",
        boxShadow: "4px 4px 0px #000000",
      }}
    >
      <h2
        style={{
          margin: "0 0 16px",
          fontSize: "10px",
          fontWeight: 800,
          letterSpacing: "0.15em",
          color: "#000000",
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
    <p style={{ margin: 0, fontSize: "12px", color: "#000000", fontStyle: "italic", fontWeight: 500 }}>
      {children}
    </p>
  );
}
