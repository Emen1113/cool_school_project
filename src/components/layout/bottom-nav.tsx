"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Flame, Home, Search, Trophy, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/vote", label: "Vote", icon: Home },
  { href: "/leaderboards", label: "Ranks", icon: Trophy },
  { href: "/feed", label: "Feed", icon: Flame },
  { href: "/search", label: "Search", icon: Search },
  { href: "/profile/me", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/60 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur-2xl md:hidden">
      <motion.div className="mx-auto flex max-w-lg items-center justify-around">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href === "/profile/me" && pathname.startsWith("/profile"));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 px-3 py-2 text-[10px] font-medium transition-colors",
                active ? "text-violet-400" : "text-white/50"
              )}
            >
              {active && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-xl bg-violet-500/15"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className="relative z-10 h-5 w-5" />
              <span className="relative z-10">{label}</span>
            </Link>
          );
        })}
      </motion.div>
    </nav>
  );
}
