"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
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
      <div className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[19rem_1fr]">
        <aside className="hidden border-r border-border bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(248,250,252,0.92))] px-4 py-5 lg:block">
          <div className="flex h-full flex-col gap-6">
            <div className="rounded-[1.6rem] border border-border bg-surface p-4 shadow-soft">
              <div className="flex items-center gap-3">
                <Avatar name={currentUser.name} color={currentUser.avatarColor} />
                <div>
                  <p className="text-sm font-semibold">{currentOrg.name}</p>
                  <p className="text-xs text-muted-foreground">{currentOrg.plan} tenant</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <Badge variant="accent">{currentUser.role}</Badge>
                <Badge variant="neutral">{unreadNotifications} notifications</Badge>
              </div>
            </div>
            <nav className="space-y-6 overflow-y-auto pr-1">
              {Object.entries(grouped).map(([group, items]) => (
                <div key={group} className="space-y-2">
                  <p className="px-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{group}</p>
                  <div className="grid gap-1">
                    {items.map((item) => {
                      const active = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "rounded-2xl px-3 py-2.5 text-sm font-medium transition",
                            active ? "bg-foreground text-background shadow-sm" : "text-foreground hover:bg-surface",
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
          <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
              <div className="flex items-center gap-3">
                <Button variant="secondary" className="lg:hidden" onClick={() => setMobileOpen((value) => !value)}>
                  Menu
                </Button>
                <div>
                  <p className="text-sm font-semibold">{currentOrg.name}</p>
                  <p className="text-xs text-muted-foreground">MSR Command Center</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CommandPalette />
                <ButtonLink href="/notifications" variant="secondary">
                  Inbox {unreadNotifications > 0 ? `(${unreadNotifications})` : ""}
                </ButtonLink>
                <div className="hidden items-center gap-3 rounded-full border border-border bg-surface px-3 py-2 sm:flex">
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
                      "rounded-2xl px-3 py-2 text-sm font-medium",
                      pathname === item.href ? "bg-foreground text-background" : "text-foreground hover:bg-background",
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
