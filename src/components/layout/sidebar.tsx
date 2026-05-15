"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Flame,
  Home,
  Search,
  Settings,
  Shield,
  Trophy,
  User,
} from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const links = [
  { href: "/vote", label: "Vote", icon: Home },
  { href: "/leaderboards", label: "Leaderboards", icon: Trophy },
  { href: "/feed", label: "Activity", icon: Flame },
  { href: "/search", label: "Search", icon: Search },
  { href: "/profile/me", label: "My Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  isAdmin?: boolean;
}

export function Sidebar({ isAdmin }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-white/10 md:bg-black/40 md:backdrop-blur-2xl">
      <div className="flex h-16 items-center gap-2 border-b border-white/10 px-6">
        <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-xl font-black text-transparent">
          {APP_NAME}
        </span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-4">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/profile/me" && pathname.startsWith(href)) ||
            (href === "/profile/me" && pathname === "/profile/me");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                active
                  ? "bg-gradient-to-r from-violet-600/30 to-fuchsia-600/30 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
        {isAdmin && (
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
              pathname.startsWith("/admin")
                ? "bg-gradient-to-r from-amber-600/30 to-orange-600/30 text-white"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            )}
          >
            <Shield className="h-5 w-5" />
            Admin
          </Link>
        )}
      </nav>
      <div className="border-t border-white/10 p-4">
        <SignOutButton />
      </div>
    </aside>
  );
}
