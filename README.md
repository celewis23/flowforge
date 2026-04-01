# MSR Command Center

MSR Command Center is a multi-tenant SaaS platform for personal kanban boards, manager-assigned work, monthly status reports, team MSR compilation, dashboards, exports, notifications, and auditability.

## Repository Layout

- `apps/api` - ASP.NET Core Web API, domain model, application services, infrastructure, and tests.
- `apps/web` - Next.js App Router frontend with Tailwind CSS.
- `docs` - Architecture, API, deployment, and roadmap documentation.
- `docker` - Local container and compose assets.

## Quick Start

1. Install the prerequisites:
   - Node.js 22+
   - .NET 8 SDK
   - Docker Desktop if you want the container workflow
2. Copy `.env.example` to `.env` and update the secrets.
3. Restore and run the API.
4. Install and run the web app.

Example local commands:

```powershell
dotnet restore .\MsrCommandCenter.sln
dotnet run --project .\apps\api\src\Msr.CommandCenter.Api\Msr.CommandCenter.Api\Msr.CommandCenter.Api.csproj
cd .\apps\web
npm install
npm run dev
```

## Local Environment

The root `.env.example` captures the common application settings. Use it as the source of truth for:

- PostgreSQL connection settings
- JWT and cookie/session configuration
- frontend API base URL
- SMTP defaults
- file storage root

## Container Workflow

Use the compose file in `docker/docker-compose.yml` for a local stack with PostgreSQL, the API, and the web frontend.

```powershell
docker compose -f .\docker\docker-compose.yml up --build
```

## Documentation

- [Architecture](docs/architecture.md)
- [API](docs/api.md)
- [Deployment](docs/deployment.md)
- [Roadmap](docs/roadmap.md)

## Product Scope

The platform is designed to support:

- personal kanban boards for every team member
- manager assignments and collaborative work
- reporting cycles and MSR generation
- team MSR compilation and approval
- dashboards, notifications, exports, and audit logging
- multi-tenant organization isolation with role-based access control

## Security And Ops

The application is intended to support:

- secure authentication and authorization
- audit logging for sensitive actions
- tenant-aware data access
- health checks and structured logging
- background jobs for reminders and report generation
- PDF, Word, and CSV export paths

