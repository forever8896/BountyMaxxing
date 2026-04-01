import { NextResponse } from "next/server";

const KEEPER_URL = process.env.KEEPER_URL ?? "http://localhost:3001";

/**
 * GET /api/genome — proxy to keeper genome endpoint.
 */
export async function GET() {
  try {
    const res = await fetch(`${KEEPER_URL}/genome`, {
      next: { revalidate: 15 },
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
