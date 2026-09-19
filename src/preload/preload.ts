import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/contracts/ipc-channels';
import type { PiDesktopApi } from '../shared/contracts/preload-api';

const piDesktop: PiDesktopApi = {
  getVersions: () => ipcRenderer.invoke(IPC_CHANNELS.APP_GET_VERSIONS),
  ping: () => ipcRenderer.invoke(IPC_CHANNELS.APP_PING, {}),
};

contextBridge.exposeInMainWorld('piDesktop', piDesktop);
