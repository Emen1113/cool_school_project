"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import { FireBadge } from "@/components/shared/fire-badge";
import { getFullName } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry } from "@/types/database";

interface LeaderboardListProps {
  entries: LeaderboardEntry[];
  type: string;
}

const rankColors: Record<number, string> = {
  1: "text-yellow-400",
  2: "text-gray-300",
  3: "text-amber-600",
};

export function LeaderboardList({ entries, type }: LeaderboardListProps) {
  if (entries.length === 0) {
    return (
      <p className="py-12 text-center text-white/50">No rankings yet. Start voting!</p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {entries.map((entry, i) => (
        <motion.li
          key={entry.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.03 }}
        >
          <Link
            href={`/profile/${entry.id}`}
            className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-3 backdrop-blur-xl transition-all hover:border-white/15 hover:bg-white/10"
          >
            <span
              className={cn(
                "w-8 text-center font-black tabular-nums",
                rankColors[entry.rank] ?? "text-white/40"
              )}
            >
              {entry.rank <= 3 ? ["🥇", "🥈", "🥉"][entry.rank - 1] : `#${entry.rank}`}
            </span>
            <ProfileAvatar
              avatarUrl={entry.avatar_url}
              firstName={entry.first_name}
              lastName={entry.last_name}
              size="md"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-white">
                {getFullName(entry.first_name, entry.last_name)}
              </p>
              <p className="text-xs text-white/50">{entry.grade}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              {type === "rating" && (
                <span className="font-mono text-sm font-bold text-violet-400">
                  {entry.elo_rating}
                </span>
              )}
              {type === "wins" && (
                <span className="text-sm font-bold text-emerald-400">
                  {entry.total_wins} wins
                </span>
              )}
              {type === "streak" && (
                <span className="text-sm font-bold text-orange-400">
                  {entry.streak_count} streak
                </span>
              )}
              {type === "trending" && (
                <FireBadge score={Number(entry.fire_score)} size="sm" />
              )}
              {type !== "trending" && (
                <FireBadge score={Number(entry.fire_score)} size="sm" animated={false} />
              )}
            </div>
          </Link>
        </motion.li>
      ))}
    </ul>
  );
}
