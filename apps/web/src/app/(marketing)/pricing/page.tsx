import Link from "next/link";
import { PublicFooter } from "@/components/layout/public-footer";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

const plans = [
  {
    name: "Starter",
    price: "$12",
    detail: "For small teams proving the workflow",
    features: ["Personal boards", "Basic MSR drafts", "Email reminders"],
  },
  {
    name: "Growth",
    price: "$28",
    detail: "For managers running active teams",
    features: ["Team board aggregation", "Exports", "Reporting cycles", "Templates"],
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    detail: "For multi-tenant organizations with controls",
    features: ["Audit logs", "Platform admin", "Feature flags", "Security reviews"],
  },
];

export default function PricingPage() {
  return (
    <main>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted">
            <span aria-hidden="true">←</span>
            Back to home
          </Link>
          <ButtonLink href="/login" variant="secondary">
            Log in
          </ButtonLink>
        </div>
        <div className="mt-8 space-y-4 text-center">
          <Badge variant="accent">Pricing</Badge>
          <h1 className="text-4xl font-semibold tracking-tight">Simple plans that scale with your organization</h1>
          <p className="mx-auto max-w-3xl text-base leading-7 text-muted-foreground">
            FlowForge supports lean teams and enterprise rollouts alike, including Google Workspace and Microsoft integration paths for organizations that need identity, directory sync, export, and notification alignment from day one.
          </p>
        </div>
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.name} className={plan.featured ? "ring-2 ring-accent/30" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold">{plan.name}</h2>
                  {plan.featured ? <Badge variant="accent">Most popular</Badge> : null}
                </div>
              </CardHeader>
              <CardBody className="space-y-5">
                <div>
                  <p className="text-4xl font-semibold tracking-tight">{plan.price}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.detail}</p>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <span className="inline-flex h-2 w-2 rounded-full bg-accent" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <ButtonLink href="/register" variant={plan.featured ? "primary" : "secondary"} className="w-full">
                  Start with {plan.name}
                </ButtonLink>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
      <PublicFooter />
    </main>
  );
}
