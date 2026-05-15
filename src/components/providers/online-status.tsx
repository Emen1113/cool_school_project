"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function OnlineStatus({ userId }: { userId: string }) {
  useEffect(() => {
    const supabase = createClient();

    const setOnline = async (online: boolean) => {
      await supabase
        .from("profiles")
        .update({ is_online: online, last_seen_at: new Date().toISOString() })
        .eq("id", userId);
    };

    setOnline(true);

    const handleVisibility = () => {
      setOnline(document.visibilityState === "visible");
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      setOnline(false);
    };
  }, [userId]);

  return null;
}
