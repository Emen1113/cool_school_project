"use client";

import { AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { VoteCard } from "@/components/voting/vote-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Profile, VotePair } from "@/types/database";

interface VoteArenaProps {
  initialPair: VotePair | null;
  userId: string;
}

export function VoteArena({ initialPair, userId }: VoteArenaProps) {
  const [pair, setPair] = useState<VotePair | null>(initialPair);
  const [loading, setLoading] = useState(false);
  const [voting, setVoting] = useState(false);
  const [selectedSide, setSelectedSide] = useState<"left" | "right" | null>(null);

  const fetchPair = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vote/pair");
      const data = await res.json();
      if (data.pair) setPair(data.pair);
      else toast.error("Not enough students to vote yet");
    } catch {
      toast.error("Failed to load matchup");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleVote = async (winner: Profile, loser: Profile, side: "left" | "right") => {
    if (voting) return;
    setVoting(true);
    setSelectedSide(side);

    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winnerId: winner.id, loserId: loser.id }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Vote failed");
        setSelectedSide(null);
        setVoting(false);
        return;
      }

      toast.success(`+${data.winnerDelta} ELO for ${winner.first_name}!`, {
        icon: "🔥",
      });

      await new Promise((r) => setTimeout(r, 400));
      setSelectedSide(null);
      await fetchPair();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setVoting(false);
    }
  };

  useEffect(() => {
    if (!initialPair) fetchPair();
  }, [initialPair, fetchPair]);

  if (loading && !pair) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Skeleton className="aspect-[3/5] w-full" />
        <Skeleton className="aspect-[3/5] w-full" />
      </div>
    );
  }

  if (!pair) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <p className="text-4xl">🎓</p>
        <p className="text-lg font-semibold text-white">No matchups available</p>
        <p className="text-sm text-white/50">
          More students need to join and upload photos first.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
        <span className="rounded-full border border-white/20 bg-black/80 px-3 py-1 text-xs font-black tracking-widest text-white/80 backdrop-blur-xl">
          VS
        </span>
      </div>
      <AnimatePresence mode="wait">
        <div key={`${pair.left.id}-${pair.right.id}`} className="grid grid-cols-2 gap-3 sm:gap-4">
          <VoteCard
            profile={pair.left}
            side="left"
            selected={selectedSide === "left"}
            disabled={voting}
            onVote={() => handleVote(pair.left, pair.right, "left")}
          />
          <VoteCard
            profile={pair.right}
            side="right"
            selected={selectedSide === "right"}
            disabled={voting}
            onVote={() => handleVote(pair.right, pair.left, "right")}
          />
        </div>
      </AnimatePresence>
    </div>
  );
}
