import { NextResponse } from "next/server";
import { searchProfiles } from "@/services/profile.service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ profiles: [] });
  }

  const profiles = await searchProfiles(q);
  return NextResponse.json({ profiles });
}
