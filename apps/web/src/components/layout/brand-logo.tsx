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
  const iconHeightClass = hero ? "h-[72px] w-[54px] sm:h-[84px] sm:w-[63px] lg:h-[96px] lg:w-[72px]" : "h-[34px] w-[26px]";
  const iconWidth = hero ? 72 : 26;
  const iconHeight = hero ? 96 : 34;

  return (
    <Link href="/" className={cn("inline-flex min-w-0 items-center gap-2.5", stacked && "items-start", hero && "gap-3 sm:gap-4", className)}>
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
      {iconOnly ? null : <div className={cn("min-w-0", hero ? "space-y-0.5 sm:space-y-1" : sidebarLockup ? "space-y-0" : stacked ? "space-y-1.5" : "leading-none")}>
        <div
          className={cn(
            "truncate font-semibold tracking-tight",
            hero ? "text-[2rem] leading-[0.94] sm:text-[2.35rem] lg:text-[2.8rem]" : sidebarLockup ? "text-[0.94rem] leading-[1.02]" : "text-[0.98rem]",
            inverse ? "text-white" : "text-foreground",
          )}
        >
          FLOWFORGE
        </div>
        <div
          className={cn(
            hero ? "text-[0.98rem] leading-[1.12] sm:text-[1.1rem] lg:text-[1.28rem]" : sidebarLockup ? "text-[0.76rem] leading-[1.05]" : "text-[0.72rem]",
            inverse ? "text-white/72" : "text-muted-foreground",
          )}
        >
          Workforce Clarity. Forged.
        </div>
      </div>}
    </Link>
  );
}
