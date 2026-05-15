"use client";

import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/ui/glass-card";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

interface SettingsFormProps {
  profile: Profile;
}

export function SettingsForm({ profile }: SettingsFormProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [form, setForm] = useState({
    firstName: profile.first_name,
    lastName: profile.last_name,
    grade: profile.grade,
    bio: profile.bio ?? "",
  });

  const uploadAvatar = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/avatar", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setAvatarUrl(data.url);
    toast.success("Photo updated!");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: form.firstName,
        last_name: form.lastName,
        grade: form.grade,
        bio: form.bio || null,
      })
      .eq("id", profile.id);

    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Profile saved!");
  };

  return (
    <GlassCard className="space-y-6 p-6">
      <div className="flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="group relative"
        >
          <ProfileAvatar
            avatarUrl={avatarUrl}
            firstName={form.firstName}
            lastName={form.lastName}
            size="xl"
          />
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <Camera className="h-8 w-8 text-white" />
          </span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              await uploadAvatar(file);
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Upload failed");
            }
          }}
        />
        <p className="text-xs text-white/50">Tap to upload · Max 2MB · WebP optimized</p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="grade">Class / Grade</Label>
          <Input
            id="grade"
            value={form.grade}
            onChange={(e) => setForm({ ...form, grade: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="bio">Bio / Status</Label>
          <Input
            id="bio"
            placeholder="What's your vibe?"
            maxLength={160}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save profile"}
        </Button>
      </form>
    </GlassCard>
  );
}
