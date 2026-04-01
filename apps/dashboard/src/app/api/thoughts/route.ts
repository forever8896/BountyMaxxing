import { type NextRequest } from "next/server";

/**
 * SSE proxy — streams thought events from the keeper process to the browser,
 * bypassing CORS restrictions since the keeper runs on localhost:3001.
 *
 * GET /api/thoughts
 */
export async function GET(req: NextRequest) {
  const keeperUrl = process.env.KEEPER_URL ?? "http://localhost:3001";

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(`${keeperUrl}/thoughts`, {
      headers: { Accept: "text/event-stream" },
      // @ts-expect-error — Node 18+ fetch supports duplex
      duplex: "half",
      signal: req.signal,
    });
  } catch {
    // Keeper unreachable — return a single error event then close
    const body = "event: error\ndata: {\"message\":\"Keeper unavailable\"}\n\n";
    return new Response(body, {
      status: 200,
      headers: sseHeaders(),
    });
  }

  if (!upstreamResponse.ok || !upstreamResponse.body) {
    const body = `event: error\ndata: {"message":"Upstream ${upstreamResponse.status}"}\n\n`;
    return new Response(body, { status: 200, headers: sseHeaders() });
  }

  // Pipe the upstream SSE stream straight through to the client
  return new Response(upstreamResponse.body, {
    status: 200,
    headers: sseHeaders(),
  });
}

function sseHeaders(): HeadersInit {
  return {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  };
}
