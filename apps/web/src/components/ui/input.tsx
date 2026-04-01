import { cn } from "@/lib/utils";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

const base =
  "w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground shadow-sm backdrop-blur-md transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(base, className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(base, "min-h-32 resize-y", className)} {...props} />;
}
