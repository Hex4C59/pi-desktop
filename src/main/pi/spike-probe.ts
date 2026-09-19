import { createAgentSession, ModelRuntime, SessionManager } from '@earendil-works/pi-coding-agent';

export type PiSpikeProbeResult = {
  sessionId: string;
};

/**
 * WI-001: load pinned pi SDK and create an in-memory session without prompting a model.
 */
export async function runPiSpikeProbe(cwd: string): Promise<PiSpikeProbeResult> {
  const modelRuntime = await ModelRuntime.create();
  const { session } = await createAgentSession({
    cwd,
    sessionManager: SessionManager.inMemory(),
    modelRuntime,
  });
  const sessionId = session.sessionId;
  session.dispose();
  return { sessionId };
}
