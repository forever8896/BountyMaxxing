"use client";

import { useEffect, useState } from "react";
import { KEEPER_URL } from "@/lib/web3";

interface HealthData {
  walletBalance: string;
  computeBalance: string;
  activeHunts: number;
  generation: number;
  clanconomyAgent: string;
  network: string;
}

export default function CreatureBalance() {
  const [health, setHealth] = useState<HealthData | null>(null);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`${KEEPER_URL}/health`);
        if (res.ok) setHealth(await res.json());
      } catch { /* offline */ }
    };

    poll();
    const interval = setInterval(poll, 8000); // Update every 8s
    return () => clearInterval(interval);
  }, []);

  if (!health) {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "4px 10px",
          fontSize: "10px",
          fontWeight: 700,
          color: "#000000",
          border: "2px solid #000000",
          background: "#FFFFFF",
        }}
      >
        OFFLINE
      </div>
    );
  }

  // Parse balance to show just the number
  const ogBalance = health.walletBalance.replace(" OG", "");
  const shortBalance = parseFloat(ogBalance).toFixed(3);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0",
        border: "3px solid #000000",
        overflow: "hidden",
        fontSize: "11px",
      }}
    >
      <BalanceCell label="WALLET" value={`${shortBalance} OG`} accent="#BFFF00" />
      <BalanceCell label="HUNTS" value={String(health.activeHunts)} />
      <BalanceCell label="GEN" value={String(health.generation)} />
      <BalanceCell
        label="STATUS"
        value={health.activeHunts > 0 ? "HUNTING" : "IDLE"}
        accent={health.activeHunts > 0 ? "#BFFF00" : undefined}
      />
    </div>
  );
}

function BalanceCell({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div
      style={{
        padding: "10px 16px",
        background: "#FFFFFF",
        borderRight: "3px solid #000000",
        textAlign: "center",
        minWidth: "80px",
      }}
    >
      <div
        style={{
          fontSize: "9px",
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: "#000000",
          marginBottom: "3px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontWeight: 800,
          color: "#000000",
          background: accent ?? "transparent",
          padding: accent ? "1px 6px" : undefined,
          display: "inline-block",
        }}
      >
        {value}
      </div>
    </div>
  );
}
