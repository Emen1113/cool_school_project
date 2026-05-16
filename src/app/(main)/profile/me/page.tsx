import { redirect } from "next/navigation";
import { ProfileView } from "@/components/profile/profile-view";
import { getAuthUser } from "@/lib/auth";
import { getCurrentProfile, getRatingHistory } from "@/services/profile.service";

export default async function MyProfilePage() {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const [fetchedProfile, history] = await Promise.all([
    getCurrentProfile(),
    getRatingHistory(user.id),
  ]);

  if (!fetchedProfile) {
    return redirect("/settings");
  }

  const profile = fetchedProfile;

  return (
    <ProfileView
      profile={profile}
      history={history}
      isOwn
      currentUserId={user.id}
    />
  );
}
