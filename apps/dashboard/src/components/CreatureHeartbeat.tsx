"use client";

interface CreatureHeartbeatProps {
  /** Label shown next to the pulse dot */
  label?: string;
  /** Size of the core dot in pixels */
  size?: number;
}

/**
 * A pulsing green dot with expanding ring animations.
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
      {/* Dot + rings container */}
      <span
        className="relative inline-flex items-center justify-center"
        style={{ width: size * 3, height: size * 3 }}
      >
        {/* Outer expanding ring */}
        <span
          className="absolute rounded-full"
          style={{
            width: size,
            height: size,
            backgroundColor: "transparent",
            border: "1px solid #00ff88",
            animation: "pulse-ring 2s cubic-bezier(0.2, 0.8, 0.4, 1) infinite",
          }}
        />
        {/* Middle expanding ring — offset phase */}
        <span
          className="absolute rounded-full"
          style={{
            width: size,
            height: size,
            backgroundColor: "transparent",
            border: "1px solid #00cc6a",
            animation:
              "pulse-ring 2s cubic-bezier(0.2, 0.8, 0.4, 1) 0.6s infinite",
          }}
        />
        {/* Core dot */}
        <span
          className="relative rounded-full"
          style={{
            width: size,
            height: size,
            backgroundColor: "#00ff88",
            animation: "pulse-glow 2.5s ease-in-out infinite",
          }}
        />
      </span>

      {label && (
        <span
          className="text-xs tracking-widest uppercase"
          style={{ color: "#00ff88" }}
        >
          {label}
        </span>
      )}
    </span>
  );
}
