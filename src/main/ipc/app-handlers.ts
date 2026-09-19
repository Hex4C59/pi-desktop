import type { AppPingResponse, AppVersions } from '../../shared/contracts/app-ipc';

export function readAppVersions(): AppVersions {
  return {
    node: process.versions.node,
    electron: process.versions.electron,
    chrome: process.versions.chrome,
  };
}

export function handleAppPing(): AppPingResponse {
  return { ok: true };
}
