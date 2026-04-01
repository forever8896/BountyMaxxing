import { type NextRequest, NextResponse } from "next/server";

const KEEPER_URL = process.env.KEEPER_URL ?? "http://localhost:3001";

/**
 * GET /api/challenges — proxy to keeper challenge list.
 * GET /api/challenges?id=ch-001 — proxy to single challenge.
 */
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  const upstream = id
    ? `${KEEPER_URL}/challenges/${id}`
    : `${KEEPER_URL}/challenges`;

  try {
    const res = await fetch(upstream, {
      next: { revalidate: 10 },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Keeper unavailable" },
      { status: 503 }
    );
  }
}
