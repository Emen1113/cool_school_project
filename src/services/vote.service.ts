import { calculateNewRatings } from "@/lib/elo";
import { FIRE_VOTE_BOOST, FIRE_WIN_BOOST } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { Profile, VotePair } from "@/types/database";

export async function getVotePair(excludeId?: string): Promise<VotePair | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_vote_pair", {
    p_exclude_id: excludeId ?? null,
  });

  if (error || !data || data.length < 2) return null;

  const left = data.find((p: Profile & { slot: string }) => p.slot === "left");
  const right = data.find((p: Profile & { slot: string }) => p.slot === "right");

  if (!left || !right) return null;
  return { left, right };
}

export async function castVote(
  voterId: string,
  winnerId: string,
  loserId: string
): Promise<{
  success: boolean;
  error?: string;
  voteId?: string;
  winnerDelta?: number;
}> {
  const supabase = await createClient();

  const { data: profiles, error: fetchError } = await supabase
    .from("profiles")
    .select("id, elo_rating, streak_count, fire_score, is_banned")
    .in("id", [winnerId, loserId]);

  if (fetchError || !profiles || profiles.length !== 2) {
    return { success: false, error: "Could not load players" };
  }

  const winner = profiles.find((p) => p.id === winnerId)!;
  const loser = profiles.find((p) => p.id === loserId)!;

  if (winner.is_banned || loser.is_banned) {
    return { success: false, error: "Player unavailable" };
  }

  const { winnerNew, loserNew, winnerDelta, loserDelta } = calculateNewRatings(
    winner.elo_rating,
    loser.elo_rating
  );

  const winnerStreak = (winner.streak_count ?? 0) + 1;
  const loserStreak = 0;
  const winnerFireBoost = FIRE_WIN_BOOST + FIRE_VOTE_BOOST;
  const loserFireDecay = 1;

  const { data: voteId, error } = await supabase.rpc("process_vote", {
    p_voter_id: voterId,
    p_winner_id: winnerId,
    p_loser_id: loserId,
    p_winner_elo_before: winner.elo_rating,
    p_loser_elo_before: loser.elo_rating,
    p_winner_elo_after: winnerNew,
    p_loser_elo_after: loserNew,
    p_winner_delta: winnerDelta,
    p_loser_delta: loserDelta,
    p_winner_streak: winnerStreak,
    p_loser_streak: loserStreak,
    p_winner_fire_boost: winnerFireBoost,
    p_loser_fire_decay: loserFireDecay,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, voteId: voteId as string, winnerDelta };
}
