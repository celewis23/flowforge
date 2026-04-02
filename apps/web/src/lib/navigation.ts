export const marketingNav = [
  { href: "/", label: "Overview" },
  { href: "/pricing", label: "Pricing" },
  { href: "/login", label: "Log in" },
];

export type AppNavItem = {
  href: string;
  label: string;
};

export type AppNavArea = {
  id: "overview" | "work" | "reports" | "admin" | "platform";
  label: string;
  href: string;
  items: AppNavItem[];
};

export const appNavAreas: AppNavArea[] = [
  {
    id: "overview",
    label: "Overview",
    href: "/dashboard",
    items: [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/my-board", label: "My Board" },
      { href: "/team-board", label: "Team Board" },
      { href: "/my-tasks", label: "My Tasks" },
      { href: "/my-activity-log", label: "Activity Log" },
    ],
  },
  {
    id: "work",
    label: "Work",
    href: "/team-members",
    items: [
      { href: "/team-members", label: "Team Members" },
      { href: "/projects", label: "Projects" },
      { href: "/reporting-cycles", label: "Reporting Cycles" },
      { href: "/notifications", label: "Notifications" },
    ],
  },
  {
    id: "reports",
    label: "Reports",
    href: "/my-msrs",
    items: [
      { href: "/my-msrs", label: "My MSRs" },
      { href: "/personal-msr-editor", label: "Personal MSR Editor" },
      { href: "/team-msr-builder", label: "Team MSR Builder" },
      { href: "/reports-archive", label: "Reports Archive" },
    ],
  },
  {
    id: "admin",
    label: "Admin",
    href: "/settings",
    items: [
      { href: "/settings", label: "Settings" },
      { href: "/organization-settings", label: "Organization Settings" },
      { href: "/team-settings", label: "Team Settings" },
      { href: "/template-settings", label: "Template Settings" },
      { href: "/user-management", label: "User Management" },
      { href: "/audit-logs", label: "Audit Logs" },
    ],
  },
  {
    id: "platform",
    label: "Platform",
    href: "/platform-admin",
    items: [{ href: "/platform-admin", label: "Platform Admin" }],
  },
];

export const appNav = appNavAreas.flatMap((area) =>
  area.items.map((item) => ({
    ...item,
    areaId: area.id,
    areaLabel: area.label,
  })),
);
