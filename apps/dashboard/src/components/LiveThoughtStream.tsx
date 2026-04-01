"use client";

/**
 * LiveThoughtStream — client component that connects to an SSE endpoint
 * and renders thoughts in a scrolling terminal feed.
 *
 * Automatically reconnects on disconnect (exponential backoff, max 30s).
 * Falls back to mock data when SSE is unreachable.
 *
 * Usage:
 *   <LiveThoughtStream sseUrl="http://localhost:3001/thoughts" />
 *   <LiveThoughtStream sseUrl="..." filterChallengeId="ch-001" maxHeight="400px" />
 */

import { useEffect, useRef, useState, useCallback } from "react";
import type { Thought, ThoughtType } from "./ThoughtStream";

// Re-export types for convenience
export type { Thought, ThoughtType };

interface LiveThoughtStreamProps {
  /** SSE endpoint URL */
  sseUrl: string;
  /** If set, only show thoughts whose content or id references this challenge */
  filterChallengeId?: string;
  /** Max CSS height of the scrollable panel */
  maxHeight?: string;
}

const TYPE_CONFIG: Record<
  ThoughtType,
  { color: string; bg: string; border: string }
> = {
  HUNT:   { color: "#000000", bg: "#BFFF00",  border: "#000000" },
  DRAFT:  { color: "#FFFFFF", bg: "#5856D6",  border: "#000000" },
  EVOLVE: { color: "#FFFFFF", bg: "#5856D6",  border: "#000000" },
  NUDGE:  { color: "#000000", bg: "#BFFF00",  border: "#000000" },
  SETTLE: { color: "#000000", bg: "#FFFFFF",  border: "#000000" },
  ERROR:  { color: "#FFFFFF", bg: "#FF3B30",  border: "#000000" },
};

const MAX_DISPLAYED = 120;
const RECONNECT_BASE_MS = 1500;
const RECONNECT_MAX_MS = 30_000;

