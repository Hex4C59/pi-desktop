import assert from 'node:assert/strict';
import test from 'node:test';
import { checkElectronNodeVersion } from './node-version';

test('checkElectronNodeVersion accepts pi SDK minimum', () => {
  const result = checkElectronNodeVersion('22.19.0');
  assert.equal(result.satisfiesMinimum, true);
  assert.equal(result.piSdkMinimumNode, '22.19.0');
});

test('checkElectronNodeVersion rejects below minimum', () => {
  const result = checkElectronNodeVersion('22.18.9');
  assert.equal(result.satisfiesMinimum, false);
});
