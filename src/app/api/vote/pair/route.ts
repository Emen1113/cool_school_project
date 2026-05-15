import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getVotePair } from "@/services/vote.service";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pair = await getVotePair(user.id);
  return NextResponse.json({ pair });
}
