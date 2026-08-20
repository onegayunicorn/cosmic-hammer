import {
  ControlApiError,
  normalizeDeploymentStatus,
  type DeploymentStatusSnapshot,
} from "./contracts";

export interface ReadOnlyControlApiAdapter {
  readonly mode: "remote" | "fixture";
  getDeploymentStatus(projectId: string): Promise<DeploymentStatusSnapshot>;
}

export interface ReadOnlyAdapterOptions {
  baseUrl?: string;
  getBearerToken?: () => string | undefined;
  fetchImpl?: typeof fetch;
  fixture?: DeploymentStatusSnapshot;
  timeoutMs?: number;
}

const defaultFixture: DeploymentStatusSnapshot = {
  projectId: "sovereign-saas",
  repository: "onegayunicorn/sovereign-saas",
  buildStatus: "passed",
  smokeTestStatus: "passed",
  deploymentStatus: "registered",
  activationStatus: "disabled",
  approvalStatus: "pending",
  rollbackStatus: "not_requested",
  activationRequested: false,
  serverEnforced: true,
  health: {
    status: "sandbox",
    detail: "Fixture data; no production traffic or activation is implied.",
  },
  auditEventCount: 0,
  observedAt: "2026-08-21T00:00:00.000Z",
};

function classifyStatus(status: number): ControlApiError["kind"] {
  if (status === 401) return "authentication";
  if (status === 403) return "authorization";
  if (status === 404) return "not_found";
  return status >= 500 ? "server" : "invalid";
}

export function createReadOnlyControlApiAdapter(
  options: ReadOnlyAdapterOptions = {}
): ReadOnlyControlApiAdapter {
  const baseUrl = options.baseUrl?.replace(/\/$/, "");
  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? 8000;
  if (!baseUrl)
    return createStaticFixtureAdapter(options.fixture ?? defaultFixture);

  return {
    mode: "remote",
    async getDeploymentStatus(projectId) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const token = options.getBearerToken?.();
        const response = await fetchImpl(
          `${baseUrl}/api/deployments/status/${encodeURIComponent(projectId)}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            signal: controller.signal,
          }
        );
        if (!response.ok)
          throw new ControlApiError(
            classifyStatus(response.status),
            `Control API request failed with HTTP ${response.status}`,
            response.status
          );
        return normalizeDeploymentStatus(await response.json());
      } catch (error) {
        if (error instanceof ControlApiError) throw error;
        if (error instanceof DOMException && error.name === "AbortError")
          throw new ControlApiError("timeout", "Control API request timed out");
        throw new ControlApiError("unavailable", "Control API is unavailable");
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}

export function createStaticFixtureAdapter(
  fixture: DeploymentStatusSnapshot = defaultFixture
): ReadOnlyControlApiAdapter {
  const snapshot = normalizeDeploymentStatus(fixture);
  return {
    mode: "fixture",
    async getDeploymentStatus(projectId) {
      return { ...snapshot, projectId };
    },
  };
}

export function createControlCenterAdapter(
  options: ReadOnlyAdapterOptions = {}
): ReadOnlyControlApiAdapter {
  return createReadOnlyControlApiAdapter(options);
}
