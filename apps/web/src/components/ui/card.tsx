import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Card({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLElement> & {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("rounded-[2rem] border border-white/10 bg-surface shadow-soft backdrop-blur-xl", className)} {...props}>
      {children}
    </section>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("border-b border-white/10 px-5 py-4 sm:px-6", className)} {...props}>
      {children}
    </div>
  );
}

export function CardBody({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("px-5 py-5 sm:px-6", className)} {...props}>
      {children}
    </div>
  );
}
