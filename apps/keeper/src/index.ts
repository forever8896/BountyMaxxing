/**
 * The Creature — Keeper Daemon
 * Watches 0G Chain for events, hunts Clankonomy bounties, streams thoughts.
 */

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

import http from "http";
import { URL } from "url";
import {
  CreatureCompute,
  CreatureStorage,
  CreatureChain,
  ThoughtStream,
  GenomeStore,
  ClanconomyClient,
  formatUSDC,
} from "@creature/integration";
import { loadConfig } from "./config.js";
import { EventWatcher } from "./watcher.js";
import { createOnRequestHandler } from "./handlers/on-request.js";
import { createOnNudgeHandler } from "./handlers/on-nudge.js";
import { createOnWonHandler, createOnLostHandler } from "./handlers/on-settle.js";
import { HuntLoop } from "./handlers/on-hunt.js";

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

  // Initialize Clankonomy client
  const clan = new ClanconomyClient(config.privateKey);
  console.log(`Clankonomy agent address: ${clan.address}`);

  const deps = { compute, storage, chain, thoughts, genome };

  // Start 0G Chain event watcher
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

  // Start Clankonomy hunt loop
  const huntLoop = new HuntLoop({ compute, storage, thoughts, genome, clan });
  await huntLoop.start(90_000); // Scan every 90 seconds

  // ── HTTP API ─────────────────────────────────────────────────────────────

  const server = http.createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url || "/", `http://localhost:${config.port}`);
    const pathname = url.pathname;

    // Health
    if (pathname === "/health") {
      const hunts = huntLoop.getActiveHunts();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        status: "alive",
        generation: genome.load().generation,
        activeHunts: hunts.length,
        clanconomyAgent: clan.address,
      }));
      return;
    }

    // SSE thought stream
    if (pathname === "/thoughts") {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });

      const recent = thoughts.getRecent(100);
      for (const t of recent) {
        res.write(`data: ${JSON.stringify(t)}\n\n`);
      }

      const unsubscribe = thoughts.subscribe((thought) => {
        res.write(`data: ${JSON.stringify(thought)}\n\n`);
      });

      req.on("close", unsubscribe);
      return;
    }

    // Genome
    if (pathname === "/genome") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(genome.load()));
      return;
    }

    // List challenges (from Clankonomy + active hunts)
    if (pathname === "/challenges" && req.method === "GET") {
      try {
        const bounties = await clan.listBounties({ status: "active" });
        const hunts = huntLoop.getActiveHunts();
        const huntMap = new Map(hunts.map((h) => [h.bounty.id, h]));

        const challenges = bounties.map((b) => {
          const hunt = huntMap.get(b.id);
          const catSlug = b.categorySlug || b.categories?.[0]?.slug || "";
          return {
            id: b.id,
            title: b.title,
            bountyUrl: `https://clankonomy.com/bounties/${b.id}`,
            description: b.description,
            status: hunt ? "Working" : "Pending",
            requester: "Clankonomy",
            prize: formatUSDC(b.amount),
            fee: "0",
            nudgeCount: b.submissionCount || 0,
            categorySlug: catSlug,
            evalType: b.evalType,
            deadline: b.deadline,
            numWinners: b.numWinners,
            topScore: b.topScore,
            iteration: hunt?.iteration || 0,
            submissions: hunt?.submissions || [],
            createdAt: b.createdAt || new Date().toISOString(),
          };
        });

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(challenges));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: String(err) }));
      }
      return;
    }

    // Single challenge detail
    const challengeMatch = pathname.match(/^\/challenges\/(.+)$/);
    if (challengeMatch && req.method === "GET") {
      const id = challengeMatch[1];
      try {
        const bounty = await clan.getBounty(id);
        if (!bounty) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Not found" }));
          return;
        }

        const hunts = huntLoop.getActiveHunts();
        const hunt = hunts.find((h) => h.bounty.id === id);
        const submissions = await clan.getSubmissions(id);

        const catSlug = bounty.categorySlug || bounty.categories?.[0]?.slug || "";
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          id: bounty.id,
          title: bounty.title,
          bountyUrl: `https://clankonomy.com/bounties/${bounty.id}`,
          description: bounty.description,
          status: hunt ? "Working" : "Pending",
          requester: "Clankonomy",
          prize: formatUSDC(bounty.amount),
          fee: "0",
          nudgeCount: bounty.submissionCount || 0,
          categorySlug: catSlug,
          evalType: bounty.evalType,
          evalScript: bounty.evalScript,
          fileType: bounty.fileType,
          iteration: hunt?.iteration || 0,
          currentDraft: hunt?.currentDraft || null,
          submissions,
          createdAt: bounty.createdAt || new Date().toISOString(),
        }));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: String(err) }));
      }
      return;
    }

    // Nudge a specific bounty
    if (challengeMatch && req.method === "POST") {
      const id = challengeMatch[1];
      let body = "";
      for await (const chunk of req) body += chunk;
      try {
        const { nudge } = JSON.parse(body);
        await huntLoop.applyNudge(id, nudge);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: String(err) }));
      }
      return;
    }

    res.writeHead(404);
    res.end("Not found");
  });

  server.listen(config.port, () => {
    console.log(`\nKeeper API server listening on port ${config.port}`);
    console.log(`  Thoughts:   http://localhost:${config.port}/thoughts`);
    console.log(`  Challenges: http://localhost:${config.port}/challenges`);
    console.log(`  Genome:     http://localhost:${config.port}/genome`);
    console.log(`  Health:     http://localhost:${config.port}/health`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log("Shutting down...");
    watcher.stop();
    huntLoop.stop();
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
    content: `The Creature is awake. Generation ${genome.load().generation}. Hunting on Clankonomy as ${clan.address}. Watching for challenges...`,
  });
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
