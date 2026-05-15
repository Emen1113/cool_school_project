"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ProfileAvatarProps {
  avatarUrl?: string | null;
  firstName: string;
  lastName: string;
  size?: "sm" | "md" | "lg" | "xl";
  isOnline?: boolean;
  className?: string;
}

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-20 w-20 text-lg",
  xl: "h-32 w-32 text-2xl",
};

export function ProfileAvatar({
  avatarUrl,
  firstName,
  lastName,
  size = "md",
  isOnline,
  className,
}: ProfileAvatarProps) {
  return (
    <div className={cn("relative inline-block", className)}>
      <Avatar className={sizeMap[size]}>
        {avatarUrl && <AvatarImage src={avatarUrl} alt={getInitials(firstName, lastName)} />}
        <AvatarFallback>{getInitials(firstName, lastName)}</AvatarFallback>
      </Avatar>
      {isOnline && (
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#050508] bg-emerald-500" />
      )}
    </div>
  );
}
