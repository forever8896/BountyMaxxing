/**
 * The Creature — Keeper Daemon
 * Watches 0G Chain for events and orchestrates AI work.
 */

import http from "http";
import { CreatureCompute, CreatureStorage, CreatureChain, ThoughtStream, GenomeStore } from "@creature/integration";
import { loadConfig } from "./config.js";
import { EventWatcher } from "./watcher.js";
import { createOnRequestHandler } from "./handlers/on-request.js";
import { createOnNudgeHandler } from "./handlers/on-nudge.js";
import { createOnWonHandler, createOnLostHandler } from "./handlers/on-settle.js";

async function main() {
  console.log("Starting The Creature keeper daemon...");

  const config = loadConfig();

  // Initialize 0G integration layers
  const storage = new CreatureStorage({
    rpcUrl: config.rpcUrl,
    privateKey: config.privateKey,
    indexerUrl: config.indexerUrl,
    storageContracts: config.storageContracts,
  });

  const thoughts = new ThoughtStream(storage);
  const genome = new GenomeStore(storage);

  const compute = await CreatureCompute.create(
    { rpcUrl: config.rpcUrl, privateKey: config.privateKey },
    thoughts
  );

  // Ensure compute account is funded
  console.log("Ensuring 0G Compute account is ready...");
  const ready = await compute.ensureAccountReady();
  if (!ready) {
    console.warn("0G Compute account setup failed — inference may not work");
  }

  const chain = new CreatureChain({
    rpcUrl: config.rpcUrl,
    privateKey: config.privateKey,
    contracts: config.contracts,
  });

  const deps = { compute, storage, chain, thoughts, genome };

  // Start event watcher
  const watcher = new EventWatcher({
    chain,
    pollIntervalMs: config.pollIntervalMs,
    handlers: {
      onRequestSubmitted: createOnRequestHandler(deps),
      onNudgeSubmitted: createOnNudgeHandler(deps),
      onChallengeWon: createOnWonHandler(deps),
      onChallengeLost: createOnLostHandler(deps),
    },
  });

  await watcher.start();

  // SSE server for thought streaming to dashboard
  const server = http.createServer((req, res) => {
    // CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "alive", generation: genome.load().generation }));
      return;
    }

    if (req.url?.startsWith("/thoughts")) {
      // SSE endpoint
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });

      // Send recent thoughts
      const recent = thoughts.getRecent(50);
      for (const t of recent) {
        res.write(`data: ${JSON.stringify(t)}\n\n`);
      }

      // Subscribe to new thoughts
      const unsubscribe = thoughts.subscribe((thought) => {
        res.write(`data: ${JSON.stringify(thought)}\n\n`);
      });

      req.on("close", () => {
        unsubscribe();
      });

      return;
    }

    if (req.url === "/genome") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(genome.load()));
      return;
    }

    res.writeHead(404);
    res.end("Not found");
  });

  server.listen(config.port, () => {
    console.log(`Keeper SSE server listening on port ${config.port}`);
    console.log(`  Thoughts: http://localhost:${config.port}/thoughts`);
    console.log(`  Genome:   http://localhost:${config.port}/genome`);
    console.log(`  Health:   http://localhost:${config.port}/health`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log("Shutting down...");
    watcher.stop();
    server.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  await thoughts.emit({
    id: crypto.randomUUID(),
    challengeId: 0,
    timestamp: Date.now(),
    type: "system",
    content: `The Creature is awake. Generation ${genome.load().generation}. Watching for challenges...`,
  });
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
