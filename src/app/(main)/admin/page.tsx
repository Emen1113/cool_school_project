import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { getAdminStats, getAllProfiles, getPendingReports } from "@/services/admin.service";

export default async function AdminPage() {
  const [stats, reports, profiles] = await Promise.all([
    getAdminStats(),
    getPendingReports(),
    getAllProfiles(50),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-black text-white">Admin</h1>
        <p className="text-sm text-white/50">Moderation & analytics</p>
      </header>
      <AdminDashboard stats={stats} reports={reports} profiles={profiles} />
    </div>
  );
}
