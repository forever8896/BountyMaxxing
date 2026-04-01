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
 *   <ThoughtStream thoughts={thoughts} maxHeight="420px" />
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
          Waiting for keeper...
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
