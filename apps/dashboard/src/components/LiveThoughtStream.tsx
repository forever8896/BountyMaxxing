"use client";

/**
 * LiveThoughtStream — client component that connects to an SSE endpoint
 * and renders thoughts in a scrolling terminal feed.
 *
 * Automatically reconnects on disconnect (exponential backoff, max 30s).
 * When SSE is offline, shows "Waiting for keeper..." with no fake messages.
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
  const [offline, setOffline] = useState(false);

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
      setOffline(true);
      return;
    }

    esRef.current = es;

    es.onopen = () => {
      if (!mountedRef.current) return;
      setConnected(true);
      setOffline(false);
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
      setOffline(true);

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
          borderTop: offline ? "3px solid #FF3B30" : "3px solid #000000",
        }}
        role="log"
        aria-label="Live agent thought stream"
        aria-live="polite"
        aria-relevant="additions"
      >
        {/* Offline banner */}
        {offline && (
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
            Keeper offline — reconnecting...
          </div>
        )}

        {thoughts.length === 0 && (
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
            Waiting for keeper...
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
