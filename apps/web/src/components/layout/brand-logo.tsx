import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function BrandLogo({
  inverse = false,
  iconOnly = false,
  stacked = false,
  sidebarLockup = false,
  className,
}: {
  inverse?: boolean;
  iconOnly?: boolean;
  stacked?: boolean;
  sidebarLockup?: boolean;
  className?: string;
}) {
  return (
    <Link href="/" className={cn("inline-flex min-w-0 items-center gap-2", stacked && "items-start", className)}>
      <div
        className={cn(
          "grid shrink-0 place-items-center overflow-hidden",
          "h-[34px] w-[26px]",
        )}
      >
        <Image
          src="/flowforge-homeLogo.png"
          alt="FlowForge"
          width={26}
          height={34}
          className="max-h-full max-w-full object-contain"
          priority
        />
      </div>
      {iconOnly ? null : <div className={cn("min-w-0", sidebarLockup ? "space-y-0" : stacked ? "space-y-1.5" : "leading-none")}>
        <div
          className={cn(
            "truncate font-semibold tracking-tight",
            sidebarLockup ? "text-[0.94rem] leading-[1.02]" : "text-[0.98rem]",
            inverse ? "text-white" : "text-foreground",
          )}
        >
          FLOWFORGE
        </div>
        <div
          className={cn(
            sidebarLockup ? "text-[0.76rem] leading-[1.05]" : "text-[0.72rem]",
            inverse ? "text-white/72" : "text-muted-foreground",
          )}
        >
          Workforce Clarity. Forged.
        </div>
      </div>}
    </Link>
  );
}
