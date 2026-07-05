# AetherFlow Enterprise Frontend

AetherFlow Enterprise is a distributed job scheduling platform built around the core execution lifecycle:

- Dashboard
- Projects
- Queues
- Jobs
- Workers
- Executions
- Retry Management
- Dead Letter Queue
- Analytics
- System Health

The product keeps enterprise-grade capabilities such as AI assistance, notifications, workflow tooling, plugins, and auditability, but those features are intentionally secondary to the scheduler control plane.

## Simplified Roles

- Administrator: full platform access
- Operator: operational access to scheduler workflows
- Viewer: read-only access to dashboards and reporting

## Authentication

The frontend supports:

- JWT authentication
- Supabase Auth integration
- Remember Me
- Password reset
- Session logout

## Primary User Flow

After login, the primary navigation emphasizes:

1. Dashboard
2. Projects
3. Queues
4. Jobs
5. Workers

Advanced enterprise features remain available in the secondary navigation.
