import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function BrandLogo({
  inverse = false,
  iconOnly = false,
  stacked = false,
  sidebarLockup = false,
  hero = false,
  className,
}: {
  inverse?: boolean;
  iconOnly?: boolean;
  stacked?: boolean;
  sidebarLockup?: boolean;
  hero?: boolean;
  className?: string;
}) {
  const iconHeightClass = hero ? "h-[96px] w-[72px]" : "h-[34px] w-[26px]";
  const iconWidth = hero ? 72 : 26;
  const iconHeight = hero ? 96 : 34;

  return (
    <Link href="/" className={cn("inline-flex min-w-0 items-center gap-2.5", stacked && "items-start", hero && "gap-4", className)}>
      <div
        className={cn(
          "grid shrink-0 place-items-center overflow-hidden",
          iconHeightClass,
        )}
      >
        <Image
          src="/flowforge-homeLogo.png"
          alt="FlowForge"
          width={iconWidth}
          height={iconHeight}
          className="max-h-full max-w-full object-contain"
          priority
        />
      </div>
      {iconOnly ? null : <div className={cn("min-w-0", hero ? "space-y-1" : sidebarLockup ? "space-y-0" : stacked ? "space-y-1.5" : "leading-none")}>
        <div
          className={cn(
            "truncate font-semibold tracking-tight",
            hero ? "text-[2.8rem] leading-[0.92]" : sidebarLockup ? "text-[0.94rem] leading-[1.02]" : "text-[0.98rem]",
            inverse ? "text-white" : "text-foreground",
          )}
        >
          FLOWFORGE
        </div>
        <div
          className={cn(
            hero ? "text-[1.28rem] leading-[1.12]" : sidebarLockup ? "text-[0.76rem] leading-[1.05]" : "text-[0.72rem]",
            inverse ? "text-white/72" : "text-muted-foreground",
          )}
        >
          Workforce Clarity. Forged.
        </div>
      </div>}
    </Link>
  );
}
