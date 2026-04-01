"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { BrandLogo } from "@/components/layout/brand-logo";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

  const grouped = useMemo(() => appNav.reduce<Record<string, typeof appNav>>((acc, item) => {
    acc[item.group] = acc[item.group] ?? [];
    acc[item.group].push(item);
    return acc;
  }, {}), []);
  const railItems = [
    grouped.Core?.[0],
    grouped.Core?.[1],
    grouped.Work?.[0],
    grouped.Reports?.[0],
    grouped.Admin?.[0],
  ].filter(Boolean);
  const topTabs = [...(grouped.Core ?? []).slice(0, 3), ...(grouped.Reports ?? []).slice(0, 1)];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid min-h-screen max-w-[1680px] gap-4 p-3 lg:grid-cols-[4.5rem_1fr] lg:p-3">
        <aside className="hidden rounded-[0.7rem] border border-border bg-surface px-2 py-3 shadow-soft lg:block">
          <div className="flex h-full flex-col items-center gap-5">
            <div className="grid h-11 w-11 place-items-center rounded-[0.7rem] border border-border bg-surface-2">
              <BrandLogo compact iconOnly />
            </div>
            <nav className="flex flex-1 flex-col items-center gap-2">
              {railItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.label}
                    className={cn(
                      "group grid h-11 w-11 place-items-center rounded-[0.7rem] border transition",
                      active ? "border-accent bg-accent/8 text-accent" : "border-transparent text-muted-foreground hover:border-border hover:bg-muted",
                    )}
                  >
                    <RailIcon label={item.label} active={active} />
                  </Link>
                );
              })}
            </nav>
            <div className="grid gap-2">
              <Link href="/notifications" className="grid h-11 w-11 place-items-center rounded-[0.7rem] border border-transparent text-muted-foreground transition hover:border-border hover:bg-muted">
                <span className="relative">
                  <BellIcon />
                  {unreadNotifications > 0 ? <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-accent-2" /> : null}
                </span>
              </Link>
            </div>
          </div>
        </aside>
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-30 rounded-[0.7rem] border border-border bg-surface/96 backdrop-blur-md">
            <div className="flex flex-col gap-4 px-4 py-3 sm:px-5">
              <div className="flex items-center justify-between gap-3">
                <Button variant="secondary" className="lg:hidden" onClick={() => setMobileOpen((value) => !value)}>
                  Menu
                </Button>
                <div className="flex items-center gap-3">
                  <BrandLogo compact className="lg:hidden" />
                  <div className="hidden lg:block">
                    <p className="text-sm font-semibold">{currentOrg.name}</p>
                    <p className="text-xs text-muted-foreground">{currentUser.role} workspace</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CommandPalette />
                  <div className="hidden items-center gap-3 rounded-[0.7rem] border border-border bg-surface-2 px-3 py-2 sm:flex">
                    <Badge variant="accent">{currentOrg.plan}</Badge>
                    <Avatar name={currentUser.name} color={currentUser.avatarColor} className="h-8 w-8 rounded-full" />
                    <div className="leading-tight">
                      <div className="text-sm font-semibold">{currentUser.name}</div>
                      <div className="text-xs text-muted-foreground">{currentUser.title}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="hidden items-center gap-2 overflow-x-auto lg:flex">
                {topTabs.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "whitespace-nowrap rounded-[0.65rem] px-3 py-2 text-sm font-medium transition",
                        active ? "bg-accent text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
                <div className="ml-auto flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="rounded-full p-0 h-9 w-9">
                    +
                  </Button>
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
          <main className="flex-1 px-0 py-4 sm:px-0 lg:px-0">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

function RailIcon({ label, active }: { label: string; active: boolean }) {
  const stroke = active ? "currentColor" : "currentColor";

  switch (label) {
    case "Dashboard":
      return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 13h7V4H4v9Zm9 7h7V4h-7v16ZM4 20h7v-5H4v5Z" fill={stroke} /></svg>;
    case "My Board":
      return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 5h14v4H5V5Zm0 5h6v9H5v-9Zm7 0h7v9h-7v-9Z" fill={stroke} /></svg>;
    case "Team Members":
      return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM8 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8 1c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4ZM8 15c-3.33 0-8 1.67-8 5v1h6v-3c0-1.13.58-2.12 1.53-2.93A10.3 10.3 0 0 0 8 15Z" fill={stroke} /></svg>;
    case "My MSRs":
      return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm8 1.5V8h4.5" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 13h8M8 17h8M8 9h2" stroke={stroke} strokeWidth="1.8" strokeLinecap="round"/></svg>;
    default:
      return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 4h16v16H4z" stroke={stroke} strokeWidth="1.8" /></svg>;
  }
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 1 0-14 0v5l-2 2v1h18v-1l-2-2Z" fill="currentColor" />
    </svg>
  );
}
