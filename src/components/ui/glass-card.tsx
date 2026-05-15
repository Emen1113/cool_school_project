"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  glow?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function GlassCard({ className, glow = false, children }: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-2xl",
        glow && "shadow-lg shadow-violet-500/10",
        className
      )}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
