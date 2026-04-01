"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { BrandLogo } from "@/components/layout/brand-logo";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { CommandPalette } from "@/components/layout/command-palette";
import { ToastProvider } from "@/components/ui/toast";
import { appNav } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function AppShell({
  children,
  currentUser,
  currentOrg,
  unreadNotifications = 0,
}: {
  children: React.ReactNode;
  currentUser: { name: string; title: string; avatarColor: string; role: string };
  currentOrg: { name: string; plan: string };
  unreadNotifications?: number;
}) {
  return (
    <ToastProvider>
      <AppShellClient currentUser={currentUser} currentOrg={currentOrg} unreadNotifications={unreadNotifications}>
        {children}
      </AppShellClient>
    </ToastProvider>
  );
}

function AppShellClient({
  children,
  currentUser,
  currentOrg,
  unreadNotifications,
}: {
  children: React.ReactNode;
  currentUser: { name: string; title: string; avatarColor: string; role: string };
  currentOrg: { name: string; plan: string };
  unreadNotifications: number;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const grouped = useMemo(() => {
    return appNav.reduce<Record<string, typeof appNav>>((acc, item) => {
      acc[item.group] = acc[item.group] ?? [];
      acc[item.group].push(item);
      return acc;
    }, {});
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid min-h-screen max-w-[1680px] gap-4 p-3 lg:grid-cols-[18rem_1fr] lg:p-4">
        <aside className="hidden rounded-[0.8rem] border border-accent/65 bg-[var(--navy-strong)] px-4 py-5 text-white shadow-soft lg:block">
          <div className="flex h-full flex-col gap-6">
            <BrandLogo compact inverse />
            <div className="rounded-[0.65rem] border border-white/12 bg-white/6 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/72">Workspace</p>
              <div className="flex items-center gap-3">
                <Avatar name={currentUser.name} color={currentUser.avatarColor} />
                <div>
                  <p className="text-sm font-semibold text-white">{currentOrg.name}</p>
                  <p className="text-xs text-white/60">{currentOrg.plan} tenant</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <Badge variant="accent">{currentUser.role}</Badge>
                <Badge variant="neutral">{unreadNotifications} notifications</Badge>
              </div>
            </div>
            <div className="rounded-[0.65rem] border border-white/12 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/72">Operations signal</p>
              <p className="mt-3 text-sm leading-6 text-white/65">
                Boards, reporting cycles, and executive-ready summaries now move through one continuous workflow.
              </p>
            </div>
            <nav className="space-y-6 overflow-y-auto pr-1">
              {Object.entries(grouped).map(([group, items]) => (
                <div key={group} className="space-y-2">
                  <p className="px-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/44">{group}</p>
                  <div className="grid gap-1">
                    {items.map((item) => {
                      const active = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "rounded-lg px-3 py-2.5 text-sm font-medium transition",
                            active
                              ? "bg-white/12 text-white ring-1 ring-white/18"
                              : "text-white/82 hover:bg-white/8",
                          )}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </aside>
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-30 rounded-[0.8rem] border border-accent/45 bg-surface/95 backdrop-blur-md">
            <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
              <div className="flex items-center gap-3">
                <Button variant="secondary" className="lg:hidden" onClick={() => setMobileOpen((value) => !value)}>
                  Menu
                </Button>
                <BrandLogo compact className="lg:hidden" />
                <div className="hidden lg:block">
                  <p className="text-sm font-semibold">{currentOrg.name}</p>
                  <p className="text-xs text-muted-foreground">Team operations</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CommandPalette />
                <ButtonLink href="/notifications" variant="secondary">
                  Inbox {unreadNotifications > 0 ? `(${unreadNotifications})` : ""}
                </ButtonLink>
                <div className="hidden items-center gap-3 rounded-lg border border-border bg-surface-2 px-3 py-2 sm:flex">
                  <Avatar name={currentUser.name} color={currentUser.avatarColor} className="h-8 w-8 rounded-full" />
                  <div className="leading-tight">
                    <div className="text-sm font-semibold">{currentUser.name}</div>
                    <div className="text-xs text-muted-foreground">{currentUser.title}</div>
                  </div>
                </div>
              </div>
            </div>
          </header>
          {mobileOpen ? (
            <div className="border-b border-border bg-surface px-4 py-4 lg:hidden">
              <div className="grid gap-2">
                {appNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm font-medium",
                      pathname === item.href ? "bg-accent text-white" : "text-foreground hover:bg-muted",
                    )}
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
