const PI_SDK_MIN_NODE = '22.19.0';

export type NodeVersionCheck = {
  electronNode: string;
  piSdkMinimumNode: string;
  satisfiesMinimum: boolean;
};

function parseNodeParts(version: string): [number, number, number] {
  const parts = version.split('.').map((segment) => Number.parseInt(segment, 10));
  if (parts.length < 3 || parts.some((value) => Number.isNaN(value))) {
    throw new Error(`Invalid Node version string: ${version}`);
  }
  return [parts[0], parts[1], parts[2]];
}

function compareNodeVersions(left: string, right: string): number {
  const [lMajor, lMinor, lPatch] = parseNodeParts(left);
  const [rMajor, rMinor, rPatch] = parseNodeParts(right);
  if (lMajor !== rMajor) {
    return lMajor - rMajor;
  }
  if (lMinor !== rMinor) {
    return lMinor - rMinor;
  }
  return lPatch - rPatch;
}

export function checkElectronNodeVersion(nodeVersion: string): NodeVersionCheck {
  const satisfiesMinimum = compareNodeVersions(nodeVersion, PI_SDK_MIN_NODE) >= 0;
  return {
    electronNode: nodeVersion,
    piSdkMinimumNode: PI_SDK_MIN_NODE,
    satisfiesMinimum,
  };
}
