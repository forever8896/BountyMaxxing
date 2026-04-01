"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";

export default function WalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 700,
            fontFamily: "monospace",
            color: "#000000",
            background: "#BFFF00",
            padding: "4px 10px",
            border: "2px solid #000000",
          }}
        >
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          style={{
            fontSize: "10px",
            fontWeight: 700,
            color: "#000000",
            background: "#FFFFFF",
            border: "2px solid #000000",
            padding: "4px 8px",
            cursor: "pointer",
          }}
        >
          DISCONNECT
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: injected() })}
      disabled={isPending}
      style={{
        fontSize: "11px",
        fontWeight: 800,
        letterSpacing: "0.08em",
        color: "#000000",
        background: "#BFFF00",
        border: "3px solid #000000",
        padding: "6px 14px",
        cursor: isPending ? "wait" : "pointer",
        boxShadow: "2px 2px 0px #000000",
      }}
    >
      {isPending ? "CONNECTING..." : "CONNECT WALLET"}
    </button>
  );
}
