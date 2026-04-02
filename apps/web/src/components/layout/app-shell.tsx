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
import { appNavAreas } from "@/lib/navigation";
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
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  const activeArea = useMemo(
    () => appNavAreas.find((area) => area.items.some((item) => item.href === pathname)) ?? appNavAreas[0],
    [pathname],
  );
  const railItems = appNavAreas;
  const topTabs = activeArea.items;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className={cn("mx-auto grid min-h-screen max-w-[1680px] gap-4 p-3 lg:p-3", sidebarExpanded ? "lg:grid-cols-[18rem_1fr]" : "lg:grid-cols-[4.5rem_1fr]")}>
        <aside className={cn("relative hidden rounded-[0.7rem] border border-border bg-surface px-2 py-3 shadow-soft transition-[width,padding] duration-200 lg:block", sidebarExpanded && "px-3")}>
          <div className={cn("flex h-full flex-col gap-5", sidebarExpanded ? "items-stretch" : "items-center")}>
            <div className={cn("flex", sidebarExpanded ? "items-center rounded-[0.7rem] border border-border bg-surface-2 px-3 py-3" : "flex-col items-center gap-3")}>
              {sidebarExpanded ? (
                <BrandLogo sidebarLockup className="min-w-0 flex-1 overflow-hidden" />
              ) : (
                <div className="grid h-11 w-11 place-items-center rounded-[0.7rem] border border-border bg-surface-2">
                  <BrandLogo iconOnly className="justify-center" />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setSidebarExpanded((value) => !value)}
              className={cn(
                "absolute top-[5.65rem] z-20 hidden h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-border bg-surface-2 text-muted-foreground shadow-[0_8px_18px_rgba(16,44,88,0.12)] transition hover:bg-muted hover:text-foreground lg:grid",
                sidebarExpanded ? "-right-4" : "-right-4",
              )}
              aria-label={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
              title={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
            >
              <ChevronDoubleIcon expanded={sidebarExpanded} />
            </button>
            <nav className={cn("flex flex-1 flex-col gap-2", sidebarExpanded ? "items-stretch" : "items-center")}>
              {railItems.map((item) => {
                const active = activeArea.id === item.id;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.label}
                    className={cn(
                      "group rounded-[0.7rem] border transition",
                      sidebarExpanded
                        ? "flex items-center gap-3 px-3 py-3"
                        : "grid h-11 w-11 place-items-center",
                      active ? "border-accent bg-accent/8 text-accent" : "border-transparent text-muted-foreground hover:border-border hover:bg-muted",
                    )}
                  >
                    <RailIcon areaId={item.id} active={active} />
                    {sidebarExpanded ? (
                      <div className="min-w-0">
                        <span className="block truncate text-sm font-medium">{item.label}</span>
                        <span className="block truncate text-[11px] uppercase tracking-[0.18em] text-muted-foreground/90">
                          {item.items.length} views
                        </span>
                      </div>
                    ) : null}
                  </Link>
                );
              })}
            </nav>
            <div className={cn("grid gap-2", sidebarExpanded ? "items-stretch" : "items-center")}>
              <Link
                href="/notifications"
                className={cn(
                  "rounded-[0.7rem] border border-transparent text-muted-foreground transition hover:border-border hover:bg-muted",
                  sidebarExpanded ? "flex items-center gap-3 px-3 py-3" : "grid h-11 w-11 place-items-center",
                )}
              >
                <span className="relative">
                  <BellIcon />
                  {unreadNotifications > 0 ? <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-accent-2" /> : null}
                </span>
                {sidebarExpanded ? <span className="text-sm font-medium">Notifications</span> : null}
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
                  <BrandLogo className="lg:hidden" />
                  <div className="hidden lg:block">
                    <p className="text-sm font-semibold">{currentOrg.name}</p>
                    <p className="text-xs text-muted-foreground">{activeArea.label} area</p>
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
                <span className="mr-1 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  {activeArea.label}
                </span>
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
                {appNavAreas.map((area) => (
                  <div key={area.id} className="space-y-1">
                    <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      {area.label}
                    </p>
                    {area.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "block rounded-lg px-3 py-2 text-sm font-medium",
                          pathname === item.href ? "bg-accent text-white" : "text-foreground hover:bg-muted",
                        )}
                        onClick={() => setMobileOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          <main className="flex-1 px-0 py-4 sm:px-0 lg:px-0">
            <div className="w-full">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

function RailIcon({ areaId, active }: { areaId: string; active: boolean }) {
  const tone = active ? "currentColor" : "currentColor";

  switch (areaId) {
    case "overview":
      return (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
          <path d="M4 12.75 12 5l8 7.75V20a1 1 0 0 1-1 1h-4.75v-5.5h-4.5V21H5a1 1 0 0 1-1-1v-7.25Z" stroke={tone} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "work":
      return (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
          <path d="M8 4v3m8-3v3M4 10h16M7 20h10a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H7A2 2 0 0 0 5 8v10a2 2 0 0 0 2 2Z" stroke={tone} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 14h6" stroke={tone} strokeWidth="1.9" strokeLinecap="round" />
        </svg>
      );
    case "reports":
      return (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
          <path d="M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" stroke={tone} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 3v5h5M9 13h6M9 17h6M9 9h2" stroke={tone} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "admin":
      return (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
          <path d="M12 4.75 18 8v8l-6 3.25L6 16V8l6-3.25Z" stroke={tone} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 9.25a2.75 2.75 0 1 0 0 5.5 2.75 2.75 0 0 0 0-5.5Z" stroke={tone} strokeWidth="1.9" />
        </svg>
      );
    case "platform":
      return (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
          <path d="M12 3 4.5 7v10L12 21l7.5-4V7L12 3Z" stroke={tone} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 12 19.5 7M12 12 4.5 7M12 12v9" stroke={tone} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="8" stroke={tone} strokeWidth="1.9" />
        </svg>
      );
  }
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 1 0-14 0v5l-2 2v1h18v-1l-2-2Z" fill="currentColor" />
    </svg>
  );
}

function ChevronDoubleIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={cn("transition-transform", !expanded && "rotate-180")}>
      <path d="m14 7-5 5 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m19 7-5 5 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
