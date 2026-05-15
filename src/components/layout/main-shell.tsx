"use client";

import { BottomNav } from "@/components/layout/bottom-nav";
import { Sidebar } from "@/components/layout/sidebar";

interface MainShellProps {
  children: React.ReactNode;
  isAdmin?: boolean;
}

export function MainShell({ children, isAdmin }: MainShellProps) {
  return (
    <div className="flex min-h-dvh">
      <Sidebar isAdmin={isAdmin} />
      <div className="flex flex-1 flex-col">
        <main className="mx-auto w-full max-w-4xl flex-1 overflow-y-auto px-4 py-6 pb-24 md:pb-6">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
