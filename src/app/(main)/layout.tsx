import { redirect } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { MainShell } from "@/components/layout/main-shell";
import { OnlineStatus } from "@/components/providers/online-status";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/services/admin.service";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const admin = await isAdmin(user.id);

  return (
    <MainShell isAdmin={admin}>
      <OnlineStatus userId={user.id} />
      {children}
    </MainShell>
  );
}
