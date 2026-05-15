import { NextResponse } from "next/server";
import { getLeaderboard } from "@/services/leaderboard.service";
import type { LeaderboardType } from "@/types/database";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = (searchParams.get("type") ?? "rating") as LeaderboardType;
  const page = parseInt(searchParams.get("page") ?? "0", 10);

  const entries = await getLeaderboard(type, page);
  return NextResponse.json({ entries });
}
