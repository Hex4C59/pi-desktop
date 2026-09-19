import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('piDesktop', {
  versions: {
    node: process.versions.node,
    electron: process.versions.electron,
    chrome: process.versions.chrome,
  },
});
