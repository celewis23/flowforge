import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function BrandLogo({
  compact = false,
  inverse = false,
  iconOnly = false,
  stacked = false,
  sidebarLockup = false,
  className,
}: {
  compact?: boolean;
  inverse?: boolean;
  iconOnly?: boolean;
  stacked?: boolean;
  sidebarLockup?: boolean;
  className?: string;
}) {
  const iconSize = iconOnly ? (compact ? 26 : 30) : sidebarLockup ? 42 : compact ? 30 : 36;

  return (
    <Link href="/" className={cn("inline-flex min-w-0 items-center", sidebarLockup ? "gap-2.5" : "gap-3", stacked && "items-start", className)}>
      <div
        className={cn(
          "grid shrink-0 place-items-center overflow-hidden",
          iconOnly ? "h-8 w-8" : sidebarLockup ? "h-11 w-11" : compact ? "h-8 w-8" : "h-10 w-10",
        )}
      >
        <Image
          src="/flowforge-icon.png"
          alt="FlowForge"
          width={iconSize}
          height={iconSize}
          className="max-h-full max-w-full object-contain"
          priority
        />
      </div>
      {iconOnly ? null : <div className={cn("min-w-0", sidebarLockup ? "space-y-0.5" : stacked ? "space-y-1.5" : "leading-none")}>
        <div
          className={cn(
            "truncate font-semibold tracking-tight",
            sidebarLockup ? "text-[0.88rem] leading-none" : "text-[0.98rem]",
            inverse ? "text-white" : "text-foreground",
          )}
        >
          FLOWFORGE
        </div>
        <div
          className={cn(
            sidebarLockup ? "text-[0.76rem] leading-none" : "text-[0.72rem]",
            inverse ? "text-white/72" : "text-muted-foreground",
          )}
        >
          Workforce Clarity. Forged.
        </div>
      </div>}
    </Link>
  );
}
