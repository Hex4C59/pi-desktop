/** Allowlisted `ipcMain.handle` channel names (WI-002 shell). */
export const IPC_CHANNELS = {
  APP_GET_VERSIONS: 'app:getVersions',
  APP_PING: 'app:ping',
} as const;

export type IpcChannelName = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];

export const ALLOWED_INVOKE_CHANNELS: readonly IpcChannelName[] = [
  IPC_CHANNELS.APP_GET_VERSIONS,
  IPC_CHANNELS.APP_PING,
];
