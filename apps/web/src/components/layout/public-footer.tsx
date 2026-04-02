import Link from "next/link";
import { BrandLogo } from "@/components/layout/brand-logo";

const footerLinks = [
  { href: "/", label: "Overview" },
  { href: "/pricing", label: "Pricing" },
  { href: "/login", label: "Log in" },
  { href: "/register", label: "Start trial" },
];

export function PublicFooter() {
  return (
    <footer className="border-t border-border/80 bg-surface/70">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
        <div className="space-y-3">
          <BrandLogo className="w-fit" />
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            FlowForge unifies manager-assigned work, MSR reporting, and enterprise integrations across Google Workspace and Microsoft environments.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-muted-foreground">
          {footerLinks.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
