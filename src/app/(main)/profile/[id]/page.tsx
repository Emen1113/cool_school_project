import { notFound, redirect } from "next/navigation";
import { ProfileView } from "@/components/profile/profile-view";
import { createClient } from "@/lib/supabase/server";
import { getProfile, getRatingHistory } from "@/services/profile.service";

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profileId = id === "me" ? user?.id : id;
  if (!profileId) redirect("/login");

  const [profile, history] = await Promise.all([
    getProfile(profileId),
    getRatingHistory(profileId),
  ]);

  if (!profile || (profile.is_banned && user?.id !== profileId)) {
    notFound();
  }

  const isOwn = user?.id === profile.id;

  return (
    <ProfileView
      profile={profile}
      history={history}
      isOwn={isOwn}
      currentUserId={user?.id}
    />
  );
}
