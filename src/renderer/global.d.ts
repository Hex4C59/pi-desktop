import type { PiDesktopApi } from '../shared/contracts/preload-api';

declare global {
  interface Window {
    piDesktop: PiDesktopApi;
  }
}

export {};
