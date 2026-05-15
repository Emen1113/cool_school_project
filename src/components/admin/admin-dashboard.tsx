"use client";

import { useState } from "react";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import { getFullName } from "@/lib/utils";
import type { Profile, Report } from "@/types/database";

interface AdminDashboardProps {
  stats: { totalUsers: number; totalVotes: number; pendingReports: number };
  reports: Report[];
  profiles: Profile[];
}

export function AdminDashboard({ stats, reports, profiles }: AdminDashboardProps) {
  const [localReports, setLocalReports] = useState(reports);
  const [localProfiles, setLocalProfiles] = useState(profiles);

  const adminAction = async (body: Record<string, string>) => {
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Users", value: stats.totalUsers },
          { label: "Votes", value: stats.totalVotes },
          { label: "Reports", value: stats.pendingReports },
        ].map((s) => (
          <GlassCard key={s.label} className="text-center">
            <p className="text-2xl font-black text-violet-400">{s.value}</p>
            <p className="text-xs text-white/50">{s.label}</p>
          </GlassCard>
        ))}
      </div>

      <Tabs defaultValue="reports">
        <TabsList>
          <TabsTrigger value="reports">Reports ({localReports.length})</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-2">
          {localReports.length === 0 ? (
            <p className="py-8 text-center text-white/50">No pending reports</p>
          ) : (
            localReports.map((report) => (
              <GlassCard key={report.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-white">{report.reason}</p>
                  {report.details && (
                    <p className="text-sm text-white/50">{report.details}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={async () => {
                      try {
                        await adminAction({
                          action: "dismiss_report",
                          reportId: report.id,
                        });
                        setLocalReports((r) => r.filter((x) => x.id !== report.id));
                        toast.success("Dismissed");
                      } catch (e) {
                        toast.error(e instanceof Error ? e.message : "Failed");
                      }
                    }}
                  >
                    Dismiss
                  </Button>
                  <Button
                    size="sm"
                    onClick={async () => {
                      try {
                        await adminAction({
                          action: "resolve_report",
                          reportId: report.id,
                        });
                        setLocalReports((r) => r.filter((x) => x.id !== report.id));
                        toast.success("Resolved");
                      } catch (e) {
                        toast.error(e instanceof Error ? e.message : "Failed");
                      }
                    }}
                  >
                    Resolve
                  </Button>
                </div>
              </GlassCard>
            ))
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-2">
          {localProfiles.map((profile) => (
            <GlassCard
              key={profile.id}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <ProfileAvatar
                  avatarUrl={profile.avatar_url}
                  firstName={profile.first_name}
                  lastName={profile.last_name}
                />
                <div>
                  <p className="font-semibold text-white">
                    {getFullName(profile.first_name, profile.last_name)}
                  </p>
                  <p className="text-xs text-white/50">
                    {profile.is_banned ? "BANNED" : profile.email}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant={profile.is_banned ? "secondary" : "destructive"}
                onClick={async () => {
                  try {
                    await adminAction({
                      action: profile.is_banned ? "unban" : "ban",
                      userId: profile.id,
                    });
                    setLocalProfiles((ps) =>
                      ps.map((p) =>
                        p.id === profile.id ? { ...p, is_banned: !p.is_banned } : p
                      )
                    );
                    toast.success(profile.is_banned ? "Unbanned" : "Banned");
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : "Failed");
                  }
                }}
              >
                {profile.is_banned ? "Unban" : "Ban"}
              </Button>
            </GlassCard>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
