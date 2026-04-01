import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function BrandLogo({
  compact = false,
  inverse = false,
  iconOnly = false,
  stacked = false,
  className,
}: {
  compact?: boolean;
  inverse?: boolean;
  iconOnly?: boolean;
  stacked?: boolean;
  className?: string;
}) {
  return (
    <Link href="/" className={cn("inline-flex min-w-0 items-center gap-3", stacked && "items-start", className)}>
      <div className={cn("grid shrink-0 place-items-center", compact ? "h-8 w-8" : "h-10 w-10")}>
        <Image
          src="/flowforge-icon.png"
          alt="FlowForge"
          width={compact ? 32 : 40}
          height={compact ? 32 : 40}
          className="max-h-full max-w-full object-contain"
          priority
        />
      </div>
      {iconOnly ? null : <div className={cn("min-w-0", stacked ? "space-y-1.5" : "leading-none")}>
        <div className={cn("truncate text-[0.98rem] font-semibold tracking-tight", inverse ? "text-white" : "text-foreground")}>FLOWFORGE</div>
        <div className={cn("text-[0.72rem] font-medium", inverse ? "text-white/72" : "text-muted-foreground")}>Workforce Clarity. Forged.</div>
      </div>}
    </Link>
  );
}
