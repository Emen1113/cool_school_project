import { VoteArena } from "@/components/voting/vote-arena";
import { createClient } from "@/lib/supabase/server";
import { getVotePair } from "@/services/vote.service";

export default async function VotePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const initialPair = user ? await getVotePair(user.id) : null;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-black text-white">Who wins?</h1>
        <p className="text-sm text-white/50">Tap your pick — next matchup loads instantly</p>
      </header>
      {user && <VoteArena initialPair={initialPair} userId={user.id} />}
    </div>
  );
}
