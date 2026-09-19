import { useEffect, useState } from 'react';
import type { AppVersions } from '../../shared/contracts/app-ipc';

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; versions: AppVersions; pingOk: boolean }
  | { status: 'error'; message: string };

export function App() {
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const versions = await window.piDesktop.getVersions();
        const ping = await window.piDesktop.ping();
        if (!cancelled) {
          setState({ status: 'ready', versions, pingOk: ping.ok });
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'IPC failed';
        if (!cancelled) {
          setState({ status: 'error', message });
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="shell">
      <h1>pi Desktop</h1>
      <p>WI-002 — IPC secure shell (allowlisted invoke).</p>
      {state.status === 'loading' && <p>Loading host info…</p>}
      {state.status === 'error' && <p role="alert">Error: {state.message}</p>}
      {state.status === 'ready' && (
        <ul>
          <li>Node: {state.versions.node}</li>
          <li>Electron: {state.versions.electron}</li>
          <li>Chrome: {state.versions.chrome}</li>
          <li>ping: {state.pingOk ? 'ok' : 'fail'}</li>
        </ul>
      )}
    </main>
  );
}
