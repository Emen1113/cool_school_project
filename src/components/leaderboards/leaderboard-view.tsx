"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeaderboardList } from "@/components/leaderboards/leaderboard-list";
import { useRealtimeLeaderboard } from "@/hooks/use-realtime-leaderboard";
import type { LeaderboardEntry, LeaderboardType } from "@/types/database";

const tabs: { value: LeaderboardType; label: string }[] = [
  { value: "rating", label: "Top Rated" },
  { value: "trending", label: "Trending" },
  { value: "wins", label: "Most Wins" },
  { value: "streak", label: "Hot Streaks" },
];

interface LeaderboardViewProps {
  initialEntries: LeaderboardEntry[];
}

export function LeaderboardView({ initialEntries }: LeaderboardViewProps) {
  const [type, setType] = useState<LeaderboardType>("rating");
  const [entries, setEntries] = useState(initialEntries);
  const [loading, setLoading] = useState(false);

  useRealtimeLeaderboard(() => {
    fetchEntries(type);
  });

  const fetchEntries = async (t: LeaderboardType) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leaderboard?type=${t}`);
      const data = await res.json();
      setEntries(data.entries ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (type !== "rating") fetchEntries(type);
    else setEntries(initialEntries);
  }, [type, initialEntries]);

  return (
    <Tabs value={type} onValueChange={(v) => setType(v as LeaderboardType)}>
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {loading ? (
            <p className="py-12 text-center text-white/50">Loading...</p>
          ) : (
            <LeaderboardList entries={entries} type={tab.value} />
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
