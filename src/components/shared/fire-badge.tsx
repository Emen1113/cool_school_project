"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FireBadgeProps {
  score: number;
  streak?: number;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

export function FireBadge({
  score,
  streak,
  size = "md",
  animated = true,
}: FireBadgeProps) {
  const displayScore = Math.round(Number(score));
  const isHot = displayScore >= 10;
  const isBlazing = displayScore >= 25;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  return (
    <motion.span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-bold",
        sizeClasses[size],
        isBlazing
          ? "bg-gradient-to-r from-orange-500/30 to-red-500/30 text-orange-300 ring-1 ring-orange-500/50"
          : isHot
            ? "bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/30"
            : "bg-white/10 text-white/70"
      )}
      animate={
        animated && isHot
          ? { scale: [1, 1.05, 1], opacity: [1, 0.9, 1] }
          : undefined
      }
      transition={{ repeat: Infinity, duration: 1.5 }}
    >
      <span className={cn(isBlazing && "animate-pulse")}>🔥</span>
      <span>{displayScore}</span>
      {streak !== undefined && streak > 0 && (
        <span className="text-white/50">· {streak}🔥</span>
      )}
    </motion.span>
  );
}
