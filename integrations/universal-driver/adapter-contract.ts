export interface UniversalDriverAdapter {
  id: string;
  capabilities: string[];
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  health(): Promise<{ ok: boolean; latencyMs: number }>;
}
