"use client";

interface CreatureHeartbeatProps {
  /** Label shown next to the pulse dot */
  label?: string;
  /** Size of the core dot in pixels */
  size?: number;
}

/**
 * A solid black square indicator with a status label.
 * Indicates the creature process is alive and running.
 *
 * Usage:
 *   <CreatureHeartbeat label="HUNTING" />
 */
export default function CreatureHeartbeat({
  label = "ALIVE",
  size = 10,
}: CreatureHeartbeatProps) {
  return (
    <span
      className="inline-flex items-center gap-2"
      role="status"
      aria-label={`Creature status: ${label}`}
    >
      {/* Solid square dot */}
      <span
        style={{
          width: size,
          height: size,
          borderRadius: 0,
          backgroundColor: "#000000",
          display: "inline-block",
          flexShrink: 0,
        }}
        aria-hidden="true"
      />

      {label && (
        <span
          className="text-xs tracking-widest uppercase"
          style={{ color: "#000000", fontWeight: 800 }}
        >
          {label}
        </span>
      )}
    </span>
  );
}
