"use client";

import { use } from "react";
import { ThoughtStream } from "@/components/ThoughtStream";

export default function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const challengeId = parseInt(id);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-100 mb-2">
        Challenge #{challengeId}
      </h1>
      <p className="text-gray-500 mb-8">
        Viewing details and thought stream for this challenge.
      </p>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Challenge Info */}
        <div className="lg:col-span-1">
          <div className="border border-gray-800 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase mb-3">
              Details
            </h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500">Status:</span>{" "}
                <span className="text-yellow-400">Pending</span>
              </div>
              <div>
                <span className="text-gray-500">Challenge ID:</span>{" "}
                <span className="text-gray-300">{challengeId}</span>
              </div>
            </div>
          </div>

          {/* Nudge Form Placeholder */}
          <div className="border border-gray-800 rounded-lg p-4 mt-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase mb-3">
              Submit a Nudge
            </h2>
            <p className="text-gray-600 text-xs mb-3">
              Upload your improvement to 0G Storage and submit the content hash.
            </p>
            <textarea
              className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-gray-300 font-mono"
              rows={4}
              placeholder="Paste your improvement here..."
              disabled
            />
            <button
              className="mt-2 w-full bg-gray-800 text-gray-500 py-2 rounded text-sm cursor-not-allowed"
              disabled
            >
              Connect Wallet to Nudge
            </button>
          </div>
        </div>

        {/* Thought Stream */}
        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-400 uppercase mb-3">
            Thought Stream
          </h2>
          <ThoughtStream challengeId={challengeId} />
        </div>
      </div>
    </div>
  );
}
