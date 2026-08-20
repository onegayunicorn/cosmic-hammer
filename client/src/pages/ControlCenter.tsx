import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  Eye,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import {
  createControlCenterAdapter,
  type ReadOnlyControlApiAdapter,
} from "../../../integrations/sovereign-control/adapter";
import type { DeploymentStatusSnapshot } from "../../../integrations/sovereign-control/contracts";

function StatusCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="instrument-card p-5">
      <div className="mono-label text-[#657985]">{label}</div>
      <div className="mt-4 font-display text-2xl tracking-[-.04em]">
        {value}
      </div>
      {detail && (
        <div className="mt-2 text-xs leading-5 text-[#82979c]">{detail}</div>
      )}
    </div>
  );
}

export default function ControlCenter() {
  const [snapshot, setSnapshot] = useState<DeploymentStatusSnapshot>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const adapter = useMemo<ReadOnlyControlApiAdapter>(
    () =>
      createControlCenterAdapter({
        baseUrl: import.meta.env.VITE_CONTROL_API_URL,
      }),
    []
  );

  const load = async () => {
    setLoading(true);
    setError(undefined);
    try {
      setSnapshot(await adapter.getDeploymentStatus("sovereign-saas"));
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Control API unavailable"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [adapter]);

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <div className="mono-label text-[#f4a261]">10 / CONTROL PLANE</div>
          <h1 className="mt-3 font-display text-4xl tracking-[-.06em] sm:text-5xl">
            Visibility without authority.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#a4b3b2]">
            A governed, read-only view of Sovereign SaaS deployment state. This
            surface can observe status, health, approvals, rollback state, and
            audit summaries; it cannot approve, activate, deploy, access
            credentials, or execute rollback.
          </p>
        </div>
        <button
          className="header-tool"
          onClick={() => void load()}
          disabled={loading}
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />{" "}
          Refresh status
        </button>
      </div>
      <div className="flex flex-wrap gap-3">
        <span className="tag tag-cyan">
          <Eye size={13} /> READ ONLY
        </span>
        <span className="tag tag-apricot">
          <ShieldCheck size={13} /> SERVER ENFORCED
        </span>
        <span className="tag tag-rose">
          <LockKeyhole size={13} /> NO EXTERNAL WRITES
        </span>
      </div>
      {error && (
        <div className="instrument-card flex items-start gap-3 border-[#d98989]/40 p-5 text-sm text-[#f0b1b1]">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <div>
            <strong>Control API unavailable</strong>
            <p className="mt-1 text-xs leading-5 text-[#c29b9b]">
              {error}. The UI does not reinterpret a data-source error as
              deployment failure.
            </p>
          </div>
        </div>
      )}
      {snapshot && (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatusCard
              label="Repository"
              value={snapshot.repository}
              detail={snapshot.projectId}
            />
            <StatusCard
              label="Deployment"
              value={snapshot.deploymentStatus}
              detail={`Build ${snapshot.buildStatus} · smoke ${snapshot.smokeTestStatus}`}
            />
            <StatusCard
              label="Approval"
              value={snapshot.approvalStatus}
              detail={`Activation ${snapshot.activationStatus} · requested ${snapshot.activationRequested ? "yes" : "no"}`}
            />
            <StatusCard
              label="Health"
              value={snapshot.health.status}
              detail={snapshot.health.detail}
            />
          </div>
          <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
            <div className="instrument-card p-6">
              <div className="mono-label text-[#73c9c2]">GOVERNANCE STATE</div>
              <h2 className="mt-4 font-display text-2xl tracking-[-.04em]">
                Mutating decisions stay server-side.
              </h2>
              <div className="mt-6 space-y-4 text-sm text-[#a7b6b3]">
                <div className="flex items-center gap-3">
                  <Check size={15} className="text-[#73c9c2]" /> Approval is
                  persisted and audited by Sovereign SaaS.
                </div>
                <div className="flex items-center gap-3">
                  <Check size={15} className="text-[#73c9c2]" /> Rollback
                  requires separate approval and health gates.
                </div>
                <div className="flex items-center gap-3">
                  <Check size={15} className="text-[#73c9c2]" /> Browser state
                  cannot authorize activation or execution.
                </div>
              </div>
            </div>
            <div className="instrument-card p-6">
              <div className="mono-label text-[#f4a261]">AUDIT SUMMARY</div>
              <div className="mt-4 font-display text-4xl">
                {snapshot.auditEventCount}
              </div>
              <p className="mt-3 text-sm leading-6 text-[#82979c]">
                Immutable governance events observed by the server at{" "}
                {new Date(snapshot.observedAt).toLocaleString()}.
              </p>
              <div className="mt-6 rounded-xl bg-[#0e1d27] p-4 text-xs text-[#82979c]">
                Adapter mode:{" "}
                <span className="font-mono text-[#d7e0dc]">{adapter.mode}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
