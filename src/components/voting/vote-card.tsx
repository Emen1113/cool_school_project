"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FireBadge } from "@/components/shared/fire-badge";
import { getFullName } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types/database";

interface VoteCardProps {
  profile: Profile;
  side: "left" | "right";
  selected?: boolean;
  disabled?: boolean;
  onVote: () => void;
}

export function VoteCard({
  profile,
  side,
  selected,
  disabled,
  onVote,
}: VoteCardProps) {
  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onVote}
      className={cn(
        "group relative flex w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-left backdrop-blur-2xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 disabled:opacity-50",
        selected && "scale-[1.02] border-violet-500 ring-2 ring-violet-500/50",
        !selected && "hover:border-white/20 hover:bg-white/10 active:scale-[0.98]"
      )}
      initial={{ opacity: 0, x: side === "left" ? -40 : 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.9, x: side === "left" ? -60 : 60 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      whileTap={{ scale: 0.97 }}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar_url}
            alt={getFullName(profile.first_name, profile.last_name)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-900 to-fuchsia-900 text-4xl font-black text-white">
            {profile.first_name[0]}
            {profile.last_name[0]}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        {selected && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-violet-600/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="rounded-full bg-white px-4 py-2 text-lg font-black text-violet-600">
              WINNER
            </span>
          </motion.div>
        )}
      </div>

      <motion.div className="flex flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link
              href={`/profile/${profile.id}`}
              onClick={(e) => e.stopPropagation()}
              className="font-bold text-white hover:text-violet-300"
            >
              {getFullName(profile.first_name, profile.last_name)}
            </Link>
            <p className="text-xs text-white/50">{profile.grade}</p>
          </div>
          <FireBadge
            score={Number(profile.fire_score)}
            streak={profile.streak_count}
            size="sm"
          />
        </div>
        {profile.bio && (
          <p className="line-clamp-2 text-xs text-white/60">{profile.bio}</p>
        )}
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono font-bold text-violet-400">
            {profile.elo_rating} ELO
          </span>
          <span className="text-white/50">
            {profile.total_wins}W · {profile.total_losses}L
          </span>
        </div>
      </motion.div>
    </motion.button>
  );
}
