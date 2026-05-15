import { createClient } from "@/lib/supabase/server";
import type { ActivityFeedItem } from "@/types/database";

export async function getActivityFeed(limit = 30): Promise<ActivityFeedItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activity_feed")
    .select(`
      *,
      profile:profiles(id, first_name, last_name, avatar_url)
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data as ActivityFeedItem[];
}
