import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function BrandLogo({
  compact = false,
  inverse = false,
  className,
}: {
  compact?: boolean;
  inverse?: boolean;
  className?: string;
}) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-3", className)}>
      <Image src="/flowforge-logo.png" alt="FlowForge" width={compact ? 34 : 42} height={compact ? 34 : 42} className="h-auto w-auto" priority />
      <div className="leading-none">
        <div className={cn("text-[0.95rem] font-semibold tracking-tight", inverse ? "text-white" : "text-foreground")}>FlowForge</div>
        <div className={cn("mt-1 text-[0.66rem] font-medium uppercase tracking-[0.2em]", inverse ? "text-white/72" : "text-muted-foreground")}>Command Center</div>
      </div>
    </Link>
  );
}
