import { AppShell } from "@/components/layout/app-shell";
import { getAppSummary } from "@/lib/api";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const summary = await getAppSummary();

  return (
    <AppShell currentUser={summary.currentUser} currentOrg={summary.organization} unreadNotifications={summary.unreadNotifications}>
      {children}
    </AppShell>
  );
}
