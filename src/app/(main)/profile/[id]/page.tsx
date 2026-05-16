import { notFound, redirect } from "next/navigation";
import { ProfileView } from "@/components/profile/profile-view";
import { getAuthUser } from "@/lib/auth";
import { isUuid } from "@/lib/utils";
import { getProfile, getRatingHistory } from "@/services/profile.service";

type ProfilePageProps = {
  params: Promise<{ id: string }> | { id: string };
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await Promise.resolve(params);

  if (id === "me") {
    redirect("/profile/me");
  }

  if (!isUuid(id)) {
    notFound();
  }

  const user = await getAuthUser();
  const isOwn = user?.id === id;

  if (isOwn) {
    redirect("/profile/me");
  }

  const profile = await getProfile(id);

  if (!profile || profile.is_banned) {
    notFound();
  }

  return (
    <ProfileView
      profile={profile}
      history={[]}
      isOwn={false}
      currentUserId={user?.id}
    />
  );
}
