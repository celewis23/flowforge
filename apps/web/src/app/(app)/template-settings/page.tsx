import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PageShell } from "@/components/layout/page-shell";
import { getAdminData } from "@/lib/api";

export default async function TemplateSettingsPage() {
  const data = await getAdminData();

  return (
    <PageShell eyebrow="Template Settings" title="MSR templates and board defaults" description="Control required sections, prompts, and branding for exports.">
      <div className="grid gap-4 lg:grid-cols-2">
        {data.templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">{template.name}</h2>
                <Badge variant="accent">{template.cadence}</Badge>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              <p className="text-sm text-muted-foreground">{template.branding}</p>
              <div className="space-y-2 text-sm text-muted-foreground">
                {template.requiredSections.map((section: string) => (
                  <div key={section} className="rounded-2xl border border-border bg-surface px-4 py-3">
                    {section}
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