export default function LiveThoughtStream({
  sseUrl,
  filterChallengeId,
  maxHeight = "420px",
}: LiveThoughtStreamProps) {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const esRef = useRef<EventSource | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryDelay = useRef(RECONNECT_BASE_MS);
  const mountedRef = useRef(true);

  // Auto-scroll to bottom when thoughts change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thoughts]);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;

    // Close any existing connection
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }

    let es: EventSource;
    try {
      es = new EventSource(sseUrl);
    } catch {
      setError("SSE not supported");
      return;
    }

    esRef.current = es;

    es.onopen = () => {
      if (!mountedRef.current) return;
      setConnected(true);
      setError(null);
      retryDelay.current = RECONNECT_BASE_MS;
    };

    es.onmessage = (evt) => {
      if (!mountedRef.current) return;
      try {
        const thought = JSON.parse(evt.data) as Thought;
        // Apply filter if set
        if (
          filterChallengeId &&
          !thought.content.includes(filterChallengeId) &&
          thought.id !== filterChallengeId
        ) {
          return;
        }
        setThoughts((prev) => {
          const next = [...prev, thought];
          return next.length > MAX_DISPLAYED
            ? next.slice(next.length - MAX_DISPLAYED)
            : next;
        });
      } catch {
        // Ignore malformed messages
      }
    };

    es.onerror = () => {
      if (!mountedRef.current) return;
      es.close();
      esRef.current = null;
      setConnected(false);

      // Show mock data and schedule reconnect
      setThoughts(MOCK_FALLBACK);
      setError(`Keeper offline — showing cached data. Retrying in ${Math.round(retryDelay.current / 1000)}s…`);

      retryRef.current = setTimeout(() => {
        retryDelay.current = Math.min(retryDelay.current * 2, RECONNECT_MAX_MS);
        connect();
      }, retryDelay.current);
    };
  }, [sseUrl, filterChallengeId]);

  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      esRef.current?.close();
      if (retryRef.current) clearTimeout(retryRef.current);
    };
  }, [connect]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
      {/* Status bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 14px",
          background: "#FFFFFF",
          border: "3px solid #000000",
          borderBottom: "none",
          borderRadius: 0,
          fontSize: "10px",
          fontWeight: 700,
        }}
      >
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: 0,
            background: connected ? "#BFFF00" : "#000000",
            border: "2px solid #000000",
            flexShrink: 0,
          }}
          aria-hidden="true"
        />
        <span style={{ color: "#000000", fontWeight: 800 }}>
          {connected ? "LIVE" : "OFFLINE"}
        </span>
        {filterChallengeId && (
          <span style={{ color: "#000000", marginLeft: "6px", fontWeight: 600 }}>
            / CHALLENGE {filterChallengeId}
          </span>
        )}
        <span
          style={{
            marginLeft: "auto",
            color: "#000000",
            fontVariantNumeric: "tabular-nums",
            fontWeight: 600,
          }}
        >
          {thoughts.length} entries
        </span>
      </div>

      {/* Feed */}
      <div
        className="terminal-panel"
        style={{
          overflowY: "auto",
          maxHeight,
          borderRadius: 0,
          border: "3px solid #000000",
          borderTop: error ? "3px solid #FF3B30" : "3px solid #000000",
        }}
        role="log"
        aria-label="Live agent thought stream"
        aria-live="polite"
        aria-relevant="additions"
      >
        {/* Error / offline banner */}
        {error && (
          <div
            style={{
              padding: "8px 14px",
              fontSize: "10px",
              color: "#FFFFFF",
              fontWeight: 700,
              background: "#FF3B30",
              border: "none",
              borderBottom: "3px solid #000000",
            }}
          >
            {error}
          </div>
        )}

        {thoughts.length === 0 && !error && (
          <div
            style={{
              padding: "24px",
              textAlign: "center",
              color: "#000000",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            <span className="animate-blink" aria-hidden="true" style={{ background: "#000000", color: "#000000", display: "inline-block", width: "8px", height: "14px", verticalAlign: "middle" }}>█</span>{" "}
            Waiting for agent activity...
          </div>
        )}

        {thoughts.map((thought, idx) => (
          <ThoughtRow
            key={thought.id + idx}
            thought={thought}
            isNew={idx === thoughts.length - 1}
          />
        ))}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}

// ── ThoughtRow ─────────────────────────────────────────────────────────────────

function ThoughtRow({
  thought,
  isNew,
}: {
  thought: Thought;
  isNew: boolean;
}) {
  const cfg = TYPE_CONFIG[thought.type] ?? TYPE_CONFIG.ERROR;

  return (
    <div
      className={isNew ? "animate-stream-in" : undefined}
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
          minWidth: "76px",
          fontVariantNumeric: "tabular-nums",
          flexShrink: 0,
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
          whiteSpace: "nowrap",
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
          wordBreak: "break-word",
          fontWeight: 500,
        }}
      >
        {thought.content}
      </span>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────

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

// ── Mock fallback (shown when SSE is unreachable) ──────────────────────────────

const BASE = new Date("2026-04-01T09:00:00Z");
const t = (s: number) => new Date(BASE.getTime() + s * 1000).toISOString();

const MOCK_FALLBACK: Thought[] = [
  { id: "f-01", timestamp: t(0),   type: "HUNT",   content: "Scanning bounty platforms for new challenges on 0G network..." },
  { id: "f-02", timestamp: t(15),  type: "HUNT",   content: "Found 3 open bounties. Evaluating genome fitness for each..." },
  { id: "f-03", timestamp: t(45),  type: "DRAFT",  content: "Generating v0 submission for DeFi yield optimizer bounty." },
  { id: "f-04", timestamp: t(110), type: "DRAFT",  content: "Draft complete. Projected 14.2% APY improvement over baseline." },
  { id: "f-05", timestamp: t(140), type: "NUDGE",  content: "Nudge received — improving code quality and NatSpec comments." },
  { id: "f-06", timestamp: t(200), type: "SETTLE", content: "Settlement window open for NFT bridge challenge. Awaiting judgment." },
  { id: "f-07", timestamp: t(310), type: "EVOLVE", content: "Challenge LOST. Gas estimation off by 18%. Updating genome weights." },
  { id: "f-08", timestamp: t(345), type: "EVOLVE", content: "Generation 1 → 2. Mutation: gas_buffer_multiplier 1.1 → 1.3." },
  { id: "f-09", timestamp: t(380), type: "HUNT",   content: "Gen 2 cycle begins. Re-scanning with updated genome..." },
];
