# Architecture

MSR Command Center is structured as a monorepo with a clean backend boundary and a Next.js frontend.

## System Overview

```text
Browser -> Next.js Web -> ASP.NET Core API -> Application Services -> Domain Model -> Infrastructure -> PostgreSQL
                                              -> Background Jobs
                                              -> Email / Storage / Export Providers
```

## Backend Layers

### Domain

The domain layer owns the business model and rules:

- organizations and teams
- users, roles, and memberships
- enterprise identity settings, identity providers, external identity links, and integration connections
- boards, columns, cards, collaborators, comments, subtasks, and activity logs
- projects and workstreams
- reporting cycles, MSR drafts, submissions, and finals
- notifications, audit logs, feature flags, and template definitions

The domain layer should stay free of infrastructure concerns. Tenant boundaries, ownership rules, and reporting semantics belong here first.

### Application

The application layer orchestrates use cases:

- authentication and account management
- board and card commands
- report generation and compilation
- dashboard queries
- export jobs
- notification dispatch
- admin workflows

This layer validates input, coordinates repositories, and emits domain events or integration events where appropriate.

### Infrastructure

The infrastructure layer provides implementations for:

- EF Core persistence and migrations
- ASP.NET Core Identity
- JWT or secure cookie session handling
- OIDC, SAML, and directory provisioning adapters
- background jobs
- email
- file storage
- PDF and Word generation
- structured logging and health checks

### API

The API layer exposes versioned REST endpoints, authorization policies, Swagger/OpenAPI, and consistent error responses.

## Frontend Structure

The web app is organized around:

- a public marketing and auth surface
- a responsive authenticated shell
- board and report workflows
- manager and admin views
- reusable accessible UI components

The frontend should prefer server components for static data and client components where interactivity matters, especially for boards, editors, and command-palette actions.

## Multi-Tenant Strategy

Tenant isolation is enforced by:

- an `OrganizationId` foreign key on tenant-scoped records
- authorization checks that bind the current user to an organization
- query filters in EF Core for scoped access
- explicit admin-only overrides for platform support flows

Tenant-aware tables should always include created and updated timestamps, soft delete or archive state where the workflow needs history, and audit trail references for sensitive changes.

## Enterprise Identity And Integrations

Enterprise support is modeled as a first-class tenant capability rather than a login add-on.

- `OrganizationAuthenticationSettings` stores how a tenant authenticates:
  local-only, mixed local plus SSO, or SSO-required
- `OrganizationIdentityProvider` stores per-tenant identity provider configuration for Microsoft Entra ID, Google Workspace, and future SAML providers
- `ExternalIdentityLink` maps internal users to upstream enterprise identities
- `OrganizationIntegrationConnection` stores provider connections for Microsoft 365, Google Workspace, and future collaboration or document systems

This design allows the platform to support:

- Microsoft Entra ID and Google Workspace OIDC sign-in
- future SAML support for regulated and legacy enterprise environments
- SCIM and lifecycle provisioning without redesigning the tenant model
- org-level SSO enforcement, domain verification, and group or role mapping
- downstream integrations for Outlook, Teams, Google Drive, Gmail, Calendar, and similar services

The intended rollout order is:

1. tenant auth settings and provider configuration
2. Microsoft and Google OIDC sign-in
3. external identity linking and org SSO enforcement
4. SCIM or directory provisioning
5. productivity integrations and event sync

## Reporting Model

The reporting engine uses deterministic rules first:

- collect cycle-scoped card activity
- separate owned work from collaborative contributions
- group work by project or workstream
- identify accomplishments, current work, blockers, and upcoming priorities
- produce user-editable drafts before submission

This keeps the system explainable and ready for future AI-assisted summarization behind an interface.

## Operational Concerns

The production design includes:

- correlation IDs for requests
- structured logging
- health endpoints
- background retry patterns for jobs
- export generation outside the request thread where possible
- explicit audit logging for permission-sensitive actions
