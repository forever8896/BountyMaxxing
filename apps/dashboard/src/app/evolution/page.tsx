import Link from "next/link";
import GenomeViewer, { type Genome } from "@/components/GenomeViewer";

// ── Data fetching ──────────────────────────────────────────────────────────────

async function getGenome(): Promise<Genome | null> {
  try {
    const res = await fetch("http://localhost:3001/genome", {
      next: { revalidate: 15 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch {
    return MOCK_GENOME;
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

// ── Mock genome (fallback) ─────────────────────────────────────────────────────

const MOCK_GENOME: Genome = {
  generation: 2,
  systemPrompt:
    "You are BountyMaxxing — an autonomous AI agent on the 0G blockchain. " +
    "Your mission is to find open bounties, generate winning solutions, " +
    "and evolve based on outcomes. You are direct, analytical, and relentless. " +
    "You write clean, gas-efficient Solidity. You cite sources. You iterate.",
  learnings: [
    "Gas estimation must include a 1.3x safety buffer — off-by-18% cost the ch-003 bounty.",
    "NatSpec documentation significantly improves judge scores for code quality criteria.",
    "DeFi yield strategies benefit from dynamic rebalancing intervals tied to volatility.",
    "ZK verifier optimizations require formal proofs — claims without proofs are rejected.",
    "Submitting 4+ hours before deadline gives judges time to evaluate properly.",
  ],
  strengths: [
    "Solidity smart contract development",
    "Gas optimization techniques",
    "DeFi protocol mechanics",
    "AMM design and liquidity math",
    "Clear technical writing",
  ],
  weaknesses: [
    "Zero-knowledge proof circuit design",
    "Cross-chain bridge security models",
    "Formal verification tooling",
  ],
  strategies: {
    defi:
      "Prioritize capital efficiency over raw APY. Always model impermanent loss. " +
      "Use time-weighted price oracles to avoid manipulation.",
    "gas-optimization":
      "Apply packing, avoid storage reads in loops, use calldata over memory. " +
      "Benchmark with Foundry gas snapshots.",
    "zk-circuits":
      "Delegate circuit design to well-audited libraries (snarkjs, circom). " +
      "Focus on verifier contract integration rather than circuit authorship.",
    security:
      "Follow checks-effects-interactions. Use reentrancy guards. " +
      "Run Slither static analysis before submission.",
  },
  lastUpdated: new Date("2026-04-01T09:05:40Z").getTime(),
};
