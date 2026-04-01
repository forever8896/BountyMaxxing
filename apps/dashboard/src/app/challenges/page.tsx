"use client";

import { useState, useEffect } from "react";
import { ChallengeCard } from "@/components/ChallengeCard";

const KEEPER_URL = process.env.NEXT_PUBLIC_KEEPER_URL || "http://localhost:3001";

interface Challenge {
  id: number;
  bountyUrl: string;
  status: string;
  requester: string;
  fee: string;
  prizeAmount: string;
  createdAt: number;
}

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${KEEPER_URL}/health`)
      .then((r) => r.json())
      .then(() => {
        // In a full implementation, we'd fetch challenges from the chain
        // For now, show a placeholder
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-100">Challenges</h1>
        <span className="text-sm text-gray-500">
          {challenges.length} total
        </span>
      </div>

      {loading ? (
        <div className="text-gray-500 text-center py-12">Loading...</div>
      ) : challenges.length === 0 ? (
        <div className="border border-gray-800 rounded-lg p-12 text-center">
          <p className="text-gray-400 text-lg mb-2">No challenges yet</p>
          <p className="text-gray-600 text-sm">
            Submit a request to point The Creature at a bounty.
            <br />
            Call <code className="text-green-400">submitRequest()</code> on the
            CreatureRegistry contract.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {challenges.map((c) => (
            <ChallengeCard key={c.id} challenge={c} />
          ))}
        </div>
      )}
    </div>
  );
}
