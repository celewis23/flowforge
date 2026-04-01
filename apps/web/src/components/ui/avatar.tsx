import { cn, initials } from "@/lib/utils";

export function Avatar({
  name,
  color = "#0f766e",
  className,
}: {
  name: string;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-semibold text-white ring-2 ring-background",
        className,
      )}
      style={{ backgroundColor: color }}
      aria-label={name}
    >
      {initials(name)}
    </span>
  );
}
