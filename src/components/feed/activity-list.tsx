"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import { getFullName } from "@/lib/utils";
import type { ActivityFeedItem } from "@/types/database";

const typeEmoji: Record<string, string> = {
  vote_win: "🏆",
  vote_loss: "💫",
  streak: "🔥",
  milestone: "⭐",
  joined: "👋",
};

interface ActivityListProps {
  initialItems: ActivityFeedItem[];
}

export function ActivityList({ initialItems }: ActivityListProps) {
  if (initialItems.length === 0) {
    return (
      <p className="py-12 text-center text-white/50">No activity yet. Start voting!</p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {initialItems.map((item, i) => {
        const profile = item.profile;
        return (
          <motion.li
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02 }}
            className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur-xl"
          >
            {profile ? (
              <Link href={`/profile/${profile.id}`}>
                <ProfileAvatar
                  avatarUrl={profile.avatar_url}
                  firstName={profile.first_name}
                  lastName={profile.last_name}
                  size="md"
                />
              </Link>
            ) : (
              <span className="text-2xl">{typeEmoji[item.type] ?? "•"}</span>
            )}
            <div className="min-w-0 flex-1">
              {profile && (
                <Link
                  href={`/profile/${profile.id}`}
                  className="font-semibold text-white hover:text-violet-300"
                >
                  {getFullName(profile.first_name, profile.last_name)}
                </Link>
              )}
              <p className="text-sm text-white/60">
                {typeEmoji[item.type]} {item.message}
              </p>
              <p className="text-xs text-white/30">
                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
              </p>
            </div>
          </motion.li>
        );
      })}
    </ul>
  );
}
