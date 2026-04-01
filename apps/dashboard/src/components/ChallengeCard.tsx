import StatusBadge, { type ChallengeStatus } from "./StatusBadge";

export interface Challenge {
  id: string;
  title: string;
  status: ChallengeStatus;
  bountyUrl: string;
  /** Prize in OG tokens */
  prize: string;
  /** Fee paid to enter in OG */
  fee: string;
  nudgeCount: number;
  iterations?: number;
  createdAt: string;
  /** Optional brief description */
  description?: string;
}

interface ChallengeCardProps {
  challenge: Challenge;
}

function truncateUrl(url: string, maxLen = 40): string {
  if (url.length <= maxLen) return url;
  const proto = url.startsWith("https://") ? "https://" : "http://";
  const rest = url.slice(proto.length);
  const half = Math.floor((maxLen - proto.length - 3) / 2);
  return `${proto}${rest.slice(0, half)}...${rest.slice(-half)}`;
}

/**
 * Card showing a challenge summary.
 *
 * Usage:
 *   <ChallengeCard challenge={challengeData} />
 */
export default function ChallengeCard({ challenge }: ChallengeCardProps) {
  const {
    title,
    status,
    bountyUrl,
    prize,
    fee,
    iterations,
    createdAt,
    description,
  } = challenge;

  return (
    <article
      className="card-base"
      style={{
        padding: "16px 20px",
      }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <h3
          style={{
            margin: 0,
            fontSize: "13px",
            fontWeight: 700,
            color: "#000000",
            letterSpacing: "0.02em",
            lineHeight: 1.4,
            flex: 1,
          }}
        >
          {title}
        </h3>
        <StatusBadge status={status} />
      </div>

      {/* Description */}
      {description && (
        <p
          style={{
            margin: "8px 0 0",
            fontSize: "11px",
            color: "#000000",
            lineHeight: 1.5,
          }}
        >
          {description}
        </p>
      )}

      {/* URL */}
      <a
        href={bountyUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "block",
          marginTop: "10px",
          fontSize: "10px",
          color: "#5856D6",
          textDecoration: "none",
          wordBreak: "break-all",
          fontWeight: 600,
        }}
        title={bountyUrl}
        aria-label={`View bounty: ${title}`}
      >
        {truncateUrl(bountyUrl)}
      </a>

      {/* Stats row */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          marginTop: "14px",
          paddingTop: "12px",
          borderTop: "3px solid #000000",
        }}
      >
        <Stat label="PRIZE" value={prize} accent="#BFFF00" />
        <Stat label="FEE" value={fee} />
        <Stat
          label="ITERATIONS"
          value={String(iterations ?? 0)}
          accent={(iterations ?? 0) > 0 ? "#5856D6" : undefined}
        />
        <Stat label="OPENED" value={formatDate(createdAt)} />
      </div>
    </article>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      <span
        style={{ fontSize: "9px", color: "#000000", letterSpacing: "0.1em", fontWeight: 700 }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "12px",
          fontWeight: 800,
          color: "#000000",
          background: accent ?? "transparent",
          padding: accent ? "1px 4px" : undefined,
          display: "inline-block",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}
