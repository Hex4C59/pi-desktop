import { ipcMain } from 'electron';
import { parseAppPingRequest } from '../../shared/contracts/app-ipc';
import { IpcCallError, IPC_ERROR_CODES } from '../../shared/contracts/ipc-errors';
import { ALLOWED_INVOKE_CHANNELS, IPC_CHANNELS } from '../../shared/contracts/ipc-channels';
import { handleAppPing, readAppVersions } from './app-handlers';

let handlersRegistered = false;

function wrapHandler<T>(run: () => T): T {
  try {
    return run();
  } catch (error: unknown) {
    if (error instanceof IpcCallError) {
      throw error;
    }
    throw new IpcCallError(IPC_ERROR_CODES.INTERNAL, 'Host handler failed');
  }
}

export function registerIpcHandlers(): void {
  if (handlersRegistered) {
    return;
  }

  ipcMain.handle(IPC_CHANNELS.APP_GET_VERSIONS, () => {
    return wrapHandler(() => readAppVersions());
  });

  ipcMain.handle(IPC_CHANNELS.APP_PING, (_event, payload: unknown) => {
    return wrapHandler(() => {
      parseAppPingRequest(payload);
      return handleAppPing();
    });
  });

  handlersRegistered = true;
}

export function unregisterIpcHandlers(): void {
  if (!handlersRegistered) {
    return;
  }

  for (const channel of ALLOWED_INVOKE_CHANNELS) {
    ipcMain.removeHandler(channel);
  }

  handlersRegistered = false;
}

export function areIpcHandlersRegistered(): boolean {
  return handlersRegistered;
}
