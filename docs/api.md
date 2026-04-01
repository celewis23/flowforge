# API

The API should be versioned and RESTful with a base path such as `/api/v1`.

## Conventions

- Use DTOs at the boundary.
- Validate every request.
- Return consistent problem details for failures.
- Paginate list endpoints.
- Require tenant-scoped authorization on every protected route.

## Authentication

Typical auth routes:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- `POST /api/v1/auth/verify-email`
- `GET /api/v1/auth/me`

## Organization And Users

- `GET /api/v1/organizations`
- `POST /api/v1/organizations`
- `GET /api/v1/organizations/{id}`
- `PATCH /api/v1/organizations/{id}`
- `GET /api/v1/organizations/{id}/teams`
- `POST /api/v1/organizations/{id}/invitations`
- `GET /api/v1/users`
- `PATCH /api/v1/users/{id}`
- `POST /api/v1/users/{id}/deactivate`
- `POST /api/v1/users/{id}/reactivate`

## Boards And Cards

- `GET /api/v1/boards/me`
- `GET /api/v1/boards/team`
- `GET /api/v1/boards/aggregate`
- `POST /api/v1/cards`
- `GET /api/v1/cards/{id}`
- `PATCH /api/v1/cards/{id}`
- `POST /api/v1/cards/{id}/move`
- `POST /api/v1/cards/{id}/assign`
- `POST /api/v1/cards/{id}/collaborators`
- `POST /api/v1/cards/{id}/comments`
- `POST /api/v1/cards/{id}/subtasks`
- `POST /api/v1/cards/{id}/archive`

## Projects And Reporting

- `GET /api/v1/projects`
- `POST /api/v1/projects`
- `GET /api/v1/reporting-cycles`
- `POST /api/v1/reporting-cycles`
- `GET /api/v1/personal-msrs`
- `POST /api/v1/personal-msrs/generate`
- `PATCH /api/v1/personal-msrs/{id}`
- `POST /api/v1/personal-msrs/{id}/submit`
- `GET /api/v1/team-msrs`
- `POST /api/v1/team-msrs/compile`
- `PATCH /api/v1/team-msrs/{id}`
- `POST /api/v1/team-msrs/{id}/finalize`

## Notifications And Admin

- `GET /api/v1/notifications`
- `POST /api/v1/notifications/{id}/read`
- `GET /api/v1/dashboards/*`
- `GET /api/v1/exports/*`
- `GET /api/v1/audit-logs`
- `GET /api/v1/templates`
- `POST /api/v1/templates`
- `PATCH /api/v1/templates/{id}`

## Error Contract

Standard failure payload:

```json
{
  "type": "https://tools.ietf.org/html/rfc7807",
  "title": "Validation failed",
  "status": 400,
  "traceId": "00-abc123",
  "errors": {
    "title": ["Title is required."]
  }
}
```

## Pagination

List endpoints should accept:

- `page`
- `pageSize`
- `sort`
- `filter`

And return:

```json
{
  "items": [],
  "page": 1,
  "pageSize": 25,
  "totalCount": 0
}
```

## File And Export Behavior

Export endpoints should return either:

- a `202 Accepted` job ticket for long-running generation
- a file download response for already-prepared documents

Prefer explicit status endpoints for asynchronous export jobs.

