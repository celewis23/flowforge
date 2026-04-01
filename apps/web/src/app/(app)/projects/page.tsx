import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PageShell } from "@/components/layout/page-shell";
import { getProjectsData } from "@/lib/mock-api";
import { formatDate } from "@/lib/utils";

export default async function ProjectsPage() {
  const data = await getProjectsData();

  return (
    <PageShell eyebrow="Projects" title="Projects and workstreams" description="See project health, progress, ownership, and the cards that feed each workstream.">
      <div className="grid gap-4 lg:grid-cols-2">
        {data.projects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">{project.name}</h2>
                <Badge variant={project.status === "at risk" ? "danger" : project.status === "watch" ? "warning" : "success"}>{project.status}</Badge>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <p className="text-sm text-muted-foreground">{project.summary}</p>
              <div className="rounded-3xl bg-surface p-4 ring-1 ring-border">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Progress</p>
                  <span className="text-sm text-muted-foreground">{project.progress}%</span>
                </div>
                <div className="mt-3 h-3 rounded-full bg-muted">
                  <div className="h-3 rounded-full bg-accent" style={{ width: `${project.progress}%` }} />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Due {formatDate(project.dueDate)}</p>
            </CardBody>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}

