"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Toast = { id: number; title: string; description?: string };

const ToastContext = createContext<{ push: (toast: Omit<Toast, "id">) => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const value = useMemo(
    () => ({
      push: (toast: Omit<Toast, "id">) => {
        const id = Date.now() + Math.floor(Math.random() * 1000);
        setToasts((current) => [...current, { id, ...toast }]);
        window.setTimeout(() => setToasts((current) => current.filter((item) => item.id !== id)), 3200);
      },
    }),
    [],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex w-[min(92vw,22rem)] flex-col gap-3">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto rounded-3xl border border-border bg-background p-4 shadow-2xl">
            <div className="text-sm font-semibold text-foreground">{toast.title}</div>
            {toast.description ? <div className="mt-1 text-sm leading-6 text-muted-foreground">{toast.description}</div> : null}
            <Button className="mt-3" size="sm" variant="secondary" onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))}>
              Dismiss
            </Button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastPill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={cn("inline-flex items-center rounded-full bg-surface px-2.5 py-1 text-xs font-semibold text-foreground ring-1 ring-border", className)}>{children}</span>;
}
