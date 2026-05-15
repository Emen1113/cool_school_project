import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  banUser,
  getAdminStats,
  getAllProfiles,
  getPendingReports,
  resolveReport,
  unbanUser,
} from "@/services/admin.service";
import { isAdmin } from "@/services/admin.service";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const view = searchParams.get("view") ?? "stats";

  if (view === "reports") {
    const reports = await getPendingReports();
    return NextResponse.json({ reports });
  }

  if (view === "users") {
    const profiles = await getAllProfiles();
    return NextResponse.json({ profiles });
  }

  const stats = await getAdminStats();
  return NextResponse.json({ stats });
}

const actionSchema = z.object({
  action: z.enum(["ban", "unban", "resolve_report", "dismiss_report"]),
  userId: z.string().uuid().optional(),
  reportId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = actionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const { action, userId, reportId } = parsed.data;

  if (action === "ban" && userId) {
    const result = await banUser(user.id, userId);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  }

  if (action === "unban" && userId) {
    const result = await unbanUser(user.id, userId);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  }

  if ((action === "resolve_report" || action === "dismiss_report") && reportId) {
    const status = action === "resolve_report" ? "resolved" : "dismissed";
    const result = await resolveReport(user.id, reportId, status);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
