"use client";

import { useState } from "react";
import { Share2, Flag } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import { FireBadge } from "@/components/shared/fire-badge";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { getFullName } from "@/lib/utils";
import type { Profile, RatingHistory } from "@/types/database";

interface ProfileViewProps {
  profile: Profile;
  history: RatingHistory[];
  isOwn: boolean;
  currentUserId?: string;
}

export function ProfileView({
  profile,
  history,
  isOwn,
  currentUserId,
}: ProfileViewProps) {
  const [reporting, setReporting] = useState(false);

  const shareProfile = async () => {
    const url = `${window.location.origin}/profile/${profile.id}`;
    try {
      await navigator.share?.({ title: getFullName(profile.first_name, profile.last_name), url });
    } catch {
      await navigator.clipboard.writeText(url);
      toast.success("Profile link copied!");
    }
  };

  const reportUser = async () => {
    if (!currentUserId || reporting) return;
    setReporting(true);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportedId: profile.id,
          reason: "Inappropriate content",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Report submitted. Moderators will review it.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Report failed");
    } finally {
      setReporting(false);
    }
  };

  const winRate =
    profile.total_wins + profile.total_losses > 0
      ? Math.round(
          (profile.total_wins / (profile.total_wins + profile.total_losses)) * 100
        )
      : 0;

  return (
    <div className="space-y-6">
      <GlassCard glow className="flex flex-col items-center p-6 text-center">
        <ProfileAvatar
          avatarUrl={profile.avatar_url}
          firstName={profile.first_name}
          lastName={profile.last_name}
          size="xl"
          isOnline={profile.is_online}
        />
        <h1 className="mt-4 text-2xl font-black text-white">
          {getFullName(profile.first_name, profile.last_name)}
        </h1>
        <p className="text-white/50">{profile.grade}</p>
        {profile.bio && <p className="mt-2 text-sm text-white/70">{profile.bio}</p>}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <FireBadge score={Number(profile.fire_score)} streak={profile.streak_count} />
          {profile.streak_count >= 3 && (
            <span className="rounded-full bg-orange-500/20 px-3 py-1 text-xs font-bold text-orange-400">
              {profile.streak_count} win streak
            </span>
          )}
        </div>
        <div className="mt-4 flex gap-2">
          <Button variant="secondary" size="sm" onClick={shareProfile}>
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          {!isOwn && currentUserId && (
            <Button variant="outline" size="sm" onClick={reportUser} disabled={reporting}>
              <Flag className="h-4 w-4" />
              Report
            </Button>
          )}
          {isOwn && (
            <Button asChild variant="secondary" size="sm">
              <Link href="/settings">Edit profile</Link>
            </Button>
          )}
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "ELO", value: profile.elo_rating },
          { label: "Wins", value: profile.total_wins },
          { label: "Losses", value: profile.total_losses },
          { label: "Win %", value: `${winRate}%` },
        ].map((stat) => (
          <GlassCard key={stat.label} className="text-center">
            <p className="text-2xl font-black text-violet-400">{stat.value}</p>
            <p className="text-xs text-white/50">{stat.label}</p>
          </GlassCard>
        ))}
      </div>

      {history.length > 0 && (
        <div>
          <h2 className="mb-3 font-bold text-white">Rating history</h2>
          <ul className="flex flex-col gap-1">
            {history.slice(0, 10).map((h) => (
              <li
                key={h.id}
                className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-2 text-sm"
              >
                <span className="text-white/60">
                  {new Date(h.created_at).toLocaleDateString()}
                </span>
                <span className="font-mono font-bold text-white">{h.elo_rating}</span>
                <span
                  className={
                    h.delta >= 0 ? "font-bold text-emerald-400" : "font-bold text-red-400"
                  }
                >
                  {h.delta >= 0 ? "+" : ""}
                  {h.delta}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
