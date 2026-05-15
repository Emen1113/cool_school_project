import { createClient } from "@/lib/supabase/server";
import type { Profile, Report } from "@/types/database";

export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("is_admin", { p_user_id: userId });
  return !!data;
}

export async function getPendingReports(): Promise<Report[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reports")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(50);

  return (data ?? []) as Report[];
}

export async function banUser(
  adminId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const admin = await isAdmin(adminId);
  if (!admin) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from("profiles")
    .update({ is_banned: true })
    .eq("id", userId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function unbanUser(
  adminId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const admin = await isAdmin(adminId);
  if (!admin) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from("profiles")
    .update({ is_banned: false })
    .eq("id", userId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function resolveReport(
  adminId: string,
  reportId: string,
  status: "resolved" | "dismissed"
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const admin = await isAdmin(adminId);
  if (!admin) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from("reports")
    .update({ status, reviewed_by: adminId })
    .eq("id", reportId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function getAdminStats() {
  const supabase = await createClient();

  const [profiles, votes, reports] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("votes").select("id", { count: "exact", head: true }),
    supabase
      .from("reports")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  return {
    totalUsers: profiles.count ?? 0,
    totalVotes: votes.count ?? 0,
    pendingReports: reports.count ?? 0,
  };
}

export async function getAllProfiles(limit = 100): Promise<Profile[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []) as Profile[];
}
