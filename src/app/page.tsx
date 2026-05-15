import { redirect } from "next/navigation";
import Link from "next/link";
import { Flame, Trophy, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/vote");

  const features = [
    { icon: Zap, label: "Vote", desc: "Pick winners" },
    { icon: Trophy, label: "Rank", desc: "Climb ELO" },
    { icon: Flame, label: "Trend", desc: "Go viral" },
  ] as const;

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-12">
        <div className="mb-8 text-center">
          <span className="mb-4 inline-block rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold text-violet-300">
            Your school. Your rankings.
          </span>
          <h1 className="bg-gradient-to-br from-white via-violet-200 to-fuchsia-300 bg-clip-text text-5xl font-black tracking-tight text-transparent">
            {APP_NAME}
          </h1>
          <p className="mt-3 text-lg text-white/60">{APP_TAGLINE}</p>
        </div>

        <div className="mb-10 grid grid-cols-3 gap-3">
          {features.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="glass flex flex-col items-center gap-2 rounded-2xl p-4 text-center"
            >
              <Icon className="h-6 w-6 text-violet-400" />
              <span className="text-sm font-bold">{label}</span>
              <span className="text-[10px] text-white/50">{desc}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <Button asChild size="lg" className="w-full">
            <Link href="/signup">Get started</Link>
          </Button>
          <Button asChild variant="secondary" size="lg" className="w-full">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>

        <p className="mt-8 text-center text-xs text-white/40">
          School email required · Students only
        </p>
      </div>
    </div>
  );
}
