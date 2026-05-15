import { LEADERBOARD_PAGE_SIZE } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { LeaderboardEntry, LeaderboardType } from "@/types/database";

export async function getLeaderboard(
  type: LeaderboardType = "rating",
  page = 0
): Promise<LeaderboardEntry[]> {
  const supabase = await createClient();
  const offset = page * LEADERBOARD_PAGE_SIZE;

  const { data, error } = await supabase.rpc("get_leaderboard", {
    p_type: type,
    p_limit: LEADERBOARD_PAGE_SIZE,
    p_offset: offset,
  });

  if (error || !data) return [];
  return data as LeaderboardEntry[];
}
