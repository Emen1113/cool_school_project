import { LeaderboardView } from "@/components/leaderboards/leaderboard-view";
import { getLeaderboard } from "@/services/leaderboard.service";

export default async function LeaderboardsPage() {
  const initialEntries = await getLeaderboard("rating", 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-black text-white">Leaderboards</h1>
        <p className="text-sm text-white/50">Top students at your school</p>
      </header>
      <LeaderboardView initialEntries={initialEntries} />
    </div>
  );
}
