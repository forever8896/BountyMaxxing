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
  { label: string; color: string; bg: string; border: string; textDecoration?: string }
> = {
  Pending: {
    label: "PENDING",
    color: "#000000",
    bg: "#FFFFFF",
    border: "#000000",
  },
  Acknowledged: {
    label: "ACK'D",
    color: "#000000",
    bg: "#FFFFFF",
    border: "#000000",
  },
  Working: {
    label: "WORKING",
    color: "#FFFFFF",
    bg: "#5856D6",
    border: "#000000",
  },
  Submitted: {
    label: "SUBMITTED",
    color: "#FFFFFF",
    bg: "#5856D6",
    border: "#000000",
  },
  Won: {
    label: "WON",
    color: "#000000",
    bg: "#BFFF00",
    border: "#000000",
  },
  Lost: {
    label: "LOST",
    color: "#FFFFFF",
    bg: "#FF3B30",
    border: "#000000",
  },
  Cancelled: {
    label: "CANCELLED",
    color: "#000000",
    bg: "#FFFFFF",
    border: "#000000",
    textDecoration: "line-through",
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
        fontWeight: 800,
        letterSpacing: "0.08em",
        color: cfg.color,
        backgroundColor: cfg.bg,
        border: `3px solid ${cfg.border}`,
        borderRadius: 0,
        lineHeight: 1.4,
        whiteSpace: "nowrap",
        textDecoration: cfg.textDecoration,
      }}
      aria-label={`Status: ${status}`}
    >
      {cfg.label}
    </span>
  );
}
