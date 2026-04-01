import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { PageShell } from "@/components/layout/page-shell";
import { getNotificationsData } from "@/lib/mock-api";
import { formatDateTime } from "@/lib/utils";

export default async function NotificationsPage() {
  const data = await getNotificationsData();

  return (
    <PageShell eyebrow="Notifications" title="Assignment, reminder, and review notifications" description="Keep the team moving with in-app and email-ready signals.">
      <div className="space-y-3">
        {data.notifications.map((notification) => (
          <Card key={notification.id}>
            <CardBody className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant={notification.read ? "neutral" : "accent"}>{notification.kind}</Badge>
                  {!notification.read ? <Badge variant="warning">Unread</Badge> : null}
                </div>
                <h2 className="mt-2 text-lg font-semibold">{notification.title}</h2>
                <p className="text-sm text-muted-foreground">{notification.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(notification.createdAt)}</p>
              </div>
              <Link href={notification.href} className="text-sm font-medium text-accent">
                Open related view
              </Link>
            </CardBody>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
