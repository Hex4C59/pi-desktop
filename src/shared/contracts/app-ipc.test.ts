import assert from 'node:assert/strict';
import test from 'node:test';
import { parseAppPingRequest } from './app-ipc';
import { IpcCallError, IPC_ERROR_CODES } from './ipc-errors';
import { ALLOWED_INVOKE_CHANNELS, IPC_CHANNELS } from './ipc-channels';

test('parseAppPingRequest accepts empty object', () => {
  assert.deepEqual(parseAppPingRequest({}), {});
  assert.deepEqual(parseAppPingRequest(undefined), {});
});

test('parseAppPingRequest rejects extra fields', () => {
  assert.throws(
    () => parseAppPingRequest({ extra: true }),
    (error: unknown) => {
      assert.ok(error instanceof IpcCallError);
      assert.equal(error.code, IPC_ERROR_CODES.INVALID_INPUT);
      return true;
    },
  );
});

test('ALLOWED_INVOKE_CHANNELS matches shell registry', () => {
  assert.deepEqual([...ALLOWED_INVOKE_CHANNELS].sort(), [
    IPC_CHANNELS.APP_GET_VERSIONS,
    IPC_CHANNELS.APP_PING,
  ]);
});
