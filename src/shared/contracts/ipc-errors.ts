export const IPC_ERROR_CODES = {
  INVALID_INPUT: 'INVALID_INPUT',
  INTERNAL: 'INTERNAL',
} as const;

export type IpcErrorCode = (typeof IPC_ERROR_CODES)[keyof typeof IPC_ERROR_CODES];

export type IpcErrorPayload = {
  code: IpcErrorCode;
  message: string;
};

export class IpcCallError extends Error {
  readonly code: IpcErrorCode;

  constructor(code: IpcErrorCode, message: string) {
    super(message);
    this.name = 'IpcCallError';
    this.code = code;
  }

  toPayload(): IpcErrorPayload {
    return { code: this.code, message: this.message };
  }
}

export function isIpcErrorPayload(value: unknown): value is IpcErrorPayload {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.message === 'string' &&
    (record.code === IPC_ERROR_CODES.INVALID_INPUT || record.code === IPC_ERROR_CODES.INTERNAL)
  );
}
