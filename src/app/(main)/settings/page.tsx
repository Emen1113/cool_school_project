import { SettingsForm } from "@/components/settings/settings-form";
import { getCurrentProfile } from "@/services/profile.service";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-black text-white">Settings</h1>
        <p className="text-sm text-white/50">Update your profile & photo</p>
      </header>
      <SettingsForm profile={profile} />
    </div>
  );
}
