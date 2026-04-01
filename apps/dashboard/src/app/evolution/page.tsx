import Link from "next/link";
import GenomeViewer, { type Genome } from "@/components/GenomeViewer";

// ── Data fetching ──────────────────────────────────────────────────────────────

const KEEPER_BASE = process.env.KEEPER_URL || "http://localhost:3001";

async function getGenome(): Promise<Genome | null> {
  try {
    const res = await fetch(`${KEEPER_BASE}/genome`, {
      next: { revalidate: 15 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch {
    return null;
  }
}

// ── Page ───────────────────────────────────────────────────────────────────────

export const metadata = { title: "Evolution | BountyMaxxing" };

export default async function EvolutionPage() {
  const genome = await getGenome();

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
            {" / "}EVOLUTION
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
            EVOLUTION
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#000000", fontWeight: 500 }}>
            BountyMaxxing&apos;s current genome — its accumulated intelligence.
          </p>
        </div>

        {genome ? (
          <GenomeViewer genome={genome} />
        ) : (
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
              Genome unavailable. Keeper may be offline.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

