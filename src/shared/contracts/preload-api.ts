import type { AppPingResponse, AppVersions } from './app-ipc';

export type PiDesktopApi = {
  getVersions(): Promise<AppVersions>;
  ping(): Promise<AppPingResponse>;
};
