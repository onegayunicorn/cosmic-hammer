# Sovereign SaaS ↔ ONENESS Control Center Integration

**Status:** Read-only control-plane integration prepared. Activation, deployment execution, rollback execution, credential access, and production launch remain intentionally disabled in this project.

**Repository:** [onegayunicorn/cosmic-hammer](https://github.com/onegayunicorn/cosmic-hammer)

## Executive overview

Cosmic Hammer now contains a provider-neutral integration boundary for presenting Sovereign SaaS deployment state inside an ONENESS-style Control Center. Sovereign SaaS remains the authority for authentication, project ownership, deployment records, approval state, rollback state, audit events, build orchestration, health checks, and future activation execution. The Cosmic Hammer Control Center owns presentation, normalized status display, responsive interaction, and explicit read-only error states.

The integration separates **visibility from authority**. The browser may display a deployment status, approval state, rollback state, health summary, audit count, and observation timestamp. It cannot approve activation, activate a deployment, enqueue a build, deploy, access credentials, request or execute rollback, or mutate project state. A public repository, successful build, or smoke test is not evidence that Sovereign SaaS is activated or serving production traffic.

## Architecture and data flow

```text
Authenticated operator
        |
        v
Cosmic Hammer / ONENESS Control Center
        |
        | GET /api/deployments/status/:projectId
        | Bearer session token; read-only
        v
Sovereign SaaS control API
        |
        +--> authentication middleware
        +--> project ownership and role checks
        +--> deployment and governance persistence
        +--> normalized response
        +--> immutable audit-event summary
```

The runtime dependency direction is one-way: the Control Center reads from a server-side control API. The server does not depend on browser state, UI controls, or client-side approval decisions.

The adapter selects its source at startup. When `VITE_CONTROL_API_URL` is configured, `createReadOnlyControlApiAdapter()` calls the authenticated remote endpoint. When the value is absent, `createStaticFixtureAdapter()` supplies deterministic local-development data. Fixture data is explicitly marked as sandbox state and must be disabled in staging and production configuration.

## Repository responsibilities

| Surface                    | Responsibility                                                                                                                                       | Must not do                                                       |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Sovereign SaaS backend     | Authentication, ownership checks, deployment records, governance transitions, audit events, build orchestration, health checks, and future execution | Trust browser state or execute an unapproved deployment           |
| Sovereign SaaS persistence | Store deployment and governance state, migration history, and immutable audit records                                                                | Store secrets in audit metadata or use destructive schema changes |
| Control Center adapter     | Authenticate read-only status requests, normalize responses, classify errors, and preserve stable view contracts                                     | Approve, activate, deploy, access credentials, or retry mutations |
| Control Center UI          | Present status, health, approval, rollback, audit, filtering, and sharing state                                                                      | Enforce authorization or expose credentials                       |
| Configuration              | Declare API path, fixture policy, browser capabilities, and default-deny safety flags                                                                | Treat metadata as deployment authorization                        |

## Read-only API contract

### Endpoint

```text
GET /api/deployments/status/:projectId
```

The endpoint requires a valid Bearer JWT accepted by the Sovereign SaaS authentication middleware. Ordinary users are limited by project ownership. `ADMIN` and `OWNER` roles may inspect projects according to server policy. The endpoint is read-only and must not create deployments, approve gates, enqueue builds, request rollbacks, approve rollbacks, or mutate project state.

### Request example

```bash
curl --fail-with-body \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $READONLY_CONTROL_API_TOKEN" \
  "$READONLY_CONTROL_API_URL/api/deployments/status/sovereign-saas"
```

The Control Center adapter sends `GET`, `Accept: application/json`, and an Authorization header only when the application session boundary supplies a token. It never accepts a token from a browser text field or committed configuration file.

### Normalized response

The adapter normalizes the response into `DeploymentStatusSnapshot` in `integrations/sovereign-control/contracts.ts`:

| Field                 | Meaning                                                           |
| --------------------- | ----------------------------------------------------------------- |
| `projectId`           | Stable external project identifier                                |
| `repository`          | Repository provenance                                             |
| `buildStatus`         | Known build result                                                |
| `smokeTestStatus`     | Known smoke-test result                                           |
| `deploymentStatus`    | Server-defined registered, published, failed, or equivalent state |
| `activationStatus`    | Explicit runtime activation state                                 |
| `approvalStatus`      | Persisted activation approval state                               |
| `rollbackStatus`      | Persisted rollback request and approval state                     |
| `activationRequested` | Whether activation has been requested server-side                 |
| `serverEnforced`      | Whether governance is enforced by the backend                     |
| `health`              | Read-only health summary                                          |
| `auditEventCount`     | Immutable governance-event count or summary                       |
| `observedAt`          | Server observation timestamp                                      |

Unknown server fields are not passed through to the UI. The normalized schema rejects incomplete or malformed responses. Secret-like fields such as authorization values, private keys, database URLs, webhook secrets, client secrets, and JWT secrets are not part of the contract and are tested as prohibited content.

### Error handling

Non-2xx responses are treated as data-source errors rather than as evidence that a deployment failed. The adapter classifies authentication failure, authorization failure, missing project, server error, timeout, unavailable service, and invalid response separately through `ControlApiError`. Retry behavior belongs in the API client layer and applies only to safe read requests.

## Governance lifecycle

Deployment registration and activation are separate server-side operations. Registration creates a persisted deployment and governance record in `pending` state; it does not enqueue a build or execute a deployment.

| Transition                   | Required authority                                  | Required effect                                             |
| ---------------------------- | --------------------------------------------------- | ----------------------------------------------------------- |
| Register deployment          | Authenticated caller                                | Persist deployment and pending governance record            |
| Approve or reject activation | `ADMIN` or `OWNER`                                  | Persist decision and immutable audit event                  |
| Activate                     | Authenticated caller plus persisted approval        | Enqueue work once and record activation request             |
| Request rollback             | Authorized caller for eligible published deployment | Persist rollback intent and audit event                     |
| Approve rollback             | `ADMIN` or `OWNER`, separate from requester         | Persist approval; do not execute external rollback          |
| Execute rollback             | Separate approved executor                          | Run health-gated provider operation and write audit outcome |

Activation must be rejected when approval is missing, rejected, stale, already requested, or inconsistent with the deployment target. Rollback must be rejected when the deployment is not eligible, approval is absent, separation of duties is violated, or required health checks fail.

The local governance predicates in `integrations/sovereign-control/governance.ts` express these boundaries as pure functions. They do not perform database writes, call external providers, or execute deployment commands.

## Rollback executor boundary

The future server implementation should inject a provider-specific executor rather than selecting one from a browser request:

```ts
interface RollbackExecutor {
  checkHealth(
    context: RollbackExecutionContext
  ): Promise<RollbackHealthCheck[]>;
  execute(context: RollbackExecutionContext): Promise<{ externalId: string }>;
}
```

The executor must validate the target, artifact or version, owning account, environment, authorization context, health checks, and separation of duties. Successful execution must produce an immutable audit event containing identifiers and outcomes without secrets. This repository defines the policy boundary but intentionally provides no default external executor.

## Authentication and secret handling

The Control Center obtains a session token through the application authentication boundary and passes it as a Bearer token to the read-only adapter. Tokens must not be hardcoded, placed in fixture records, committed to source control, placed in the frontend bundle, or written to audit metadata.

Staging and production secrets must be supplied through an approved secret manager. Expected server-only values may include API signing secrets, database connection information, queue credentials, object-storage credentials, domain-provider credentials, Cloudflare credentials, and external integration tokens. None belongs in this repository’s client bundle, Markdown documentation, mock data, or normalized status response.

The checked-in `.env.example` contains empty placeholders only. The `config/sovereign-control.json` file declares `externalWrites: false`, `serverAuthority: true`, read-only browser capabilities, and fixture fallback disabled outside local development.

## Local setup

From the repository root:

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
```

To run the local server and view the Control Center:

```bash
pnpm build
pnpm start
# open http://localhost:3000/control-center
```

Without `VITE_CONTROL_API_URL`, the Control Center uses a deterministic fixture adapter. This is expected for local UI development and is visibly labeled as fixture or sandbox state. To exercise the remote adapter, configure `VITE_CONTROL_API_URL` through the environment and provide the session token through the application authentication boundary.

## Disposable PostgreSQL integration testing

The Cosmic Hammer repository does not own Sovereign SaaS’s Prisma schema or production database. Database integration tests must therefore run in the Sovereign SaaS repository against its documented disposable PostgreSQL profile. The Control Center must never point tests at a production database.

A safe test profile should use an isolated PostgreSQL service on a non-default local port, temporary storage, test-only migrations, and test-only credentials. The read-only test runner should accept the following values only from an untracked environment:

| Variable                         | Purpose                                         |
| -------------------------------- | ----------------------------------------------- |
| `READONLY_API_BASE_URL`          | Running local Sovereign SaaS API base URL       |
| `READONLY_API_TEST_TOKEN`        | Locally issued test JWT                         |
| `READONLY_API_TEST_DATABASE_URL` | Disposable PostgreSQL connection string         |
| `READONLY_API_TEST_PROJECT_ID`   | Project fixture, defaulting to `sovereign-saas` |

When these values are absent, the test should exit successfully with an explicit `SKIP` message. It must never substitute production credentials, production URLs, or an unspecified database.

## Validation matrix

| Command or check                     | Purpose                                                                             | Expected result                                               |
| ------------------------------------ | ----------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `pnpm check`                         | Validate TypeScript across the existing application and integration contracts       | No errors                                                     |
| `pnpm test`                          | Run UI-adjacent server tests, simulation tests, governance tests, and adapter tests | All tests pass                                                |
| `pnpm build`                         | Produce frontend and server artifacts                                               | Successful build; non-blocking chunk warnings may remain      |
| `pnpm verify:production`             | Verify required files, model state, external-write flags, and build output          | `status: verified`                                            |
| `pnpm audit --audit-level high`      | Check high and critical dependency advisories                                       | Exit successfully; low advisories must be reviewed separately |
| Sovereign SaaS governance tests      | Test approval, activation, rollback, role policy, and audit behavior                | Pass                                                          |
| Sovereign SaaS read-only status test | Exercise authenticated status API against disposable local services                 | Pass or explicit safe skip                                    |
| Browser smoke test                   | Confirm route rendering, error distinction, and read-only labels                    | Pass without mutation controls                                |

## Troubleshooting

### The Control Center shows fixture data

Check whether `VITE_CONTROL_API_URL` is configured in the active environment. If it is absent, fixture data is expected. If it is present, inspect the browser network log for the status request and verify that the application session supplies a valid Bearer token. Do not make fixture data appear live by changing labels.

### The API returns `401` or `403`

Confirm that the session is valid, has not expired, and has access to the requested project. Do not weaken server authorization to make the Control Center display data.

### The adapter reports an unavailable or timeout error

Verify the API base URL, local network path, TLS configuration, server health, and timeout budget. A data-source error must remain visibly distinct from a failed deployment state.

### The read-only test skips

A skip means that one or more test-only variables or local services are absent. Start the disposable PostgreSQL service, apply test migrations, start the API with test configuration, issue a local test token, and rerun the read-only test. Never replace missing values with production credentials.

### Activation is rejected

Inspect the persisted governance record. Activation requires an approved, current gate, a valid target, no previous activation request, and server-side authorization. The correct response is to resolve the missing prerequisite, not to bypass the gate in the UI.

### A response fails normalization

Compare the server response to `DeploymentStatusSnapshot`. Add compatible server fields through the adapter normalization layer rather than coupling view components directly to a changing backend response.

## Staging and production prerequisites

Production activation remains blocked until an operator supplies and confirms a named target, owning account, authenticated service credentials through the approved secret manager, environment variables, domain and DNS ownership, database and queue connectivity, health-check procedures, approved rollback target, authorized approver, and separation-of-duties policy.

Before launch, complete authenticated read-only API validation, disposable PostgreSQL integration tests, negative authorization tests, provider health checks, rollback rehearsal, audit review, artifact provenance review, and explicit approval. The production configuration must disable fixture fallback and preserve `externalWrites: false` until a separately reviewed activation change is approved.

A successful Cosmic Hammer build or browser smoke test does not activate Sovereign SaaS, deploy an artifact, approve governance, or serve production traffic.

## Ownership and handoff

| Team or surface           | Owns                                                                                                                                                                    |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sovereign SaaS            | Backend authorization, project ownership, deployment lifecycle, governance persistence, audit integrity, build orchestration, provider execution, and rollback executor |
| ONENESS Control Center    | Normalized read-only adapter, route UX, status presentation, filters, share links, and operator-facing error states                                                     |
| Cosmic Hammer integration | Provider-neutral contracts, local fixture adapter, safety predicates, Control Center surface, and integration documentation                                             |
| Operations                | Secret-manager configuration, deployment target confirmation, health checks, rollback rehearsal, approval records, and production handoff                               |

The handoff package consists of this README, `config/sovereign-control.json`, `integrations/sovereign-control/contracts.ts`, `integrations/sovereign-control/adapter.ts`, `integrations/sovereign-control/governance.ts`, the Control Center route, adapter tests, and the validation matrix above.

## References

[1]: https://github.com/onegayunicorn/sovereign-saas "Sovereign SaaS repository"
[2]: https://github.com/onegayunicorn/oneness-templates "ONENESS Templates repository"
[3]: https://github.com/onegayunicorn/sovereign-repo-decision-matrix "Sovereign Repo Decision Matrix repository"
