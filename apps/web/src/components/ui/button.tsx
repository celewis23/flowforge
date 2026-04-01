import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "subtle";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center rounded-full font-medium transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-[linear-gradient(135deg,var(--color-accent),var(--color-accent-2))] text-slate-950 shadow-[0_16px_40px_rgba(45,212,191,0.25)] hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(96,165,250,0.28)]",
  secondary: "bg-white/6 text-foreground ring-1 ring-white/10 backdrop-blur-md hover:bg-white/10",
  ghost: "bg-transparent text-foreground hover:bg-white/7",
  danger: "bg-danger text-slate-950 shadow-[0_16px_34px_rgba(251,113,133,0.25)] hover:-translate-y-0.5",
  subtle: "bg-accent/12 text-accent hover:bg-accent/18",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-4.5 text-sm",
  lg: "h-12 px-6 text-base",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}

export function ButtonLink({
  className,
  variant = "primary",
  size = "md",
  href,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}) {
  return (
    <Link className={cn(base, variants[variant], sizes[size], className)} href={href} {...props}>
      {children}
    </Link>
  );
}
