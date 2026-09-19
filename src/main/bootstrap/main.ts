import { app, BrowserWindow } from 'electron';
import os from 'node:os';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { runPiSpikeProbe } from '../pi/spike-probe';
import { checkElectronNodeVersion } from '../platform/node-version';
import { registerIpcHandlers, unregisterIpcHandlers } from '../ipc/register-ipc-handlers';
import { createMainWindow } from '../window/create-main-window';

if (started) {
  app.quit();
}

const nodeCheck = checkElectronNodeVersion(process.versions.node);
console.info(
  `[pi-desktop] Electron Node ${nodeCheck.electronNode} (pi SDK requires >= ${nodeCheck.piSdkMinimumNode}): ${
    nodeCheck.satisfiesMinimum ? 'ok' : 'FAIL'
  }`,
);

if (!nodeCheck.satisfiesMinimum) {
  console.error('[pi-desktop] Built-in Node is below the pinned pi SDK minimum.');
}

async function initializePiSpike(): Promise<void> {
  const cwd = path.join(os.homedir(), '.pi', 'agent');
  const result = await runPiSpikeProbe(cwd);
  console.info(`[pi-desktop] pi SDK spike probe ok (sessionId=${result.sessionId})`);
}

app.whenReady().then(async () => {
  try {
    await initializePiSpike();
  } catch (error: unknown) {
    console.error('[pi-desktop] pi SDK spike probe failed:', error);
    app.exit(1);
    return;
  }

  registerIpcHandlers();
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  unregisterIpcHandlers();
});
