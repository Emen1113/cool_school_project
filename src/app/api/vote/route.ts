import { NextResponse } from "next/server";
import { z } from "zod";
import { checkVoteCooldown, checkVoteRateLimit } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";
import { createClient } from "@/lib/supabase/server";
import { castVote } from "@/services/vote.service";

const voteSchema = z.object({
  winnerId: z.string().uuid(),
  loserId: z.string().uuid(),
  turnstileToken: z.string().optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = voteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { winnerId, loserId, turnstileToken } = parsed.data;

  if (winnerId === loserId) {
    return NextResponse.json({ error: "Invalid matchup" }, { status: 400 });
  }

  if (process.env.TURNSTILE_SECRET_KEY && turnstileToken) {
    const valid = await verifyTurnstile(turnstileToken);
    if (!valid) {
      return NextResponse.json({ error: "Captcha failed" }, { status: 403 });
    }
  }

  const cooldown = checkVoteCooldown(user.id);
  if (!cooldown.allowed) {
    return NextResponse.json(
      { error: "Slow down!", retryAfterMs: cooldown.retryAfterMs },
      { status: 429 }
    );
  }

  const rateLimit = checkVoteRateLimit(user.id);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many votes. Take a break." },
      { status: 429 }
    );
  }

  const result = await castVote(user.id, winnerId, loserId);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    voteId: result.voteId,
    winnerDelta: result.winnerDelta,
  });
}
