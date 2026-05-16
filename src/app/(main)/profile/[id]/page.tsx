import { notFound, redirect } from "next/navigation";
import { ProfileView } from "@/components/profile/profile-view";
import { getAuthUser } from "@/lib/auth";
import { getProfile, getRatingHistory } from "@/services/profile.service";

interface ProfilePageProps {
  params: {
    id: string;
  };
}

export default async function ProfilePage({
  params,
}: ProfilePageProps) {
  const { id } = params;

  
  if (id === "me") {
    const user = await getAuthUser();

    if (!user) {
      redirect("/login");
    }

    redirect(`/profile/${user.id}`);
  }

  const user = await getAuthUser();

  const [fetchedProfile, history] = await Promise.all([
    getProfile(id),
    getRatingHistory(id),
  ]);

  if (!fetchedProfile) {
    if (user?.id === id) {
      redirect("/settings");
    }

    return notFound();
  }

  if (fetchedProfile.is_banned && user?.id !== id) {
    return notFound();
  }

  return (
    <ProfileView
      profile={fetchedProfile}
      history={history}
      isOwn={user?.id === fetchedProfile.id}
      currentUserId={user?.id}
    />
  );
}
