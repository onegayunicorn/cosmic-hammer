export interface DigitalTwinRuntimeContract {
  loadProfile(id: string): Promise<unknown>;
  saveProfile(profile: unknown): Promise<unknown>;
  applyToSimulation(profileId: string, runId: string): Promise<{ accepted: boolean; traceId: string }>;
}
