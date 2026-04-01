"use client";

import { useState, useEffect } from "react";

const KEEPER_URL = process.env.NEXT_PUBLIC_KEEPER_URL || "http://localhost:3001";

interface Genome {
  generation: number;
  systemPrompt: string;
  learnings: string[];
  strengths: string[];
  weaknesses: string[];
  strategies: Record<string, string>;
  lastUpdated: number;
}

export default function EvolutionPage() {
  const [genome, setGenome] = useState<Genome | null>(null);

  useEffect(() => {
    fetch(`${KEEPER_URL}/genome`)
      .then((r) => r.json())
      .then(setGenome)
      .catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-100 mb-8">Evolution</h1>

      {!genome ? (
        <div className="text-gray-500 text-center py-12">
          Connect to keeper to view genome...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Generation Header */}
          <div className="border border-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl font-bold text-green-400">
                Gen {genome.generation}
              </div>
              <div className="text-sm text-gray-500">
                Last updated:{" "}
                {new Date(genome.lastUpdated).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* System Prompt */}
          <div className="border border-gray-800 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase mb-3">
              System Prompt
            </h2>
            <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap bg-gray-900 p-4 rounded">
              {genome.systemPrompt}
            </pre>
          </div>

          {/* Learnings */}
          {genome.learnings.length > 0 && (
            <div className="border border-gray-800 rounded-lg p-4">
              <h2 className="text-sm font-semibold text-gray-400 uppercase mb-3">
                Learnings ({genome.learnings.length})
              </h2>
              <ul className="space-y-2">
                {genome.learnings.map((l, i) => (
                  <li
                    key={i}
                    className="text-sm text-gray-300 pl-4 border-l-2 border-green-800"
                  >
                    {l}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Strengths & Weaknesses */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="border border-gray-800 rounded-lg p-4">
              <h2 className="text-sm font-semibold text-green-400 uppercase mb-3">
                Strengths
              </h2>
              {genome.strengths.length === 0 ? (
                <p className="text-gray-600 text-sm">None identified yet</p>
              ) : (
                <ul className="space-y-1">
                  {genome.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-gray-300">
                      + {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="border border-gray-800 rounded-lg p-4">
              <h2 className="text-sm font-semibold text-red-400 uppercase mb-3">
                Weaknesses
              </h2>
              {genome.weaknesses.length === 0 ? (
                <p className="text-gray-600 text-sm">None identified yet</p>
              ) : (
                <ul className="space-y-1">
                  {genome.weaknesses.map((w, i) => (
                    <li key={i} className="text-sm text-gray-300">
                      - {w}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Strategies */}
          {Object.keys(genome.strategies).length > 0 && (
            <div className="border border-gray-800 rounded-lg p-4">
              <h2 className="text-sm font-semibold text-gray-400 uppercase mb-3">
                Domain Strategies
              </h2>
              <div className="space-y-3">
                {Object.entries(genome.strategies).map(([domain, strategy]) => (
                  <div key={domain}>
                    <span className="text-sm font-mono text-blue-400">
                      {domain}:
                    </span>
                    <p className="text-sm text-gray-300 ml-4">{strategy}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
