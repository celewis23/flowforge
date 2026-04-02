# Deployment

This repository is designed to run locally in development and be promoted to container-based environments without changing the application code.

## Local Development

1. Copy `.env.example` to `.env`.
2. Start PostgreSQL with the compose file or your preferred local instance.
3. Run the API from `apps/api`.
4. Run the web app from `apps/web`.

## Docker Compose

The `docker/docker-compose.yml` file defines a local stack with:

- PostgreSQL
- the ASP.NET Core API
- the Next.js web app

Use it for developer onboarding and repeatable verification.

## Production Checklist

- Replace all example secrets with managed secrets.
- Point the app at a managed PostgreSQL instance or a stateful service with backups.
- Configure SMTP credentials and sender identities.
- Set public origin values for CORS and callback URLs.
- Set enterprise auth URLs for OIDC callback routing:
  `EnterpriseAuth__ApiBaseUrl`, `EnterpriseAuth__FrontendBaseUrl`, and `NEXT_PUBLIC_APP_BASE_URL`.
- Turn on HTTPS at the edge.
- Verify health checks and logging export to your observability stack.
- Run database migrations during deployment.

## Database Migrations

Treat migrations as versioned delivery artifacts:

- generate migrations from the infrastructure project
- review them before applying
- apply them in the release pipeline or with an operator-controlled job
- keep backups before destructive schema changes

## Background Jobs

Background jobs should be scheduled for:

- due soon reminders
- overdue reminders
- report generation
- cycle closeout
- notification fan-out

Make jobs idempotent and safe to retry.

## Secrets And Configuration

Recommended configuration sources:

- `.env` for local development
- managed secret storage in staging and production
- environment variables for container deployments

Never commit production secrets or database credentials.

For enterprise identity providers, store OIDC client secrets in managed secret storage and reference them through tenant identity-provider configuration rather than hard-coding them in source.

## Observability

Production deployment should expose:

- request correlation IDs
- structured logs
- health checks
- job failure visibility
- export failure visibility

## Rollout Strategy

Use a simple staged approach:

1. Provision data services.
2. Apply migrations.
3. Deploy the API.
4. Deploy the web app.
5. Verify auth, dashboards, and report generation.
