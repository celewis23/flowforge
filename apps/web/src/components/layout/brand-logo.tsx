import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function BrandLogo({
  compact = false,
  inverse = false,
  iconOnly = false,
  className,
}: {
  compact?: boolean;
  inverse?: boolean;
  iconOnly?: boolean;
  className?: string;
}) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-3", className)}>
      <Image src="/flowforge-icon.png" alt="FlowForge" width={compact ? 32 : 40} height={compact ? 32 : 40} className="h-auto w-auto" priority />
      {iconOnly ? null : <div className="leading-none">
        <div className={cn("text-[0.95rem] font-semibold tracking-tight", inverse ? "text-white" : "text-foreground")}>FlowForge</div>
        <div className={cn("mt-1 text-[0.66rem] font-medium uppercase tracking-[0.2em]", inverse ? "text-white/72" : "text-muted-foreground")}>Command Center</div>
      </div>}
    </Link>
  );
}
