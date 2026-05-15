"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import { FireBadge } from "@/components/shared/fire-badge";
import { getFullName } from "@/lib/utils";
import type { Profile } from "@/types/database";

export function SearchView() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (q: string) => {
    setQuery(q);
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.profiles ?? []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <Input
          className="pl-10"
          placeholder="Search by name or class..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {loading && <p className="text-center text-sm text-white/50">Searching...</p>}

      <ul className="flex flex-col gap-2">
        {results.map((profile) => (
          <li key={profile.id}>
            <Link
              href={`/profile/${profile.id}`}
              className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-3 transition-all hover:bg-white/10"
            >
              <ProfileAvatar
                avatarUrl={profile.avatar_url}
                firstName={profile.first_name}
                lastName={profile.last_name}
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white">
                  {getFullName(profile.first_name, profile.last_name)}
                </p>
                <p className="text-xs text-white/50">{profile.grade}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="font-mono text-sm text-violet-400">{profile.elo_rating}</span>
                <FireBadge score={Number(profile.fire_score)} size="sm" animated={false} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
