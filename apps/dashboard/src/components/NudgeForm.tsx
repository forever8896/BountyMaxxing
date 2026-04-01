"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { KEEPER_URL } from "@/lib/web3";

interface NudgeFormProps {
  bountyId: string;
}

export default function NudgeForm({ bountyId }: NudgeFormProps) {
  const { address, isConnected } = useAccount();
  const [nudgeText, setNudgeText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const handleSubmit = async () => {
    if (!nudgeText.trim() || !isConnected) return;

    setSubmitting(true);
    setResult(null);

    try {
      const res = await fetch(`${KEEPER_URL}/challenges/${bountyId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nudge: nudgeText,
          nudger: address,
        }),
      });

      if (res.ok) {
        setResult({ ok: true, message: "Nudge submitted! The Creature is evaluating your improvement." });
        setNudgeText("");
      } else {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        setResult({ ok: false, message: err.error || "Submission failed" });
      }
    } catch (err) {
      setResult({ ok: false, message: `Network error: ${err}` });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "3px solid #000000",
        padding: "20px",
        boxShadow: "4px 4px 0px #000000",
      }}
    >
      <div
        style={{
          fontSize: "10px",
          fontWeight: 800,
          letterSpacing: "0.15em",
          color: "#000000",
          marginBottom: "12px",
        }}
      >
        NUDGE THE CREATURE
      </div>

      <p
        style={{
          margin: "0 0 12px",
          fontSize: "11px",
          color: "#000000",
          lineHeight: 1.5,
        }}
      >
        Suggest an improvement to the creature&apos;s current submission.
        If your nudge is integrated and the creature wins, you earn a share of the prize.
      </p>

      <textarea
        value={nudgeText}
        onChange={(e) => setNudgeText(e.target.value)}
        disabled={!isConnected || submitting}
        style={{
          width: "100%",
          boxSizing: "border-box",
          background: isConnected ? "#FFFEF2" : "#F0F0F0",
          border: "3px solid #000000",
          padding: "10px 12px",
          fontSize: "12px",
          color: "#000000",
          fontFamily: "inherit",
          resize: "vertical",
          outline: "none",
          minHeight: "100px",
        }}
        placeholder={
          isConnected
            ? "Describe your improvement — be specific about what to change and why..."
            : "Connect wallet to nudge"
        }
      />

      {isConnected ? (
        <button
          onClick={handleSubmit}
          disabled={submitting || !nudgeText.trim()}
          style={{
            marginTop: "10px",
            width: "100%",
            background: nudgeText.trim() ? "#BFFF00" : "#E0E0E0",
            border: "3px solid #000000",
            padding: "10px",
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "0.1em",
            color: "#000000",
            cursor: nudgeText.trim() && !submitting ? "pointer" : "not-allowed",
            boxShadow: nudgeText.trim() ? "2px 2px 0px #000000" : "none",
          }}
        >
          {submitting ? "SUBMITTING..." : "SEND NUDGE"}
        </button>
      ) : (
        <div
          style={{
            marginTop: "10px",
            fontSize: "11px",
            color: "#000000",
            fontWeight: 600,
            textAlign: "center",
            padding: "8px",
            background: "#F5F5F0",
            border: "2px solid #000000",
          }}
        >
          Connect your wallet above to nudge
        </div>
      )}

      {result && (
        <div
          style={{
            marginTop: "10px",
            padding: "10px",
            fontSize: "11px",
            fontWeight: 600,
            color: "#000000",
            background: result.ok ? "#BFFF00" : "#FF3B30",
            border: "2px solid #000000",
          }}
        >
          {result.message}
        </div>
      )}
    </div>
  );
}
