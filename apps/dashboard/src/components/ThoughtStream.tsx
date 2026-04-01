"use client";

import { useEffect, useRef } from "react";

export type ThoughtType = "HUNT" | "DRAFT" | "EVOLVE" | "NUDGE" | "SETTLE" | "ERROR";

export interface Thought {
  id: string;
  timestamp: string;
  type: ThoughtType;
  content: string;
}

interface ThoughtStreamProps {
  thoughts: Thought[];
  /** Max height of the scrollable area */
  maxHeight?: string;
}

const TYPE_CONFIG: Record<
  ThoughtType,
  { color: string; bg: string; border: string }
> = {
  HUNT: {
    color: "#000000",
    bg: "#BFFF00",
    border: "#000000",
  },
  DRAFT: {
    color: "#FFFFFF",
    bg: "#5856D6",
    border: "#000000",
  },
  EVOLVE: {
    color: "#FFFFFF",
    bg: "#5856D6",
    border: "#000000",
  },
  NUDGE: {
    color: "#000000",
    bg: "#BFFF00",
    border: "#000000",
  },
  SETTLE: {
    color: "#FFFFFF",
    bg: "#5856D6",
    border: "#000000",
  },
  ERROR: {
    color: "#FFFFFF",
    bg: "#FF3B30",
    border: "#000000",
  },
};

/**
 * Terminal-style thought stream component.
 * Auto-scrolls to the bottom when new thoughts arrive.
 *
 * Usage:
 *   <ThoughtStream thoughts={MOCK_THOUGHTS} maxHeight="420px" />
 */
export default function ThoughtStream({
  thoughts,
  maxHeight = "420px",
}: ThoughtStreamProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thoughts]);

  return (
    <div
      className="terminal-panel"
      style={{ overflowY: "auto", maxHeight }}
      role="log"
      aria-label="Agent thought stream"
      aria-live="polite"
    >
      {thoughts.length === 0 && (
        <div
          style={{
            padding: "20px",
            textAlign: "center",
            color: "#000000",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          Waiting for agent activity...
        </div>
      )}

      {thoughts.map((thought, idx) => (
        <ThoughtEntry
          key={thought.id}
          thought={thought}
          isLast={idx === thoughts.length - 1}
        />
      ))}

      <div ref={bottomRef} />
    </div>
  );
}

function ThoughtEntry({
  thought,
  isLast,
}: {
  thought: Thought;
  isLast: boolean;
}) {
  const cfg = TYPE_CONFIG[thought.type];

  return (
    <div
      className={isLast ? "animate-stream-in" : undefined}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        padding: "8px 14px",
        borderBottom: "3px solid #000000",
      }}
    >
      {/* Timestamp */}
      <span
        style={{
          fontSize: "10px",
          color: "#000000",
          whiteSpace: "nowrap",
          paddingTop: "1px",
          minWidth: "80px",
          fontVariantNumeric: "tabular-nums",
          fontWeight: 600,
        }}
      >
        {formatTimestamp(thought.timestamp)}
      </span>

      {/* Type badge */}
      <span
        style={{
          display: "inline-block",
          flexShrink: 0,
          padding: "1px 6px",
          fontSize: "10px",
          fontWeight: 800,
          letterSpacing: "0.08em",
          color: cfg.color,
          backgroundColor: cfg.bg,
          border: `2px solid ${cfg.border}`,
          borderRadius: 0,
          lineHeight: 1.6,
        }}
      >
        {thought.type}
      </span>

      {/* Content */}
      <span
        style={{
          fontSize: "12px",
          color: "#000000",
          lineHeight: 1.5,
          flex: 1,
          fontWeight: 500,
        }}
      >
        {thought.content}
      </span>
    </div>
  );
}

function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  } catch {
    return iso;
  }
}

// ── Mock data ────────────────────────────────────────────────────────────────

const BASE_TS = new Date("2026-04-01T09:00:00Z");
function ts(offsetSeconds: number) {
  return new Date(BASE_TS.getTime() + offsetSeconds * 1000).toISOString();
}

export const MOCK_THOUGHTS: Thought[] = [
  {
    id: "t-001",
    timestamp: ts(0),
    type: "HUNT",
    content: "Scanning bounty platforms for new challenges on 0G network...",
  },
  {
    id: "t-002",
    timestamp: ts(12),
    type: "HUNT",
    content:
      "Found 3 open bounties: DeFi yield optimizer, NFT bridge gas reducer, ZK proof verifier.",
  },
  {
    id: "t-003",
    timestamp: ts(28),
    type: "HUNT",
    content:
      "Evaluating genome fitness for each challenge. Highest match: DeFi yield optimizer (0.87 score).",
  },
  {
    id: "t-004",
    timestamp: ts(45),
    type: "DRAFT",
    content:
      "Generating v0 submission for DeFi yield optimizer bounty — compounding strategy with dynamic rebalancing.",
  },
  {
    id: "t-005",
    timestamp: ts(112),
    type: "DRAFT",
    content:
      "Draft complete. Running internal simulation: projected 14.2% APY improvement over baseline.",
  },
  {
    id: "t-006",
    timestamp: ts(140),
    type: "NUDGE",
    content:
      "Evaluating nudge from 0x1a2b...3c4d — suggestion: improve code quality & add NatSpec comments.",
  },
  {
    id: "t-007",
    timestamp: ts(155),
    type: "NUDGE",
    content:
      "Nudge accepted. Rewrote submission with improved documentation. Stored improvement delta in genome.",
  },
  {
    id: "t-008",
    timestamp: ts(203),
    type: "DRAFT",
    content:
      "Submitting final draft for DeFi yield optimizer — IPFS hash bafybeig...9xka pinned to 0G storage.",
  },
  {
    id: "t-009",
    timestamp: ts(250),
    type: "SETTLE",
    content:
      "Settlement window open for challenge #4 (NFT bridge gas reducer). Awaiting judge evaluation.",
  },
  {
    id: "t-010",
    timestamp: ts(310),
    type: "EVOLVE",
    content:
      "Challenge #3 result: LOST. Analyzing failure vectors — gas estimation was off by 18%. Updating genome strategy weights.",
  },
  {
    id: "t-011",
    timestamp: ts(340),
    type: "EVOLVE",
    content:
      "Genome update committed. Generation 1 → 2. Mutation: increased gas_buffer_multiplier from 1.1 to 1.3.",
  },
  {
    id: "t-012",
    timestamp: ts(380),
    type: "HUNT",
    content:
      "Gen 2 cycle begins. Re-scanning with updated genome. Three new challenges detected...",
  },
];
