import { Type } from 'typebox';
import type { Static } from 'typebox';
import { Value } from 'typebox/value';
import { IpcCallError, IPC_ERROR_CODES } from './ipc-errors';

export const AppPingRequestSchema = Type.Object({}, { additionalProperties: false });

export type AppPingRequest = Static<typeof AppPingRequestSchema>;

export type AppVersions = {
  node: string;
  electron: string;
  chrome: string;
};

export type AppPingResponse = {
  ok: true;
};

export function parseAppPingRequest(payload: unknown): AppPingRequest {
  const value = payload === undefined ? {} : payload;
  if (!Value.Check(AppPingRequestSchema, value)) {
    throw new IpcCallError(IPC_ERROR_CODES.INVALID_INPUT, 'Invalid app:ping payload');
  }
  return value;
}
