/**
 * Maps every ChallengeStatus value to a visual badge.
 *
 * Usage:
 *   <StatusBadge status="Working" />
 *   <StatusBadge status="Won" size="sm" />
 */

export type ChallengeStatus =
  | "Pending"
  | "Acknowledged"
  | "Working"
  | "Submitted"
  | "Won"
  | "Lost"
  | "Cancelled";

interface StatusBadgeProps {
  status: ChallengeStatus;
  size?: "sm" | "md";
}

const STATUS_CONFIG: Record<
  ChallengeStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  Pending: {
    label: "PENDING",
    color: "#888899",
    bg: "rgba(136,136,153,0.08)",
    border: "rgba(136,136,153,0.25)",
  },
  Acknowledged: {
    label: "ACK'D",
    color: "#aaaacc",
    bg: "rgba(170,170,204,0.08)",
    border: "rgba(170,170,204,0.25)",
  },
  Working: {
    label: "WORKING",
    color: "#ffcc00",
    bg: "rgba(255,204,0,0.08)",
    border: "rgba(255,204,0,0.3)",
  },
  Submitted: {
    label: "SUBMITTED",
    color: "#4488ff",
    bg: "rgba(68,136,255,0.08)",
    border: "rgba(68,136,255,0.3)",
  },
  Won: {
    label: "WON",
    color: "#00ff88",
    bg: "rgba(0,255,136,0.08)",
    border: "rgba(0,255,136,0.3)",
  },
  Lost: {
    label: "LOST",
    color: "#ff4444",
    bg: "rgba(255,68,68,0.08)",
    border: "rgba(255,68,68,0.25)",
  },
  Cancelled: {
    label: "CANCELLED",
    color: "#555566",
    bg: "rgba(85,85,102,0.08)",
    border: "rgba(85,85,102,0.2)",
  },
};

export default function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status];
  const padding = size === "sm" ? "2px 7px" : "4px 10px";
  const fontSize = size === "sm" ? "10px" : "12px";

  return (
    <span
      style={{
        display: "inline-block",
        padding,
        fontSize,
        fontFamily: "inherit",
        fontWeight: 600,
        letterSpacing: "0.08em",
        color: cfg.color,
        backgroundColor: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderRadius: "2px",
        lineHeight: 1.4,
        whiteSpace: "nowrap",
      }}
      aria-label={`Status: ${status}`}
    >
      {cfg.label}
    </span>
  );
}
