import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  description: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <Card>
      <CardBody className="flex flex-col items-start gap-4 py-12">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        {ctaHref && ctaLabel ? <ButtonLink href={ctaHref}>{ctaLabel}</ButtonLink> : null}
      </CardBody>
    </Card>
  );
}
