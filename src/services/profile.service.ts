import { getAuthUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Profile, RatingHistory } from "@/types/database";

export async function getProfile(id: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as Profile;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getAuthUser();
  if (!user) return null;
  return getProfile(user.id);
}

export async function updateProfile(
  id: string,
  updates: Partial<Pick<Profile, "first_name" | "last_name" | "grade" | "bio" | "avatar_url">>
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update(updates).eq("id", id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function searchProfiles(query: string): Promise<Profile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("search_profiles", {
    p_query: query,
    p_limit: 20,
  });

  if (error || !data) return [];
  return data as Profile[];
}

export async function getRatingHistory(
  profileId: string,
  limit = 30
): Promise<RatingHistory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rating_history")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data as RatingHistory[];
}

export async function setOnlineStatus(userId: string, online: boolean) {
  const supabase = await createClient();
  await supabase
    .from("profiles")
    .update({ is_online: online, last_seen_at: new Date().toISOString() })
    .eq("id", userId);
}
